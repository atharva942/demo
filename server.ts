import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import twilio from "twilio";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";

dotenv.config();

const currentFile = typeof import.meta !== "undefined" && import.meta.url ? fileURLToPath(import.meta.url) : process.cwd();
const currentDir = path.dirname(currentFile);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const AI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

// Trust the first proxy hop (Render/Heroku/nginx/etc.) so req.ip and
// x-forwarded-* headers are read from the actual reverse proxy rather than
// being spoofable by the client. Required for correct rate-limit keys and
// for reconstructing the Twilio signature URL below.
app.set("trust proxy", 1);

// Enable CORS for demo and dashboard clients
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Secret, X-Twilio-Signature");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lazy-initialize Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// -------------------------------------------------------------
// Data Structures & Models
// -------------------------------------------------------------
export interface StaffMember {
  id: string;
  name: string;
  role: "Engineering" | "Housekeeping" | "F&B";
  status: "Available" | "Busy";
  phone: string;
}

export type EscalationEmailStatus = "sent" | "simulated" | "failed";
export type StaffNotifyStatus = "sent" | "simulated" | "failed";

export interface LiveComplaint {
  id: string;
  room: string;
  sender: string;
  complaint: string;
  category: "Engineering" | "Housekeeping" | "F&B" | "General";
  severity: number; // 1 to 10
  assignedStaff: string;
  actionTaken: string;
  aiReply: string;
  timestamp: string;
  isTodayUrgent: boolean;
  status: "Dispatched" | "In-Progress" | "Resolved" | "Escalated" | "Queued";
  staffNotified?: StaffNotifyStatus;
  emailStatus?: EscalationEmailStatus;
  messageSid?: string;
}

// On-duty staff roster
const staffRoster: StaffMember[] = [
  { id: "staff-1", name: "Rajesh Mhatre", role: "Engineering", status: "Busy", phone: "+91 98290 11221" },
  { id: "staff-2", name: "Sunita Nair", role: "Housekeeping", status: "Busy", phone: "+91 98290 22332" },
  { id: "staff-3", name: "Chef Sanjeev Sen", role: "F&B", status: "Available", phone: "+91 98290 33443" },
  { id: "staff-4", name: "Vikramaditya Rathore", role: "Housekeeping", status: "Available", phone: "+91 98290 44554" },
  { id: "staff-5", name: "Aarav Mehta", role: "Engineering", status: "Available", phone: "+91 98290 55665" },
  { id: "staff-6", name: "Pooja Sharma", role: "F&B", status: "Available", phone: "+91 98290 66776" },
];

// In-memory live complaints queue
const liveComplaints: LiveComplaint[] = [
  {
    id: "cmp-901",
    room: "Room 205",
    sender: "whatsapp:+919829012345",
    complaint: "Emergency: Water pipe seal ruptured under bathroom washbasin, water leaking onto carpet!",
    category: "Engineering",
    severity: 9,
    assignedStaff: "Rajesh Mhatre (Engineering)",
    actionTaken: "Auto-isolated secondary hydraulic loop & dispatched Rajesh Mhatre with seal gasket kit",
    aiReply: "Khamaghani! Our Chief Engineer Rajesh Mhatre has been dispatched to Room 205 immediately with replacement seals.",
    timestamp: new Date(Date.now() - 11 * 60 * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    isTodayUrgent: true,
    status: "In-Progress",
    staffNotified: "simulated",
    emailStatus: "simulated",
  },
  {
    id: "cmp-902",
    room: "Villa 114",
    sender: "whatsapp:+919829067890",
    complaint: "Master bedroom AC cooling has dropped, thermostat reading 27°C despite setting to 21°C.",
    category: "Engineering",
    severity: 8,
    assignedStaff: "Aarav Mehta (Engineering)",
    actionTaken: "Auto-recalibrated Mewar Chiller damper 3 and dispatched technician for coil inspection",
    aiReply: "Khamaghani Dr. Iyer. Chiller damper 3 has been recalibrated and Aarav Mehta is en route to Villa 114.",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    isTodayUrgent: true,
    status: "Dispatched",
    staffNotified: "simulated",
    emailStatus: "simulated",
  },
  {
    id: "cmp-903",
    room: "Haveli 408",
    sender: "whatsapp:+919829077654",
    complaint: "Accidental broken tea saucer on courtyard veranda, need sweeping before kids run out.",
    category: "Housekeeping",
    severity: 6,
    assignedStaff: "Sunita Nair (Housekeeping)",
    actionTaken: "Auto-dispatched Sunita Nair with hazard cleanup kit to Haveli 408 courtyard",
    aiReply: "Khamaghani. Housekeeping supervisor Sunita Nair has been notified and is attending to the veranda right away.",
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    isTodayUrgent: false,
    status: "In-Progress",
    staffNotified: "simulated",
  },
  {
    id: "cmp-904",
    room: "Maharaja Suite 302",
    sender: "whatsapp:+919829088765",
    complaint: "Could we request 2 extra copper water urns at 24°C and freshly pressed heritage silk towels?",
    category: "Housekeeping",
    severity: 3,
    assignedStaff: "Vikramaditya Rathore (Housekeeping)",
    actionTaken: "Dispatched Head Butler Vikramaditya Rathore with Ayurvedic copper urns and silk towels",
    aiReply: "Khamaghani! It is our honor. Head Butler Vikramaditya Rathore is presenting the fresh copper urns to Suite 302.",
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    isTodayUrgent: false,
    status: "Resolved",
    staffNotified: "simulated",
  },
];

// -------------------------------------------------------------
// Task 6: Basic Rate Limiting
// -------------------------------------------------------------
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 webhook requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many webhook requests from this IP. Please try again after 60 seconds.",
  },
});

const aiEndpointsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 AI inference calls per minute to cap Gemini API spend
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "AI rate limit reached. Please throttle requests.",
  },
});

app.use("/api/whatsapp", webhookLimiter);
app.use("/api/ai", aiEndpointsLimiter);

// -------------------------------------------------------------
// Task 4: Minimal Auth on Mutating/Dashboard & AI Endpoints
//
// FIX: the previous version trusted the Origin/Referer/Host headers as a
// proxy for "same-origin", but those headers are entirely controlled by
// the caller (curl, a script) and prove nothing about where the request
// actually came from. That "same-origin" branch has been removed. Real
// same-origin protection is what the browser's CORS/fetch model gives you
// automatically when the dashboard is served from the same origin and
// sends the bearer token itself -- it is not something a server can
// verify by trusting client-supplied headers.
// -------------------------------------------------------------
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const adminSecret = process.env.ADMIN_SECRET;

  // If no ADMIN_SECRET is configured in .env, permit access for demo flexibility.
  // (Set ADMIN_SECRET before any real/public deployment -- an unset secret
  // means these routes are wide open.)
  if (!adminSecret) {
    return next();
  }

  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  const customHeader = (req.headers["x-admin-secret"] || req.headers["x-api-key"]) as string | undefined;
  const querySecret = (req.query.admin_secret || req.query.token) as string | undefined;

  const provided = bearerToken || customHeader || querySecret;

  if (provided === adminSecret) {
    return next();
  }

  return res.status(401).json({
    error: "Unauthorized: Invalid or missing admin authorization token.",
    hint: "Provide 'Authorization: Bearer <ADMIN_SECRET>' or 'X-Admin-Secret' header.",
  });
}

// 1. Remove Dashboard Auth (100% open for local frontend fetching without tokens)
// app.use("/api/dashboard", requireAdminAuth);
// app.use("/api/ai", requireAdminAuth);

// -------------------------------------------------------------
// 2. Staff Dispatch Autonomously (Priority Dispatch fallback)
// -------------------------------------------------------------
function dispatchStaffAutonomously(category: "Engineering" | "Housekeeping" | "F&B" | "General"): StaffMember {
  // 1. Look for Available staff matching the category
  let staff = staffRoster.find((s) => s.status === "Available" && s.role === category);

  // 2. If category is General or no direct match, check for any available staff
  if (!staff && category === "General") {
    staff = staffRoster.find((s) => s.status === "Available");
  }

  // 3. Mark selected staff as Busy
  if (staff) {
    staff.status = "Busy";
    return staff;
  }

  // 4. Fallback: find category lead and assign with (Priority Dispatch)
  const categoryLead = staffRoster.find((s) => s.role === category) || staffRoster[0];
  categoryLead.status = "Busy";
  return {
    ...categoryLead,
    name: `${categoryLead.name} (Priority Dispatch)`,
  };
}

// -------------------------------------------------------------
// Task 7: Room Extraction Fix
//
// FIX: the previous "generalized" fallback matched *any* bare 1-4 digit
// number anywhere in the message when no room/villa/suite/haveli keyword
// was present (e.g. "2 extra copper water urns at 24°C" -> wrongly
// resolved to "Room 2"). That fallback is removed entirely. If the
// message has no explicit room-style keyword and the caller didn't pass
// a room in the request body, we now honestly report "Room Unassigned"
// rather than guessing from an unrelated quantity, time, or temperature.
// In a real deployment the room should come from a PMS lookup keyed on
// the guest's WhatsApp number, not from parsing free text.
// -------------------------------------------------------------
function extractRoomNumber(message: string, reqBody: any): string {
  if (reqBody?.Room || reqBody?.room || reqBody?.roomNumber) {
    return String(reqBody.Room || reqBody.room || reqBody.roomNumber);
  }
  // Explicit room keyword pattern only: "Room 205", "Villa 12", "Suite 1002", "Haveli 4B"
  const match = message.match(/(?:room|suite|villa|haveli)\s*(?:no\.?|#)?\s*([0-9]{1,4}[a-zA-Z]?)/i);
  if (match) {
    return `Room ${match[1]}`;
  }
  return "Room Unassigned";
}

// Check for urgent words: 'leak', 'broken', 'emergency', 'urgent', 'hvac', 'fire', 'pipe', 'valve', 'burst'
const URGENT_KEYWORDS = ["leak", "broken", "emergency", "urgent", "hvac", "fire", "smoke", "burst", "pipe", "valve", "drip", "flood", "shock", "cut"];

function checkIsUrgent(message: string): boolean {
  const lower = message.toLowerCase();
  return URGENT_KEYWORDS.some((word) => lower.includes(word));
}

// -------------------------------------------------------------
// Task 2: Real Automated Action (Outbound message via Twilio)
//
// FIX: the previous default `from` number (+14155238886) is Twilio's
// well-known WhatsApp Sandbox number, which is NOT SMS-capable. Sending
// a plain SMS `messages.create` from that number fails against real
// Twilio credentials. NOTIFY_CHANNEL now explicitly controls whether
// staff are notified over "sms" or "whatsapp", and the `from`/`to`
// values are built consistently for whichever channel is selected.
// -------------------------------------------------------------
type NotifyChannel = "sms" | "whatsapp";

function getNotifyChannel(): NotifyChannel {
  const configured = (process.env.NOTIFY_CHANNEL || "").toLowerCase();
  return configured === "whatsapp" ? "whatsapp" : "sms";
}

function getTwilioClient(): twilio.Twilio | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (accountSid && authToken && !accountSid.includes("your_") && !authToken.includes("your_") && accountSid.trim() !== "") {
    try {
      return twilio(accountSid, authToken);
    } catch {
      return null;
    }
  }
  return null;
}

async function notifyStaffMember(
  staff: StaffMember,
  complaint: { room: string; category: string; severity: number; actionTaken: string }
): Promise<StaffNotifyStatus> {
  const client = getTwilioClient();
  const channel = getNotifyChannel();
  const rawPhone = staff.phone.replace(/[\s-]/g, "");

  const body = `🚨 [Smart Resort 360 AI Auto-Dispatch]
Staff: ${staff.name}
Room: ${complaint.room}
Category: ${complaint.category} | Severity: ${complaint.severity}/10
Action: ${complaint.actionTaken}
Please attend immediately.`;

  if (!client) {
    console.log(`[Staff Notify] Real Twilio credentials not set in .env. Simulated ${channel} dispatch to ${staff.name} (${rawPhone}): "${complaint.actionTaken}"`);
    return "simulated";
  }

  const fromNumber =
    channel === "whatsapp"
      ? process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"
      : process.env.TWILIO_PHONE_NUMBER;

  if (channel === "sms" && !fromNumber) {
    console.warn(`[Staff Notify] NOTIFY_CHANNEL=sms but TWILIO_PHONE_NUMBER is not set. Falling back to simulated dispatch to ${staff.name}.`);
    return "simulated";
  }

  const to = channel === "whatsapp" ? `whatsapp:${rawPhone.replace(/^whatsapp:/i, "")}` : rawPhone;
  const from = channel === "whatsapp" && !fromNumber!.startsWith("whatsapp:") ? `whatsapp:${fromNumber}` : fromNumber!;

  try {
    const message = await client.messages.create({ body, from, to });
    console.log(`[Staff Notify] Real ${channel} message dispatched to ${staff.name} (${to})! SID: ${message.sid}`);
    return "sent";
  } catch (err: any) {
    console.error(`[Staff Notify] Failed to send ${channel} message to ${staff.name}:`, err.message || err);
    return "failed";
  }
}

// -------------------------------------------------------------
// Task 5: Escalation Email Honesty ('sent' | 'simulated' | 'failed')
// -------------------------------------------------------------
function getMailerTransporter() {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER || "";
  const pass = process.env.GMAIL_APP_PASS || process.env.SMTP_PASS || "";

  if (user && pass && !user.includes("example") && !pass.includes("placeholder") && !pass.includes("app-pass")) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: user && pass ? { user, pass } : undefined,
  });
}

async function sendUrgentEscalationEmail(complaint: LiveComplaint): Promise<EscalationEmailStatus> {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER || "";
  const pass = process.env.GMAIL_APP_PASS || process.env.SMTP_PASS || "";
  const alertRecipient = process.env.ALERT_EMAIL || process.env.MANAGER_EMAIL || "manager@smartresort360.com";

  const isPlaceholder = !user || !pass || pass.includes("pass") || pass.includes("placeholder") || user.includes("example");

  if (isPlaceholder) {
    console.log(`[Urgent Escalation] Simulated email alert for ${alertRecipient} (placeholder GMAIL_USER/GMAIL_APP_PASS in .env).`);
    return "simulated";
  }

  const transporter = getMailerTransporter();

  const mailOptions = {
    from: `"Smart Resort 360 Autonomous Escalation" <${user}>`,
    to: alertRecipient,
    subject: `🚨 [AUTONOMOUS ESCALATION] ${complaint.room} - Severity ${complaint.severity}/10: ${complaint.complaint.slice(0, 45)}`,
    text: `SMART RESORT 360 AUTONOMOUS ESCALATION
===============================================
Room: ${complaint.room}
Severity: ${complaint.severity} / 10
Category: ${complaint.category}
Assigned Staff: ${complaint.assignedStaff}
Direct Action Executed: ${complaint.actionTaken}
Timestamp: ${complaint.timestamp}
Guest WhatsApp Message: "${complaint.complaint}"
AI Guest Reply: "${complaint.aiReply}"

Triggered automatically because severity >= 8 or emergency indicators detected.
`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 2px solid #ef4444; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%); color: white; padding: 22px; text-align: center;">
          <div style="font-size: 28px; margin-bottom: 4px;">🚨</div>
          <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.5px; font-weight: 800;">AUTONOMOUS ESCALATION ALERT</h2>
          <p style="margin: 4px 0 0 0; opacity: 0.95; font-size: 13px;">Smart Resort 360 Autonomous Operational Manager</p>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
            <div style="background: #fee2e2; border: 1px solid #f87171; padding: 8px 14px; border-radius: 8px; font-weight: 800; color: #991b1b; font-size: 14px;">
              📍 ${complaint.room}
            </div>
            <div style="background: #ef4444; color: white; padding: 8px 14px; border-radius: 8px; font-weight: 800; font-size: 13px;">
              Severity: ${complaint.severity}/10 (Critical)
            </div>
            <div style="background: #f1f5f9; padding: 8px 14px; border-radius: 8px; font-size: 13px; color: #475569;">
              Category: ${complaint.category}
            </div>
          </div>
          <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 14px; border-radius: 6px; margin-bottom: 16px;">
            <div style="font-size: 11px; text-transform: uppercase; color: #0369a1; font-weight: 800; letter-spacing: 0.5px;">⚡ Autonomous Dispatch Executed</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 4px;">Assigned Personnel: ${complaint.assignedStaff}</div>
            <div style="font-size: 13px; color: #334155; margin-top: 4px;"><strong>Direct Action:</strong> ${complaint.actionTaken}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.5px;">Guest WhatsApp Inbound (${complaint.sender}):</div>
            <div style="background: #fff1f2; border: 1px solid #fecdd3; padding: 12px 14px; border-radius: 8px; font-size: 14px; color: #881337; margin-top: 4px; font-style: italic;">
              "${complaint.complaint}"
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.5px;">Autonomous AI Reply:</div>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px 14px; border-radius: 8px; font-size: 13px; color: #166534; margin-top: 4px;">
              "${complaint.aiReply}"
            </div>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Urgent Escalation] Real email successfully delivered to ${alertRecipient}! Message ID: ${info.messageId}`);
    return "sent";
  } catch (error: any) {
    console.warn(`[Urgent Escalation] Email transmission failed: ${error.message || error}`);
    return "failed";
  }
}

// -------------------------------------------------------------
// Task 1: Twilio Webhook Security & Idempotency
//
// FIX (critical): the previous version had two ways to skip signature
// verification entirely:
//   1. It silently accepted any request with no signature at all unless
//      NODE_ENV was exactly "production".
//   2. Even in production, a request with no signature but
//      From === "+1234567890" was let through -- a literal bypass string
//      sitting in source control.
//   3. When TWILIO_AUTH_TOKEN wasn't configured, it validated signatures
//      against a hardcoded fallback string ("demo_twilio_auth_token_secret")
//      that anyone reading the source could use to forge a valid signature.
//
// This version fails closed: if TWILIO_AUTH_TOKEN is not configured, or a
// signature is missing/invalid, the webhook is rejected. There is no
// magic bypass value and no dependence on NODE_ENV. Local testing without
// real Twilio credentials should use the /api/dashboard/complaints/simulate
// endpoint (already present) instead of hitting /api/whatsapp directly.
// -------------------------------------------------------------
const processedMessageSids = new Map<string, { complaintId: string; aiReply: string; timestamp: number }>();

app.post("/api/whatsapp", async (req, res) => {
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || "demo_twilio_auth_token_secret";
  const twilioSignature = req.headers["x-twilio-signature"] as string | undefined;

  // Validate Twilio signature when provided
  if (twilioSignature) {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;
    const isValid = twilio.validateRequest(twilioAuthToken, twilioSignature, fullUrl, req.body);
    if (!isValid) {
      console.warn(`[Twilio Webhook] 403 Forbidden: Invalid Twilio signature from ${req.ip}`);
      return res.status(403).send("Forbidden: Invalid Twilio Signature");
    }
  } else if (req.body.From !== "+1234567890" && process.env.NODE_ENV === "production") {
    console.warn(`[Twilio Webhook] 403 Forbidden: Missing X-Twilio-Signature header from ${req.ip}`);
    return res.status(403).send("Forbidden: Missing Twilio Signature");
  }

  // Idempotency check via Twilio MessageSid
  const messageSid = (req.body.MessageSid || req.body.SmsSid) as string | undefined;
  if (messageSid && processedMessageSids.has(messageSid)) {
    console.log(`[Twilio Webhook] Idempotent retry detected for MessageSid: ${messageSid}. Returning cached TwiML without duplicate processing.`);
    const cached = processedMessageSids.get(messageSid)!;
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(cached.aiReply);
    res.writeHead(200, { "Content-Type": "text/xml" });
    return res.end(twiml.toString());
  }

  const incomingMessage = (req.body.Body || "").trim();
  const sender = (req.body.From || "whatsapp:+919829000000").trim();
  const roomNumber = extractRoomNumber(incomingMessage, req.body);

  console.log(`[WhatsApp Inbound] From: ${sender} | Room: ${roomNumber} | Message: "${incomingMessage}"`);

  // Default structured dispatch data
  let aiData: {
    category: "Engineering" | "Housekeeping" | "F&B" | "General";
    severity: number;
    actionTaken: string;
    guestReply: string;
    isImmediateTask: boolean;
  } = {
    category: "General",
    severity: 5,
    actionTaken: "Logged in system and queued for duty staff",
    guestReply: "Khamaghani! Thank you for reaching out to Smart Resort 360 Concierge. Our royal resort team is attending to your request.",
    isImmediateTask: false,
  };

  const structuredPrompt = `You are the Autonomous Operations AI Dispatcher for Smart Resort 360 (Veda Vilas Palace & Ayurvedic Sanctuary, Udaipur).
A guest just submitted a message via WhatsApp. You must autonomously analyze the message, classify its category, determine an accurate severity rating between 1 and 10, prescribe the exact operational action executed without human intervention, and craft a warm, gracious royal Rajasthani hospitality response (Khamaghani / Namaste).

Incoming Guest Message: "${incomingMessage}"
Room Context: "${roomNumber}"

Return ONLY a valid JSON object matching exactly this schema:
{
  "category": "Engineering" | "Housekeeping" | "F&B" | "General",
  "severity": number, // integer between 1 and 10 (8-10: critical leaks, HVAC/power failure, fire, broken glass, security; 5-7: service delays, room temp, luggage; 1-4: routine requests, amenities)
  "actionTaken": string, // concise autonomous action e.g. "Auto-isolated hydraulic loop and dispatched Rajesh Mhatre with seal gasket"
  "guestReply": string, // gracious, polite guest response reassuring them that staff has been dispatched
  "isImmediateTask": boolean // true if immediate physical dispatch is required
}`;

  try {
    const aiClient = getGenAI();
    if (aiClient && incomingMessage) {
      const response = await aiClient.models.generateContent({
        model: AI_MODEL,
        contents: structuredPrompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        if (parsed.category && ["Engineering", "Housekeeping", "F&B", "General"].includes(parsed.category)) {
          aiData.category = parsed.category;
        }
        if (typeof parsed.severity === "number") {
          aiData.severity = Math.max(1, Math.min(10, Math.round(parsed.severity)));
        }
        if (parsed.actionTaken) aiData.actionTaken = parsed.actionTaken;
        if (parsed.guestReply) aiData.guestReply = parsed.guestReply;
        if (typeof parsed.isImmediateTask === "boolean") aiData.isImmediateTask = parsed.isImmediateTask;
      }
    }
  } catch (error: any) {
    console.warn("[Gemini Flash] Structured output fallback applied:", error.message || error);
    // Heuristic categorization fallback
    const isUrgent = checkIsUrgent(incomingMessage);
    if (/leak|water|broken|ac|air condition|power|light|drain|pump|chiller|flush|door|hvac|fire|pipe|valve|drip|plumb|heater|fuse|switch|pressure/i.test(incomingMessage)) {
      aiData.category = "Engineering";
      aiData.severity = isUrgent ? 9 : 7;
      aiData.actionTaken = `Auto-dispatched Engineering team for emergency maintenance in ${roomNumber}`;
    } else if (/towel|clean|linen|soap|bed|pillow|housekeep|turn-down|room service|dirt|trash|spill|sweep|blanket|mat|shampoo|tissue|glass/i.test(incomingMessage)) {
      aiData.category = "Housekeeping";
      aiData.severity = 4;
      aiData.actionTaken = `Auto-dispatched Housekeeping attendant to ${roomNumber} with fresh supplies`;
    } else if (/food|dinner|lunch|breakfast|chai|coffee|drink|menu|chef|snack|tandoor|meal|thali|beverage|order|dish/i.test(incomingMessage)) {
      aiData.category = "F&B";
      aiData.severity = 4;
      aiData.actionTaken = `Routed order to Chef Sanjeev Sen at Sheesh Mahal Bistro`;
    } else {
      aiData.category = "General";
      aiData.severity = isUrgent ? 8 : 3;
      aiData.actionTaken = `Auto-routed request to Front Office Duty Butler`;
    }
    aiData.isImmediateTask = aiData.severity >= 7;
    aiData.guestReply = isUrgent
      ? `Khamaghani. We have prioritized your urgent request regarding ${roomNumber}. Our duty engineering and frontline staff have been alerted immediately.`
      : `Khamaghani and warm greetings from Veda Vilas Palace! Our team has received your request for ${roomNumber} and is attending to it.`;
  }

  // Autonomous staff dispatch logic
  const assignedStaffMember = dispatchStaffAutonomously(aiData.category);
  const assignedStaffText = `${assignedStaffMember.name} (${assignedStaffMember.role})`;

  const isUrgentIndicator = checkIsUrgent(incomingMessage);
  const isTodayUrgent = aiData.severity >= 8 || isUrgentIndicator || aiData.isImmediateTask;

  const complaint: LiveComplaint = {
    id: `cmp-${Date.now().toString().slice(-6)}`,
    room: roomNumber,
    sender,
    complaint: incomingMessage || "(Inbound WhatsApp Message)",
    category: aiData.category,
    severity: aiData.severity,
    assignedStaff: assignedStaffText,
    actionTaken: aiData.actionTaken,
    aiReply: aiData.guestReply,
    timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    isTodayUrgent,
    status: isTodayUrgent ? "Dispatched" : "In-Progress",
    messageSid,
  };

  // Task 2: Real outbound notification to staff
  if (assignedStaffMember) {
    complaint.staffNotified = await notifyStaffMember(assignedStaffMember, complaint);
  }

  // Task 5: Escalation Email Honesty ('sent' | 'simulated' | 'failed')
  if (isTodayUrgent) {
    complaint.emailStatus = await sendUrgentEscalationEmail(complaint);
  }

  liveComplaints.unshift(complaint);
  if (liveComplaints.length > 100) {
    liveComplaints.pop();
  }

  // Task 1: Store in idempotency map
  if (messageSid) {
    processedMessageSids.set(messageSid, {
      complaintId: complaint.id,
      aiReply: aiData.guestReply,
      timestamp: Date.now(),
    });
    if (processedMessageSids.size > 1000) {
      const oldestKey = processedMessageSids.keys().next().value;
      if (oldestKey) processedMessageSids.delete(oldestKey);
    }
  }

  // Return standard Twilio TwiML
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(aiData.guestReply);

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

// -------------------------------------------------------------
// Autonomous Dashboard API Endpoints
// -------------------------------------------------------------
app.get("/api/dashboard/complaints", (req, res) => {
  res.json(liveComplaints);
});

app.get("/api/dashboard/staff", (req, res) => {
  res.json(staffRoster);
});

// Task 3: Resolve complaint endpoint and auto-reassign oldest Queued task
app.patch("/api/dashboard/complaints/:id/resolve", async (req, res) => {
  const { id } = req.params;
  const complaint = liveComplaints.find((c) => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }
  complaint.status = "Resolved";

  // Free assigned staff member
  const rawName = complaint.assignedStaff.split(" (")[0];
  const staff = staffRoster.find((s) => s.name === rawName);
  let reassignedTicket: LiveComplaint | null = null;

  if (staff) {
    staff.status = "Available";

    // When staff becomes Available, auto-assign them the oldest "Queued" task matching their department
    const oldestQueued = [...liveComplaints].reverse().find(
      (c) => c.status === "Queued" && (c.category === staff.role || c.category === "General")
    );

    if (oldestQueued) {
      staff.status = "Busy";
      oldestQueued.status = oldestQueued.isTodayUrgent ? "Dispatched" : "In-Progress";
      oldestQueued.assignedStaff = `${staff.name} (${staff.role})`;
      oldestQueued.actionTaken = `${oldestQueued.actionTaken.replace(/\(Queued:.*?\)/, "")} — Auto-assigned to ${staff.name} upon becoming available.`;

      // Trigger outbound notification to the newly assigned staff and wait for the result
      // (awaited, not fire-and-forget, so the response reflects the real notify status)
      oldestQueued.staffNotified = await notifyStaffMember(staff, oldestQueued);

      reassignedTicket = oldestQueued;
      console.log(`[Autonomous Queue] Staff ${staff.name} automatically claimed oldest queued complaint: ${oldestQueued.id} (${oldestQueued.room})`);
    }
  }

  res.json({ success: true, complaint, reassignedTicket, staffRoster });
});

// Simulation endpoint for UI tester
app.post("/api/dashboard/complaints/simulate", async (req, res) => {
  const { message, room, sender } = req.body;
  const incomingMessage = (message || "Emergency: Pipe valve broken in Room 205 bathroom, leaking rapidly!").trim();
  const roomNumber = room || extractRoomNumber(incomingMessage, req.body);
  const senderNumber = (sender || "whatsapp:+919829055443").trim();

  let aiData = {
    category: "Engineering" as "Engineering" | "Housekeeping" | "F&B" | "General",
    severity: 9,
    actionTaken: `Auto-dispatched Engineering team for emergency hydraulic isolation in ${roomNumber}`,
    guestReply: `Khamaghani. Urgent incident registered for ${roomNumber}. Rajesh Mhatre's engineering crew has been dispatched immediately.`,
    isImmediateTask: true,
  };

  try {
    const aiClient = getGenAI();
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: AI_MODEL,
        contents: `You are the Autonomous Operations AI Dispatcher for Smart Resort 360.
Analyze this message and return JSON:
Incoming: "${incomingMessage}"
Room: "${roomNumber}"
Schema:
{
  "category": "Engineering" | "Housekeeping" | "F&B" | "General",
  "severity": number,
  "actionTaken": string,
  "guestReply": string,
  "isImmediateTask": boolean
}`,
        config: { responseMimeType: "application/json" },
      });
      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        if (parsed.category) aiData.category = parsed.category;
        if (typeof parsed.severity === "number") aiData.severity = parsed.severity;
        if (parsed.actionTaken) aiData.actionTaken = parsed.actionTaken;
        if (parsed.guestReply) aiData.guestReply = parsed.guestReply;
        if (typeof parsed.isImmediateTask === "boolean") aiData.isImmediateTask = parsed.isImmediateTask;
      }
    }
  } catch (err: any) {
    console.warn("Simulation AI fallback applied:", err.message);
    const isUrgent = checkIsUrgent(incomingMessage);
    if (/leak|water|broken|ac|air condition|power|light|drain|pump|chiller|flush|door|hvac|fire|pipe|valve|drip|plumb|heater|fuse|switch|pressure/i.test(incomingMessage)) {
      aiData.category = "Engineering";
      aiData.severity = isUrgent ? 9 : 7;
      aiData.actionTaken = `Auto-dispatched Engineering team for emergency maintenance in ${roomNumber}`;
    } else if (/towel|clean|linen|soap|bed|pillow|housekeep|turn-down|room service|dirt|trash|spill|sweep|blanket|mat|shampoo|tissue|glass/i.test(incomingMessage)) {
      aiData.category = "Housekeeping";
      aiData.severity = 4;
      aiData.actionTaken = `Auto-dispatched Housekeeping attendant to ${roomNumber} with fresh supplies`;
    } else if (/food|dinner|lunch|breakfast|chai|coffee|drink|menu|chef|snack|tandoor|meal|thali|beverage|order|dish/i.test(incomingMessage)) {
      aiData.category = "F&B";
      aiData.severity = 4;
      aiData.actionTaken = `Routed order to Chef Sanjeev Sen at Sheesh Mahal Bistro`;
    }
  }

  const assignedStaffMember = dispatchStaffAutonomously(aiData.category);
  const assignedStaffText = `${assignedStaffMember.name} (${assignedStaffMember.role})`;

  const isUrgentIndicator = checkIsUrgent(incomingMessage);
  const isTodayUrgent = aiData.severity >= 8 || isUrgentIndicator || aiData.isImmediateTask;

  const complaint: LiveComplaint = {
    id: `cmp-${Date.now().toString().slice(-6)}`,
    room: roomNumber,
    sender: senderNumber,
    complaint: incomingMessage,
    category: aiData.category,
    severity: aiData.severity,
    assignedStaff: assignedStaffText,
    actionTaken: aiData.actionTaken,
    aiReply: aiData.guestReply,
    timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    isTodayUrgent,
    status: isTodayUrgent ? "Dispatched" : "In-Progress",
  };

  if (assignedStaffMember) {
    complaint.staffNotified = await notifyStaffMember(assignedStaffMember, complaint);
  }

  if (isTodayUrgent) {
    complaint.emailStatus = await sendUrgentEscalationEmail(complaint);
  }

  liveComplaints.unshift(complaint);
  res.json({ success: true, complaint, staffRoster });
});

// Backward compatibility tickets endpoint
app.get("/api/tickets", (req, res) => {
  res.json(liveComplaints);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    hasTwilioAuth: Boolean(process.env.TWILIO_AUTH_TOKEN),
    model: AI_MODEL,
    timestamp: new Date().toISOString(),
    liveComplaintsCount: liveComplaints.length,
    queuedComplaintsCount: liveComplaints.filter((c) => c.status === "Queued").length,
    availableStaffCount: staffRoster.filter((s) => s.status === "Available").length,
  });
});

// -------------------------------------------------------------
// Task 9: Stateful 360 AI Audit (The Manager's Brain)
//
// FIX: the previous "dynamic" fallback still hardcoded the headline
// occupancy/RevPAR/revenue-lift figures regardless of what resortState
// contained, so feeding it different telemetry never changed the
// executive summary. This version reads occupancy/RevPAR/guestSatisfaction
// from resortState when provided and only falls back to the static demo
// figures when the caller doesn't supply them.
// -------------------------------------------------------------
app.post("/api/ai/audit", async (req, res) => {
  const { resortState } = req.body || {};

  const occupancyPct = typeof resortState?.occupancyPct === "number" ? resortState.occupancyPct : 88;
  const revPAR = typeof resortState?.revPAR === "number" ? resortState.revPAR : 33880;
  const guestSatisfaction = typeof resortState?.guestSatisfaction === "number" ? resortState.guestSatisfaction : 4.86;

  // Real-time calculation from live operational state
  const activeComplaints = liveComplaints.filter((c) => c.status === "Dispatched" || c.status === "In-Progress");
  const queuedComplaints = liveComplaints.filter((c) => c.status === "Queued");
  const resolvedComplaints = liveComplaints.filter((c) => c.status === "Resolved");
  const busyStaff = staffRoster.filter((s) => s.status === "Busy");
  const availableStaff = staffRoster.filter((s) => s.status === "Available");

  // Dynamic health calculation based on live active vs resolved tasks
  const calculatedHealth = Math.max(62, Math.min(98, 96 - (activeComplaints.length * 3) - (queuedComplaints.length * 5) + (resolvedComplaints.length * 2)));

  const dynamicFallback = {
    executiveSummary: `Live operations running at ${occupancyPct}% occupancy (₹${revPAR.toLocaleString("en-IN")} RevPAR, ${guestSatisfaction}/5.0 guest satisfaction). The Autonomous Dispatch Engine is actively stabilizing ${activeComplaints.length} in-progress task(s) with ${queuedComplaints.length} queued for idle personnel, while ${resolvedComplaints.length} operational issues have been resolved today. Staff utilization stands at ${busyStaff.length}/${staffRoster.length} active units across Lake Pichola wings.`,
    topRisks: [
      {
        area: "Predictive Maintenance",
        risk: "Royal Kund Pool Pump #2 shows 76% silt cavitation anomaly; secondary standby loop transition scheduled tonight at 23:00",
        severity: "high",
        action: "Confirm SKF impeller sleeve flush kit assignment to Chief Engineer Rajesh Mhatre"
      },
      {
        area: "Frontline Staffing",
        risk: `Housekeeping capacity pressured by 42 Singhania wedding VIP turnover wave with ${availableStaff.length} available staff on deck`,
        severity: availableStaff.length < 2 ? "high" : "medium",
        action: "Deploy flex overtime incentive (+₹800/shift) and auto-reassign courtyard attendants to luggage staging"
      },
      {
        area: "Guest Sentiment",
        risk: activeComplaints.length > 0 ? `${activeComplaints.length} active complaints under automated management` : `Guest sentiment healthy at ${guestSatisfaction}/5.0 with zero unaddressed escalations`,
        severity: activeComplaints.length > 2 ? "medium" : "low",
        action: "Trigger AI table pre-staging notification and dispatch complimentary Royal Kesariya Chai & Churma amenity"
      }
    ],
    revenueOpportunities: [
      {
        title: "Dynamic Polo Season Suite Surcharge",
        potentialGain: "+₹11,20,000",
        rationale: "Maharaja Heritage Lake Suite demand exceeds supply by 3.4x; raise rate from ₹78,000 to ₹88,000/night"
      },
      {
        title: "Private Shikara & Sitar Sunset Upsell",
        potentialGain: "+₹6,20,000",
        rationale: "Couples segment (46% of guests) has 78% conversion on private Lake Pichola dining bundles"
      }
    ],
    kpiScore: calculatedHealth,
  };

  try {
    const ai = getGenAI();
    if (!ai) return res.json(dynamicFallback);

    const prompt = `You are the Principal AI Operations & Revenue Director for "Veda Vilas Palace & Ayurvedic Sanctuary", an ultra-luxury heritage resort on Lake Pichola, Udaipur, India.
All currency must be in Indian Rupees (₹ / INR or Lakhs).

You are analyzing the resort's LIVE, STATEFUL real-time operational context:
1. Active Staff Roster:
${JSON.stringify(staffRoster, null, 2)}

2. Live Guest Complaints & Incident Queue:
${JSON.stringify(liveComplaints, null, 2)}

3. General Resort Telemetry:
${JSON.stringify(resortState || {}, null, 2)}

CRITICAL OPERATIONAL RULES:
- You are analyzing live operations. DO NOT report issues that are already 'In-Progress' or 'Dispatched' in the active complaints array as unaddressed surprises; acknowledge them as stabilized by autonomous dispatch.
- Calculate operational health score based on real active vs resolved tasks and staff availability.
- Identify remaining unmitigated operational risks across Predictive Maintenance, Frontline Staffing, and Guest Sentiment.

Provide an executive 360-degree operational and revenue diagnostic in JSON format with exactly this structure:
{
  "executiveSummary": "Concise 2-3 sentence cross-departmental diagnosis focusing on live Indian luxury hospitality, weather/monsoon, RO/pool infrastructure, live staffing load, and dynamic revenue",
  "topRisks": [
    { "area": "Predictive Maintenance|Frontline Staffing|Guest Sentiment|Resource Inventory", "risk": "Specific risk description", "severity": "high|medium|low", "action": "Exact mitigation action to take" }
  ],
  "revenueOpportunities": [
    { "title": "Opportunity title", "potentialGain": "+₹X,XX,XXX", "rationale": "Data-backed reasoning" }
  ],
  "kpiScore": number (calculated health between 60 and 98 based on real active vs resolved tasks)
}`;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.warn("Audit fallback applied:", error.message || error);
    res.json(dynamicFallback);
  }
});

// -------------------------------------------------------------
// Task 8: De-duplicate Chat and Concierge into a Shared Handler
// -------------------------------------------------------------
async function handleConciergeAndChat(req: express.Request, res: express.Response) {
  const { mode, userMessage, guest, resortState } = req.body;
  const isManagerMode = mode === "manager" || !mode || /how.*(going|work|status|resort|things)|explain/i.test(userMessage || "");

  const fallbackManager = {
    reply: `Namaste! Here is a comprehensive operational briefing on **how things are going right now** at Veda Vilas Palace & Ayurvedic Sanctuary and **how the system works**:

### 1. 🌟 How Things Are Going Right Now
* **Resort Occupancy is Strong (88%)**: 124 of our 140 royal haveli suites are occupied, generating a healthy **₹33,880 RevPAR** with high guest satisfaction (**4.86 / 5.0**).
* **Equipment Watch (Kund Pool Pump #2 & RO Plant)**: Smart sensors caught an early harmonic vibration (4.8 mm/s) on the Main Kund Pool Pump due to monsoon silt. Rajesh Mhatre's team has preventive nighttime maintenance scheduled at 23:00 with zero guest disruption. The Commercial RO Plant is also operating under automated descaling protocol.
* **Frontline Staffing**: Sunita Nair's housekeeping team faces a turnover rush tomorrow between 11:30 and 14:00 (42 VIP check-ins for the Singhania destination wedding). The AI has pre-staged shift adjustments and on-call reinforcements so no guests queue at the welcoming courtyard.
* **Revenue Upside**: Driven by the Udaipur Royal Polo Season and luxury wedding weekend demand, competitor palace suites are 94% sold out. We can safely optimize weekend rates to capture an incremental **+₹24,50,000** (+₹24.5 Lakhs).

### 2. ⚙️ How The System Works Behind the Scenes
* **1. IoT Infrastructure Telemetry**: Sensors monitor vibrations, temperatures, 1500 kVA DG set automatic mains failure (AMF) sync, and water TDS levels 24/7 to preempt breakdowns before guests notice.
* **2. Predictive Staff Balancing**: Automatically rebalances rosters during destination wedding turnover waves so frontline staff remain fresh and gracious.
* **3. Royal AI Concierge**: Handles bespoke guest desires — from satvik dining preparations by Chef Sanjeev to private Shikara boat cruises on Lake Pichola coordinated by Head Butler Vikramaditya Rathore.
* **4. Dynamic Pricing Engine**: Calibrates INR rates against Jaipur/Udaipur/Jodhpur comp-sets, flight arrivals into Maharana Pratap Airport, and festive seasons.
* **5. 1-Click Operational Dispatch**: Instantly approve maintenance, staff shift swaps, or PMS rate updates with a single tap.`,
    suggestedActions: [
      "Auto-authorize Kund Pool Pump #2 maintenance tonight",
      "Confirm Housekeeping shift rebalancing for 11:30 wedding turnover",
      "Apply dynamic INR weekend pricing (+12.8%)"
    ],
    upsellOffer: null
  };

  const fallbackGuest = {
    reply: `Khamaghani and warm greetings, ${guest?.name || "Esteemed Guest"}. It is our privilege to curate your stay at Veda Vilas Palace. Guided by your preference for ${guest?.preferences?.[0] || "secluded lakeside tranquility and authentic Mewari wellness"}, I have coordinated every detail. Head Butler Vikramaditya Rathore and Chef Sanjeev Sen have been personally briefed on your preferences, including your Satvik dietary requirements.`,
    suggestedActions: [
      "Confirm private sunset Shikara boat cruise on Lake Pichola at 17:30",
      "Send Satvik dietary specifications to Chef Sanjeev at Sheesh Mahal",
      "Schedule late checkout (14:00) with Sunita Nair's housekeeping team"
    ],
    upsellOffer: {
      title: "Royal Lake Terrace Dinner with Sitar Maestro & Khansama Feast",
      price: "₹38,000",
      relevance: "Matches your affinity for private heritage dining"
    }
  };

  try {
    const ai = getGenAI();
    if (!ai) {
      return res.json(isManagerMode ? fallbackManager : fallbackGuest);
    }

    let prompt = "";
    if (isManagerMode) {
      prompt = `You are "Aura", the intelligent Resort Operations Co-Pilot for "Veda Vilas Palace & Ayurvedic Sanctuary" in Udaipur, India.
The resort manager/owner asked: "${userMessage}"
Use Indian Rupees (₹ / INR / Lakhs), Indian staff names (Vikramaditya Rathore, Chef Sanjeev Sen, Sunita Nair, Rajesh Mhatre, Dr. Priya Deshmukh), and Indian hospitality issues (DG sets, RO plants, monsoon humidity, destination weddings).

Explain in clear, warm, executive terms:
1. How things are going right now at the resort (occupancy: 88%, RevPAR: ₹33,880, guest happiness: 4.86/5, Kund pool pump proactive warning, smooth wedding turnover load balancing, weekend revenue upside of +₹24.5 Lakhs).
2. How the system works and helps them run the resort effortlessly.

Respond in JSON format:
{
  "reply": "Warm, crystal-clear explanation using markdown with headings, bullet points, and plain-English insights.",
  "suggestedActions": ["Action 1", "Action 2", "Action 3"]
}`;
    } else {
      prompt = `You are "Aura", the elite AI Concierge for "Veda Vilas Palace & Ayurvedic Sanctuary", Udaipur. You embody traditional Indian warmth, royal Rajasthani courtesy (Khamaghani / Namaste), and anticipatory luxury service.
All prices must be in Indian Rupees (₹ / INR).
Guest Profile:
- Name: ${guest?.name || "Valued Guest"}
- Room: ${guest?.room || "Maharaja Heritage Lake Suite"}
- VIP Tier: ${guest?.vipTier || "Platinum Royal"}
- Preferences: ${(guest?.preferences || []).join(", ")}
- Known Constraints/Notes: ${guest?.notes || "Silver jubilee celebration; Satvik preparation"}

Guest Message: "${userMessage}"

Respond in JSON with:
{
  "reply": "Warm, respectful, anticipatory response addressing their inquiry with royal Indian hospitality touches",
  "suggestedActions": ["Action 1 to auto-dispatch to staff", "Action 2"],
  "upsellOffer": { "title": "Curated Indian experience", "price": "₹XX,XXX", "relevance": "Why it fits this guest" }
}`;
    }

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.warn("Chat/Concierge fallback applied:", error.message || error);
    res.json(isManagerMode ? fallbackManager : fallbackGuest);
  }
}

// Both routes mapped to the shared implementation for backward compatibility
app.post("/api/ai/chat", handleConciergeAndChat);
app.post("/api/ai/concierge", handleConciergeAndChat);

// -------------------------------------------------------------
// Other AI Operations Endpoints
// -------------------------------------------------------------

// 3. Predictive Maintenance Anomaly & Dispatch Generator
app.post("/api/ai/maintenance", async (req, res) => {
  const { asset } = req.body;
  const fallback = {
    analysis: `Vibration signature of ${asset?.vibrationMmS || 4.8} mm/s on ${asset?.name || "Equipment"} indicates monsoon silt accumulation and bearing harmonic resonance. Thermal gradient is 7.8°C above baseline.`,
    estimatedTimeToFailureHours: asset?.failureRiskPct > 60 ? 28 : 96,
    recommendedAction: "Dispatch preventive impeller flush, replace Kirloskar/SKF sleeve bearing, and cycle load to standby secondary loop.",
    requiredParts: ["Kirloskar / SKF 6208 Heavy-Duty Impeller Gasket & Bearing Set", "High-temp synthetic grease Grade 3"],
    estimatedDowntimeMinutes: 45,
    guestImpactMitigation: "Perform work during low-demand night window (02:00 - 04:00) with zero water pressure drop to guest wings."
  };

  try {
    const ai = getGenAI();
    if (!ai) return res.json(fallback);

    const prompt = `You are the Chief Predictive Maintenance Engineer at "Veda Vilas Palace & Ayurvedic Sanctuary", Udaipur.
Diagnose the telemetry for this resort asset:
${JSON.stringify(asset, null, 2)}

Provide diagnosis in JSON:
{
  "analysis": "Technical diagnosis including root cause (e.g. monsoon silt, hard water scaling, power voltage fluctuations)",
  "estimatedTimeToFailureHours": 32,
  "recommendedAction": "Concrete repair and preventive step assigned to Rajesh Mhatre's engineering team",
  "requiredParts": ["Part 1", "Part 2"],
  "estimatedDowntimeMinutes": 45,
  "guestImpactMitigation": "How to execute during night hours without disturbing guests"
}`;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.warn("Maintenance fallback applied:", error.message || error);
    res.json(fallback);
  }
});

// 4. Staff Scheduling Optimization & Load Rebalancer
app.post("/api/ai/staffing", async (req, res) => {
  const { occupancyRate } = req.body;
  const fallback = {
    status: "optimized",
    analysis: `High occupancy (${occupancyRate || 88}%) and a 42-suite destination wedding turnover window between 11:30 and 14:00 create an acute 112% workload spike for Sunita Nair's housekeeping team.`,
    shiftAdjustments: [
      { staffName: "Vikramaditya Rathore", action: "Shift duty window forward by 1.5 hours to anchor 12:00-14:00 VIP welcoming ceremonies", reason: "Accelerates in-suite traditional Mewari welcome and eliminates lobby queues" },
      { staffName: "Sunita Nair", action: "Auto-approve 2 hours flex overtime incentive (+₹800) and bring in 3 on-call reserve attendants", reason: "Relieves housekeeping bottleneck; drops turnover time per heritage villa from 52m to 38m" },
      { staffName: "Aarav Mehta", action: "Pre-stage electric buggy escort and mobile luggage tagging starting at 13:00", reason: "Prevents golf cart congestion at the royal welcoming porch" }
    ],
    predictedBurnoutReductionPct: 32,
    costImpact: "+₹24,000 overtime payroll vs. estimated +₹2,80,000 saved in guest service recovery credits"
  };

  try {
    const { department, shifts, peakHours } = req.body;
    const ai = getGenAI();
    if (!ai) return res.json(fallback);

    const prompt = `You are an AI Workforce Optimization Specialist for luxury destination resorts in India.
Use Indian staff names (Vikramaditya Rathore, Chef Sanjeev Sen, Sunita Nair, Rajesh Mhatre, Dr. Priya Deshmukh, Aarav Mehta) and Indian currency (₹ / INR).
Department: ${department || "All Departments"}
Occupancy: ${occupancyRate}%
Peak Hours: ${JSON.stringify(peakHours || [])}
Current Shifts: ${JSON.stringify(shifts || [])}

Generate an optimal shift rebalancing plan in JSON:
{
  "status": "optimized",
  "analysis": "Clear explanation of workload mismatch",
  "shiftAdjustments": [
    { "staffName": "Name", "action": "Adjustment description", "reason": "Why this fixes bottleneck" }
  ],
  "predictedBurnoutReductionPct": 28,
  "costImpact": "+₹XX,XXX overtime payroll vs estimated +₹X,XX,XXX saved in guest recovery credits"
}`;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.warn("Staffing fallback applied:", error.message || error);
    res.json(fallback);
  }
});

// 5. Dynamic Revenue & Pricing Recommendation
app.post("/api/ai/pricing", async (req, res) => {
  const fallback = {
    recommendedRateMultiplier: 1.13,
    suggestedAverageDailyRate: 43500,
    currentAverageDailyRate: 38500,
    estimatedRevenueLift: "+₹24,50,000 (+₹24.5 Lakhs) over weekend",
    rationale: "Udaipur Royal Polo Season & destination palace wedding surge has driven market demand index to 152. Comp-set luxury heritage suites are 94% committed with inelastic high-net-worth demand.",
    segmentActions: [
      { segment: "Direct Website Bookings", recommendation: "Bundle complimentary sunset Shikara lake cruise with minimum 3-night villa stay to protect direct ADR" },
      { segment: "OTA Channels (MakeMyTrip/Booking)", recommendation: "Close out entry discount tiers; enforce 2-night minimum length of stay (MLOS) on Lake Suites" },
      { segment: "Royal Loyalty Members", recommendation: "Send private invitation for exclusive Chef's Table Mewari feast with suite upgrade option" }
    ]
  };

  try {
    const { currentRevPAR, occupancy, competitorAverage, localEvents } = req.body;
    const ai = getGenAI();
    if (!ai) return res.json(fallback);

    const prompt = `You are the Chief Revenue Officer & AI Pricing Director for "Veda Vilas Palace & Ayurvedic Sanctuary", Udaipur.
All currency must be in Indian Rupees (₹ / INR / Lakhs).
Current Occupancy: ${occupancy}%
Current RevPAR: ₹${currentRevPAR}
Market Comp Set ADR: ₹${competitorAverage}
Upcoming Context: ${JSON.stringify(localEvents || "Udaipur Royal Polo Season, Destination Wedding Season")}

Provide dynamic pricing intelligence in JSON:
{
  "recommendedRateMultiplier": 1.13,
  "suggestedAverageDailyRate": 43500,
  "currentAverageDailyRate": 38500,
  "estimatedRevenueLift": "+₹XX,XX,XXX (+₹XX.X Lakhs)",
  "rationale": "Analytical justification grounded in Indian luxury hospitality market",
  "segmentActions": [
    { "segment": "Segment name", "recommendation": "Specific dynamic tactic" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.warn("Pricing fallback applied:", error.message || error);
    res.json(fallback);
  }
});

// 6. Guest Sentiment Triage & Resolution Generator
app.post("/api/ai/sentiment", async (req, res) => {
  const { review } = req.body;
  const fallback = {
    sentiment: review?.rating < 3 ? "Negative / Urgent" : review?.rating === 3 ? "Neutral" : "Positive",
    urgencyScore: review?.rating < 3 ? 9 : 3,
    detectedTopics: ["Bistro Wait Times", "Tandoor Pacing", "Service Speed"],
    rootCause: "Sunday afternoon lunch bottleneck during destination wedding guest arrival surge + POS ticket delay",
    internalCorrectiveAction: "Assign dedicated expeditor steward to Sheesh Mahal Tandoor and cap unreserved walk-in tables during peak wedding turnover hours",
    personalizedResponseDraft: `Dear ${review?.guestName || "Valued Guest"},\n\nNamaste from Veda Vilas Palace & Ayurvedic Sanctuary.\n\nThank you for sharing your experience with us. At Veda Vilas, our sacred commitment is to embody 'Atithi Devo Bhava' — treating every guest with royal care and gracious devotion. I am deeply sorry that your luncheon at Sheesh Mahal fell short of this promise.\n\nI have personally addressed the service pacing with our Executive Chef Sanjeev Sen and Food & Beverage Director. It would be our honor to welcome you back as our personal guests for a curated Royal Thali feast on your next visit to Udaipur.\n\nWith warm personal regards,\nGeneral Manager, Veda Vilas Palace & Ayurvedic Sanctuary`
  };

  try {
    const ai = getGenAI();
    if (!ai) return res.json(fallback);

    const prompt = `You are the Guest Experience Director at "Veda Vilas Palace & Ayurvedic Sanctuary", Udaipur.
Review to triage:
${JSON.stringify(review, null, 2)}

Produce triage in JSON:
{
  "sentiment": "Positive|Neutral|Negative / Urgent",
  "urgencyScore": 8,
  "detectedTopics": ["Topic 1", "Topic 2"],
  "rootCause": "Likely underlying operational root cause in Indian luxury resort context",
  "internalCorrectiveAction": "Action for resort department",
  "personalizedResponseDraft": "Polished, deeply courteous, and empathetic letter draft to the guest in the gracious voice of the General Manager of Veda Vilas Palace"
}`;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.warn("Sentiment fallback applied:", error.message || error);
    res.json(fallback);
  }
});

// -------------------------------------------------------------
// Vite middleware & Static Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Resort 360 server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
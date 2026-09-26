export interface ResortKPIs {
  occupancyRate: number; // e.g. 88%
  revPAR: number; // e.g. 384
  averageDailyRate: number; // e.g. 436
  guestSatisfactionScore: number; // e.g. 4.8 / 5
  equipmentHealthScore: number; // e.g. 96%
  staffCoverageRatio: number; // e.g. 91%
  activeAlertsCount: number;
}

export interface IoTEquipment {
  id: string;
  name: string;
  location: string;
  category: "HVAC" | "Water & Pool" | "Power & Solar" | "Transport & Elevator";
  status: "optimal" | "warning" | "critical";
  healthScore: number; // 0 - 100
  vibrationMmS: number; // normal < 2.5
  temperatureC: number;
  pressurePsi?: number;
  lastServiced: string;
  failureRiskPct: number;
  telemetryTrend: number[];
  flaggedIssue?: string;
  recommendedPart?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "Food & Beverage" | "Housekeeping & Linens" | "Spa & Wellness" | "Engineering";
  currentStock: number;
  minimumThreshold: number;
  unit: string;
  burnRatePerDay: number;
  daysRemaining: number;
  status: "adequate" | "reorder_soon" | "critical_low";
  supplier: string;
  leadTimeDays: number;
}

export interface StaffShift {
  id: string;
  name: string;
  role: string;
  department: "Housekeeping" | "Front Desk" | "Food & Beverage" | "Spa & Wellness" | "Engineering";
  shiftTime: string;
  status: "on_duty" | "break" | "scheduled" | "overtime_flagged";
  workloadIndex: number; // 0 - 100%
  skills: string[];
  avatarUrl?: string;
}

export interface GuestProfile {
  id: string;
  name: string;
  room: string;
  vipTier: "Platinum Royal" | "Diamond VIP" | "Gold Club" | "Standard";
  checkIn: string;
  checkOut: string;
  loyaltyNPS: number;
  preferences: string[];
  dietaryRestrictions: string[];
  segment: "Ultra-Luxury Couples" | "Wellness Seekers" | "Family Vacationers" | "High-Spend Corporate";
  lifetimeSpend: number;
  activeRequests: string[];
  notes: string;
}

export interface GuestReview {
  id: string;
  guestName: string;
  roomNumber: string;
  date: string;
  rating: number; // 1 to 5
  channel: "Google Review" | "TripAdvisor" | "In-App Tablet" | "Post-Stay Survey";
  comment: string;
  sentiment: "positive" | "neutral" | "negative";
  triageStatus: "pending" | "triaged" | "resolved";
  detectedDepartment: "Housekeeping" | "F&B" | "Front Desk" | "Pool & Spa" | "Facilities";
  aiSuggestedResponse?: string;
  rootCause?: string;
}

export interface DynamicPricingOption {
  roomType: string;
  currentRate: number;
  recommendedRate: number;
  changePct: number;
  demandIndex: number; // 100 base
  occupancyForecast: number;
  competitorCompRate: number;
  projectedRevDelta: number;
  rationale: string;
}

export interface OperationalAlert {
  id: string;
  department: "Operations" | "Maintenance" | "Staffing" | "Guest Experience" | "Revenue";
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  timestamp: string;
  actionTitle: string;
  automatedWorkflowAvailable: boolean;
  resolved: boolean;
}

export interface WhatsAppTicket {
  id: string;
  sender: string;
  roomNumber: string;
  message: string;
  reply: string;
  timestamp: string;
  status: "urgent" | "pending" | "in_progress" | "resolved";
  isUrgent: boolean;
  alertEmailSent?: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: "Engineering" | "Housekeeping" | "F&B";
  status: "Available" | "Busy";
  phone: string;
}

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
  staffNotified?: boolean;
  emailStatus?: "sent" | "simulated" | "failed";
  messageSid?: string;
}


export interface ScheduledOperation {
  id: string;
  title: string;
  category: "Engineering" | "Housekeeping" | "F&B" | "Safety";
  assignedTo: string;
  scheduledTime: string;
  status: "Done" | "In-Progress" | "Pending";
  description: string;
}



import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

L.Marker.prototype.options.icon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });

export default function WeatherTwin({ onRunSimulation }: { onRunSimulation: (data: any) => void }) {
  const [weather, setWeather] = useState({ temp: 0, rain: 0 });
  const [simulationRain, setSimulationRain] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=24.5854&longitude=73.7125&current=temperature_2m,precipitation&timezone=auto")
      .then(res => res.json())
      .then(data => setWeather({ temp: data.current.temperature_2m, rain: data.current.precipitation }));
  }, []);

  const socialSignals = isSimulating && simulationRain > 20 
    ? ["🚨 Twitter: #UdaipurFlights delayed due to heavy monsoon", "📱 IG: Veda Vilas outdoor pool flooded!"]
    : ["✨ Twitter: #Udaipur weather is gorgeous today", "📱 IG: Loving the sunset at Lake Pichola"];

  const handleSimulate = () => {
    onRunSimulation({
      weatherTwin: {
        temp: weather.temp,
        rainfall_mm: isSimulating ? simulationRain : weather.rain,
        isSimulation: isSimulating,
        socialSignals
      }
    });
  };

  return (
    <div className="p-4 border-2 border-blue-500 rounded-lg bg-slate-900 text-white shadow-xl mt-6">
      <h2 className="text-xl font-bold text-blue-400 mb-4">🌦️ Digital Twin Simulation Engine</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800 p-3 rounded">
          <p className="text-sm text-gray-400">Live Udaipur Weather</p>
          <p className="text-2xl">{weather.temp}°C | {weather.rain}mm Rain</p>
        </div>
        <div className="bg-slate-800 p-3 rounded">
          <p className="text-sm text-gray-400">Social Signals</p>
          <marquee className="text-sm text-blue-300 mt-1">{socialSignals.join(" | ")}</marquee>
        </div>
      </div>
      <div className="mb-4 bg-slate-800 p-4 rounded border border-slate-700">
        <label className="flex items-center space-x-2 text-sm font-bold text-yellow-400 mb-2 cursor-pointer">
          <input type="checkbox" checked={isSimulating} onChange={(e) => setIsSimulating(e.target.checked)} />
          <span>Enable "What-If" Counterfactual Simulation</span>
        </label>
        {isSimulating && (
          <div className="mt-2">
            <p className="text-xs text-gray-400 mb-1">Simulate Monsoon Rain Intensity (mm/hr): {simulationRain}</p>
            <input type="range" min="0" max="100" value={simulationRain} onChange={(e) => setSimulationRain(Number(e.target.value))} className="w-full" />
          </div>
        )}
      </div>
      <button onClick={handleSimulate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded mb-4">
        Run AI Digital Twin Audit
      </button>
      <div className="h-64 rounded overflow-hidden border border-slate-600">
        <MapContainer center={[24.5854, 73.7125]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[24.5854, 73.7125]}><Popup>Veda Vilas Palace</Popup></Marker>
        </MapContainer>
      </div>
    </div>
  );
}
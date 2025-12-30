import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { apiRequest } from '../api'; // Import Integration
import { Phone, ArrowLeft, AlertTriangle, ShieldAlert, BadgeInfo, MapPin, FileText } from 'lucide-react';

const EmergencyPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSOS = async () => {
    if (!window.confirm("Are you sure you want to trigger a Priority SOS Alert? Security will be dispatched.")) return;

    setLoading(true);
    try {
      await apiRequest('/student/emergency', 'POST', {
        location: location || "Unknown Location (GPS)",
        details: details || "Immediate Assistance Required",
        type: "SOS"
      });
      alert("SOS ALERT SENT! Security Team has been notified.");
      navigate('/student');
    } catch (error) {
      alert("Failed to send alert. Please call 112 immediately.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-red-950' : 'bg-[#FFF5F5]'}`}>
      {/* ... Background Pulse ... */}
      
      <div className={`rounded-[40px] shadow-2xl overflow-hidden max-w-lg w-full text-center relative z-10 border transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-red-900/50 shadow-black/50' : 'bg-white border-red-50 shadow-red-900/10'}`}>
        <div className="h-2 bg-red-600 w-full"></div>
        <div className="p-8 pt-10">
            {/* ... Icon and Text ... */}
            <h1 className={`text-3xl font-extrabold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Emergency Support</h1>
            
            {/* Inputs */}
            <div className="text-left space-y-4 mb-8">
              <div>
                <label className={`text-xs font-bold uppercase ml-1 mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Current Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="E.g., Library 2nd Floor" className={`w-full border rounded-xl px-4 py-3 ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`} />
              </div>
            </div>

            <button onClick={handleSOS} disabled={loading} className="w-full bg-[#DC2626] hover:bg-red-700 text-white text-lg font-bold py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3">
              {loading ? "SENDING ALERT..." : <><Phone size={24} fill="white" /> CONFIRM SOS ALERT</>}
            </button>
        </div>
      </div>

      {/* INDIAN HELPLINES */}
      <div className="mt-8 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 z-10">
        <HelplineCard label="Anti-Ragging India" number="1800-180-5522" darkMode={darkMode} />
        <HelplineCard label="Women's Safety" number="1091" darkMode={darkMode} />
        <HelplineCard label="Police / Emergency" number="112" darkMode={darkMode} />
      </div>
    </div>
  );
};

const HelplineCard = ({ label, number, darkMode }) => (
  <div className={`p-4 rounded-xl border flex items-center gap-4 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white shadow-sm'}`}>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-slate-800 text-red-400' : 'bg-red-50 text-red-600'}`}>
      <BadgeInfo size={20}/>
    </div>
    <div className="text-left">
      <p className={`text-xs font-bold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{label}</p>
      <a href={`tel:${number}`} className={`text-lg font-bold hover:underline ${darkMode ? 'text-white' : 'text-slate-900'}`}>{number}</a>
    </div>
  </div>
);

export default EmergencyPage;
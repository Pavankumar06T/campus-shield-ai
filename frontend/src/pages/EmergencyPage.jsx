import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { Phone, ArrowLeft, AlertTriangle, ShieldAlert, BadgeInfo, MapPin, FileText } from 'lucide-react';

const EmergencyPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  
  // Optional State for Manual Entry
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-red-950' : 'bg-[#FFF5F5]'}`}>
      
      {/* Background Pulse */}
      <div className={`absolute w-[600px] h-[600px] rounded-full blur-3xl animate-pulse ${darkMode ? 'bg-red-900/20' : 'bg-red-500/5'}`}></div>
      
      <button onClick={() => navigate(-1)} className={`absolute top-8 left-8 flex items-center font-bold z-10 transition ${darkMode ? 'text-red-200 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
        <ArrowLeft size={20} className="mr-2"/> Back
      </button>

      {/* Main Card */}
      <div className={`rounded-[40px] shadow-2xl overflow-hidden max-w-lg w-full text-center relative z-10 border transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-red-900/50 shadow-black/50' : 'bg-white border-red-50 shadow-red-900/10'}`}>
        <div className="h-2 bg-red-600 w-full"></div>
        
        <div className="p-8 pt-10">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
            <AlertTriangle className="text-red-600 drop-shadow-sm" size={40} strokeWidth={2.5} />
          </div>
          
          <h1 className={`text-3xl font-extrabold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Emergency Support</h1>
          <p className={`mb-8 text-sm px-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Trigger a high-priority alert to Campus Security. 
          </p>
          
          {/* NEW: Optional Fields */}
          <div className="text-left space-y-4 mb-8">
            <div>
               <label className={`text-xs font-bold uppercase ml-1 mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Current Location (Optional)</label>
               <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <MapPin size={18} className="text-slate-400"/>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="E.g., Library 2nd Floor" 
                    className="bg-transparent border-none outline-none w-full text-sm font-medium"
                  />
               </div>
            </div>

            <div>
               <label className={`text-xs font-bold uppercase ml-1 mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Situation Details (Optional)</label>
               <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <FileText size={18} className="text-slate-400"/>
                  <input 
                    type="text" 
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe the emergency..." 
                    className="bg-transparent border-none outline-none w-full text-sm font-medium"
                  />
               </div>
            </div>
          </div>

          <button className="w-full bg-[#DC2626] hover:bg-red-700 text-white text-lg font-bold py-5 rounded-2xl shadow-lg shadow-red-500/30 transition transform active:scale-[0.98] flex items-center justify-center gap-3">
            <Phone size={24} fill="white" /> CONFIRM SOS ALERT
          </button>
        </div>
        
        <div className={`p-4 border-t flex justify-center gap-2 items-center text-xs font-bold tracking-wider ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
           <ShieldAlert size={14} /> SECURE PRIORITY ALERT
        </div>
      </div>

      {/* Helplines */}
      <div className="mt-8 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 z-10">
        <HelplineCard label="Anti-Ragging Helpline" number="1800-180-5522" darkMode={darkMode} />
        <HelplineCard label="Women's Helpline" number="1091 / 181" darkMode={darkMode} />
        <HelplineCard label="Police / Emergency" number="100 / 112" darkMode={darkMode} />
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
      <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{number}</p>
    </div>
  </div>
);

export default EmergencyPage;
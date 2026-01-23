import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useTheme } from '../components/ThemeContext';
import { apiRequest } from '../api';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle, Phone, LogOut, Activity, ArrowRight, ShieldCheck,
  Sun, Moon, CloudSun, Sparkles, Zap, Quote, Mic
} from 'lucide-react';
import { useSpeechSOS } from '../hooks/useSpeechSOS';
import { useToast } from '../components/ToastContext'; 

const StudentDashboard = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [greeting, setGreeting] = useState("Good Morning");
  const [streak, setStreak] = useState(1);
  const [studentProfile, setStudentProfile] = useState(null);


  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [academic, setAcademic] = useState(3);
  const [social, setSocial] = useState(3);
  const [journalEntry, setJournalEntry] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    
    const storedProfile = localStorage.getItem('studentProfile');
    if (storedProfile) {
      setStudentProfile(JSON.parse(storedProfile));
    }


    const checkStreak = () => {
      const today = new Date().toDateString();
      const lastLogin = localStorage.getItem('lastLoginDate');
      const currentStreak = parseInt(localStorage.getItem('mindCareStreak') || '0');

      if (lastLogin !== today) {
        if (lastLogin === new Date(Date.now() - 86400000).toDateString()) {
          setStreak(currentStreak + 1);
          localStorage.setItem('mindCareStreak', (currentStreak + 1).toString());
        } else {
          setStreak(1);
          localStorage.setItem('mindCareStreak', '1');
        }
        localStorage.setItem('lastLoginDate', today);
      } else {
        setStreak(currentStreak || 1);
      }
    };
    checkStreak();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('studentProfile'); 
    navigate('/');
  };

  const { addToast } = useToast();

  const handleVoiceTrigger = (word) => {
    addToast(`Voice Alert Triggered: "${word}"`, 'error');
    navigate('/emergency'); 
  };

  const { isListening, startListening, stopListening } = useSpeechSOS(handleVoiceTrigger);

  
  const handleSOSClick = () => {
    
    navigate('/emergency');
  };

  const handleSubmitCheckIn = async () => {
    setSubmitting(true);
    try {
      await apiRequest('/student/checkin', 'POST', {
        mood, stress, sleep, academic, social, journalEntry
      });
      addToast("Check-in saved successfully!", "success");
      setShowCheckIn(false);
    } catch (error) {
      console.error(error);
      addToast("Failed to save check-in.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-500 overflow-x-hidden ${darkMode ? 'bg-[#0B1120] text-white' : 'bg-[#F0F4F8] text-slate-900'}`}>

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-40 animate-pulse ${darkMode ? 'bg-blue-900' : 'bg-blue-200'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-40 animate-pulse delay-1000 ${darkMode ? 'bg-purple-900' : 'bg-purple-200'}`}></div>
      </div>

      <nav className={`px-6 py-4 flex justify-between items-center sticky top-4 mx-4 rounded-2xl z-50 backdrop-blur-xl border shadow-sm transition-all ${darkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/60 border-white/50'}`}>
        <div className="font-extrabold text-xl tracking-tight flex items-center gap-3">
          <ShieldCheck className="text-blue-600" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">MindCare</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className={`p-2.5 rounded-full transition-all hover:scale-110 active:scale-95 ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-600 shadow-sm'}`}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={handleLogout} className={`flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-full border transition-all hover:scale-105 active:scale-95 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-red-400' : 'bg-white border-white text-slate-600 hover:text-red-500 shadow-sm'}`}>
            Sign Out <LogOut size={16} />
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 pt-8 pb-20">

        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                Student Portal
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                <Zap size={14} fill="currentColor" /> {streak} Day Streak!
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">{studentProfile?.nickname || studentProfile?.displayName || user?.displayName?.split(' ')[0]}</span>
            </h1>
            <p className={`text-lg font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Department: {studentProfile?.department || "General"} | Year: {studentProfile?.year || "-"}
            </p>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* AI Companion Card */}
          <div onClick={() => navigate('/student/chat')} className="md:col-span-7 relative group cursor-pointer overflow-hidden rounded-[2.5rem] bg-[#2563EB] text-white shadow-xl shadow-blue-500/20 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
            <div className="p-10 h-full flex flex-col justify-between relative z-10">
              <div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                  <MessageCircle size={28} color="white" strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-bold mb-2">AI Companion</h2>
                <p className="text-blue-100 text-lg opacity-90 max-w-sm">
                  Feeling overwhelmed? Chat privately with your 24/7 AI wellness assistant.
                </p>
              </div>
              <div className="flex items-center justify-between mt-8">
                <button className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-blue-50 transition-colors">
                  Start Chat <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* CHECK-IN CARD */}
          <div className={`md:col-span-5 relative overflow-hidden rounded-[2.5rem] border shadow-lg transition-all duration-300 flex flex-col ${darkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-white border-white hover:border-blue-100 shadow-slate-200/50'}`}>
            {!showCheckIn ? (
              <div className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                      <Activity size={24} />
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>Daily Task</span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Daily Check-In</h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Track your mood & stress to unlock insights.
                  </p>
                </div>
                <button onClick={() => setShowCheckIn(true)} className="w-full py-4 mt-6 bg-[#0D9488] text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  Log Today's Mood <Sparkles size={18} />
                </button>
              </div>
            ) : (
              <div className="p-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Today's Stats</h3>
                  <button onClick={() => setShowCheckIn(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">CANCEL</button>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <Slider label="Stress Level" value={stress} setValue={setStress} min="Low" max="High" color="text-emerald-500" darkMode={darkMode} />
                  <Slider label="Sleep Quality" value={sleep} setValue={setSleep} min="Bad" max="Good" color="text-blue-500" darkMode={darkMode} />
                  <Slider label="Social Activity" value={social} setValue={setSocial} min="Low" max="High" color="text-purple-500" darkMode={darkMode} />

                  {/* NEW: Journal Entry */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Thoughts / Journal
                    </label>
                    <textarea
                      className={`w-full p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition ${darkMode ? 'bg-slate-700 text-white placeholder-slate-400' : 'bg-slate-100 text-slate-900 placeholder-slate-500'}`}
                      placeholder="How are you feeling today? (Optional)"
                      rows="3"
                      value={journalEntry}
                      onChange={(e) => setJournalEntry(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSubmitCheckIn}
                  disabled={submitting}
                  className={`w-full py-3 mt-4 font-bold rounded-xl transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-900 text-white hover:bg-black'}`}
                >
                  {submitting ? "Analyzing..." : "Save Entry"}
                </button>
              </div>
            )}
          </div>

          {/* SOS BUTTON - NOW CONNECTED TO FIREBASE */}
          {/* SOS BUTTON - NOW CONNECTED TO FIREBASE */}
          <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
            <button onClick={handleSOSClick} className="w-full group relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-red-500 to-rose-600 p-1 shadow-xl shadow-red-500/20 transition-all hover:scale-[1.01]">
              <div className={`relative flex items-center justify-between rounded-[1.8rem] px-8 py-6 transition-all ${darkMode ? 'bg-slate-900/90 group-hover:bg-slate-900/0' : 'bg-white group-hover:bg-white/10'}`}>
                <div className="flex items-center gap-6">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-500'}`}>
                    <Phone className="h-8 w-8 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h3 className={`text-2xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-slate-900 group-hover:text-white'}`}>Emergency SOS</h3>
                    <p className={`font-medium transition-colors ${darkMode ? 'text-slate-400 group-hover:text-red-100' : 'text-slate-500 group-hover:text-red-100'}`}>
                      Click to send Alert with Location & Details
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <ArrowRight className="text-white" />
                </div>
              </div>
            </button>

            {/* VOICE SOS TOGGLE */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative overflow-hidden rounded-[2rem] p-1 shadow-xl transition-all hover:scale-105 ${isListening ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-red-500/20' : 'bg-slate-200 dark:bg-slate-800'}`}
            >
              <div className={`h-full flex flex-col items-center justify-center rounded-[1.8rem] px-8 py-4 min-w-[140px] transition-all ${isListening ? 'bg-transparent text-white' : 'bg-white dark:bg-slate-900 text-slate-500'}`}>
                <Mic size={32} className={isListening ? 'animate-bounce' : ''} />
                <span className="text-xs font-bold uppercase tracking-wider mt-2">
                  {isListening ? 'Listening...' : 'Enable Voice'}
                </span>
                {isListening && <div className="absolute inset-0 bg-white/20 animate-pulse rounded-[2rem]"></div>}
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};


const Slider = ({ label, value, setValue, min, max, color, darkMode }) => (
  <div>
    <div className="flex justify-between mb-2 text-xs font-bold uppercase tracking-wide">
      <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{label}</span>
      <span className={color}>{value}/5</span>
    </div>
    <input
      type="range" min="1" max="5" value={value}
      onChange={(e) => setValue(e.target.value)}
      className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-current ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} ${color}`}
    />
    <div className="flex justify-between text-[10px] mt-1 font-bold text-slate-400">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

export default StudentDashboard;
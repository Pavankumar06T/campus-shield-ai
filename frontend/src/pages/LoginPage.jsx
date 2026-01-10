import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { useToast } from '../components/ToastContext';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {
  Shield, Lock, ArrowLeft, Sun, Moon, ArrowRight, Smile, Zap, Heart
} from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('student');
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');

  const handleLogin = async () => {
   
    if (activeTab === 'student' && !nickname.trim()) {
      addToast("Please enter a Nickname for today!", "warning");
      return;
    }

    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const existingData = userDocSnap.exists() ? userDocSnap.data() : {};

      const updateData = {
        uid: user.uid,
        email: user.email,
        lastLogin: new Date(),
        ...(activeTab === 'student' && {
          nickname: nickname,
          role: 'student' 
        }),
        ...(activeTab === 'admin' && {
          role: 'admin' 
        })
      };

      
      await setDoc(userDocRef, updateData, { merge: true });

      
      const finalProfile = { ...existingData, ...updateData };
      localStorage.setItem('studentProfile', JSON.stringify(finalProfile));

      window.location.href = activeTab === 'admin' ? '/admin' : '/student';

    } catch (error) {
      console.error(error);
      addToast("Login Failed: " + error.message, "error");
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative font-sans transition-colors duration-500 overflow-hidden ${darkMode ? 'bg-[#0f172a] text-white' : 'bg-[#fafafa] text-slate-900'}`}>

      {/* --- BACKGROUND ACCENTS --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 animate-pulse ${darkMode ? 'bg-blue-600' : 'bg-blue-300'}`}></div>
        <div className={`absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 animate-pulse delay-1000 ${darkMode ? 'bg-purple-600' : 'bg-purple-300'}`}></div>
      </div>

      {/* --- TOP NAV --- */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all hover:scale-105 ${darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white/60 border-black/5 text-slate-600 hover:bg-white'}`}
        >
          <ArrowLeft size={18} /> <span className="text-sm font-bold">Home</span>
        </button>

        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full backdrop-blur-md border transition-all hover:rotate-12 ${darkMode ? 'bg-white/5 border-white/10 text-yellow-400' : 'bg-white/60 border-black/5 text-slate-600'}`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>

      {/* --- REIMAGINED AUTH CARD --- */}
      <div className={`relative z-10 w-full max-w-[440px] mx-4 p-8 md:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl border transition-all duration-300 ${darkMode ? 'bg-[#1e293b]/70 border-white/10 shadow-black/50' : 'bg-white/80 border-white/60 shadow-xl shadow-slate-200/50'}`}>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white transform rotate-3 hover:rotate-6 transition-transform">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Welcome Back</h1>
          <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Ready to check in? safe space active.
          </p>
        </div>

        {/* Role Toggle */}
        <div className={`grid grid-cols-2 p-1.5 rounded-2xl mb-8 border ${darkMode ? 'bg-[#0f172a]/50 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setActiveTab('student')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'student'
              ? (darkMode ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-900 shadow-md')
              : 'text-slate-400 hover:text-slate-500'}`}
          >
            <Smile size={18} /> Student
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'admin'
              ? (darkMode ? 'bg-slate-700 text-white shadow-lg' : 'bg-white text-slate-900 shadow-md')
              : 'text-slate-400 hover:text-slate-500'}`}
          >
            <Lock size={18} /> Admin
          </button>
        </div>

        {/* Input & Action */}
        <div className="space-y-6">

          {/* Nickname (Student Only) */}
          <div className={`transition-all duration-300 overflow-hidden ${activeTab === 'student' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Daily Alias / Nickname</label>
            <div className="relative group">
              <Zap className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${darkMode ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Your Nickname"
                className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none border-2 font-bold transition-all ${darkMode ? 'bg-[#0f172a]/50 border-slate-700 focus:border-blue-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'}`}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''
              } ${activeTab === 'admin'
                ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-lg shadow-slate-900/20'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/30'
              }`}
          >
            {loading ? "Connecting..." : (
              <>Continue with Google <ArrowRight size={20} /></>
            )}
          </button>

          <div className="text-center pt-2">
            <button onClick={() => navigate('/register')} className={`text-sm font-bold transition-colors ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
              First time here? <span className="underline decoration-2 underline-offset-2">Create Safety ID</span>
            </button>
          </div>
        </div>

      </div>

      {/* Footer Branding */}
      <div className={`absolute bottom-6 text-center w-full text-xs font-bold tracking-widest uppercase opacity-40 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        Secure Campus Initiative
      </div>

    </div>
  );
};

export default LoginPage;
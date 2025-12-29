import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext'; // Import Theme Logic
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Shield, Lock, GraduationCap, ArrowLeft, User, Sun, Moon } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme(); // Use Theme Hook
  
  const [activeTab, setActiveTab] = useState('student');
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState(""); 

  const handleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const finalName = customName.trim() || user.displayName;

      if (customName.trim()) {
        await updateProfile(user, { displayName: finalName });
      }

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: finalName,
          role: activeTab,
          createdAt: new Date()
        });
      }
      navigate(activeTab === 'admin' ? '/admin' : '/student');
    } catch (error) {
      console.error(error);
      alert("Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Top Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <button onClick={() => navigate('/')} className={`flex items-center gap-2 transition ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'}`}>
          <ArrowLeft size={20} /> Back to Home
        </button>

        {/* Theme Toggle Button */}
        <button onClick={toggleTheme} className={`p-2 rounded-full transition ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm'}`}>
          {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
        </button>
      </div>

      <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className={`p-8 text-center bg-gradient-to-b ${darkMode ? 'from-slate-800 to-slate-900' : 'from-blue-50 to-white'}`}>
          <div className="mx-auto bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-blue-500/30 transform rotate-3">
            <Shield size={32} />
          </div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Welcome Back</h1>
          <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Secure Campus Access</p>
        </div>

        {/* Tabs */}
        <div className={`flex border-b px-8 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <button 
            className={`flex-1 pb-4 font-medium text-sm flex items-center justify-center gap-2 transition border-b-2 ${activeTab === 'student' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
            onClick={() => setActiveTab('student')}
          >
            <GraduationCap size={18} /> Student
          </button>
          <button 
            className={`flex-1 pb-4 font-medium text-sm flex items-center justify-center gap-2 transition border-b-2 ${activeTab === 'admin' ? (darkMode ? 'border-white text-white' : 'border-slate-900 text-slate-900') : 'border-transparent text-slate-400'}`}
            onClick={() => setActiveTab('admin')}
          >
            <Lock size={18} /> Admin
          </button>
        </div>

        <div className="p-8 space-y-4">
          {/* Name Input */}
          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ml-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your Name</label>
            <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition ${darkMode ? 'bg-slate-950 border-slate-700 focus-within:border-blue-500' : 'bg-slate-50 border-slate-200 focus-within:border-blue-500'}`}>
              <User size={18} className="text-slate-400"/>
              <input 
                type="text" 
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={activeTab === 'admin' ? "Enter Admin Name" : "Enter Student Name"} 
                className={`bg-transparent border-none outline-none w-full text-sm font-medium ${darkMode ? 'text-white placeholder-slate-600' : 'text-slate-900 placeholder-slate-400'}`}
              />
            </div>
          </div>

          <button 
            onClick={handleLogin}
            disabled={loading}
            className={`w-full text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 ${activeTab === 'admin' ? (darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-900 hover:bg-black') : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? "Connecting..." : "Continue with Google"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { 
  Shield, Lock, GraduationCap, ArrowLeft, User, Sun, Moon, 
  Building, BookOpen, ChevronRight, CheckCircle2 
} from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('student');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: '',
    section: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    // Validation
    if (!formData.name.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (activeTab === 'student') {
        if (!formData.department || !formData.year || !formData.section) {
            alert("Please fill in all student details.");
            return;
        }
    }

    setLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: formData.name,
        role: activeTab,
        lastLogin: new Date(),
        ...(activeTab === 'student' && {
            department: formData.department,
            year: formData.year,
            section: formData.section
        })
      };

      localStorage.setItem('studentProfile', JSON.stringify(userProfile));
      await setDoc(doc(db, "users", user.uid), userProfile, { merge: true });
      window.location.href = activeTab === 'admin' ? '/admin' : '/student';
      
    } catch (error) {
      console.error(error);
      alert("Login Failed: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-500 font-sans ${darkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      
      {/* --- ANIMATED BACKGROUND BLOBS --- */}
      <div className={`absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none`}>
        <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob ${darkMode ? 'bg-blue-900' : 'bg-blue-300'}`}></div>
        <div className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000 ${darkMode ? 'bg-purple-900' : 'bg-purple-300'}`}></div>
        <div className={`absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-4000 ${darkMode ? 'bg-indigo-900' : 'bg-indigo-300'}`}></div>
      </div>

      {/* --- TOP NAVIGATION --- */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
        <button 
          onClick={() => navigate('/')} 
          className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all hover:scale-105 ${darkMode ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-white/60 border-black/5 text-slate-700 hover:bg-white/80'}`}
        >
          <ArrowLeft size={18} /> <span className="text-sm font-medium">Back to Home</span>
        </button>

        <button 
          onClick={toggleTheme} 
          className={`p-3 rounded-full backdrop-blur-md border transition-all hover:rotate-12 ${darkMode ? 'bg-white/10 border-white/10 text-yellow-400' : 'bg-white/60 border-black/5 text-slate-700'}`}
        >
          {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
        </button>
      </nav>

      {/* --- MAIN LOGIN CARD --- */}
      <div className={`relative z-10 w-full max-w-[480px] mx-4 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl border transition-all duration-300 ${darkMode ? 'bg-slate-900/60 border-white/10 shadow-black/50' : 'bg-white/70 border-white/40 shadow-xl'}`}>
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-lg transform rotate-3 transition-transform hover:rotate-6 ${darkMode ? 'bg-blue-600 shadow-blue-500/20' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/30'}`}>
            <Shield size={40} className="text-white" />
          </div>
          <h1 className={`text-3xl font-black tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Welcome Back
          </h1>
          <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Secure access to your campus safety network
          </p>
        </div>

        {/* Custom Segmented Control Tabs */}
        <div className={`relative flex p-1.5 rounded-2xl mb-8 border ${darkMode ? 'bg-slate-950/50 border-white/5' : 'bg-slate-100/80 border-slate-200'}`}>
          {/* Sliding Background */}
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl shadow-sm transition-all duration-300 ease-out ${activeTab === 'student' ? 'left-1.5' : 'left-[calc(50%+3px)]'} ${darkMode ? 'bg-blue-600' : 'bg-white'}`}
          ></div>

          <button 
            onClick={() => setActiveTab('student')}
            className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-colors z-10 ${activeTab === 'student' ? (darkMode ? 'text-white' : 'text-slate-800') : 'text-slate-400 hover:text-slate-500'}`}
          >
            <GraduationCap size={18} /> Student
          </button>
          
          <button 
            onClick={() => setActiveTab('admin')}
            className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-colors z-10 ${activeTab === 'admin' ? (darkMode ? 'text-white' : 'text-slate-800') : 'text-slate-400 hover:text-slate-500'}`}
          >
            <Lock size={18} /> Admin
          </button>
        </div>

        {/* Form Inputs */}
        <div className="space-y-5">
          
          <InputField 
            icon={User} 
            name="name" 
            placeholder="Full Name" 
            value={formData.name} 
            onChange={handleInputChange} 
            darkMode={darkMode}
          />

          {/* Animated Student Fields */}
          <div className={`space-y-5 overflow-hidden transition-all duration-500 ease-in-out ${activeTab === 'student' ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
            
            <div className="relative group">
              <Building className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${darkMode ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
              <select 
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border-2 font-medium transition-all appearance-none cursor-pointer ${darkMode ? 'bg-slate-800/50 border-slate-700 focus:border-blue-500 text-white placeholder-slate-500' : 'bg-white border-slate-100 focus:border-blue-500 text-slate-800'}`}
              >
                <option value="">Select Department</option>
                <option value="AI&DS">Artificial intelligence and Data science (AI&DS)</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="IT">Information Tech (IT)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="MECH">Mechanical</option>
                <option value="CIVIL">Civil</option>
              </select>
              <ChevronRight className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none rotate-90 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}/>
            </div>

            <div className="flex gap-4">
               <div className="relative group flex-1">
                 <GraduationCap className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${darkMode ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
                 <select 
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border-2 font-medium transition-all appearance-none cursor-pointer ${darkMode ? 'bg-slate-800/50 border-slate-700 focus:border-blue-500 text-white' : 'bg-white border-slate-100 focus:border-blue-500 text-slate-800'}`}
                 >
                    <option value="">Year</option>
                    <option value="1">1st</option>
                    <option value="2">2nd</option>
                    <option value="3">3rd</option>
                    <option value="4">4th</option>
                 </select>
                 <ChevronRight className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none rotate-90 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}/>
               </div>

               <div className="flex-1">
                 <InputField 
                    icon={BookOpen} 
                    name="section" 
                    placeholder="Section" 
                    value={formData.section} 
                    onChange={handleInputChange} 
                    darkMode={darkMode}
                  />
               </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-4 mt-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
            } ${
                activeTab === 'admin' 
                ? (darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-900 hover:bg-black text-white') 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
            }`}
          >
            {loading ? (
                <>Processing...</>
            ) : (
                <>
                   Continue with Google <ChevronRight size={20} className="opacity-80"/>
                </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className={`text-center mt-8 text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          <Shield size={12} className="inline mr-1 mb-0.5"/> Protected by SafeCampus Secure Login
        </p>

      </div>
    </div>
  );
};

// Reusable Input Component
const InputField = ({ icon: Icon, name, placeholder, value, onChange, darkMode }) => (
  <div className="relative group">
    <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${darkMode ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} />
    <input 
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder} 
      className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border-2 font-medium transition-all ${darkMode ? 'bg-slate-800/50 border-slate-700 focus:border-blue-500 text-white placeholder-slate-500' : 'bg-white border-slate-100 focus:border-blue-500 text-slate-900 placeholder-slate-400'}`}
    />
  </div>
);

export default LoginPage;
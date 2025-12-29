import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext'; // <--- USE THEME
import { Shield, MessageCircle, Activity, Lock, Users, ArrowRight, Bell, Menu, X, CheckCircle, Sun, Moon } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme(); // <--- HOOK
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-white text-gray-900'}`}>
      
      {/* Navbar */}
      <nav className={`fixed w-full backdrop-blur-md z-50 border-b transition-colors duration-300 ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/90 border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-2xl text-blue-600">
            <Shield className="fill-blue-600 text-blue-600" /> Campus Shield AI
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className={`p-2 rounded-full transition ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
              {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            
            <button onClick={() => navigate('/login')} className={`px-6 py-2 font-medium transition ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'}`}>Login</button>
            <button onClick={() => navigate('/login')} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">Get Started</button>
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className={darkMode ? 'text-white' : 'text-gray-900'}/> : <Menu className={darkMode ? 'text-white' : 'text-gray-900'}/>}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-6 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          AI-Powered Student Safety
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Early Detection. <br/><span className="text-blue-600">Timely Support.</span>
        </h1>
        <p className={`text-xl mb-10 leading-relaxed max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          A privacy-first platform that listens to students, identifies early signs of stress, and triggers timely human support.
        </p>
        <div className="flex justify-center gap-4">
          <button onClick={() => navigate('/login')} className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-full hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20">
            Start Your Wellness Journey <ArrowRight size={20}/>
          </button>
        </div>
      </header>

      {/* How It Works */}
      <section className={`py-20 px-6 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How Campus Shield Works</h2>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>A seamless flow from student expression to administrative action.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard number="1" title="Student Activity" desc="Students chat with AI & fill daily check-in forms." icon={<MessageCircle className="text-blue-600"/>} darkMode={darkMode} />
            <StepCard number="2" title="AI Analysis" desc="System detects stress patterns & sentiment privately." icon={<Activity className="text-teal-500"/>} darkMode={darkMode} />
            <StepCard number="3" title="Risk Scoring" desc="Generates anonymous risk scores for the dashboard." icon={<Lock className="text-purple-500"/>} darkMode={darkMode} />
            <StepCard number="4" title="Admin Action" desc="Alerts counselors only when high-risk is detected." icon={<Bell className="text-red-500"/>} darkMode={darkMode} />
          </div>
        </div>
      </section>

      {/* Two Roles Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Two Separate Roles</h2>
        <div className="grid md:grid-cols-2 gap-12">
          
          {/* Student Role Card */}
          <div className={`p-8 rounded-2xl border shadow-lg hover:shadow-xl transition relative overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="text-blue-600"/> Student Portal
            </h3>
            <ul className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li className="flex items-start gap-3"><CheckCircle size={20} className="text-blue-600 shrink-0"/> Fill non-invasive stress forms (1-5 scale)</li>
              <li className="flex items-start gap-3"><CheckCircle size={20} className="text-blue-600 shrink-0"/> Chat with AI friend (Private)</li>
              <li className="flex items-start gap-3"><CheckCircle size={20} className="text-blue-600 shrink-0"/> Use SOS / Emergency Button</li>
            </ul>
          </div>

          {/* Admin Role Card */}
          <div className={`p-8 rounded-2xl border shadow-lg hover:shadow-xl transition relative overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-900 text-white'}`}>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Lock className="text-teal-400"/> Admin Dashboard
            </h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3"><div className="w-2 h-2 bg-teal-400 rounded-full mt-2"/> View Overall Stress Heatmaps</li>
              <li className="flex items-start gap-3"><div className="w-2 h-2 bg-teal-400 rounded-full mt-2"/> High-Risk Alerts (IDs Only)</li>
              <li className="flex items-start gap-3"><div className="w-2 h-2 bg-teal-400 rounded-full mt-2"/> Emergency Notifications</li>
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
};

const StepCard = ({ number, title, desc, icon, darkMode }) => (
  <div className={`p-6 rounded-xl border shadow-sm relative hover:-translate-y-1 transition duration-300 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
    <div className={`absolute -top-4 -left-4 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg ${darkMode ? 'bg-blue-600 text-white' : 'bg-gray-900 text-white'}`}>{number}</div>
    <div className={`mb-4 w-12 h-12 rounded-lg flex items-center justify-center ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>{icon}</div>
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
  </div>
);

export default LandingPage;
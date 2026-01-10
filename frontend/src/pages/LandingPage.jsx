import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { Shield, MessageCircle, Activity, Lock, Users, ArrowRight, Bell, Menu, X, CheckCircle, Sun, Moon, Sparkles, Heart, Download } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Show custom instruction modal instead of alert
      setShowInstallModal(true);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 selection:bg-blue-500 selection:text-white ${darkMode ? 'bg-[#0f172a] text-white' : 'bg-[#fafafa] text-slate-900'}`}>

      {/* --- INSTALL INSTRUCTION MODAL --- */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className={`relative max-w-md w-full p-8 rounded-3xl shadow-2xl ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
            <button onClick={() => setShowInstallModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition">
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Install App</h3>
              <p className="text-sm opacity-70">Get the best experience by installing Campus Shield on your device.</p>
            </div>

            <div className={`space-y-4 text-left p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1 font-bold text-blue-500">1.</div>
                <div>
                  <p className="font-bold text-sm">Review URL Bar</p>
                  <p className="text-xs opacity-70">Look for the <span className="inline-block border rounded px-1 text-[10px]">🖥️ Install</span> icon on the right side of your browser address bar.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 font-bold text-blue-500">2.</div>
                <div>
                  <p className="font-bold text-sm">Already Installed?</p>
                  <p className="text-xs opacity-70">If the icon is missing, you might already have the app installed! Check your desktop or apps menu.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 font-bold text-blue-500">3.</div>
                <div>
                  <p className="font-bold text-sm">Browser Menu</p>
                  <p className="text-xs opacity-70">Alternatively, click the browser menu (⋮) &rarr; "Cast, save, and share" &rarr; "Install CampusShield".</p>
                </div>
              </div>
            </div>

            <button onClick={() => setShowInstallModal(false)} className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* --- BACKGROUND ACCENTS --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[20%] -left-[10%] w-[700px] h-[700px] rounded-full blur-[120px] opacity-20 animate-pulse ${darkMode ? 'bg-blue-800' : 'bg-blue-300'}`}></div>
        <div className={`absolute top-[40%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 animate-pulse delay-1000 ${darkMode ? 'bg-purple-800' : 'bg-purple-300'}`}></div>
        <div className={`absolute -bottom-[20%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 animate-pulse delay-2000 ${darkMode ? 'bg-teal-800' : 'bg-teal-300'}`}></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-xl border-b ${darkMode ? 'bg-[#0f172a]/80 border-white/5' : 'bg-white/70 border-black/5'}`}>
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className={`p-2.5 rounded-2xl transition-transform duration-300 group-hover:rotate-12 ${darkMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'}`}>
              <Shield size={28} fill="currentColor" className="opacity-90" />
            </div>
            <span className="font-black text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              CampusShield
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 border ${darkMode ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' : 'bg-white border-black/5 text-slate-600 hover:bg-slate-50'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className={`h-8 w-[1px] ${darkMode ? 'bg-white/10' : 'bg-black/5'}`}></div>

            {/* INSTALL APP BUTTON (Always Visible for user clarity) */}
            <button
              onClick={handleInstallClick}
              className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border transition-all ${darkMode ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' : 'border-blue-100 text-blue-600 hover:bg-blue-50'}`}
            >
              <Download size={16} /> Install App
            </button>

            <button
              onClick={() => navigate('/login')}
              className={`text-sm font-bold transition-colors ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-blue-600'}`}
            >
              Member Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="group relative px-8 py-3 bg-[#2563EB] text-white font-bold rounded-full transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">Get Started <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border backdrop-blur-md animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}>
            <span className={`relative flex h-2.5 w-2.5`}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className={`text-xs font-bold tracking-wide uppercase ${darkMode ? 'text-slate-300 border-white/10 bg-white/5' : 'text-slate-600 border-black/5 bg-white/40'}`}>
              AI-Powered Student Safety Net
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1] animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}>
            Silence isn't <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#EC4899] animate-gradient-x">
              always safe.
            </span>
          </h1>

          <p className={`text-xl md:text-2xl font-medium mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}
            style={{ animationDelay: '0.3s' }}>
            A privacy-first platform that listens to the unsaid.
            From subtle stress signals to instant emergency response,
            we bridge the gap between students and support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-full shadow-xl shadow-blue-500/25 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => navigate('/login')}
              className={`w-full sm:w-auto px-10 py-5 rounded-full font-bold text-lg border-2 transition-all hover:bg-opacity-10 ${darkMode ? 'border-slate-700 text-white hover:bg-white' : 'border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-transparent'}`}
            >
              Member Login
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className={`py-32 px-6 relative z-10 ${darkMode ? 'bg-[#0B1120]/50' : 'bg-white/50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6">How it works</h2>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Seamless integration of technology and empathy.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <FeatureCard
              icon={MessageCircle}
              color="text-blue-500"
              bg={darkMode ? "bg-blue-500/10" : "bg-blue-50"}
              title="Private Chat"
              desc="Vent to an AI companion that listens without judgment, 24/7."
              delay="0s"
              darkMode={darkMode}
            />
            <FeatureCard
              icon={Sparkles}
              color="text-purple-500"
              bg={darkMode ? "bg-purple-500/10" : "bg-purple-50"}
              title="Smart Detection"
              desc="Natural Language Processing identifies distress signals instantly."
              delay="0.1s"
              darkMode={darkMode}
            />
            <FeatureCard
              icon={Lock}
              color="text-emerald-500"
              bg={darkMode ? "bg-emerald-500/10" : "bg-emerald-50"}
              title="Privacy First"
              desc="Your data is anonymized. Identity is revealed only in emergencies."
              delay="0.2s"
              darkMode={darkMode}
            />
            <FeatureCard
              icon={Bell}
              color="text-red-500"
              bg={darkMode ? "bg-red-500/10" : "bg-red-50"}
              title="Instant Alert"
              desc="Critical triggers dispatch immediate help to your exact location."
              delay="0.3s"
              darkMode={darkMode}
            />
          </div>
        </div>
      </section>

      {/* --- ROLES SECTION --- */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Student Card */}
            <div className={`relative p-10 rounded-[2.5rem] overflow-hidden group transition-all duration-500 hover:scale-[1.02] ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-2xl shadow-slate-200/50 border border-slate-100'}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>

              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  <Users size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-4">Student Portal</h3>
                <p className={`text-lg mb-8 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Your safe space to reflect, track mood, and seek help.
                  Completely private unless you're in danger.
                </p>
                <ul className="space-y-4 mb-8">
                  <ListItem text="Daily Mood Tracking" darkMode={darkMode} />
                  <ListItem text="Anonymous AI Support" darkMode={darkMode} />
                  <ListItem text="One-Tap SOS Beacon" darkMode={darkMode} />
                </ul>
                <button onClick={() => navigate('/login')} className={`font-bold border-b-2 border-transparent hover:border-current transition-all ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Login as Student →
                </button>
              </div>
            </div>

            {/* Admin Card */}
            <div className={`relative p-10 rounded-[2.5rem] overflow-hidden group transition-all duration-500 hover:scale-[1.02] ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20'}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-white/10 text-emerald-400">
                  <Lock size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white">Admin Dashboard</h3>
                <p className="text-lg mb-8 leading-relaxed text-slate-400">
                  Powerful oversight with privacy controls. Monitor campus sentiment
                  and intervene precisely when needed.
                </p>
                <ul className="space-y-4 mb-8">
                  <ListItem text="Real-time Risk Heatmaps" darkMode={true} />
                  <ListItem text="Smart Trigger Detection" darkMode={true} />
                  <ListItem text="Emergency Dispatch System" darkMode={true} />
                </ul>
                <button onClick={() => navigate('/login')} className="font-bold border-b-2 border-transparent hover:border-current transition-all text-emerald-400">
                  Access Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className={`py-12 text-center border-t ${darkMode ? 'border-white/5 bg-[#0f172a]' : 'border-slate-100 bg-white'}`}>
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
          <Shield size={16} /> CampusShield AI • 2026
        </div>
        <p className={`text-sm ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
          Designed for Safety. Built with <Heart size={12} className="inline text-red-500 mx-1" fill="currentColor" /> by Engineering
        </p>
      </footer>

    </div>
  );
};

const FeatureCard = ({ icon: Icon, color, bg, title, desc, delay, darkMode }) => (
  <div className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${darkMode ? 'bg-slate-800/50 border-white/5 hover:bg-slate-800' : 'bg-white border-slate-100 hover:border-blue-100 shadow-sm'}`}
    style={{ animationDelay: delay }}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${bg} ${color}`}>
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
      {desc}
    </p>
  </div>
);

const ListItem = ({ text, darkMode }) => (
  <li className={`flex items-center gap-3 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
    <div className={`p-1 rounded-full ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
      <CheckCircle size={14} />
    </div>
    {text}
  </li>
);

export default LandingPage;
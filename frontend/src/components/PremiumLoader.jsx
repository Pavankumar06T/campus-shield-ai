import React from 'react';
import { Shield } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';

const PremiumLoader = () => {
    const { darkMode } = useTheme();

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-900'}`}>

            
            <div className={`absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full blur-[120px] animate-pulse ${darkMode ? 'bg-blue-600/20' : 'bg-blue-400/20'}`}></div>
            <div className={`absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full blur-[120px] animate-pulse delay-1000 ${darkMode ? 'bg-purple-600/20' : 'bg-purple-400/20'}`}></div>

            
            <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-xl opacity-20 animate-ping ${darkMode ? 'bg-blue-500' : 'bg-blue-400'}`}></div>
                <div className={`relative z-10 p-6 backdrop-blur-xl border rounded-3xl shadow-2xl ${darkMode ? 'bg-slate-900/50 border-white/10' : 'bg-white/50 border-slate-200'}`}>
                    <Shield size={64} className="text-blue-500 animate-pulse" fill="currentColor" fillOpacity={0.2} />
                </div>
            </div>

           
            <div className="mt-8 text-center space-y-2 relative z-10">
                <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 animate-gradient-x">
                    CampusShield AI
                </h1>
                <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    <span className={`text-xs font-bold tracking-widest uppercase ml-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Initializing System</span>
                </div>
            </div>

        </div>
    );
};

export default PremiumLoader;

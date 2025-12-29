import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { MessageCircle, ArrowLeft, Send, Sparkles, MoreVertical, Shield } from 'lucide-react';

const StudentChat = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme(); 
  const bottomRef = useRef(null);
  
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Hello! I'm MindCare AI. I'm here to listen without judgment. How are you feeling right now?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiResponses = [
        "I hear you. That sounds really tough.",
        "It's completely normal to feel that way given the pressure.",
        "Have you been sleeping okay lately?",
        "Remember to take deep breaths. I'm here for you.",
        "Would you like some tips on managing that stress?"
      ];
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: randomResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 overflow-hidden ${darkMode ? 'bg-[#0B1120] text-white' : 'bg-[#F0F4F8] text-slate-900'}`}>
      
      {/* 1. ANIMATED BACKGROUND (MATCHES DASHBOARD) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-40 animate-pulse ${darkMode ? 'bg-blue-900' : 'bg-blue-200'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-40 animate-pulse delay-1000 ${darkMode ? 'bg-purple-900' : 'bg-purple-200'}`}></div>
      </div>

      {/* 2. HEADER */}
      <header className={`px-6 py-4 shadow-sm border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/student')} className={`p-2 rounded-full transition ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
               <Sparkles size={20} fill="white" />
             </div>
             <div>
               <h1 className={`font-bold leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>MindCare Assistant</h1>
               <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Online • Private</p>
               </div>
             </div>
          </div>
        </div>
        <div className="flex gap-2">
           <button className={`p-2 rounded-full transition ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><Shield size={20}/></button>
           <button className={`p-2 rounded-full transition ${darkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}><MoreVertical size={20}/></button>
        </div>
      </header>

      {/* 3. CHAT AREA */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-6 overflow-y-auto custom-scrollbar">
        <div className="text-center mb-8">
           <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-500'}`}>Today</span>
        </div>

        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'ai' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : (darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border')}`}>
                 {msg.sender === 'ai' ? <Sparkles size={14}/> : <div className="font-bold text-[10px]">ME</div>}
              </div>

              <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-[#2563EB] text-white rounded-tr-none' 
                  : (darkMode ? 'bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-none backdrop-blur-sm' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none')
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
             <div className="flex gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shrink-0"><Sparkles size={14}/></div>
                <div className={`p-4 rounded-2xl rounded-tl-none border flex gap-1 items-center h-10 ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-100'}`}>
                   <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                   <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                   <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                </div>
             </div>
          )}
          <div ref={bottomRef}></div>
        </div>
      </div>

      {/* 4. INPUT AREA */}
      <div className={`p-4 border-t sticky bottom-0 backdrop-blur-xl ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
        <div className="max-w-3xl mx-auto flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message here..." 
            className={`flex-1 border rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition font-medium ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-[#2563EB] hover:bg-blue-700 text-white p-3.5 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
        <p className={`text-center text-[10px] mt-3 font-medium opacity-60 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          AI can make mistakes. In emergencies, use the SOS button.
        </p>
      </div>
    </div>
  );
};

export default StudentChat;
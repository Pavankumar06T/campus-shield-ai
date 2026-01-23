import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { apiRequest } from '../api'; 
import { ArrowLeft, Send, Sparkles } from 'lucide-react';

const StudentChat = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme(); 
  const bottomRef = useRef(null);
  
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Hello! I'm MindCare AI. I'm here to listen. How are you feeling?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    

    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      
      const data = await apiRequest('/student/chat', 'POST', { message: userMsg.text });
      
      
      if (data && data.reply) {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.reply }]);
      } else {
        throw new Error("No reply received");
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: "I'm having trouble connecting. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`h-screen flex flex-col font-sans relative ${darkMode ? 'bg-[#0B1120] text-white' : 'bg-[#F0F4F8] text-slate-900'}`}>
      
      {/* 1. Header (Fixed Height) */}
      <header className={`h-16 px-6 shadow-sm border-b flex items-center justify-between shrink-0 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/student')} className="p-2 rounded-full hover:bg-slate-100/10">
            <ArrowLeft size={24} />
          </button>
          <div>
             <h1 className="font-bold">MindCare Assistant</h1>
             <div className="flex items-center gap-1.5">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               <p className="text-xs opacity-60">Online</p>
             </div>
          </div>
        </div>
      </header>

      {/* 2. Messages Area (Scrollable with bottom padding for input) */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'ai' ? 'bg-blue-600 text-white' : 'bg-slate-500 text-white'}`}>
                 {msg.sender === 'ai' ? <Sparkles size={14}/> : "ME"}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : (darkMode ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-white text-slate-800 border border-slate-100')
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center"><Sparkles size={14}/></div>
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                   <span className="animate-pulse">Typing...</span>
                </div>
             </div>
          )}
          <div ref={bottomRef}></div>
        </div>
      </div>

      {/* 3. Input Area (Fixed to Bottom) */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 border-t z-50 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="max-w-3xl mx-auto flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message here..." 
            className={`flex-1 border rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
          />
          <button onClick={handleSend} disabled={!input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl transition disabled:opacity-50">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentChat;
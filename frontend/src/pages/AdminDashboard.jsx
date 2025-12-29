import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useTheme } from '../components/ThemeContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Bell, LogOut, AlertTriangle, Activity, Lock, Sun, Moon, 
  ShieldAlert, Users, Search, MoreVertical, ChevronRight, TrendingUp, Clock 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Modern Smooth Data
const stressData = [
  { name: 'Mon', stress: 2.4 }, { name: 'Tue', stress: 3.1 }, { name: 'Wed', stress: 4.5 },
  { name: 'Thu', stress: 3.8 }, { name: 'Fri', stress: 4.2 }, { name: 'Sat', stress: 2.1 },
  { name: 'Sun', stress: 2.8 },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview'); 
  const LOGO_URL = "/logo.png"; 

  const handleLogout = async () => {
    try { await signOut(auth); navigate('/'); } catch (error) { console.error("Logout Error:", error); }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab darkMode={darkMode} />;
      case 'students': return <StudentsTab darkMode={darkMode} />;
      case 'emergencies': return <EmergenciesTab darkMode={darkMode} />;
      default: return <OverviewTab darkMode={darkMode} />;
    }
  };

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 ${darkMode ? 'bg-[#0B1120]' : 'bg-[#F1F5F9]'}`}>
      
      {/* 1. MODERN SIDEBAR (Glassy Dark) */}
      <aside className={`w-72 hidden md:flex flex-col border-r transition-colors duration-300 ${darkMode ? 'bg-[#0F172A]/90 border-slate-800' : 'bg-white border-slate-200'} backdrop-blur-xl z-20`}>
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <img src={LOGO_URL} alt="Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/20" />
            <div>
               <h1 className={`font-extrabold text-xl tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>MindCare</h1>
               <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500">Admin Control</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className={`text-xs font-bold uppercase tracking-wider pl-3 mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Menu</p>
            <NavItem icon={<LayoutDashboard size={20}/>} text="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} darkMode={darkMode} />
            <NavItem icon={<Users size={20}/>} text="Student Directory" active={activeTab === 'students'} onClick={() => setActiveTab('students')} darkMode={darkMode} />
            <NavItem icon={<Bell size={20}/>} text="Live Alerts" badge="2" active={activeTab === 'emergencies'} onClick={() => setActiveTab('emergencies')} darkMode={darkMode} />
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-dashed border-slate-700/30">
          <button onClick={handleLogout} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 group ${darkMode ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-600'}`}>
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform"/> 
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        {/* Decorative Grid Background */}
        <div className={`absolute inset-0 pointer-events-none opacity-[0.03] ${darkMode ? 'bg-[url("https://grainy-gradients.vercel.app/noise.svg")]' : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]'}`}></div>

        {/* Floating Header */}
        <header className={`sticky top-4 mx-6 rounded-2xl px-6 py-4 flex justify-between items-center z-30 transition-all duration-300 shadow-sm border ${darkMode ? 'bg-[#1E293B]/80 border-slate-700/50 shadow-black/20' : 'bg-white/80 border-white/50 shadow-slate-200/50'} backdrop-blur-md`}>
          <div className="flex items-center gap-4">
             <h2 className={`text-2xl font-bold capitalize tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>{activeTab}</h2>
             <div className={`flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full border ${darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               System Operational
             </div>
          </div>
          
          <div className="flex items-center gap-6">
             <button onClick={toggleTheme} className={`p-2.5 rounded-full transition-all duration-300 ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {darkMode ? <Sun size={18}/> : <Moon size={18}/>}
             </button>
             
             <div className="flex items-center gap-3 pl-6 border-l border-slate-200/20">
                <div className="text-right hidden md:block leading-tight">
                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {user?.displayName || 'Administrator'}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Super Admin</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 p-[2px]">
                  <div className={`w-full h-full rounded-full flex items-center justify-center font-bold ${darkMode ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-800'}`}>
                    {user?.displayName?.[0] || 'A'}
                  </div>
                </div>
             </div>
          </div>
        </header>

        <div className="p-6 pb-20 relative z-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// --- 1. OVERVIEW TAB (Bento Grid Style) ---
const OverviewTab = ({ darkMode }) => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <ModernStatCard title="Total Students" value="1,240" trend="+12% this month" icon={<Users className="text-blue-500"/>} darkMode={darkMode} />
      <ModernStatCard title="Stress Level" value="High" trend="Critical in Block B" icon={<Activity className="text-red-500"/>} color="red" darkMode={darkMode} />
      <ModernStatCard title="Avg Response" value="4m 12s" trend="-30s improvement" icon={<Clock className="text-emerald-500"/>} darkMode={darkMode} />
      <ModernStatCard title="Pending Alerts" value="2" trend="Action Required" icon={<Bell className="text-orange-500"/>} color="orange" darkMode={darkMode} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Chart */}
      <div className={`lg:col-span-2 p-6 rounded-3xl border transition-all duration-300 ${darkMode ? 'bg-[#1E293B] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`font-bold text-lg flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            <TrendingUp size={20} className="text-blue-500"/> Wellness Trends
          </h3>
          <select className={`text-sm rounded-lg px-3 py-1 border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <option>Last 7 Days</option>
            <option>Last Month</option>
          </select>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stressData}>
              <defs>
                <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#E2E8F0'} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: darkMode ? '#94A3B8' : '#64748B', fontSize: 12}} dy={10}/>
              <YAxis axisLine={false} tickLine={false} tick={{fill: darkMode ? '#94A3B8' : '#64748B', fontSize: 12}}/>
              <Tooltip 
                contentStyle={{backgroundColor: darkMode ? '#0F172A' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                itemStyle={{color: '#3B82F6'}}
              />
              <Area type="monotone" dataKey="stress" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorStress)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Watchlist */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 ${darkMode ? 'bg-[#1E293B] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className={`font-bold text-lg mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          <AlertTriangle size={20} className="text-orange-500"/> Priority Watchlist
        </h3>
        <div className="space-y-4">
          <RiskItem id="#8821" zone="Library" score="4.8" level="Critical" darkMode={darkMode} />
          <RiskItem id="#9923" zone="Hostel A" score="4.2" level="High" darkMode={darkMode} />
          <RiskItem id="#1102" zone="Canteen" score="4.0" level="High" darkMode={darkMode} />
          <RiskItem id="#4211" zone="Gym" score="3.8" level="Moderate" darkMode={darkMode} />
        </div>
        <button className={`w-full mt-6 py-3 rounded-xl text-sm font-bold transition-all ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
          View Full Risk Report
        </button>
      </div>
    </div>
  </div>
);

// --- 2. STUDENTS TAB ---
const StudentsTab = ({ darkMode }) => (
  <div className={`rounded-3xl border overflow-hidden transition-all duration-300 ${darkMode ? 'bg-[#1E293B] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
    <div className={`p-6 border-b flex justify-between items-center ${darkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
       <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>Recent Student Entries</h3>
       <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-700 focus-within:border-blue-500' : 'bg-slate-50 border-slate-200 focus-within:border-blue-500'}`}>
          <Search size={18} className="text-slate-400"/>
          <input type="text" placeholder="Search by ID..." className={`bg-transparent border-none outline-none text-sm w-48 font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`} />
       </div>
    </div>
    <table className="w-full text-left text-sm">
      <thead className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        <tr>
          <th className="px-6 py-4">Student ID</th>
          <th className="px-6 py-4">Status</th>
          <th className="px-6 py-4">Last Check-in</th>
          <th className="px-6 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className={`divide-y ${darkMode ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
        <StudentRow id="#8821" status="At Risk" time="2h ago" type="danger" darkMode={darkMode} />
        <StudentRow id="#4421" status="Healthy" time="5h ago" type="success" darkMode={darkMode} />
        <StudentRow id="#1299" status="Healthy" time="1d ago" type="success" darkMode={darkMode} />
        <StudentRow id="#9923" status="Warning" time="10m ago" type="warning" darkMode={darkMode} />
        <StudentRow id="#5521" status="Healthy" time="1h ago" type="success" darkMode={darkMode} />
      </tbody>
    </table>
  </div>
);

// --- 3. EMERGENCIES TAB ---
const EmergenciesTab = ({ darkMode }) => (
  <div className="max-w-4xl mx-auto">
    <div className="flex justify-between items-end mb-8">
      <div>
        <h3 className={`font-bold text-2xl ${darkMode ? 'text-white' : 'text-slate-800'}`}>Active SOS Alerts</h3>
        <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Real-time emergency monitoring system.</p>
      </div>
      <span className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full animate-pulse shadow-lg shadow-red-500/30">
        2 LIVE ALERTS
      </span>
    </div>
    
    <div className="space-y-6">
      {/* Alert 1 */}
      <EmergencyCard 
        type="SOS" 
        title="Immediate SOS Triggered"
        id="#4829" 
        location="Library 2nd Floor (User Reported)" 
        time="2 mins ago" 
        darkMode={darkMode} 
      />

      {/* Alert 2 */}
      <EmergencyCard 
        type="FLAG" 
        title="High Stress Pattern Detected"
        id="#9921" 
        location="Not Provided" 
        time="15 mins ago" 
        darkMode={darkMode} 
      />
    </div>
  </div>
);

// --- MODERN HELPER COMPONENTS ---

const NavItem = ({ icon, text, active, badge, onClick, darkMode }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm')}`}
  >
    <div className="flex items-center gap-3">
      {React.cloneElement(icon, { size: 20, className: active ? 'text-white' : '' })} 
      <span className="font-semibold text-sm">{text}</span>
    </div>
    {badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${active ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>{badge}</span>}
  </button>
);

const ModernStatCard = ({ title, value, trend, icon, color = "blue", darkMode }) => (
  <div className={`p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${darkMode ? 'bg-[#1E293B] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>{icon}</div>
      {color === 'red' && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
    </div>
    <div>
      <h3 className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
      <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
      <p className={`text-xs mt-2 font-bold ${color === 'red' ? 'text-red-500' : (color === 'orange' ? 'text-orange-500' : 'text-emerald-500')}`}>{trend}</p>
    </div>
  </div>
);

const RiskItem = ({ id, zone, score, level, darkMode }) => (
  <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-sm'}`}>
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${level === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
        {score}
      </div>
      <div>
        <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>Student {id}</p>
        <p className="text-xs text-slate-500 flex items-center gap-1"><Lock size={10}/> Zone: {zone}</p>
      </div>
    </div>
    <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${level === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>{level}</span>
  </div>
);

const StudentRow = ({ id, status, time, type, darkMode }) => {
  const getStatusColor = () => {
    if (type === 'danger') return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (type === 'warning') return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  };

  return (
    <tr className={`border-b transition-colors group ${darkMode ? 'border-slate-800 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50'}`}>
      <td className={`px-6 py-4 font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{id}</td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor()}`}>{status}</span>
      </td>
      <td className="px-6 py-4 text-xs text-slate-500 flex items-center gap-2"><Clock size={14}/> {time}</td>
      <td className="px-6 py-4 text-right">
        <button className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}><MoreVertical size={16}/></button>
      </td>
    </tr>
  );
};

const EmergencyCard = ({ type, title, id, location, time, darkMode }) => (
  <div className={`p-6 rounded-3xl border border-l-[6px] flex flex-col md:flex-row justify-between items-center gap-6 transition-all shadow-sm hover:shadow-md ${type === 'SOS' ? 'border-l-red-500' : 'border-l-orange-500'} ${darkMode ? 'bg-[#1E293B] border-slate-700/50' : 'bg-white border-slate-200'}`}>
    <div className="flex items-start gap-4 w-full">
       <div className={`p-3 rounded-2xl shrink-0 ${type === 'SOS' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
          {type === 'SOS' ? <ShieldAlert size={28}/> : <AlertTriangle size={28}/>}
       </div>
       <div>
          <h4 className={`font-bold text-lg ${type === 'SOS' ? 'text-red-500' : 'text-orange-500'}`}>{title}</h4>
          <div className={`flex flex-col md:flex-row gap-2 md:gap-6 mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
             <span className="flex items-center gap-1 font-medium"><Users size={14}/> ID: {id}</span>
             <span className="flex items-center gap-1 font-medium"><AlertTriangle size={14}/> Loc: {location}</span>
             <span className="flex items-center gap-1 opacity-70"><Clock size={14}/> {time}</span>
          </div>
       </div>
    </div>
    <div className="flex gap-3 w-full md:w-auto">
      <button className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex-1 ${type === 'SOS' ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-900'}`}>
        {type === 'SOS' ? 'Dispatch Team' : 'Notify Staff'}
      </button>
      <button className={`p-3 rounded-xl border transition-all ${darkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
        <MoreVertical size={20}/>
      </button>
    </div>
  </div>
);

export default AdminDashboard;
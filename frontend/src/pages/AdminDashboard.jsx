import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
  ShieldAlert, CheckCircle, Bell, User, Activity, Lock, Loader, LogOut, Moon, Sun, Siren, 
  LayoutDashboard, Menu, Trash2, Mail, MapPin, Eye, EyeOff
} from 'lucide-react';

import { db, auth } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// --- PRIVACY HELPER: The Core Logic for Requirement #2 ---
const StudentIdentity = ({ student, detail, severity, label }) => {
  // CRITICAL THRESHOLD: Only reveal if severity is High, Critical, or SOS
  const isCritical = ['High', 'Critical', 'SOS', 'Dangerous'].includes(severity);

  if (isCritical) {
    return (
      <div className="flex flex-col">
        <span className="font-bold text-red-600 dark:text-red-400">{student}</span>
        <span className="text-xs text-gray-500">{detail}</span>
      </div>
    );
  }

  // PRIVACY MODE
  return (
    <div className="flex flex-col">
      <span className="font-bold text-gray-500 flex items-center gap-2">
        <EyeOff size={14}/> Anonymous Student
      </span>
      <span className="text-xs text-gray-400">Identity Protected</span>
    </div>
  );
};

// --- HELPER: Highlight Triggers ---
const HighlightRisk = ({ text }) => {
  if (!text) return null;
  const riskWords = ["kill", "die", "suicide", "bomb", "ragging", "blood", "panic", "help"];
  const parts = text.split(new RegExp(`(${riskWords.join('|')})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) => 
        riskWords.some(w => w.toLowerCase() === part.toLowerCase()) ? (
          <span key={i} className="bg-red-100 text-red-700 font-extrabold px-1 rounded mx-0.5 border border-red-300">
            {part.toUpperCase()}
          </span>
        ) : part
      )}
    </span>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); 
  
  // Data State
  const [sosAlerts, setSosAlerts] = useState([]);
  const [riskLogs, setRiskLogs] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  
  // UPDATED: Split counts for users
  const [studentCount, setStudentCount] = useState(0);
  const [atRiskCount, setAtRiskCount] = useState(0);
  
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // --- 1. REAL-TIME DATA LISTENERS ---

  useEffect(() => {
    // A. SOS Alerts (Emergencies)
    const qSOS = query(collection(db, "safety_alerts"), orderBy("timestamp", "desc"));
    const unsubSOS = onSnapshot(qSOS, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSosAlerts(data.filter(d => d.status !== 'Resolved')); // Only show active SOS
    });

    // B. AI Monitor (Risk Reports) - Kept for the Table & Activity Trend
    const qRisks = query(collection(db, "riskReports"), orderBy("timestamp", "desc"));
    const unsubRisks = onSnapshot(qRisks, (snap) => {
      setRiskLogs(snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        // Normalize date for charts
        day: d.data().timestamp?.toDate().toLocaleDateString('en-US', { weekday: 'short' }) || 'Today'
      })));
    });

    // C. Forum Posts (Moderation)
    const qForum = query(collection(db, "forum_posts"), orderBy("createdAt", "desc"));
    const unsubForum = onSnapshot(qForum, (snap) => {
      setForumPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // D. Students Count (UPDATED LOGIC)
    // We now look at the 'users' collection to determine Risk Stats
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const allUsers = snap.docs.map(d => d.data());
      
      // Filter strictly for students
      const students = allUsers.filter(u => u.role === 'student');
      
      // Count total students
      setStudentCount(students.length);

      // Count students where isAtRisk is strictly true
      const riskyStudents = students.filter(u => u.isAtRisk === true).length;
      setAtRiskCount(riskyStudents);

      setLoading(false);
    });

    return () => { unsubSOS(); unsubRisks(); unsubForum(); unsubUsers(); };
  }, []);

  // --- ACTIONS ---

  const handleDispatch = async (id) => {
    if(window.confirm("Confirm dispatching Security Team to this location?")) {
      await updateDoc(doc(db, "safety_alerts", id), {
        status: "DISPATCHED",
        responders: "Security Team Alpha",
        updatedAt: serverTimestamp()
      });
      alert("Security Dispatched. Status Updated.");
    }
  };

  const handleDeletePost = async (id) => {
    if(window.confirm("Permanently delete this post?")) {
      await deleteDoc(doc(db, "forum_posts", id));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // --- CHART DATA PREP (UPDATED) ---
  
  // 1. Calculate Safe Students based on User Table (Total - At Risk)
  const safeStudentCount = Math.max(0, studentCount - atRiskCount);

  // 2. Updated Pie Data to reflect PEOPLE, not LOGS
  const pieData = [
    { name: 'Safe Students', value: safeStudentCount, color: '#10B981' },
    { name: 'At-Risk Students', value: atRiskCount, color: '#EF4444' }
  ];

  const getLast7Days = () => {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: dayNames[d.getDay()], // e.g., "Wed"
      dateString: d.toLocaleDateString('en-US') // Used for matching logs
    });
  }
  return days;
};

// 2. Update the Activity Trends data prep
const activityData = getLast7Days().map(dayObj => {
  // Filter logs that happened on this specific calendar date
  const dayLogs = riskLogs.filter(l => {
    const logDate = l.timestamp?.toDate().toLocaleDateString('en-US');
    return logDate === dayObj.dateString;
  });

  // Calculate unique headcount for Risk (High severity)
  const uniqueRiskUsers = [...new Set(
    dayLogs.filter(l => l.severity === 'High').map(l => l.userId)
  )].length;

  return {
    name: dayObj.label, // This shows "Thu", "Fri", etc., ending on Today
    // Safe count is total students minus those who were risky on THIS day
    Safe: Math.max(0, studentCount - uniqueRiskUsers),
    Risk: uniqueRiskUsers
  };
});

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className={`min-h-screen flex transition-colors duration-300 font-sans ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed z-30 inset-y-0 left-0 bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-20 flex items-center justify-center border-b border-gray-100 dark:border-gray-700">
           {sidebarOpen ? (
             <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
               <ShieldAlert /> Campus Shield
             </h1>
           ) : <ShieldAlert className="text-blue-600" />}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} open={sidebarOpen} />
          
          <SidebarItem 
            icon={Siren} 
            label="SOS Emergency" 
            active={activeTab === 'sos'} 
            onClick={() => setActiveTab('sos')} 
            open={sidebarOpen} 
            badge={sosAlerts.length} 
            pulse={sosAlerts.length > 0}
          />
          
          <SidebarItem icon={Activity} label="AI Chat Monitor" active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} open={sidebarOpen} />
          <SidebarItem icon={User} label="Forum Moderation" active={activeTab === 'forum'} onClick={() => setActiveTab('forum')} open={sidebarOpen} />
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
           <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-xl">
             <LogOut size={20} /> {sidebarOpen && "Sign Out"}
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        
        {/* HEADER */}
        <header className="h-20 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-8 sticky top-0 z-20">
           <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                 <Menu />
              </button>
              <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
           </div>
           <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
             {darkMode ? <Sun size={20} /> : <Moon size={20} />}
           </button>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-5rem)]">
           
           {/* --- 1. OVERVIEW TAB --- */}
           {activeTab === 'overview' && (
             <div className="space-y-8 animate-in fade-in">
                {/* Live Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <StatCard icon={User} label="Total Students" value={studentCount} color="blue" />
                   <StatCard icon={Siren} label="Active SOS" value={sosAlerts.length} color="red" pulse={sosAlerts.length > 0} />
                   
                   {/* UPDATED: Displays Count of Students At Risk, not total error logs */}
                   <StatCard icon={Activity} label="At-Risk Students" value={atRiskCount} color="orange" />
                   
                   {/* UPDATED: Displays Safe Students */}
                   <StatCard icon={CheckCircle} label="Safe Students" value={safeStudentCount} color="green" />
                </div>

                {/* Graphs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                      <h3 className="font-bold mb-4">Activity Trends (Safe vs Risk)</h3>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                               <defs>
                                 <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                 </linearGradient>
                                 <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                 </linearGradient>
                               </defs>
                               <XAxis dataKey="name" />
                               <YAxis />
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <RechartsTooltip />
                               <Legend />
                               <Area type="monotone" dataKey="Safe" stroke="#10B981" fillOpacity={1} fill="url(#colorSafe)" />
                               <Area type="monotone" dataKey="Risk" stroke="#EF4444" fillOpacity={1} fill="url(#colorRisk)" />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                      {/* UPDATED: Graph Title */}
                      <h3 className="font-bold mb-4">Student Safety Status</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                              <Legend />
                           </PieChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* --- 2. SOS EMERGENCY TAB --- */}
           {activeTab === 'sos' && (
             <div className="space-y-6 animate-in slide-in-from-right">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-4 rounded-xl flex items-center gap-3">
                   <div className="bg-red-500 text-white p-2 rounded-full animate-pulse"><Siren size={24}/></div>
                   <div>
                      <h3 className="font-bold text-red-700 dark:text-red-400">Live Emergency Center</h3>
                      <p className="text-sm text-red-600 dark:text-red-300">Action required immediately for items below.</p>
                   </div>
                </div>

                {sosAlerts.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">No Active Emergencies</div>
                ) : (
                  sosAlerts.map(alert => (
                    <div key={alert.id} className="bg-white dark:bg-gray-800 border-l-8 border-red-500 rounded-xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">LIVE SOS</span>
                             <span className="text-sm text-gray-500">{new Date(alert.timestamp?.toDate()).toLocaleTimeString()}</span>
                          </div>
                          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{alert.student}</h2>
                          <div className="text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-4 mt-2">
                             <span className="flex items-center gap-1"><User size={14}/> {alert.department} - Year {alert.year}</span>
                             <span className="flex items-center gap-1"><MapPin size={14}/> Location: <strong>{alert.location || "Unknown GPS"}</strong></span>
                          </div>
                       </div>
                       
                       <div className="flex gap-3">
                          <a 
                            href={`mailto:${alert.email}?subject=EMERGENCY CHECK-IN: ${alert.student}&body=We received an SOS alert. Please confirm your safety immediately.`}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-white font-bold rounded-lg transition"
                          >
                            <Mail size={18} /> Contact Student
                          </a>
                          
                          {alert.status === 'DISPATCHED' ? (
                             <button disabled className="px-6 py-3 bg-green-100 text-green-700 font-bold rounded-lg cursor-not-allowed flex items-center gap-2">
                                <CheckCircle size={18}/> Help Dispatched
                             </button>
                          ) : (
                             <button 
                               onClick={() => handleDispatch(alert.id)}
                               className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-500/30 transition transform hover:scale-105"
                             >
                               <ShieldAlert size={18} /> DISPATCH SECURITY
                             </button>
                          )}
                       </div>
                    </div>
                  ))
                )}
             </div>
           )}

           {/* --- 3. AI MONITOR TAB (PRIVACY FOCUSED) --- */}
           {activeTab === 'monitor' && (
             <div className="space-y-4 animate-in slide-in-from-right">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Real-Time Risk Analysis</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Privacy Mode Active</span>
               </div>

               <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase">
                        <tr>
                           <th className="p-4">Time</th>
                           <th className="p-4">Identity (Protected)</th>
                           <th className="p-4">Detected Trigger</th>
                           <th className="p-4">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {riskLogs.map(log => (
                           <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                              <td className="p-4 text-sm text-gray-500">
                                 {log.timestamp?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </td>
                              <td className="p-4">
                                 {/* REQUIREMENT #2: DE-ANONYMIZATION LOGIC */}
                                 <StudentIdentity 
                                   student={log.studentName} 
                                   detail={`${log.department || 'N/A'} - Sec ${log.section || 'N/A'}`}
                                   severity={log.severity} 
                                 />
                              </td>
                              <td className="p-4 text-sm">
                                 <HighlightRisk text={log.reason || log.message} />
                              </td>
                              <td className="p-4">
                                 <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                    log.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                 }`}>
                                    {log.severity}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
             </div>
           )}

           {/* --- 4. FORUM MODERATION TAB --- */}
           {activeTab === 'forum' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right">
                {forumPosts.map(post => (
                   <div key={post.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative group">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                               {post.author ? post.author[0] : 'A'}
                            </div>
                            <div>
                               <h4 className="font-bold text-sm">{post.author || "Anonymous"}</h4>
                               <p className="text-xs text-gray-400">{post.createdAt?.toDate().toLocaleString()}</p>
                            </div>
                         </div>
                         {/* DELETE ACTION */}
                         <button 
                           onClick={() => handleDeletePost(post.id)}
                           className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                           title="Delete Post"
                         >
                           <Trash2 size={18} />
                         </button>
                      </div>
                      <h3 className="font-bold mb-2">{post.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{post.content}</p>
                   </div>
                ))}
             </div>
           )}

        </div>
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const SidebarItem = ({ icon: Icon, label, active, onClick, open, badge, pulse }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 mb-1 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'} ${!open && 'justify-center'}`}
  >
    <div className="relative">
      <Icon size={20} className={`${pulse ? 'animate-pulse text-red-500' : ''}`}/>
      {badge > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">{badge}</span>}
    </div>
    {open && <span className="font-medium text-sm">{label}</span>}
  </button>
);

const StatCard = ({ icon: Icon, label, value, color, pulse }) => {
  const colors = {
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  return (
    <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 ${pulse ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
      <div className={`p-3 rounded-full ${colors[color]}`}>
        <Icon size={24} className={pulse ? 'animate-ping' : ''} />
      </div>
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase">{label}</p>
        <h3 className="text-2xl font-black">{value}</h3>
      </div>
    </div>
  );
};

export default AdminDashboard;
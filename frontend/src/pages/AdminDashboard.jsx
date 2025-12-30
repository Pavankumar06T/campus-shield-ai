import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
  ShieldAlert, CheckCircle, Bell, User, Mail, Activity, Lock, Loader, LogOut, Moon, Sun, Siren, 
  LayoutDashboard, History, Menu, ChevronRight, Info, X, GraduationCap, Building, BookOpen, MessageSquare, AlertTriangle
} from 'lucide-react';

import { db, auth } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// --- HELPER: Highlight Risk Keywords ---
const HighlightRisk = ({ text }) => {
  if (!text) return null;
  const riskWords = ["kill", "die", "hurt", "bully", "scared", "attack", "suicide", "ragging", "harass", "bomb", "weapon", "blood"];
  
  const parts = text.split(new RegExp(`(${riskWords.join('|')})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) => 
        riskWords.some(w => w.toLowerCase() === part.toLowerCase()) ? (
          <span key={i} className="bg-yellow-300 text-red-900 font-bold px-1 rounded mx-0.5 border border-yellow-500">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [alerts, setAlerts] = useState([]);
  const [studentCount, setStudentCount] = useState(0); // <--- NEW STATE FOR LIVE COUNT
  const [stats, setStats] = useState({ safe: 0, dangerous: 0, resolved: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const navigate = useNavigate();

  // --- 1. LISTEN TO ALERTS (CHATS/SOS) ---
  useEffect(() => {
    const q = query(collection(db, "safety_alerts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const realData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestampFormatted: doc.data().timestamp?.toDate 
          ? doc.data().timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) 
          : 'Just now'
      }));
      setAlerts(realData);
      
      const safe = realData.filter(a => a.status === 'Safe').length;
      const dangerous = realData.filter(a => ['Dangerous', 'SOS', 'Critical'].includes(a.status)).length;
      const resolved = realData.filter(a => a.status === 'Resolved').length;
      
      setStats({ safe, dangerous, resolved, total: realData.length });
      setLoading(false);
    }, (error) => console.error(error));
    return () => unsubscribe();
  }, []);

  // --- 2. NEW: LISTEN TO REGISTERED STUDENTS COUNT ---
  useEffect(() => {
    // Queries the "users" collection where role is 'student'
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setStudentCount(snapshot.size); // The .size property gives the live count
    });
    return () => unsubscribe();
  }, []);

  // --- ACTIONS ---
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleResolve = async (id) => {
    if(window.confirm("Mark this as Resolved? It will move to History.")) {
      try {
        const alertRef = doc(db, "safety_alerts", id);
        await updateDoc(alertRef, {
          status: "Resolved",
          resolvedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Error resolving:", err);
      }
    }
  };

  // --- FILTERS ---
  const criticalAlerts = alerts.filter(a => ['Dangerous', 'SOS', 'Critical'].includes(a.status));
  const forumFeed = alerts.filter(a => a.status !== 'Resolved'); 
  const historyAlerts = alerts.filter(a => a.status === 'Resolved');
  const criticalCount = criticalAlerts.length;

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className={`min-h-screen flex transition-colors duration-300 font-sans ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed z-30 inset-y-0 left-0 bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-20 flex items-center justify-center border-b border-gray-100 dark:border-gray-700">
           {sidebarOpen ? (
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-2">
               <ShieldAlert className="text-blue-600" /> Admin
             </h1>
           ) : (
             <ShieldAlert className="text-blue-600" size={30} />
           )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} open={sidebarOpen} />
          <SidebarItem icon={Siren} label="Live Alerts" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} open={sidebarOpen} badge={criticalCount} color="text-red-500" />
          <SidebarItem icon={MessageSquare} label="Forum Feed" active={activeTab === 'forum'} onClick={() => setActiveTab('forum')} open={sidebarOpen} color="text-blue-500" />
          <SidebarItem icon={History} label="History Log" active={activeTab === 'history'} onClick={() => setActiveTab('history')} open={sidebarOpen} />
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
           <button onClick={handleLogout} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20 ${!sidebarOpen && 'justify-center'}`}>
              <LogOut size={20} />
              {sidebarOpen && <span className="font-semibold">Sign Out</span>}
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        
        {/* HEADER */}
        <header className="h-20 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-8 sticky top-0 z-20">
           <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                 {sidebarOpen ? <Menu /> : <ChevronRight />}
              </button>
              <h2 className="text-xl font-bold capitalize">{activeTab.replace('-', ' ')}</h2>
           </div>

           <div className="flex items-center gap-6">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-yellow-400">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="relative">
                 <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Bell size={20} />
                    {criticalCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-gray-800"></span>
                    )}
                 </button>
                 
                 {/* NOTIFICATIONS */}
                 {showNotifs && (
                   <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                         <span className="font-bold text-sm">Notifications</span>
                         <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{criticalCount} Active</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                         {criticalAlerts.length === 0 ? (
                           <div className="p-4 text-center text-sm text-gray-500">No critical alerts.</div>
                         ) : (
                           criticalAlerts.slice(0, 3).map(alert => (
                             <div key={alert.id} className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer" onClick={() => setActiveTab('alerts')}>
                                <div className="flex items-start gap-3">
                                   <div className="bg-red-100 p-1.5 rounded-full text-red-600"><ShieldAlert size={14} /></div>
                                   <div>
                                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{alert.student}</p>
                                      <p className="text-xs text-gray-500 truncate w-48">{alert.message}</p>
                                   </div>
                                </div>
                             </div>
                           ))
                         )}
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-5rem)]">
           
           {/* VIEW 1: DASHBOARD */}
           {activeTab === 'dashboard' && (
             <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <StatCard icon={ShieldAlert} label="Critical Alerts" value={stats.dangerous} color="red" />
                   <StatCard icon={MessageSquare} label="Total Messages" value={stats.total} color="blue" />
                   <StatCard icon={CheckCircle} label="Resolved" value={stats.resolved} color="green" />
                   
                   {/* DYNAMIC STUDENT COUNT */}
                   <StatCard icon={User} label="Registered Students" value={studentCount} color="purple" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold mb-6 text-gray-700 dark:text-gray-300">Safety Distribution</h3>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                               <Pie data={[{name:'Risks', value: stats.dangerous}, {name:'Safe', value: stats.safe}]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                  <Cell fill="#EF4444" />
                                  <Cell fill="#10B981" />
                               </Pie>
                               <RechartsTooltip />
                               <Legend />
                            </PieChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold mb-6 text-gray-700 dark:text-gray-300">Activity Trends</h3>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={alerts.slice(0,10).reverse()}>
                               <defs>
                                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                     <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <XAxis dataKey="timestampFormatted" hide />
                               <YAxis />
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <RechartsTooltip />
                               <Area type="monotone" dataKey="status" stroke="#8884d8" fillOpacity={1} fill="url(#colorRisk)" />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* VIEW 2: LIVE ALERTS (DANGEROUS ONLY) */}
           {activeTab === 'alerts' && (
             <div className="animate-in slide-in-from-right duration-500">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold flex items-center gap-2"><Siren className="text-red-500" /> Action Required (Critical)</h2>
                </div>

                {criticalAlerts.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <CheckCircle size={48} className="text-green-500 mb-4" />
                      <h3 className="text-xl font-bold text-gray-700 dark:text-white">All Clear!</h3>
                      <p className="text-gray-500">No critical threats requiring action.</p>
                   </div>
                ) : (
                   <div className="space-y-4">
                      {criticalAlerts.map(alert => (
                         <div key={alert.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-red-500 p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                               <div className="flex items-start gap-4">
                                  <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full text-red-600 animate-pulse">
                                     <Siren size={24}/>
                                  </div>
                                  <div>
                                     <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{alert.student}</h3>
                                        <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-bold uppercase">{alert.status}</span>
                                     </div>
                                     <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        <span className="font-semibold">{alert.department} - Year {alert.year}</span>
                                        <span className="mx-2">•</span>
                                        <span className="text-gray-400">{alert.timestampFormatted}</span>
                                     </p>
                                     <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm">
                                        <HighlightRisk text={alert.message} />
                                     </div>
                                  </div>
                               </div>
                               
                               <div className="flex flex-col justify-center gap-2 min-w-[140px]">
                                  <button onClick={() => handleResolve(alert.id)} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md">
                                    <CheckCircle size={16} /> Resolve
                                  </button>
                                  <button onClick={() => setSelectedStudent(alert)} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                                    <Info size={16} /> View Details
                                  </button>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>
           )}

           {/* VIEW 3: FORUM FEED (ALL MESSAGES) */}
           {activeTab === 'forum' && (
             <div className="animate-in slide-in-from-right duration-500">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><MessageSquare className="text-blue-500" /> Live Forum Analysis</h2>
                <div className="space-y-4">
                   {forumFeed.map(msg => {
                      // COLOR CODING
                      let borderColor = "border-green-500";
                      let bgBadge = "bg-green-100 text-green-700";
                      let icon = <CheckCircle size={20} className="text-green-500"/>;

                      if (msg.status === 'Dangerous') {
                          borderColor = "border-yellow-500";
                          bgBadge = "bg-yellow-100 text-yellow-800";
                          icon = <AlertTriangle size={20} className="text-yellow-500"/>;
                      } else if (msg.status === 'SOS' || msg.status === 'Critical') {
                          borderColor = "border-red-500";
                          bgBadge = "bg-red-100 text-red-700 animate-pulse";
                          icon = <Siren size={20} className="text-red-500"/>;
                      }

                      return (
                        <div key={msg.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 ${borderColor} transition-all hover:shadow-md`}>
                           <div className="flex justify-between items-start">
                              <div className="flex gap-4">
                                 <div className="mt-1">{icon}</div>
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <span className="font-bold text-gray-800 dark:text-white">{msg.student}</span>
                                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${bgBadge}`}>
                                          {msg.status}
                                       </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                       <HighlightRisk text={msg.message} />
                                    </p>
                                    <div className="text-xs text-gray-400 mt-2 flex gap-3">
                                       <span>{msg.timestampFormatted}</span>
                                       <span>• {msg.department}</span>
                                    </div>
                                 </div>
                              </div>
                              <button onClick={() => setSelectedStudent(msg)} className="text-gray-400 hover:text-blue-500">
                                 <Info size={18} />
                              </button>
                           </div>
                        </div>
                      );
                   })}
                </div>
             </div>
           )}

           {/* VIEW 4: HISTORY */}
           {activeTab === 'history' && (
             <div className="animate-in slide-in-from-right duration-500">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><History className="text-blue-500" /> Resolved History</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                   <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-bold">
                         <tr>
                            <th className="p-4">Time</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Student</th>
                            <th className="p-4">Message</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                         {historyAlerts.map(alert => (
                            <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                               <td className="p-4 text-sm text-gray-500">{alert.timestampFormatted}</td>
                               <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Resolved</span></td>
                               <td className="p-4 text-sm font-bold text-gray-700 dark:text-gray-200">{alert.student}</td>
                               <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{alert.message}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}

        </div>
      </main>

      {/* MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
              <div className="bg-blue-600 p-6 text-white relative">
                 <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition">
                    <X size={20} />
                 </button>
                 <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-2xl"><User size={40} /></div>
                    <div>
                       <h2 className="text-2xl font-bold">{selectedStudent.student}</h2>
                       <p className="text-blue-100 text-sm">Student Profile ID</p>
                    </div>
                 </div>
              </div>
              <div className="p-8 space-y-6">
                 <div className={`border-l-4 p-4 rounded-r-lg ${selectedStudent.status === 'Safe' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                    <h3 className="font-bold text-xs uppercase mb-1">Message Content</h3>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">"{selectedStudent.message}"</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                       <p className="text-xs text-gray-500 uppercase font-bold">Department</p>
                       <p className="text-lg font-bold dark:text-white">{selectedStudent.department || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                       <p className="text-xs text-gray-500 uppercase font-bold">Year</p>
                       <p className="text-lg font-bold dark:text-white">{selectedStudent.year || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                       <p className="text-xs text-gray-500 uppercase font-bold">Section</p>
                       <p className="text-lg font-bold dark:text-white">{selectedStudent.section || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                       <p className="text-xs text-gray-500 uppercase font-bold">Email</p>
                       <p className="text-sm font-bold dark:text-white truncate">{selectedStudent.email || "N/A"}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedStudent(null)} className="w-full py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-xl transition">
                    Close Details
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

// --- SUB-COMPONENTS ---
const SidebarItem = ({ icon: Icon, label, active, onClick, open, badge, color }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'} ${!open && 'justify-center'}`}
  >
    <div className="relative">
      <Icon size={20} className={!active ? color : ''} />
      {badge > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{badge}</span>}
    </div>
    {open && <span className="font-medium">{label}</span>}
  </button>
);

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-transform hover:scale-105">
      <div className={`p-4 rounded-full ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
      </div>
    </div>
  );
};

export default AdminDashboard;
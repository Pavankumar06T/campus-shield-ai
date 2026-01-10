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
import { useToast } from '../components/ToastContext'; // <--- NEW IMPORT

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
        <EyeOff size={14} /> Anonymous Student
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
  const { addToast } = useToast(); // <--- NEW HOOK
  const [activeTab, setActiveTab] = useState('overview');

  // Data State
  const [sosAlerts, setSosAlerts] = useState([]);
  const [riskLogs, setRiskLogs] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);

  // UPDATED: Split counts for users
  const [studentCount, setStudentCount] = useState(0);
  const [atRiskCount, setAtRiskCount] = useState(0);
  const [studentsList, setStudentsList] = useState([]); // Store full list
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'risk', 'safe'

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // --- 1. REAL-TIME DATA LISTENERS ---

  useEffect(() => {
    // A. SOS Alerts (Emergencies)
    // Removed orderBy temporarily to debug missing index silent failure
    const qSOS = query(collection(db, "safety_alerts"));
    const unsubSOS = onSnapshot(qSOS, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log("SOS SNAPSHOT RAW:", data); // DEBUG
      // Sort manually in client as fallback
      data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setSosAlerts(data.filter(d => d.status !== 'Resolved'));
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

    // C. Forum Posts (Moderation) -> REMOVED FORUM LISTENER AS IT'S DEPRECATED IN UI

    // D. Students Count (UPDATED LOGIC)
    // We now look at the 'users' collection to determine Risk Stats
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Filter strictly for students
      // const students = allUsers.filter(u => u.role === 'student');
      const students = allUsers; // Relaxed for testing (Show Admin too)

      setStudentsList(students); // Save list for table

      // Count total students
      setStudentCount(students.length);

      // Count students where isAtRisk is strictly true
      const riskyStudents = students.filter(u => u.isAtRisk === true).length;
      setAtRiskCount(riskyStudents);

      setLoading(false);
    });

    return () => { unsubSOS(); unsubRisks(); unsubUsers(); };
  }, []);

  // --- ACTIONS ---

  const handleDispatch = async (id) => {
    if (window.confirm("Confirm dispatching Security Team to this location?")) {
      await updateDoc(doc(db, "safety_alerts", id), {
        status: "DISPATCHED",
        responders: "Security Team Alpha",
        updatedAt: serverTimestamp()
      });
      addToast("Security Dispatched. Status Updated.", "success"); // <--- REPLACED ALERT
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm("Permanently delete this post?")) {
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
            badge={sosAlerts.filter(a => a.status !== 'DISPATCHED').length}
            pulse={sosAlerts.some(a => a.status !== 'DISPATCHED')}
          />

          <SidebarItem icon={Activity} label="AI Chat Monitor" active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} open={sidebarOpen} />
          <SidebarItem icon={User} label="Students Safety" active={activeTab === 'students'} onClick={() => setActiveTab('students')} open={sidebarOpen} />
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
                <StatCard
                  icon={Siren}
                  label="Active SOS"
                  value={sosAlerts.filter(a => a.status !== 'DISPATCHED').length}
                  color="red"
                  pulse={sosAlerts.some(a => a.status !== 'DISPATCHED')}
                />

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
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
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
                <div className="bg-red-500 text-white p-2 rounded-full animate-pulse"><Siren size={24} /></div>
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

                      {/* PRIVACY TOGGLE: Hide details if Dispatched */}
                      {alert.status === 'DISPATCHED' ? (
                        <>
                          <h2 className="text-2xl font-bold text-gray-500 flex items-center gap-2">
                            <EyeOff size={24} /> Anonymous Student
                          </h2>
                          <div className="text-sm text-gray-400 mt-2">
                            <span className="flex items-center gap-1"><Lock size={14} /> Identity Protected (Help En Route)</span>
                            <span className="flex items-center gap-1 mt-1"><MapPin size={14} /> Location: <strong>{alert.location || "Unknown GPS"}</strong></span>
                          </div>
                        </>
                      ) : (
                        <>
                          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{alert.student}</h2>
                          <div className="text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-4 mt-2">
                            <span className="flex items-center gap-1"><User size={14} /> {alert.department} - Year {alert.year}</span>
                            <span className="flex items-center gap-1"><MapPin size={14} /> Location: <strong>{alert.location || "Unknown GPS"}</strong></span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {/* Hide Contact Button if Dispatched */}
                      {alert.status !== 'DISPATCHED' && (
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${alert.email}&su=EMERGENCY CHECK-IN: ${alert.student}&body=We received an SOS alert. Please confirm your safety immediately.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-white font-bold rounded-lg transition"
                        >
                          <Mail size={18} /> Contact Student
                        </a>
                      )}

                      {alert.status === 'DISPATCHED' ? (
                        <button disabled className="px-6 py-3 bg-green-100 text-green-700 font-bold rounded-lg cursor-not-allowed flex items-center gap-2">
                          <CheckCircle size={18} /> Help Dispatched
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
                      <th className="p-4">Latest Activity</th>
                      <th className="p-4">Student Identity</th>
                      <th className="p-4">Risk Summary & Triggers</th>
                      <th className="p-4">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {/* AGGREGATION LOGIC: Group logs by User ID */}
                    {Object.values(riskLogs.reduce((acc, log) => {
                      if (!acc[log.userId]) {
                        acc[log.userId] = {
                          ...log,
                          triggers: new Set(),
                          logsCount: 0,
                          maxSeverity: 'High', // Default
                          latestTimestamp: log.timestamp
                        };
                      }

                      // Update stats
                      acc[log.userId].logsCount += 1;
                      if (log.timestamp > acc[log.userId].latestTimestamp) {
                        acc[log.userId].latestTimestamp = log.timestamp;
                      }

                      // EXTRACT TRIGGERS (Improved Logic & Expanded List)
                      const textToScan = (log.reason + " " + (log.message || "")).toLowerCase();
                      const knownRiskWords = [
                        "suicide", "kill", "die", "hurt", "pain", "hopeless", "end my life",
                        "depression", "depressed", "panic", "blood", "stressed", "sad", "help",
                        "lonely", "alone", "lost", "tired", "anxious", "overwhelmed",
                        "overdose", "gun", "knife", "hang", "drown", "poison", "abuse", "rape",
                        "assault", "shoot", "toxic", "bomb", "ragging", "cut myself", "self harm"
                      ];

                      knownRiskWords.forEach(word => {
                        if (textToScan.includes(word)) {
                          acc[log.userId].triggers.add(word.toUpperCase());
                        }
                      });

                      // Fallback: If no specific word found, keep generic reason 
                      if (acc[log.userId].triggers.size === 0) {
                        const match = (log.reason || "").match(/(?:Trigger:|Keywords:|Detected:)\s*"?([^"]*)"?/i);
                        if (match && match[1]) {
                          acc[log.userId].triggers.add(match[1].trim().toUpperCase());
                        }
                      }

                      if (log.severity === 'Dangerous' || log.severity === 'Critical') {
                        acc[log.userId].maxSeverity = 'Critical';
                      }

                      return acc;
                    }, {})).map(studentGroup => {
                      // LOOKUP LIVE STATUS
                      const liveStudent = studentsList.find(s => s.id === studentGroup.userId);
                      const isCurrentlySafe = liveStudent && !liveStudent.isAtRisk; // "Healed" check

                      // GET REAL PROFILE DATA (Registration Data)
                      const dept = liveStudent?.department || studentGroup.department || 'N/A';
                      const year = liveStudent?.year || 'N/A';
                      const sec = liveStudent?.section || studentGroup.section || 'N/A';

                      return (
                        <tr key={studentGroup.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                          <td className="p-4 text-sm text-gray-500">
                            {studentGroup.latestTimestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <div className="text-xs text-gray-400 mt-1">{studentGroup.logsCount} Events Detected</div>
                          </td>
                          <td className="p-4">
                            {/* DE-ANONYMIZATION LOGIC */}
                            {/* If currently safe, we force 'Low' severity to hide identity */}
                            <StudentIdentity
                              student={liveStudent?.displayName || studentGroup.studentName}
                              detail={`${dept} - Year ${year} - Sec ${sec}`}
                              severity={isCurrentlySafe ? 'Low' : studentGroup.maxSeverity}
                            />

                            {/* ADDED CONTACT BUTTON as requested - Hide if safe */}
                            {!isCurrentlySafe && (studentGroup.maxSeverity === 'Critical' || studentGroup.maxSeverity === 'High') && (
                              <a
                                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${studentGroup.userId}&su=Urgent: Support from Campus Shield&body=Dear ${studentGroup.studentName},%0D%0A%0D%0AWe are reaching out...`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 rounded text-[10px] font-bold transition-colors"
                              >
                                <Mail size={10} /> Email Student
                              </a>
                            )}
                          </td>
                          <td className="p-4 text-sm">
                            <div className="flex flex-wrap gap-2">
                              {Array.from(studentGroup.triggers).map((trigger, i) => (
                                <span key={i} className="bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded text-xs font-bold uppercase">
                                  {trigger}
                                </span>
                              ))}
                              {studentGroup.triggers.size === 0 && <span className="text-gray-400 italic">General High Stress Patterns</span>}
                            </div>
                          </td>
                          <td className="p-4">
                            {isCurrentlySafe ? (
                              <span className="px-2 py-1 rounded-full text-xs font-bold uppercase bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                                <CheckCircle size={12} /> Resolved (Safe)
                              </span>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${studentGroup.maxSeverity === 'Critical' ? 'bg-red-600 text-white animate-pulse' : 'bg-red-100 text-red-700'}`}>
                                {studentGroup.maxSeverity}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- 4. STUDENTS SAFETY TAB --- */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-in slide-in-from-right">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-2xl">Student Wellness Tracker</h3>
                  <p className="text-gray-500">Real-time monitoring of student mental health status.</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                  {['all', 'risk', 'safe'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-all ${filterStatus === status
                        ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                      {status === 'risk' ? 'High Risk' : status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {studentsList
                  .filter(s => {
                    if (filterStatus === 'risk') return s.isAtRisk || (s.stressScore > 40);
                    if (filterStatus === 'safe') return !s.isAtRisk && (s.stressScore <= 40);
                    return true;
                  })
                  .map((student, index) => {
                    // Determine Status Color
                    const score = student.stressScore || 0; // Now represents Risk Score
                    let statusColor = "bg-green-100 text-green-700 border-green-200";
                    let statusText = "Safe";
                    if (score > 50) { statusColor = "bg-orange-100 text-orange-700 border-orange-200"; statusText = "Moderate"; }
                    if (score > 40) { statusColor = "bg-red-100 text-red-700 border-red-200"; statusText = "High Risk"; }

                    return (
                      <div key={student.id} className={`bg-white dark:bg-gray-800 p-6 rounded-xl border ${score > 40 ? 'border-red-500 shadow-red-100 dark:shadow-none' : 'border-gray-100 dark:border-gray-700'} shadow-sm transition-all hover:shadow-md`}>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${score > 40 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                              #{index + 1}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg flex items-center gap-2">
                                {score > 40 ? (
                                  // HIGH RISK: Reveal Full Identity
                                  <span className="text-red-700 dark:text-red-400">{student.displayName}</span>
                                ) : (
                                  // SAFE: Anonymous
                                  <span className="text-gray-500 flex items-center gap-2">
                                    <EyeOff size={16} /> Anonymous Student #{index + 1}
                                  </span>
                                )}

                                {score > 40 && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Attention</span>}
                              </h4>

                              <p className="text-sm text-gray-400 mt-1">
                                {score > 40 ? (
                                  // HIGH RISK: Show Details
                                  <>
                                    {student.department} - {student.year} Year - Sec {student.section}
                                    <span className="block mt-1 font-bold text-gray-600 dark:text-gray-300">
                                      📞 {student.contactNumber || 'No Contact Info'}
                                    </span>
                                  </>
                                ) : (
                                  // SAFE: Hide Details
                                  <span>Identity Protected</span>
                                )}
                              </p>

                              {score > 40 && <p className="text-xs text-blue-500 font-mono mt-1">{student.email}</p>}

                              {/* CONTACT BUTTON FOR HIGH RISK */}
                              {score > 40 && (
                                <a
                                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${student.email}&su=Wellness Check: ${student.displayName}&body=Dear ${student.displayName},%0D%0A%0D%0AWe noticed your recent check-in indicated high stress levels. We are here to support you.%0D%0A%0D%0ARegards,%0D%0ACampus Wellbeing Team`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-red-700 transition-colors"
                                >
                                  <Mail size={14} /> Contact via Gmail
                                </a>
                              )}
                            </div>
                          </div>

                          <div className={`px-4 py-2 rounded-lg font-bold border ${statusColor}`}>
                            Risk Score: {score}/100
                          </div>
                        </div>

                        {/* DETAILS SECTION */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="text-xs font-bold uppercase text-gray-400 mb-3">Last Check-in Analysis</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-600">
                                <span>Mood</span> <strong>{student.mood || '-'}</strong>
                              </div>
                              <div className="flex justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-600">
                                <span>Stress</span> <strong>{student.stress || '-'}</strong>
                              </div>
                              <div className="flex justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-600">
                                <span>Sleep</span> <strong>{student.sleep || '-'}</strong>
                              </div>
                              <div className="flex justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-600">
                                <span>Social</span> <strong>{student.social || '-'}</strong>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-xs font-bold uppercase text-gray-400 mb-3 flex justify-between">
                              Journal / Thoughts
                            </h5>
                            <div className={`p-3 rounded-lg border text-sm italic min-h-[80px] ${score > 40 ? 'bg-red-50 border-red-100 text-gray-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500'}`}>
                              {/* PRIVACY: Only show text if High Risk, otherwise mask it? Requirement said "if high risk only their details should show" */
                                score > 40 ? (
                                  student.lastJournal || "No text entry provided."
                                ) : (
                                  <span className="flex items-center gap-2 text-gray-400">
                                    <Lock size={14} /> Journal Check-in Protected (Safe Status)
                                  </span>
                                )
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {studentsList.filter(s => {
                  if (filterStatus === 'risk') return s.isAtRisk || (s.stressScore > 40);
                  if (filterStatus === 'safe') return !s.isAtRisk && (s.stressScore <= 40);
                  return true;
                }).length === 0 && (
                    <div className="text-center py-20 text-gray-400">No students found matching current filter.</div>
                  )}
              </div>
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
      <Icon size={20} className={`${pulse ? 'animate-pulse text-red-500' : ''}`} />
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
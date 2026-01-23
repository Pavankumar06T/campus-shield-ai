import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { useToast } from '../components/ToastContext';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import {
    Shield, ArrowLeft, User, Sun, Moon,
    Building, BookOpen, ChevronRight, Phone, BadgeCheck
} from 'lucide-react';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { darkMode, toggleTheme } = useTheme();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        year: '',
        section: '',
        contactNumber: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        // Validation
        if (!formData.name.trim() || !formData.department || !formData.year || !formData.section || !formData.contactNumber) {
            addToast("Please fill in all details to create your SafeCampus ID.", "warning");
            return;
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
                department: formData.department,
                year: formData.year,
                section: formData.section,
                contactNumber: formData.contactNumber,
                role: 'student',
                lastLogin: new Date(),
                registeredAt: new Date()
            };

            localStorage.setItem('studentProfile', JSON.stringify(userProfile));
           
            await setDoc(doc(db, "users", user.uid), userProfile, { merge: true });

            window.location.href = '/student';

        } catch (error) {
            console.error(error);
            addToast("Registration Failed: " + error.message, "error");
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center relative font-sans transition-colors duration-500 overflow-hidden ${darkMode ? 'bg-[#0f172a] text-white' : 'bg-[#fafafa] text-slate-900'}`}>

            {/* --- ANIMATED BACKGROUND --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 animate-pulse ${darkMode ? 'bg-indigo-600' : 'bg-indigo-300'}`}></div>
                <div className={`absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 animate-pulse delay-1000 ${darkMode ? 'bg-emerald-600' : 'bg-emerald-300'}`}></div>
            </div>

            {/* --- TOP NAV --- */}
            <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
                <button
                    onClick={() => navigate('/')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all hover:scale-105 ${darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white/60 border-black/5 text-slate-600 hover:bg-white'}`}
                >
                    <ArrowLeft size={18} /> <span className="text-sm font-bold">Home</span>
                </button>

                <button
                    onClick={toggleTheme}
                    className={`p-3 rounded-full backdrop-blur-md border transition-all hover:rotate-12 ${darkMode ? 'bg-white/5 border-white/10 text-yellow-400' : 'bg-white/60 border-black/5 text-slate-600'}`}
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </nav>

            {/* --- REGISTRATION CARD --- */}
            <div className={`relative z-10 w-full max-w-[500px] mx-4 p-8 md:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl border transition-all duration-300 ${darkMode ? 'bg-[#1e293b]/80 border-white/10 shadow-black/50' : 'bg-white/80 border-white/60 shadow-xl shadow-indigo-100'}`}>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                        <BadgeCheck size={32} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">New Student ID</h1>
                    <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Securely register your device on the network.
                    </p>
                </div>

                {/* Inputs */}
                <div className="space-y-4">

                    <InputField
                        icon={User}
                        name="name"
                        placeholder="Official Full Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        darkMode={darkMode}
                    />

                    <div className="relative group">
                        <Building className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${darkMode ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none border-2 font-bold transition-all appearance-none cursor-pointer ${darkMode ? 'bg-[#0f172a]/50 border-slate-700 focus:border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800'}`}
                        >
                            <option value="">Select Department</option>
                            <option value="AI&DS">AI & DS</option>
                            <option value="CSE">Computer Science (CSE)</option>
                            <option value="IT">Information Tech (IT)</option>
                            <option value="ECE">Electronics (ECE)</option>
                            <option value="MECH">Mechanical</option>
                            <option value="CIVIL">Civil</option>
                        </select>
                        <ChevronRight className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none rotate-90 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                    </div>

                    <div className="flex gap-3">
                        <div className="relative group flex-1">
                            <select
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-4 rounded-xl outline-none border-2 font-bold transition-all appearance-none cursor-pointer text-center ${darkMode ? 'bg-[#0f172a]/50 border-slate-700 focus:border-indigo-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800'}`}
                            >
                                <option value="">Year</option>
                                <option value="1">1st</option>
                                <option value="2">2nd</option>
                                <option value="3">3rd</option>
                                <option value="4">4th</option>
                            </select>
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

                    <InputField
                        icon={Phone}
                        name="contactNumber"
                        placeholder="Emergency Contact"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        darkMode={darkMode}
                    />

                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className={`w-full py-4 mt-6 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                            } bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500`}
                    >
                        {loading ? "Registering..." : (
                            <>Confirm Profile <ChevronRight size={20} /></>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <button onClick={() => navigate('/login')} className={`text-sm font-bold transition-colors ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                            Already registered? <span className="underline decoration-2 underline-offset-2">Sign In</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const InputField = ({ icon: Icon, name, placeholder, value, onChange, darkMode }) => (
    <div className="relative group">
        {Icon && <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${darkMode ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />}
        <input
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none border-2 font-bold transition-all ${darkMode ? 'bg-[#0f172a]/50 border-slate-700 focus:border-indigo-500 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800 placeholder-slate-400'}`}
        />
    </div>
);

export default RegisterPage;

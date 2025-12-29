// src/pages/StudentDashboard.jsx
import { useAuth } from '../components/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export const StudentDashboard = () => {
  const { user, role } = useAuth();

  const handleLogout = () => signOut(auth);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🎓 Student Portal</h1>
        <button onClick={handleLogout} style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </header>

      <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
        <h3>Welcome, {user?.email}</h3>
        <p><strong>Account Type:</strong> {role}</p>
      </div>

      <section style={{ marginTop: '30px' }}>
        <h2>My Assignments</h2>
        <div style={{ background: '#f9f9f9', padding: '20px', textAlign: 'center', border: '2px dashed #ccc' }}>
          <p>Your friends can start building the assignment list here.</p>
        </div>
      </section>
    </div>
  );
};


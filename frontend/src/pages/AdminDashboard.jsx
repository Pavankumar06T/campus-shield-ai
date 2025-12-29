// src/pages/AdminDashboard.jsx
import { useAuth } from '../components/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const AdminDashboard = () => {
  const { user, role } = useAuth();

  const handleLogout = () => signOut(auth);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h1>🛡️ Admin Control Panel</h1>
        <button onClick={handleLogout} style={{ backgroundColor: '#333', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          Secure Logout
        </button>
      </header>

      <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, background: '#e3f2fd', padding: '20px', borderRadius: '8px' }}>
          <h3>Admin Info</h3>
          <p><strong>Status:</strong> Active Developer</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
        
        <div style={{ flex: 2, background: '#fff3e0', padding: '20px', borderRadius: '8px' }}>
          <h3>System Analytics</h3>
          <p>All systems operational. (This data will come from your Express backend soon!)</p>
        </div>
      </div>

      <section style={{ marginTop: '30px' }}>
        <h3>User Management</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
              <th>Name</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Placeholder Student</td>
              <td>Student</td>
              <td><button>Edit</button></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;
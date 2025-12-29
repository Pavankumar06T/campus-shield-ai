import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { ThemeProvider } from './components/ThemeContext'; // <--- NEW IMPORT
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentChat from './pages/StudentChat';
import AdminDashboard from './pages/AdminDashboard';
import EmergencyPage from './pages/EmergencyPage';

function App() {
  return (
    <AuthProvider> 
      <ThemeProvider> {/* <--- WRAPPER START */}
        <BrowserRouter> 
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/student" element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } />

            <Route path="/student/chat" element={
              <ProtectedRoute allowedRole="student">
                <StudentChat />
              </ProtectedRoute>
            } />

            <Route path="/emergency" element={
              <ProtectedRoute allowedRole="student">
                <EmergencyPage />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider> {/* <--- WRAPPER END */}
    </AuthProvider>
  );
}

export default App;
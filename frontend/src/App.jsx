import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { StudentDashboard } from './pages/StudentDashboard';
import  AdminDashboard  from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <AuthProvider> 
      <BrowserRouter> 
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/student" element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
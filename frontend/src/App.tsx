import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/Admin/Dashboard';
import CreateExam from './pages/Admin/CreateExam';
import AdminExams from './pages/Admin/Exams';
import EditExam from './pages/Admin/EditExam';
import AdminResults from './pages/Admin/Results';
import AdminStudents from './pages/Admin/Students';
import AdminSettings from './pages/Admin/Settings';
import StudentDashboard from './pages/Student/Dashboard';
import TakeExam from './pages/Student/TakeExam';
import AvailableExams from './pages/Student/AvailableExams';
import StudentResults from './pages/Student/Results';
import ResultsList from './pages/Student/ResultsList';
import Leaderboard from './pages/Student/Leaderboard';
import LeaderboardList from './pages/Student/LeaderboardList';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Initializing Portal...</p>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-content">
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/student'} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/student" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/exams" element={<ProtectedRoute roles={['admin']}><AdminExams /></ProtectedRoute>} />
      <Route path="/admin/exams/create" element={<ProtectedRoute roles={['admin']}><CreateExam /></ProtectedRoute>} />
      <Route path="/admin/exams/edit/:id" element={<ProtectedRoute roles={['admin']}><EditExam /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute roles={['admin']}><AdminStudents /></ProtectedRoute>} />
      <Route path="/admin/results" element={<ProtectedRoute roles={['admin']}><AdminResults /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/exams" element={<ProtectedRoute roles={['student']}><AvailableExams /></ProtectedRoute>} />
      <Route path="/student/exams/:id" element={<ProtectedRoute roles={['student']}><TakeExam /></ProtectedRoute>} />
      <Route path="/student/results" element={<ProtectedRoute roles={['student']}><ResultsList /></ProtectedRoute>} />
      <Route path="/student/results/:id" element={<ProtectedRoute roles={['student']}><StudentResults /></ProtectedRoute>} />
      <Route path="/student/leaderboard" element={<ProtectedRoute roles={['student']}><LeaderboardList /></ProtectedRoute>} />
      <Route path="/student/leaderboard/:id" element={<ProtectedRoute roles={['student']}><Leaderboard /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/student') : '/login'} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;

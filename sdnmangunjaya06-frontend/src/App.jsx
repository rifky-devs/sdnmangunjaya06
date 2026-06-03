import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import LandingPage from './pages/public/LandingPage.jsx';
import LoginPage from './pages/public/LoginPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import StudentsPage from './pages/admin/StudentsPage.jsx';
import TeachersPage from './pages/admin/TeachersPage.jsx';
import ClassesPage from './pages/admin/ClassesPage.jsx';
import SubjectsPage from './pages/admin/SubjectsPage.jsx';
import ReportsPage from './pages/admin/ReportsPage.jsx';
import UsersPage from './pages/admin/UsersPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import GuruDashboard from './pages/guru/GuruDashboard.jsx';
import GradeInputPage from './pages/guru/GradeInputPage.jsx';
import SiswaDashboard from './pages/siswa/SiswaDashboard.jsx';
import NotFoundPage from './pages/public/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="siswa" element={<StudentsPage />} />
        <Route path="guru" element={<TeachersPage />} />
        <Route path="kelas" element={<ClassesPage />} />
        <Route path="mapel" element={<SubjectsPage />} />
        <Route path="laporan" element={<ReportsPage />} />
        <Route path="akun" element={<UsersPage />} />
        <Route path="users" element={<Navigate to="/admin/akun" replace />} />
        <Route path="manajemen-akun" element={<Navigate to="/admin/akun" replace />} />
      </Route>

      <Route
        path="/guru"
        element={
          <ProtectedRoute allowedRoles={['guru']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GuruDashboard />} />
        <Route path="input-nilai" element={<GradeInputPage />} />
        <Route path="rekap" element={<ReportsPage mode="guru" />} />
        <Route path="cetak-laporan" element={<Navigate to="/guru/rekap" replace />} />
      </Route>

      <Route
        path="/siswa"
        element={
          <ProtectedRoute allowedRoles={['siswa']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SiswaDashboard />} />
      </Route>

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['admin', 'guru', 'siswa']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfilePage />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

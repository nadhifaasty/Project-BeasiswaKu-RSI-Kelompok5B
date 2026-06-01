import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import ProtectedRoute from './components/shared/ProtectedRoute'
import AdminLayout from './components/layout/AdminLayout'
import SiswaLayout from './components/layout/SiswaLayout'
import SuperAdminLayout from './components/layout/SuperAdminLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifikasiEmailPage from './pages/VerifikasiEmailPage'
import DashboardPage from './pages/DashboardPage'
import BiodataPage from './pages/BiodataPage'
import PengajuanPage from './pages/PengajuanPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminPengajuanPage from './pages/AdminPengajuanPage'
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/daftar" element={<RegisterPage />} />
        <Route path="/verifikasi-email" element={<VerifikasiEmailPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* Protected: Siswa Routes (with Siswa Sidebar Layout) */}
      <Route element={<ProtectedRoute allowedRoles={['siswa', 'admin', 'super_admin']} />}>
        <Route element={<SiswaLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/biodata" element={<BiodataPage />} />
          <Route path="/pengajuan" element={<PengajuanPage />} />
        </Route>
      </Route>

      {/* Protected: Admin & Super Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/pengajuan" element={<AdminPengajuanPage />} />
        </Route>
      </Route>

      {/* Protected: Super Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
        <Route element={<SuperAdminLayout />}>
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboardPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App

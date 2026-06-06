import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import { ProtectedRoute } from './components'
import { AdminLayout, SiswaLayout } from './components/layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifikasiEmailPage from './pages/VerifikasiEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import BiodataPage from './pages/BiodataPage'
import PengajuanPage from './pages/PengajuanPage'
import StatusTrackingPage from './pages/StatusTrackingPage'
import SiswaLaporanDanaPage from './pages/SiswaLaporanDanaPage'
import DokumenPage from './pages/DokumenPage'
import SettingsPage from './pages/SettingsPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminPengajuanPage from './pages/AdminPengajuanPage'
import AdminKelolaProgramPage from './pages/admin/AdminKelolaProgramPage'
import SelectionPage from './pages/admin/SelectionPage'
import AdminLaporanDanaPage from './pages/admin/AdminLaporanDanaPage'
import AuditLogPage from './pages/admin/AuditLogPage'
import EvaluationsPage from './pages/admin/EvaluationsPage'
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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* Protected: Siswa Routes (with Siswa Sidebar Layout) */}
      <Route element={<ProtectedRoute allowedRoles={['siswa', 'admin', 'super_admin']} />}>
        <Route element={<SiswaLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/biodata" element={<BiodataPage />} />
          <Route path="/pengajuan" element={<PengajuanPage />} />
          <Route path="/lacak-status" element={<StatusTrackingPage />} />
          <Route path="/dokumen" element={<DokumenPage />} />
          <Route path="/laporan-dana" element={<SiswaLaporanDanaPage />} />
          <Route path="/pengaturan" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Protected: Admin & Super Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/program" element={<AdminKelolaProgramPage />} />
          <Route path="/admin/pengajuan" element={<AdminPengajuanPage />} />
          <Route path="/admin/seleksi" element={<SelectionPage />} />
          <Route path="/admin/laporan-dana" element={<AdminLaporanDanaPage />} />
          <Route path="/admin/evaluasi" element={<EvaluationsPage />} />
          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="/admin/audit-log" element={<AuditLogPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import { ProtectedRoute } from './components'
import { AdminLayout } from './components/layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifikasiEmailPage from './pages/VerifikasiEmailPage'
import DashboardPage from './pages/DashboardPage'
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

      {/* Protected: Siswa Routes */}
      <Route element={<ProtectedRoute allowedRoles={['siswa', 'admin', 'super_admin']} />}>
        <Route element={<PublicLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Route>

      {/* Protected: Admin & Super Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          {/* Tambahkan route admin lainnya di sini */}
          {/* <Route path="/admin/pengajuan" element={<PengajuanPage />} /> */}
          {/* <Route path="/admin/parameter-seleksi" element={<ParameterSeleksiPage />} /> */}
          {/* <Route path="/admin/audit-log" element={<AuditLogPage />} /> */}
          {/* <Route path="/admin/evaluasi" element={<EvaluasiPage />} /> */}
        </Route>
      </Route>
    </Routes>
  )
}

export default App

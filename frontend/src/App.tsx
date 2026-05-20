import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import StudentLayout from './layouts/StudentLayout'
import AdminLayout from './layouts/AdminLayout'
import SuperAdminLayout from './layouts/SuperAdminLayout'

import HomePage from './pages/public/HomePage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import VerifikasiEmailPage from './pages/public/VerifikasiEmailPage'

import StudentDashboard from './pages/student/DashboardPage'
import BiodataPribadi from './pages/student/BiodataPribadi'
import BiodataAlamat from './pages/student/BiodataAlamat'
import BiodataOrtu from './pages/student/BiodataOrtu'
import BiodataAkademik from './pages/student/BiodataAkademik'
import BiodataLengkap from './pages/student/BiodataLengkap'
import PilihProgram from './pages/student/PengajuanPilihProgram'
import IsiFormulir from './pages/student/PengajuanIsiFormulir'
import UploadDokumen from './pages/student/PengajuanUploadDokumen'
import KonfirmasiPengajuan from './pages/student/PengajuanKonfirmasi'
import PengajuanBerhasil from './pages/student/PengajuanBerhasil'
import StatusPengajuan from './pages/student/StatusPengajuan'
import PencairanDana from './pages/student/PencairanDana'
import PencairanDanaBerhasil from './pages/student/PencairanDanaBerhasil'
import LaporanDanaStudent from './pages/student/LaporanDana'

import AdminDashboard from './pages/admin/DashboardPage'
import DaftarPengajuan from './pages/admin/DaftarPengajuan'
import DetailPengajuan from './pages/admin/DetailPengajuan'
import SeleksiPenerima from './pages/admin/SeleksiPenerima'
import HitungSkor from './pages/admin/HitungSkor'
import SahkanHasil from './pages/admin/SahkanHasil'
import LaporanDanaAdmin from './pages/admin/LaporanDana'

import SuperAdminDashboard from './pages/super-admin/DashboardPage'
import AuditLog from './pages/super-admin/AuditLog'
import EvaluasiProgram from './pages/super-admin/EvaluasiProgram'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/daftar" element={<RegisterPage />} />
        <Route path="/verifikasi-email" element={<VerifikasiEmailPage />} />
      </Route>

      <Route path="/siswa" element={<StudentLayout />}>
        <Route index element={<StudentDashboard />} />
        <Route path="biodata/pribadi" element={<BiodataPribadi />} />
        <Route path="biodata/alamat" element={<BiodataAlamat />} />
        <Route path="biodata/orang-tua" element={<BiodataOrtu />} />
        <Route path="biodata/akademik" element={<BiodataAkademik />} />
        <Route path="biodata/lengkap" element={<BiodataLengkap />} />
        <Route path="pengajuan/pilih-program" element={<PilihProgram />} />
        <Route path="pengajuan/isi-formulir" element={<IsiFormulir />} />
        <Route path="pengajuan/upload-dokumen" element={<UploadDokumen />} />
        <Route path="pengajuan/konfirmasi" element={<KonfirmasiPengajuan />} />
        <Route path="pengajuan/berhasil" element={<PengajuanBerhasil />} />
        <Route path="dokumen/status" element={<StatusPengajuan />} />
        <Route path="dokumen/pencairan-dana" element={<PencairanDana />} />
        <Route path="dokumen/pencairan-dana/berhasil" element={<PencairanDanaBerhasil />} />
        <Route path="laporan-dana" element={<LaporanDanaStudent />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="pengajuan" element={<DaftarPengajuan />} />
        <Route path="pengajuan/:id" element={<DetailPengajuan />} />
        <Route path="seleksi" element={<SeleksiPenerima />} />
        <Route path="seleksi/hitung-skor" element={<HitungSkor />} />
        <Route path="seleksi/sahkan" element={<SahkanHasil />} />
        <Route path="laporan-dana" element={<LaporanDanaAdmin />} />
      </Route>

      <Route path="/super-admin" element={<SuperAdminLayout />}>
        <Route index element={<SuperAdminDashboard />} />
        <Route path="audit-log" element={<AuditLog />} />
        <Route path="evaluasi-program" element={<EvaluasiProgram />} />
      </Route>
    </Routes>
  )
}

export default App

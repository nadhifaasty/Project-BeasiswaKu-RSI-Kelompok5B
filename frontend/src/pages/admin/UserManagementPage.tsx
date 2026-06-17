import { useState, useEffect } from 'react'
import { Card, Button, Modal, Input } from '../../components'
import {
  getUsers,
  updateUserProfile,
  updateUserRole,
  updateUserStatus
} from '../../services/user'
import type { UserProfile, PaginationMeta } from '../../services/user'
import { useAuth } from '../../context/AuthContext'

function UserManagementPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  })
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Filters State
  const [roleFilter, setRoleFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  // Modals State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)

  // Form State
  const [editForm, setEditForm] = useState({
    nama_lengkap: '',
    nim_nisn: '',
    nomor_hp: ''
  })
  const [newRole, setNewRole] = useState<'siswa' | 'admin' | 'super_admin'>('siswa')
  const [statusAction, setStatusAction] = useState<boolean>(true) // true = activate, false = deactivate

  // Loading States for Actions
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [page, roleFilter, searchQuery])

  async function loadUsers() {
    setLoading(true)
    setErrorMessage(null)
    try {
      const paramsObj: Record<string, string> = {
        page: String(page),
        per_page: '10'
      }
      if (roleFilter) paramsObj.role = roleFilter
      if (searchQuery) paramsObj.search = searchQuery

      const res = await getUsers(paramsObj)
      setUsers(res.users)
      setMeta(res.meta)
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat daftar pengguna.')
    } finally {
      setLoading(false)
    }
  }

  // Handle opening Edit Profile modal
  function handleOpenEdit(user: UserProfile) {
    setSelectedUser(user)
    setEditForm({
      nama_lengkap: user.nama_lengkap,
      nim_nisn: user.nim_nisn,
      nomor_hp: user.nomor_hp
    })
    setShowEditModal(true)
  }

  // Handle submitting Edit Profile form
  async function handleSubmitEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return

    setActionLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await updateUserProfile(selectedUser.id, editForm)
      setSuccessMessage('Profil pengguna berhasil diperbarui.')
      setShowEditModal(false)
      loadUsers()
      
      // Auto-dismiss alert
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui profil.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle opening Change Role modal
  function handleOpenRole(user: UserProfile) {
    setSelectedUser(user)
    setNewRole(user.role)
    setShowRoleModal(true)
  }

  // Handle submitting Role update
  async function handleSubmitRole() {
    if (!selectedUser) return

    setActionLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await updateUserRole(selectedUser.id, newRole)
      setSuccessMessage(`Role pengguna ${selectedUser.nama_lengkap} berhasil diubah menjadi ${formatRole(newRole)}.`)
      setShowRoleModal(false)
      loadUsers()

      // Auto-dismiss alert
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui role.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle opening Toggle Status modal (prevent self-deactivation)
  function handleOpenStatusToggle(user: UserProfile) {
    if (currentUser && currentUser.id === user.id) {
      setErrorMessage('Anda tidak dapat menonaktifkan akun Anda sendiri.')
      setTimeout(() => setErrorMessage(null), 4000)
      return
    }
    setSelectedUser(user)
    setStatusAction(!user.is_active)
    setShowStatusModal(true)
  }

  // Handle submitting Status update
  async function handleSubmitStatus() {
    if (!selectedUser) return

    setActionLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await updateUserStatus(selectedUser.id, statusAction)
      const actionText = statusAction ? 'diaktifkan' : 'dinonaktifkan'
      setSuccessMessage(`Akun ${selectedUser.nama_lengkap} berhasil ${actionText}.`)
      setShowStatusModal(false)
      loadUsers()

      // Auto-dismiss alert
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui status akun.')
    } finally {
      setActionLoading(false)
    }
  }

  function getAvatarStyle(name?: string) {
    if (!name) return 'bg-gray-100 text-gray-600'
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    const colors = [
      'bg-red-100 text-red-700',
      'bg-orange-100 text-orange-700',
      'bg-amber-100 text-amber-700',
      'bg-emerald-100 text-emerald-700',
      'bg-teal-100 text-teal-700',
      'bg-blue-100 text-blue-700',
      'bg-indigo-100 text-indigo-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
    ]
    return colors[charCodeSum % colors.length]
  }

  function getInitials(name?: string) {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  function formatRole(role?: string) {
    if (!role) return 'SISWA'
    const roleLower = role.toLowerCase()
    if (roleLower === 'super_admin' || roleLower === 'superadmin') return 'SUPER ADMIN'
    return role.toUpperCase()
  }

  return (
    <div className="bg-[#faf5e8] -m-6 p-6 min-h-[calc(100vh-4rem)] space-y-6">
      {/* Header */}
      <div>
        <span className="inline-block bg-[#e8e2d2] text-[#5c5440] text-[10px] font-bold px-3 py-1 rounded-full mb-2 border border-[#d6cfbe] tracking-wider uppercase">
          Keamanan & Pengguna
        </span>
        <h1 className="text-2xl font-bold text-primary">Manajemen Pengguna</h1>
        <p className="text-sm text-gray-500">
          Kelola profil pengguna, ubah role hak akses, serta aktifkan atau nonaktifkan akun pengguna beasiswa.
        </p>
      </div>

      {/* Alert Notifications */}
      {errorMessage && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm shadow-sm flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-4 text-sm shadow-sm flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari nama, email, atau NIM/NISN..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
          />
        </div>

        {/* Role Filter */}
        <div className="w-full md:w-48">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          >
            <option value="">Semua Role</option>
            <option value="siswa">Siswa</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* User Table Card */}
      <Card className="p-0 overflow-hidden border border-gray-150 shadow-sm bg-white rounded-2xl">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-4 animate-pulse p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : users.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#faf5e8] border-b border-gray-200 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  <th className="py-4 px-6">Pengguna</th>
                  <th className="py-4 px-6">Identitas</th>
                  <th className="py-4 px-6">No. Telepon</th>
                  <th className="py-4 px-6">Hak Akses</th>
                  <th className="py-4 px-6 text-center">Status Aktif</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/80 transition">
                    {/* User Profile Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 ${getAvatarStyle(user.nama_lengkap)}`}>
                          {getInitials(user.nama_lengkap)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-800 truncate max-w-[200px]" title={user.nama_lengkap}>
                            {user.nama_lengkap}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-[200px]" title={user.email}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* NISN / NIM */}
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-700 font-mono text-xs">
                        {user.nim_nisn || '-'}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 font-sans">
                        NIM / NISN
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-6">
                      <div className="text-gray-600 text-xs font-semibold">
                        {user.nomor_hp || '-'}
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase ${
                        user.role === 'super_admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : user.role === 'admin'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {formatRole(user.role)}
                      </span>
                    </td>

                    {/* Status Active Toggle */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenStatusToggle(user)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            user.is_active ? 'bg-[#51966a]' : 'bg-gray-200'
                          }`}
                          title={user.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              user.is_active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-xs font-semibold ${user.is_active ? 'text-[#38704c]' : 'text-gray-400'}`}>
                          {user.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          title="Ubah Profil"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {currentUser?.role === 'super_admin' && (
                          <button
                            onClick={() => handleOpenRole(user)}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                            title="Ubah Role"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Pengguna tidak ditemukan.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 p-5">
            <span className="text-xs font-semibold text-gray-500">
              Menampilkan {users.length} dari {meta.total} pengguna
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="px-3.5 py-1.5 text-xs font-semibold"
              >
                Sebelumnya
              </Button>
              <span className="flex items-center px-3 text-xs font-bold text-primary">
                Halaman {meta.current_page} dari {meta.last_page}
              </span>
              <Button
                variant="outline"
                disabled={page >= meta.last_page || loading}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-1.5 text-xs font-semibold"
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Ubah Profil Pengguna"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Nama Lengkap</label>
            <Input
              type="text"
              required
              value={editForm.nama_lengkap}
              onChange={(e) => setEditForm({ ...editForm, nama_lengkap: e.target.value })}
              placeholder="Masukkan nama lengkap..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">NIM / NISN</label>
            <Input
              type="text"
              required
              value={editForm.nim_nisn}
              onChange={(e) => setEditForm({ ...editForm, nim_nisn: e.target.value })}
              placeholder="Masukkan NIM atau NISN..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Nomor Handphone</label>
            <Input
              type="text"
              required
              value={editForm.nomor_hp}
              onChange={(e) => setEditForm({ ...editForm, nomor_hp: e.target.value })}
              placeholder="Masukkan nomor handphone..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={actionLoading} className="bg-primary text-secondary">
              {actionLoading ? 'Menyimpan...' : 'Simpan Profil'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        open={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Ubah Hak Akses (Role)"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 text-blue-700 border border-blue-100 rounded-xl p-3 text-xs leading-relaxed">
            💡 Mengubah role pengguna akan langsung mempengaruhi tingkat hak akses halaman dan fitur aplikasi mereka. Pastikan penugasan role baru sudah benar.
          </div>

          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pengguna</span>
            <span className="font-semibold text-gray-800 text-sm block">
              {selectedUser?.nama_lengkap} ({selectedUser?.email})
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Role Baru</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            >
              <option value="siswa">Siswa (User Biasa)</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="outline" onClick={() => setShowRoleModal(false)}>
              Batal
            </Button>
            <Button disabled={actionLoading} onClick={handleSubmitRole} className="bg-primary text-secondary">
              {actionLoading ? 'Memproses...' : 'Ubah Role'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toggle Status Confirmation Modal */}
      <Modal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={statusAction ? 'Aktifkan Akun' : 'Nonaktifkan Akun'}
      >
        <div className="space-y-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            Apakah Anda yakin ingin {statusAction ? 'mengaktifkan' : 'menonaktifkan'} akun pengguna{' '}
            <span className="font-bold">{selectedUser?.nama_lengkap}</span> ({selectedUser?.email})?
          </p>

          {!statusAction && (
            <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 text-xs leading-relaxed">
              ⚠️ Pengguna dengan akun nonaktif tidak akan bisa melakukan login ke sistem.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Batal
            </Button>
            <Button
              disabled={actionLoading}
              onClick={handleSubmitStatus}
              className={statusAction ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-red-600 text-white hover:bg-red-700'}
            >
              {actionLoading ? 'Memproses...' : statusAction ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default UserManagementPage

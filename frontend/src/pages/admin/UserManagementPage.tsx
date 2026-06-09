import { useState, useEffect } from 'react'
import { Card, Button } from '../../components'
import { fetchApi } from '../../services/api'

interface User {
  id: string
  full_name: string
  email: string
  role: 'SISWA' | 'ADMIN' | 'SUPER_ADMIN'
  is_active: boolean
  created_at: string
  last_login_at: string
}

interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  })
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Filters State
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)

  // Edit Role Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<'SISWA' | 'ADMIN' | 'SUPER_ADMIN'>('SISWA')
  const [updatingRole, setUpdatingRole] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [page, roleFilter])

  async function loadUsers() {
    setLoading(true)
    setErrorMessage(null)
    try {
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('per_page', '15')
      if (search) params.append('search', search)
      if (roleFilter) params.append('role', roleFilter)

      const res = await fetchApi<any>(`/users?${params.toString()}`)
      
      // Handle response containing nested data/meta structure
      if (res && Array.isArray(res.data)) {
        setUsers(res.data)
        if (res.meta) {
          setMeta(res.meta)
        }
      } else {
        setUsers([])
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memuat data pengguna.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadUsers()
  }

  const handleResetFilters = () => {
    setSearch('')
    setRoleFilter('')
    setPage(1)
    // Clear search and reload
    setTimeout(() => {
      loadUsers()
    }, 0)
  }

  // Toggle user active status
  const handleToggleStatus = async (user: User) => {
    setErrorMessage(null)
    setSuccessMessage(null)
    const nextStatus = !user.is_active
    try {
      await fetchApi(`/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: nextStatus }),
      })
      
      // Update local state on success
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === user.id ? { ...u, is_active: nextStatus } : u))
      )
      setSuccessMessage(`Status pengguna ${user.full_name} berhasil diperbarui.`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal merubah status keaktifan user.')
    }
  }

  // Open modal to edit role
  const handleOpenRoleModal = (user: User) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  // Submit new role
  const handleUpdateRole = async () => {
    if (!selectedUser) return
    setUpdatingRole(true)
    setErrorMessage(null)
    try {
      await fetchApi(`/users/${selectedUser.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      })

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
      )
      
      setSuccessMessage(`Role untuk ${selectedUser.full_name} berhasil diubah menjadi ${newRole}.`)
      setSelectedUser(null)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui role user.')
    } finally {
      setUpdatingRole(false)
    }
  }

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'ADMIN':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <span className="inline-block bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full mb-2 border border-accent/25 tracking-wide uppercase">
          User Management
        </span>
        <h1 className="text-2xl font-bold text-primary">Manajemen Pengguna</h1>
        <p className="text-gray-500">
          Kelola data pengguna, perbarui hak akses (role), serta aktifkan atau nonaktifkan akun di dalam sistem.
        </p>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm transition-all duration-300">
          ⚠ {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 text-sm transition-all duration-300">
          ✓ {successMessage}
        </div>
      )}

      {/* Filters Card */}
      <Card className="p-5">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <h2 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
            🔍 Pencarian & Filter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Cari Pengguna</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama lengkap atau email pengguna..."
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm text-primary focus:ring-2 focus:ring-accent focus:outline-none"
                />
                <div className="absolute left-3.5 top-2.5 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Filter Hak Akses (Role)</label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary bg-white focus:ring-2 focus:ring-accent focus:outline-none"
              >
                <option value="">Semua Role</option>
                <option value="SISWA">SISWA</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER ADMIN</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleResetFilters} className="text-xs font-bold px-4">
              Reset Filter
            </Button>
            <Button type="submit" className="text-xs font-bold px-5 bg-primary text-secondary">
              Cari Pengguna
            </Button>
          </div>
        </form>
      </Card>

      {/* Users Table Card */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-4 animate-pulse py-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : users.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                  <th className="py-3.5 px-4">Nama Pengguna</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Hak Akses (Role)</th>
                  <th className="py-3.5 px-4">Status Akun</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition duration-150">
                    {/* User Profile Cell */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 text-sm">
                          {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-semibold text-gray-800">{user.full_name}</span>
                      </div>
                    </td>

                    {/* Email Cell */}
                    <td className="py-3.5 px-4 text-gray-600 font-mono text-xs">
                      {user.email}
                    </td>

                    {/* Role Cell */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border tracking-wide uppercase ${getRoleBadgeStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Status Cell */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium ${
                        user.is_active 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        {user.is_active ? 'Aktif' : 'Nonaktif / Banned'}
                      </span>
                    </td>

                    {/* Actions Cell */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Edit Role Button */}
                        <Button 
                          onClick={() => handleOpenRoleModal(user)} 
                          className="text-[11px] font-bold py-1 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                          variant="outline"
                        >
                          Ubah Role
                        </Button>

                        {/* Deactivate/Activate toggle */}
                        <Button 
                          onClick={() => handleToggleStatus(user)} 
                          className={`text-[11px] font-bold py-1 px-3 text-white transition ${
                            user.is_active 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Tidak ada pengguna yang cocok dengan kriteria filter.
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-gray-150 pt-5 mt-5">
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

      {/* Edit Role Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-fade-in border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-primary">Ubah Hak Akses</h3>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Pilih hak akses (role) baru untuk pengguna <strong className="text-primary">{selectedUser.full_name}</strong> ({selectedUser.email}).
            </p>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Role Baru</label>
              <select
                value={newRole}
                onChange={(e: any) => setNewRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-primary bg-white focus:ring-2 focus:ring-accent focus:outline-none"
              >
                <option value="SISWA">SISWA</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER ADMIN</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedUser(null)} 
                className="text-xs font-bold px-4"
                disabled={updatingRole}
              >
                Batal
              </Button>
              <Button 
                onClick={handleUpdateRole} 
                className="text-xs font-bold px-5 bg-primary text-secondary"
                disabled={updatingRole}
              >
                {updatingRole ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default UserManagementPage

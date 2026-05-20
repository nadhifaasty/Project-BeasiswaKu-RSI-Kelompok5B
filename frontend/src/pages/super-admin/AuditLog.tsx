const logs = [
  { waktu: '20 Mei 2026 14:30', user: 'admin@beasiswaku.ac.id', aksi: 'Menyetujui pengajuan #004', level: 'INFO' },
  { waktu: '20 Mei 2026 13:15', user: 'superadmin@beasiswaku.ac.id', aksi: 'Mengesahkan hasil seleksi', level: 'INFO' },
  { waktu: '20 Mei 2026 10:00', user: 'siswa@example.com', aksi: 'Mengirim pengajuan baru', level: 'INFO' },
  { waktu: '19 Mei 2026 22:45', user: 'unknown', aksi: 'Percobaan login gagal (5x)', level: 'WARNING' },
  { waktu: '19 Mei 2026 09:00', user: 'superadmin@beasiswaku.ac.id', aksi: 'Mengubah bobot seleksi', level: 'INFO' },
]

function AuditLog() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Log</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Waktu</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Level</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{log.waktu}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{log.user}</td>
                  <td className="px-4 py-3">{log.aksi}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {log.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AuditLog

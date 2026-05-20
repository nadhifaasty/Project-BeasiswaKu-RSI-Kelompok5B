import { Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-blue-600">BeasiswaKu</a>
          <div className="flex gap-4">
            <a href="/login" className="text-gray-600 hover:text-blue-600">Login</a>
            <a href="/register" className="text-gray-600 hover:text-blue-600">Register</a>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-100 border-t py-6 text-center text-gray-500 text-sm">
        &copy; 2026 BeasiswaKu. All rights reserved.
      </footer>
    </div>
  )
}

export default MainLayout

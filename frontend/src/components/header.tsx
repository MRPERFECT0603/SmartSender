'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md sticky top-0 z-50">
      <h1 className="text-xl font-bold text-blue-600">SmartInbox</h1>
      <nav className="space-x-4">
        <Link
          href="/dashboard"
          className={`hover:text-blue-500 ${pathname === '/dashboard' ? 'font-semibold text-blue-600' : ''}`}
        >
          Dashboard
        </Link>
        <Link
          href="/login"
          className={`hover:text-blue-500 ${pathname === '/login' ? 'font-semibold text-blue-600' : ''}`}
        >
          Login
        </Link>
      </nav>
    </header>
  )
}
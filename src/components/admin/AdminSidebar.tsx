'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Flag,
  Truck,
  Users,
  FileText,
  Calendar
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Courses', icon: Flag },
  { href: '/admin/transport', label: 'Transport', icon: Truck },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/quotes', label: 'Quotes', icon: FileText },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1E1F20] border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF8F35] flex items-center justify-center">
            <span className="text-white font-bold text-sm">GO</span>
          </div>
          <div>
            <span className="text-white font-semibold">Golf Okay</span>
            <span className="text-gray-500 text-xs block">Admin Portal</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-[#FF6B35]/10 text-[#FF6B35] border-l-2 border-l-[#FF6B35]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-l-transparent'
                }
              `}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-500 text-sm hover:text-gray-300 transition-colors"
        >
          ← Back to Main Site
        </Link>
      </div>
    </aside>
  );
}

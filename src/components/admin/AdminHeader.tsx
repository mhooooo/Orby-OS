'use client';

import { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';
import { Bell, Settings } from 'lucide-react';

interface AdminHeaderProps {
  user: User;
}

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/courses': 'Course Management',
  '/admin/transport': 'Transport Rates',
  '/admin/clients': 'Client Management',
  '/admin/quotes': 'Quotes',
  '/admin/bookings': 'Bookings',
};

export default function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();

  // Get title from exact match or parent path
  const title = pageTitles[pathname] ||
    Object.entries(pageTitles).find(([path]) =>
      path !== '/admin' && pathname.startsWith(path)
    )?.[1] ||
    'Admin';

  return (
    <header className="h-16 bg-[#1E1F20] border-b border-white/5 px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <Bell size={20} />
        </button>

        {/* Settings */}
        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <Settings size={20} />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user.email}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A855F7] to-[#7C3AED] flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

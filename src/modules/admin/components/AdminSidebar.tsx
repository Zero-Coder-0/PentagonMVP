import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Database, Users, Settings, LogOut } from 'lucide-react'; 

export default function AdminSidebar() {
  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, href: '/admin' },
    { name: 'Schema Builder', icon: Database, href: '/admin?tab=schema', active: true },
    { name: 'User Management', icon: Users, href: '/admin?tab=users' },
    { name: 'Settings', icon: Settings, href: '/admin?tab=settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 h-screen flex flex-col fixed left-0 top-0 border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wider text-blue-500">PENTAGON<span className="text-white">ADMIN</span></h1>
        <p className="text-xs text-slate-400 mt-1">Super Admin Console</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link 
            key={item.name} 
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              item.active 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            <span className="font-medium text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-950/30 rounded-lg transition-colors">
          <LogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

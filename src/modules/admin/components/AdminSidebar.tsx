import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Database, Users, Settings, LogOut } from 'lucide-react';

export default function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white shadow-xl z-50 flex flex-col">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white">Pentagon<span className="text-indigo-400">MVP</span></h1>
        <p className="text-xs text-slate-400 mt-1">Super Admin Console</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <Link 
          href="/admin" 
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg bg-indigo-600 text-white shadow-md"
        >
          <Database className="w-5 h-5" />
          Schema Builder
        </Link>
        
        <Link 
          href="/admin/users" 
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Users className="w-5 h-5" />
          User Management
        </Link>

        <Link 
          href="/dashboard" 
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mt-8"
        >
          <LayoutDashboard className="w-5 h-5" />
          View Sales Dashboard
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <button className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

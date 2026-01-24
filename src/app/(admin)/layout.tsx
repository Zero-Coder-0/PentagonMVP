import Link from 'next/link';
import { LayoutDashboard, FileCheck, Building2, Users, Settings } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight">Pentagon Admin</h1>
          <p className="text-xs text-slate-400 mt-1">Tenant Administrator</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem href="/admin" icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem href="/admin/approvals" icon={<FileCheck size={20} />} label="Approvals" badge="3" />
          <NavItem href="/admin/inventory" icon={<Building2 size={20} />} label="Inventory" />
          <NavItem href="/admin/users" icon={<Users size={20} />} label="User Management" />
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Link href="/super/schema" className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
            <Settings size={20} />
            <span className="font-medium">Schema Builder</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, badge }: { href: string; icon: React.ReactNode; label: string; badge?: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {badge && (
        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

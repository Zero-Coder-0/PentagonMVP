'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileCheck, 
  Building2, 
  Users, 
  Upload, 
  Settings,
  Sparkles
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  highlight?: boolean;
  description?: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch pending approvals count
  useEffect(() => {
    async function fetchPendingCount() {
      try {
        // Count property drafts with status 'pending'
        const { count: propertyCount, error: propertyError } = await supabase
          .from('property_drafts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (propertyError) throw propertyError;

        // If you have user approvals, add this:
        // const { count: userCount, error: userError } = await supabase
        //   .from('profiles')
        //   .select('*', { count: 'exact', head: true })
        //   .eq('approval_status', 'pending');
        
        const totalPending = propertyCount || 0; // + (userCount || 0) if you have user approvals
        setPendingCount(totalPending);
      } catch (err) {
        console.error('Error fetching pending count:', err);
        setPendingCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchPendingCount();

    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems: NavItem[] = [
    { 
      href: '/admin', 
      label: 'Overview', 
      icon: <LayoutDashboard size={20} />,
      description: 'Dashboard & Analytics'
    },
    { 
      href: '/admin/approvals', 
      label: 'Approvals', 
      icon: <FileCheck size={20} />,
      badge: loading ? '...' : pendingCount,
      badgeColor: pendingCount > 0 ? 'bg-blue-600' : 'bg-slate-400',
      description: 'Pending submissions'
    },
    { 
      href: '/admin/inventory', 
      label: 'Inventory', 
      icon: <Building2 size={20} />,
      description: 'All properties'
    },
    { 
      href: '/admin/users', 
      label: 'User Management', 
      icon: <Users size={20} />,
      description: 'Vendors & admins'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Modern Light Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Pentagon Admin</h1>
              <p className="text-xs text-slate-600">Tenant Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group relative flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200
                  ${active 
                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' 
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`flex-shrink-0 ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                {item.badge !== undefined && item.badge !== 0 && (
                  <span className={`flex-shrink-0 ml-2 px-2.5 py-1 text-white text-xs font-bold rounded-full shadow-sm ${item.badgeColor || 'bg-blue-600'}`}>
                    {item.badge}
                  </span>
                )}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                )}
              </Link>
            );
          })}

          {/* Separator */}
          <div className="py-2">
            <div className="border-t border-slate-200" />
          </div>

          {/* Bulk Upload - Special Highlight */}
          <Link
            href="/admin/bulk-upload"
            className={`
              group relative flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200
              bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100
              ${isActive('/admin/bulk-upload') 
                ? 'ring-2 ring-green-500 shadow-lg' 
                : 'shadow-sm'
              }
            `}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 text-green-600">
                <Upload size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-green-700 font-semibold truncate">Bulk Upload</p>
                <p className="text-xs text-green-600 truncate mt-0.5">
                  Import multiple properties
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-2 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
              NEW
            </div>
            {isActive('/admin/bulk-upload') && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-600 rounded-r-full" />
            )}
          </Link>
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          {/* Schema Builder */}
          <Link
            href="/super/schema"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
              ${isActive('/super/schema')
                ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-100'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }
            `}
          >
            <Settings size={20} />
            <span>Schema Builder</span>
          </Link>

          {/* Quick Tip Card */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-2">
              <div className="text-lg">💡</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 mb-1">Quick Tip</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Use <strong>Bulk Upload</strong> to add multiple properties at once with Excel/CSV!
                </p>
              </div>
            </div>
          </div>

          {/* Version Info */}
          <div className="text-center">
            <p className="text-xs text-slate-400">v7.0 Schema</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
}

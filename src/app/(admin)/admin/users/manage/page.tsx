'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/core/db/client'

export default function ManageUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('role', { ascending: true })
      setUsers(data || [])
    }
    fetchUsers()
  }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Active Team Members</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-700">Email</th>
              <th className="p-4 font-semibold text-slate-700">Role</th>
              <th className="p-4 font-semibold text-slate-700">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              // --- MASKING LOGIC START ---
              // If user is super_admin, pretend they are tenant_admin for display
              const displayRole = user.role === 'super_admin' ? 'tenant_admin' : user.role;
              
              // Define styles based on the DISPLAY role, not the real one
              const roleStyles = displayRole === 'tenant_admin' 
                ? 'bg-gray-100 text-gray-700' // Gray style for Admin
                : displayRole === 'salesman' 
                  ? 'bg-blue-100 text-blue-700' // Blue style for Sales
                  : 'bg-amber-100 text-amber-700'; // Amber for Vendor
              // --- MASKING LOGIC END ---

              return (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${roleStyles}`}>
                      {displayRole.replace('_', ' ')} {/* "tenant_admin" -> "TENANT ADMIN" */}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

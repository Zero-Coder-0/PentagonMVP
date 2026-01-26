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
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-4 font-medium">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                    ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 
                      user.role === 'salesman' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}
                  `}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-slate-500 text-sm">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

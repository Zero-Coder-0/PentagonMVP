'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/core/db/client' // Your Supabase Client
import { Check, X, Shield, Briefcase, User } from 'lucide-react'

type Profile = {
  id: string
  email: string
  role: 'salesman' | 'vendor'
  created_at: string
}

export default function ApprovalPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Fetch Pending Users (is_active = false)
  const fetchPending = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', false)
      .order('created_at', { ascending: false })
    
    setUsers(data as Profile[] || [])
    setLoading(false)
  }

  useEffect(() => { fetchPending() }, [])

  // Action: Approve User
  const handleApprove = async (userId: string, assignedRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: true, role: assignedRole })
      .eq('id', userId)

    if (!error) {
      alert('User Approved!')
      fetchPending() // Refresh list
    } else {
      alert('Error: ' + error.message)
    }
  }

  // Action: Reject User (Delete)
  const handleReject = async (userId: string) => {
    if(!confirm("Are you sure you want to reject and delete this user?")) return;
    
    // Delete from profiles (Cascade will likely need to be handled if they have auth data, 
    // but usually we delete from public.profiles. 
    // Note: To fully delete Auth user requires a Service Role key or Edge Function, 
    // but deleting the profile prevents them from logging in via Middleware check.)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (!error) {
      fetchPending()
    }
  }

  if (loading) return <div className="p-8">Loading requests...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Shield className="text-amber-600"/> Pending Access Requests
      </h1>

      {users.length === 0 ? (
        <div className="text-center p-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <p className="text-slate-500">No pending approvals found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-700">Email</th>
                <th className="p-4 font-semibold text-slate-700">Requested</th>
                <th className="p-4 font-semibold text-slate-700">Assign Role</th>
                <th className="p-4 font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <UserRow 
                  key={user.id} 
                  user={user} 
                  onApprove={handleApprove} 
                  onReject={handleReject} 
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Sub-component for clean row logic
function UserRow({ user, onApprove, onReject }: any) {
  const [role, setRole] = useState(user.role || 'salesman')

  return (
    <tr className="hover:bg-slate-50">
      <td className="p-4">
        <div className="font-medium text-slate-900">{user.email}</div>
        <div className="text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString()}</div>
      </td>
      <td className="p-4">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          Pending
        </span>
      </td>
      <td className="p-4">
        <select 
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
        >
          <option value="salesman">Sales Executive</option>
          <option value="vendor">Vendor / Partner</option>
        </select>
      </td>
      <td className="p-4 text-right space-x-2">
        <button 
          onClick={() => onApprove(user.id, role)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
        >
          <Check size={16} className="mr-1" /> Approve
        </button>
        <button 
          onClick={() => onReject(user.id)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
        >
          <X size={16} className="mr-1" /> Reject
        </button>
      </td>
    </tr>
  )
}

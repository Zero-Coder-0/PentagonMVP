'use client'

import Link from 'next/link'
import { UserCheck, Users, ArrowRight } from 'lucide-react'

export default function UserManagementDashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-2">Manage access requests and active team members.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Approvals */}
        <Link href="/admin/users/approval" className="group block">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-100 p-3 rounded-lg">
                <UserCheck className="w-8 h-8 text-amber-700" />
              </div>
              <ArrowRight className="text-amber-400 group-hover:translate-x-1 transition" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Pending Approvals</h3>
            <p className="text-slate-600 mt-2">
              Review new sign-ups via Google Login. Assign roles (Sales/Vendor) and activate accounts.
            </p>
          </div>
        </Link>

        {/* Card 2: Active Users */}
        <Link href="/admin/users/manage" className="group block">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-blue-700" />
              </div>
              <ArrowRight className="text-blue-400 group-hover:translate-x-1 transition" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Active Users</h3>
            <p className="text-slate-600 mt-2">
              View all active sales executives and vendors. Edit roles or revoke access.
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}

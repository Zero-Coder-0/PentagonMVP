'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, FileCheck, Calendar } from 'lucide-react';

export default function AdminOverviewPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Proper Container with Padding */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Page Header - WITH SPACING */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard Overview</h1>
          <p className="text-slate-600">Monitor your property management system</p>
        </div>

        {/* Stats Grid - WITH PROPER GAPS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Live Properties Card */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Live Properties</h3>
            </div>
            <p className="text-5xl font-bold text-blue-600 mb-2">0</p>
            <p className="text-sm text-blue-700">Active projects in database</p>
          </div>

          {/* Pending Approvals Card */}
          <Link href="/admin/approvals">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <FileCheck className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-yellow-900">Pending Approvals</h3>
              </div>
              <p className="text-5xl font-bold text-yellow-600 mb-2">0</p>
              <p className="text-sm text-yellow-700">Submissions awaiting review</p>
            </div>
          </Link>

          {/* Scheduled Visits Card */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-green-900">Scheduled Visits</h3>
            </div>
            <p className="text-5xl font-bold text-green-600 mb-2">0</p>
            <p className="text-sm text-green-700">Upcoming property visits</p>
          </div>
        </div>

        {/* Development Mode Warning - WITH SPACING */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-blue-900 text-lg mb-3 flex items-center gap-2">
            <span className="text-2xl">🚧</span>
            Development Mode Active
          </h3>
          <p className="text-blue-800 leading-relaxed">
            You are bypassing <code className="bg-blue-200 px-2 py-1 rounded text-sm font-mono">proxy.ts</code>. 
            Direct database access is enabled. Navigate to{' '}
            <Link href="/admin/inventory" className="font-semibold underline hover:text-blue-600">
              /admin/inventory
            </Link>{' '}
            to edit live data or{' '}
            <Link href="/admin/approvals" className="font-semibold underline hover:text-blue-600">
              /admin/approvals
            </Link>{' '}
            to process drafts.
          </p>
        </div>

        {/* Quick Actions - WITH SPACING */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
          <h3 className="font-bold text-slate-900 text-xl mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/inventory/new"
              className="flex flex-col items-center gap-3 p-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition group"
            >
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Building2 className="text-white" size={28} />
              </div>
              <span className="font-semibold text-slate-900">Add Property</span>
            </Link>

            <Link
              href="/admin/approvals"
              className="flex flex-col items-center gap-3 p-6 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 rounded-xl transition group"
            >
              <div className="w-14 h-14 bg-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <FileCheck className="text-white" size={28} />
              </div>
              <span className="font-semibold text-slate-900">Review Approvals</span>
            </Link>

            <Link
              href="/admin/bulk-upload"
              className="flex flex-col items-center gap-3 p-6 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition group"
            >
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <span className="text-2xl">📤</span>
              </div>
              <span className="font-semibold text-slate-900">Bulk Upload</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex flex-col items-center gap-3 p-6 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl transition group"
            >
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <span className="text-2xl">👥</span>
              </div>
              <span className="font-semibold text-slate-900">Manage Users</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

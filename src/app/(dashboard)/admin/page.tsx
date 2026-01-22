import React from 'react';
import SchemaBuilder from '@/modules/admin/components/SchemaBuilder';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Configuration</h1>
          <p className="text-slate-500">Manage global settings, property schemas, and access controls.</p>
        </div>
        <div className="flex gap-3">
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            SYSTEM ONLINE
          </span>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Main Content Modules */}
      <section>
        <SchemaBuilder />
      </section>
    </div>
  );
}

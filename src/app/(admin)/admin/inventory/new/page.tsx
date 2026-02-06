'use client'

import ProjectWizard from '@/components/admin/ProjectWizard';

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Add New Project</h1>
        <p className="text-slate-500 text-sm">Create a new inventory listing directly in the Live Database.</p>
      </div>
      
      {/* 
         We use the Wizard in "admin" mode.
         This means when you click Submit, it writes to 'projects' table (LIVE),
         NOT 'property_drafts' (PENDING).
      */}
      <ProjectWizard mode="admin" />
    </div>
  );
}

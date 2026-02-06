'use client'

import React, { use } from 'react' 
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import ProjectWizard from '@/components/admin/ProjectWizard'; // IMPORT THE WIZARD

export default function VendorPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ success?: string }> 
}) {
  const params = use(searchParams);
  const isSuccess = params.success === 'true';
  const router = useRouter(); 

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Submission Received!</h2>
          <p className="text-slate-500">
            Your property draft has been sent to the Tenant Admin. You will be notified once it is approved and live.
          </p>
          <button 
            onClick={() => window.location.href = '/vendor'} 
            className="block w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Vendor Submission Portal</h1>
        <p className="text-slate-600 mt-2">Submit your property details. Admins will review before publishing.</p>
      </div>
      
      {/* THE UPGRADED WIZARD IN VENDOR MODE */}
      <ProjectWizard mode="vendor" />
      
    </div>
  );
}

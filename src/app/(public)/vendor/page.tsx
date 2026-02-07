// src/app/vendor/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import ProjectWizard from '@/components/admin/ProjectWizard';
import { CheckCircle, Clock } from 'lucide-react';
import { Suspense } from 'react';

function VendorContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  if (success === 'true') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Submission Successful! 🎉
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Your property submission has been received and is now pending admin approval.
          </p>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left mb-8">
            <div className="flex items-start gap-3">
              <Clock className="text-blue-600 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Admin team will review your submission within 24-48 hours</li>
                  <li>• You'll receive an email notification once reviewed</li>
                  <li>• Approved properties go live on the sales dashboard</li>
                  <li>• Rejected submissions will include feedback for resubmission</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/vendor'}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
            >
              Submit Another Property
            </button>
            <button 
              onClick={() => window.location.href = '/vendor/submissions'}
              className="px-8 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
            >
              View My Submissions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Vendor Property Submission Portal
          </h1>
          <p className="text-slate-600">
            Submit property details for admin review and approval. All submissions are verified before going live.
          </p>
        </div>
      </div>

      {/* Wizard */}
      <ProjectWizard mode="vendor" />

      {/* Footer Info */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-bold text-yellow-900 mb-2">📋 Submission Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-yellow-800">
            <div>
              <h4 className="font-semibold mb-1">Required Information:</h4>
              <ul className="space-y-1">
                <li>• Project name and developer</li>
                <li>• Accurate location coordinates</li>
                <li>• At least one unit configuration</li>
                <li>• Target customer profile</li>
                <li>• Closing pitch</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Quality Standards:</h4>
              <ul className="space-y-1">
                <li>• Use high-quality images (hero image required)</li>
                <li>• Verify RERA numbers before submission</li>
                <li>• Provide accurate pricing information</li>
                <li>• Include complete amenities list</li>
                <li>• Add realistic sales intelligence data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VendorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading submission portal...</p>
        </div>
      </div>
    }>
      <VendorContent />
    </Suspense>
  );
}

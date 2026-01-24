import PropertyForm from '@/components/shared/PropertyForm';
import { CheckCircle2 } from 'lucide-react';

export default function VendorPage({ searchParams }: { searchParams: { success?: string } }) {
  const isSuccess = searchParams.success === 'true';

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
          <a href="/vendor" className="block w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors">
            Submit Another
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Vendor Submission Portal</h1>
        <p className="text-slate-600 mt-2">Submit your property details. Admins will review before publishing.</p>
      </div>
      <PropertyForm />
    </div>
  );
}

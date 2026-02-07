// src/app/admin/inventory/new/page.tsx
import ProjectWizard from '@/components/admin/ProjectWizard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewPropertyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto pt-6 px-4">
        <Link 
          href="/admin/inventory"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Inventory
        </Link>
      </div>

      {/* Wizard Component */}
      <ProjectWizard mode="admin" />
    </div>
  );
}

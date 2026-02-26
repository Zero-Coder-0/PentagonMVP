import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProjectWizardV7 from '@/components/admin/ProjectWizard';
import { WizardFormData } from '@/lib/wizard-schema';
import { getVerifiedUser } from '@/app/actions/wizard-actions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApproveDraftPage({ params }: Props) {
  const { id } = await params;

  let dbUser;
  try {
    dbUser = await getVerifiedUser();
    if (!['tenant_admin', 'super_admin'].includes(dbUser.role)) {
      redirect('/admin');
    }
  } catch (error) {
    redirect('/admin');
  }

  const draft = await prisma.propertyDraft.findUnique({
    where: { id },
  });
  if (!draft) redirect('/admin/approvals');

  const initialData = draft.submission_data as Partial<WizardFormData>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin/approvals" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Approvals
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Review &amp; Approve Draft</h1>
              <p className="text-slate-500 mt-1">
                Draft ID: {draft.id} · Status:{' '}
                <span className={`font-semibold ${draft.status === 'pending' ? 'text-amber-600' : 'text-green-600'}`}>
                  {draft.status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        </div>

        {draft.status === 'approved' ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <p className="text-green-700 text-lg font-semibold">✅ This draft has already been approved and published.</p>
            <Link href="/admin/inventory" className="text-blue-600 hover:underline mt-4 inline-block">
              View Inventory →
            </Link>
          </div>
        ) : (
          <ProjectWizardV7
            userRole={dbUser.role as any}
            mode="approve_draft"
            draftId={draft.id}
            initialData={initialData}
          />
        )}
      </div>
    </div>
  );
}

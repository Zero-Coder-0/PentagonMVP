import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/core/db/server';
import { prisma } from '@/lib/prisma';
import ProjectWizardV7 from '@/components/admin/ProjectWizard';
import { WizardFormData } from '@/lib/wizard-schema';

interface Props {
    params: { id: string };
}

export default async function VendorEditDraftPage({ params }: Props) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, is_active: true },
    });

    if (!dbUser?.is_active || !['vendor', 'salesman'].includes(dbUser.role)) {
        redirect('/');
    }

    const draft = await prisma.propertyDraft.findUnique({
        where: { id: params.id },
    });

    if (!draft) redirect('/vendor/drafts');

    if (draft.vendor_id !== user.id) {
        redirect('/vendor/drafts');
    }

    // Security Note: Page must check draft.status !== "approved" before rendering
    if (draft.status === 'approved') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Draft Approved</h2>
                    <p className="text-slate-600 mb-6">
                        This draft has already been approved and published. It can no longer be edited from the draft dashboard.
                    </p>
                    <Link
                        href="/vendor/drafts"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Back to Drafts
                    </Link>
                </div>
            </div>
        );
    }

    const initialData = draft.submission_data as Partial<WizardFormData>;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Link href="/vendor/drafts" className="text-blue-600 hover:underline mb-2 inline-block">
                        ← Back to Drafts
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Edit Draft</h1>
                            <p className="text-slate-500 mt-1">
                                Draft ID: {draft.id} · Status:{' '}
                                <span className={`font-semibold ${draft.status === 'pending' ? 'text-amber-600' : 'text-slate-600'}`}>
                                    {draft.status.toUpperCase()}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <ProjectWizardV7
                    userRole={dbUser.role}
                    mode="edit_draft"
                    draftId={draft.id}
                    initialData={initialData}
                />
            </div>
        </div>
    );
}

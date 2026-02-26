import { redirect } from 'next/navigation';
import { createClient } from '@/core/db/server';
import { prisma } from '@/lib/prisma';
import ProjectWizardV7 from '@/components/admin/ProjectWizard';

export default async function VendorAddPropertyPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, is_active: true },
    });

    if (!dbUser?.is_active || !['vendor', 'salesman'].includes(dbUser.role)) {
        redirect('/'); // Or to a generic unauthorized page
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900">Submit New Property</h1>
                    <p className="text-lg text-slate-600 mt-2">
                        Fill in all the details below. Your submission will be reviewed by our admin team before being published.
                    </p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">📋</div>
                        <div className="flex-1">
                            <h3 className="font-bold text-blue-900 text-lg mb-2">Submission Guidelines</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>✅ Fill in all required fields marked with *</li>
                                <li>✅ Add at least one unit type (2BHK, 3BHK, etc.)</li>
                                <li>✅ Set accurate location on the map</li>
                                <li>✅ Add amenities and nearby landmarks for better visibility</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <ProjectWizardV7
                    userRole={dbUser.role}
                    mode="create_draft"
                />
            </div>
        </div>
    );
}

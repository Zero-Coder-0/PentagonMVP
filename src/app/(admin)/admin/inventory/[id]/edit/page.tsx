import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/core/db/server';
import { prisma } from '@/lib/prisma';
import ProjectWizardV7 from '@/components/admin/ProjectWizard';
import { flattenLiveProjectForWizard } from '@/app/actions/wizard-actions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditLiveProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const devBypass = process.env.DEV_BYPASS_AUTH === 'true';

  let dbUserRole = 'guest';
  let dbUserActive = false;

  if (devBypass) {
    dbUserRole = process.env.DEV_ROLE || 'super_admin';
    dbUserActive = true;
  } else {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, is_active: true },
    });
    dbUserRole = dbUser?.role || 'guest';
    dbUserActive = dbUser?.is_active || false;
  }

  if (!dbUserActive || !['tenant_admin', 'super_admin'].includes(dbUserRole)) {
    redirect('/admin');
  }

  const initialData = await flattenLiveProjectForWizard(id);
  if (!initialData) redirect('/admin/inventory');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin/inventory" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Inventory
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            Edit: {initialData.project_name}
          </h1>
          <p className="text-slate-500 mt-1">Editing live project · Changes will be published immediately</p>
        </div>

        <ProjectWizardV7
          userRole={dbUserRole as any}
          mode="edit_live"
          projectId={id}
          initialData={initialData}
        />
      </div>
    </div>
  );
}

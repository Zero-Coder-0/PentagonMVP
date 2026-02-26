import { NextResponse } from 'next/server';
import { upsertDraft, approveDraftToLive } from '@/app/actions/wizard-actions';
import { defaultWizardValues } from '@/lib/wizard-schema';

export async function GET() {
    try {
        const payload = {
            ...defaultWizardValues,
            project_name: 'Test Project ' + Date.now(),
        };
        const draftResult = await upsertDraft(payload);

        // Now try to approve it to live!
        const liveResult = await approveDraftToLive(draftResult.draftId, payload);

        return NextResponse.json({ draftResult, liveResult });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}

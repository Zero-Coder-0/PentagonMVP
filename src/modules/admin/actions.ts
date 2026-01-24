'use server';

import { createClient } from '@/core/db/server';
import { redirect } from 'next/navigation';

export async function approveDraft(draftId: string, formData: FormData) {
  const supabase = await createClient();

  // 1. Fetch the Draft
  const { data: draft, error: fetchError } = await supabase
    .from('property_drafts')
    .select('*')
    .eq('id', draftId)
    .single();

  if (fetchError || !draft) throw new Error('Draft not found');

  // 2. Extract Data (The "Submission Data" is JSONB)
  const raw = draft.submission_data as any;

  // 3. Map JSON -> Strict SQL Columns
  // This ensures the "Search Indexes" (Price, Zone) work instantly.
  const propertyPayload = {
    // Identity
    name: raw.name,
    developer: raw.developer,
    location_area: raw.location_area,
    zone: raw.zone, // Enum: 'North', 'South', etc.
    lat: raw.lat || 12.9716, // Default to Bangalore center if missing
    lng: raw.lng || 77.5946,

    // Performance/Filtering Columns
    price_value: raw.price_value, // Numeric
    price_display: raw.price_display, // "1.2 Cr"
    status: raw.status || 'Under Construction',
    configurations: raw.configurations || [], // Array ['2BHK', '3BHK']
    
    // Details
    floor_levels: raw.floor_levels,
    completion_duration: raw.completion_duration,
    
    // JSONB Buckets (The "Rich Schema" parts)
    media: raw.media || { images: [], brochure: '' },
    units_available: raw.units_available || {}, // {"2BHK": 10}
    specs: raw.specs || {}, // {"pet_friendly": true}
    
    // Audit
    created_at: new Date().toISOString(),
  };

  // 4. Insert into LIVE Properties Table
  const { error: insertError } = await supabase
    .from('properties')
    .insert(propertyPayload);

  if (insertError) {
    console.error('Approval Failed:', insertError);
    throw new Error('Failed to create live property');
  }

  // 5. Mark Draft as Approved
  await supabase
    .from('property_drafts')
    .update({ status: 'approved' })
    .eq('id', draftId);

  // 6. Redirect back to dashboard
  redirect('/admin/approvals');
}

export async function rejectDraft(draftId: string) {
  const supabase = await createClient();
  
  await supabase
    .from('property_drafts')
    .update({ status: 'rejected' })
    .eq('id', draftId);
    
  redirect('/admin/approvals');
}

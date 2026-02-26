'use server'

import { createClient } from '@/core/db/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Define the shape of the data for validation
const schema = z.object({
  name: z.string().min(1),
  developer: z.string().min(1),
  location_area: z.string().min(1),
  zone: z.enum(['North', 'South', 'East', 'West']),
  price_value: z.number().positive(),
  status: z.enum(['Ready', 'Under Construction']),
  // We accept JSON strings for complex fields because FormData is flat
  units_available: z.string().transform((str) => JSON.parse(str)), 
  media: z.string().transform((str) => JSON.parse(str)),
});

export async function submitDraft(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  // 1. Extract and Format Data
  const rawData = {
    name: formData.get('name'),
    developer: formData.get('developer'),
    location_area: formData.get('location_area'),
    zone: formData.get('zone'),
    price_value: Number(formData.get('price_value')),
    price_display: formData.get('price_display'), // e.g., "1.2 Cr"
    status: formData.get('status'),
    units_available: formData.get('units_available'), // JSON string from hidden input
    media: formData.get('media'), // JSON string from hidden input
    // Default / Calculated fields
    configurations: JSON.parse(formData.get('configurations') as string || '[]'),
    lat: 12.9716, // Hardcoded for MVP (Bangalore)
    lng: 77.5946, 
  };

  // 2. Validate
  const validated = schema.safeParse(rawData);
  if (!validated.success) {
    return { message: 'Validation Failed', errors: validated.error.flatten() };
  }

  // 3. Insert into Drafts
  const { error } = await supabase
    .from('property_drafts')
    .insert({
      submission_data: rawData,
      status: 'pending'
    });

  if (error) {
    console.error(error);
    return { message: 'Database Error: Failed to save draft' };
  }

  // 4. Success Redirect
  redirect('/vendor?success=true');
}

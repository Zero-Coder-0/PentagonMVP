'use server'

import { createClient } from '@/core/db/server';
import { ProjectFullV7 } from './types-v7';
import { adaptProjectToProperty } from './utils/adapter';
import { Property } from './types';

export async function getProjectsV7(): Promise<Property[]> {
  console.log("Fetching V7 Projects...");
  const supabase = await createClient();

  // 1. Fetch Data
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      units:project_units(*),
      amenities:project_amenities(*),
      landmarks:project_landmarks(*),
      analysis:project_analysis(*),
      cost_extras:project_cost_extras(*)
    `)
    .order('created_at', { ascending: false });

  // 2. Log Errors
  if (error) {
    console.error('SUPABASE ERROR:', error);
    return [];
  }

  // 3. Log Success
  console.log(`Supabase returned ${data?.length} projects.`);

  // 4. Transform
  const rawProjects = data as unknown as ProjectFullV7[];
  const adapted = rawProjects.map(adaptProjectToProperty);
  
  return adapted;
}

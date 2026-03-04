'use server';

import { createClient } from '@/core/db/server';

/**
 * ----------------------------------------------------------------------------------
 * GATEWAY ACTIONS (Next.js Server Actions)
 * ----------------------------------------------------------------------------------
 * This file acts as the central, secure data-fetching hub for Client Components.
 * Instead of instantiating Supabase in the browser (which can cause 403s on fresh loads),
 * client components call these functions to securely fetch data from the server.
 * 
 * HOW TO EXTEND:
 * Add new async functions here for any data your client components need!
 */

/**
 * Helper: Securely gets the current active session and decodes the role.
 * Useful for any future actions in this file that require auth validation.
 */
export async function getSecureSession() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return { user: null, role: 'vendor' };
    }

    const role = user.app_metadata?.role || 'vendor';
    return { user, role };
}

/**
 * Gets the initial data required for the Admin Layout Navbar/Sidebar.
 * Called securely by the Client UI to avoid firing premature client-side HEAD requests.
 */
export async function getAdminLayoutData(): Promise<{ role: string | null; pendingCount: number }> {
    try {
        const supabase = await createClient();

        // 1. Get the securely verified role
        const { role, user } = await getSecureSession();

        // If there is no user, return early safely
        if (!user) {
            return { role: null, pendingCount: 0 };
        }

        // 2. Fetch the pending properties count securely
        const { count, error: propertyError } = await supabase
            .from('property_drafts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        if (propertyError) {
            console.error('[ServerAction: getAdminLayoutData] Error fetching count:', propertyError.message);
            return { role, pendingCount: 0 };
        }

        return {
            role,
            pendingCount: count || 0
        };

    } catch (error) {
        console.error('[ServerAction: getAdminLayoutData] Unexpected error:', error);
        return { role: null, pendingCount: 0 };
    }
}

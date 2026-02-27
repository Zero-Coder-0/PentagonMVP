import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Using the service role key to bypass RLS for debugging, or anon to see if RLS is the issue
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
    console.log('Testing direct role query against public.users...')

    // Use the exact ID from the user's screenshot
    const targetId = 'f804102c-6186-49ba-9bd5-3e6c568004ae'

    const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', targetId)
        .single()

    console.log('Result Data:', data)
    console.log('Result Error:', error)
}

testQuery()

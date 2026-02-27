import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
    console.log('Testing direct table query...')
    const { data, error } = await supabase.from('users').select('*').limit(1)

    console.log('Result Data:', data)
    console.log('Result Error:', error)
}

testQuery()

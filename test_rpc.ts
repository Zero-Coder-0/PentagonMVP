import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRpc() {
    const emailToTest = 'arsh.affiliate.1st@gmail.com'
    console.log(`Testing RPC for email: "${emailToTest}"`)

    const { data, error } = await supabase.rpc('check_is_admin_email', {
        check_email: emailToTest
    })

    console.log('Result Data:', data)
    console.log('Result Error:', error)
}

testRpc()

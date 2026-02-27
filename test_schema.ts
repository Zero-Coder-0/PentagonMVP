import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function getColumns() {
    console.log('Fetching users table schema...')
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1)

    if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]))
    } else {
        console.log('Table is empty or error:', error)
    }
}

getColumns()

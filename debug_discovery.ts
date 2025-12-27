
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDiscovery() {
    console.log('--- Testing Query from SalonDiscovery.tsx ---');

    // Exact query used in the component
    const { data, error } = await supabase
        .from('establishments')
        .select(`
            *,
            profiles:owner_id (name)
        `);

    if (error) {
        console.error('QUERY ERROR:', error);
    } else {
        console.log(`Found ${data.length} establishments.`);
        if (data.length > 0) {
            console.log('First Item:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('Result is empty array.');
        }
    }
}

checkDiscovery();

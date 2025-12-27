
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

async function checkCount() {
    console.log('--- Checking Establishment Count ---');

    const { count, error } = await supabase
        .from('establishments')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('QUERY ERROR:', error);
    } else {
        console.log(`Total Establishments: ${count}`);
    }
}

checkCount();

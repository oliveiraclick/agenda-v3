
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

async function checkData() {
    console.log('--- Checking Establishments ---');
    const { data: ests, error: estError } = await supabase.from('establishments').select('id, name, slug').ilike('name', '%salao do denys%');
    if (estError) console.error(estError);
    else {
        console.log('Found salons matching "salao do denys":');
        console.table(ests);
    }

    console.log('\n--- Checking Favorites (Structure) ---');
    // We can't easily check RLS from here without acting as a user, but we can see if the table exists
    const { error: favError } = await supabase.from('favorites').select('count', { count: 'exact', head: true });
    if (favError) console.error('Error accessing favorites:', favError);
    else console.log('Favorites table exists and is accessible (public read might be on).');

}

checkData();

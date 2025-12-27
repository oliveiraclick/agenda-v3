
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listSalons() {
    console.log('--- Listing Establishments ---');

    const { data, error } = await supabase
        .from('establishments')
        .select('name, slug, id');

    if (error) {
        console.error('QUERY ERROR:', error);
    } else {
        if (data.length === 0) {
            console.log('No establishments found.');
        } else {
            console.log(JSON.stringify(data, null, 2));
        }
    }
}

listSalons();

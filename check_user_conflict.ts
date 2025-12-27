
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

async function checkUserProfile() {
    // Check by Phone (Wildcard)
    const phonePart = '984146959';
    console.log(`Searching for profiles with phone containing: ${phonePart}`);

    // Determine columns to search - 'whatsapp' or 'phone'
    // Based on previous error, 'whatsapp' column might not exist, so let's try 'phone' only first, or cast.
    // The previous error said "column profiles.whatsapp does not exist". So only search 'phone'.

    const { data: byPhone, error: errorPhone } = await supabase
        .from('profiles')
        .select('*')
        .ilike('phone', `%${phonePart}%`);

    if (errorPhone) {
        console.error('Error fetching by wildcard:', errorPhone);
    } else {
        console.log(`Profiles found by wildcard: ${byPhone?.length}`);
        byPhone?.forEach(p => {
            console.log('--- Found Profile ---');
            console.log('ID:', p.id);
            console.log('Name:', p.name);
            console.log('Email:', p.email);
            console.log('Phone:', p.phone);
        });
    }
}

checkUserProfile();

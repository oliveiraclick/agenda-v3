
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugRole() {
    const email = 'denys@agendemais.app';
    const password = 'adm@123';

    console.log(`Logging in as ${email}...`);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        console.error('Login failed:', authError.message);
        return;
    }

    const userId = authData.user?.id;
    console.log('Login successful. User ID:', userId);

    console.log('Fetching profile...');
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, name')
        .eq('id', userId)
        .single();

    if (profileError) {
        console.error('Error fetching profile:', profileError.message);
        console.log('Hint: This might be an RLS issue.');
    } else {
        console.log('Profile fetched successfully:');
        console.log(JSON.stringify(profile, null, 2));

        if (profile.role !== 'admin') {
            console.warn('WARNING: Role is NOT admin. It is:', profile.role);
        } else {
            console.log('SUCCESS: Role is correctly set to admin.');
        }
    }
}

debugRole();

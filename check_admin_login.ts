
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

const EMAIL = 'denys@agendemais.app';
const PASSWORD = 'Vendas@123';

async function checkLogin() {
    console.log(`--- Testing Login for ${EMAIL} ---`);

    // 1. Try to Login
    const { data, error } = await supabase.auth.signInWithPassword({
        email: EMAIL,
        password: PASSWORD
    });

    if (error) {
        console.error('Login Failed:', error.message);

        // Probe if user exists via Signup attempt (Hack to check existence without Admin Key)
        console.log('Probing if user exists...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: EMAIL,
            password: PASSWORD
        });

        if (signUpError && signUpError.message.includes('already registered')) {
            console.log('✅ User EXISTS (Email is registered).');
            console.log('❌ Password Provided is INCORRECT.');
        } else if (signUpData.user && !signUpData.user.identities?.length) {
            console.log('✅ User EXISTS (Email is registered).');
            console.log('❌ Password Provided is INCORRECT.');
        } else if (signUpData.user) {
            console.log('⚠️ User DID NOT EXIST. I just created it now as a customer (default).');
            console.log('User ID:', signUpData.user.id);
        } else {
            console.log('Status Unclear:', signUpError?.message);
        }
        return;
    }

    const { user } = data;
    console.log('Login Successful!');
    console.log('User ID:', user.id);

    // 2. Check Profile Role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status, name')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('Error fetching profile:', profileError.message);
    } else {
        console.log('Profile Data:', profile);
        if (profile.role === 'admin') {
            console.log('✅ User has ADMIN privileges.');
        } else {
            console.log(`⚠️ User role is: ${profile.role} (Expected: admin)`);
        }
    }
}

checkLogin();

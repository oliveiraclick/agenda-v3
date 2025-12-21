
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

async function createAdminJr() {
    const email = 'jr@agendemais.app';
    const password = 'jr@123';

    console.log(`Attempting to create user: ${email}`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: 'Admin JR',
                role: 'customer' // Will be updated to 'admin' via SQL
            }
        }
    });

    if (error) {
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created/retrieved successfully:', data.user?.id);
        console.log('Now run the SQL script to promote this user to admin.');
    }
}

createAdminJr();

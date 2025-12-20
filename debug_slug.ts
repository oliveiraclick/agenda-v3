
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO: Variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSlug() {
    console.log('🔍 Buscando salão com slug "salao-denys"...');

    // 1. Try to find by slug
    const { data: bySlug, error: slugError } = await supabase
        .from('establishments')
        .select('id, name, slug')
        .eq('slug', 'salao-denys');

    if (slugError) {
        console.error('❌ Erro ao buscar por slug:', slugError.message);
    } else if (bySlug && bySlug.length > 0) {
        console.log('✅ SUCESSO! Salão encontrado pelo link:', bySlug[0]);
    } else {
        console.log('⚠️ AVISO: Nenhum salão encontrado com o slug "salao-denys".');
    }

    // 2. Search for any "Denys" to see what's actually there
    console.log('\n🔍 Verificando o que existe no banco com nome "Denys"...');
    const { data: anyDenys, error: searchError } = await supabase
        .from('establishments')
        .select('id, name, slug')
        .ilike('name', '%Denys%');

    if (searchError) {
        console.error('❌ Erro na busca por nome:', searchError.message);
    } else {
        console.table(anyDenys);
    }
}

debugSlug();

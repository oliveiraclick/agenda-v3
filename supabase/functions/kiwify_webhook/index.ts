
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
    try {
        // 1. Validar Método
        if (req.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 })
        }

        // 2. Parsear Payload do Kiwify
        const payload = await req.json()
        console.log('Webhook received:', payload)

        const { order_status, Customer, Product } = payload

        // Apenas processar pagamentos aprovados
        if (order_status !== 'paid') {
            return new Response(JSON.stringify({ message: 'Ignored: Not paid' }), { status: 200 })
        }

        const email = Customer?.email
        if (!email) {
            return new Response('Missing email', { status: 400 })
        }

        // 3. Inicializar Supabase Admin
        // Necessário variáveis de ambiente no Supabase Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 4. Buscar Usuário/Estabelecimento
        // Como os dados do usuário estão em 'profiles' ou vinculados ao auth.users, buscamos pelo email
        // Nota: O email do Kiwify deve ser o mesmo do cadastro no Agende Mais.

        // Buscar cadastro pelo email na tabela profiles (assumindo que email está lá ou user metadata)
        // Para simplificar, vamos buscar na collection 'profiles' se tiver email lá, ou tentar buscar user ID via RPC se necessário.
        // Mas geralmente o 'profiles' tem o ID.

        // Hack: Se profiles não tem email, precisamos buscar em auth.users. 
        // O Service Role consegue listar users.
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
        if (userError) throw userError

        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!user) {
            console.error('User not found for email:', email)
            return new Response('User not found', { status: 404 })
        }

        // 5. Atualizar Estabelecimento
        // Busca o estabelecimento deste dono
        const { data: est, error: estError } = await supabase
            .from('establishments')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (!est) {
            console.error('Establishment not found for user:', user.id)
            return new Response('Establishment not found', { status: 404 })
        }

        // Calcular nova data (30 dias a partir de hoje)
        const now = new Date()
        now.setDate(now.getDate() + 30) // 1 mês de acesso
        const newTrialDate = now.toISOString()

        const { error: updateError } = await supabase
            .from('establishments')
            .update({
                subscription_plan: 'pro',
                trial_ends_at: newTrialDate,
                updated_at: new Date().toISOString()
            })
            .eq('id', est.id)

        if (updateError) throw updateError

        console.log(`Success! Updated establishment ${est.id} for user ${email}`)

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        })

    } catch (error) {
        console.error('Webhook error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        })
    }
})

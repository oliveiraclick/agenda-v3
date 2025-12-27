
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

        const { order_status, order_id, Customer, Product } = payload

        // Apenas processar pagamentos aprovados
        if (order_status !== 'paid') {
            return new Response(JSON.stringify({ message: 'Ignored: Not paid' }), { status: 200 })
        }

        const email = Customer?.email
        if (!email) {
            return new Response('Missing email', { status: 400 })
        }

        // 3. Inicializar Supabase Admin
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 4. Buscar Usuário
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
        if (userError) throw userError

        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!user) {
            console.error('User not found for email:', email)
            return new Response('User not found', { status: 404 })
        }

        // 5. Buscar Estabelecimento e Calcular Plano
        const { data: est, error: estError } = await supabase
            .from('establishments')
            .select('id, trial_ends_at')
            .eq('owner_id', user.id)
            .single()

        if (!est) {
            console.error('Establishment not found for user:', user.id)
            return new Response('Establishment not found', { status: 404 })
        }

        // 6. Atualizar Assinatura (Renovar +30 dias a partir de agora ou do vencimento atual?)
        // Simplificação MVP: Renova a partir de AGORA se já venceu, ou soma 30 dias se ainda não venceu.
        let baseDate = new Date();
        const currentTrialEnd = new Date(est.trial_ends_at || 0);

        // Se ainda não venceu, soma aos dias restantes (acumulativo)
        if (currentTrialEnd > baseDate) {
            baseDate = currentTrialEnd;
        }

        baseDate.setDate(baseDate.getDate() + 30); // +30 dias
        const newTrialDate = baseDate.toISOString();

        // 7. Registrar Pagamento (Novo!)
        // Tenta determinar o plano pelo valor pago (opcional, ou só loga)
        const amountPaid = payload.amount ? (payload.amount / 100) : 0; // Kiwify manda em centavos geralmente, verificar documentação. 
        // ASSUMINDO QUE KIWIFY MANDA EM CENTAVOS (Ex: 2990 = 29.90). Se mandar float, ajustar.
        // Payload sample Kiwify: "commission": 1450, "total": 2990.
        // Vamos logar o que vier.

        const { error: paymentError } = await supabase
            .from('platform_payments')
            .insert({
                establishment_id: est.id,
                amount: amountPaid,
                status: order_status,
                kiwify_order_id: order_id || 'unknown',
                plan_type: 'monthly_renewal'
            })

        if (paymentError) console.error('Error logging payment:', paymentError)

        // 8. Atualizar Estabelecimento
        const { error: updateError } = await supabase
            .from('establishments')
            .update({
                subscription_plan: 'pro',
                trial_ends_at: newTrialDate,
                updated_at: new Date().toISOString()
            })
            .eq('id', est.id)

        if (updateError) throw updateError

        console.log(`Success! Updated establishment ${est.id} for user ${email}. New end date: ${newTrialDate}`)

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

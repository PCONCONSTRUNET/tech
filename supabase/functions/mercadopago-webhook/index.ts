import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  // Responde ao GET do Mercado Pago para validar a URL
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: 'Webhook ativo', gateway: 'mercadopago' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json()
    const { type, data } = body

    console.log('[MP Webhook] Tipo:', type, '| Data:', JSON.stringify(data))

    // Só processa notificações de pagamento
    if (type !== 'payment' || !data?.id) {
      return new Response(JSON.stringify({ received: true, skipped: true }), { status: 200 })
    }

    // Busca os detalhes do pagamento na API do Mercado Pago
    const mpToken = Deno.env.get('MP_ACCESS_TOKEN')
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { Authorization: `Bearer ${mpToken}` }
    })

    if (!mpRes.ok) {
      console.error('[MP Webhook] Erro ao buscar pagamento:', mpRes.status)
      return new Response(JSON.stringify({ error: 'Falha ao buscar pagamento no MP' }), { status: 500 })
    }

    const payment = await mpRes.json()
    console.log('[MP Webhook] Status do pagamento:', payment.status)

    // Conecta ao banco usando o Service Role (acesso total)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verifica se já existe uma transação para esse pagamento
    const { data: existing } = await supabase
      .from('Transaction')
      .select('id')
      .eq('description', `Pagamento MP #${data.id}`)
      .maybeSingle()

    if (existing) {
      console.log('[MP Webhook] Pagamento já registrado, ignorando.')
      return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 })
    }

    // Mapeia o método de pagamento
    const methodMap: Record<string, string> = {
      'pix': 'PIX',
      'credit_card': 'CARTAO',
      'debit_card': 'CARTAO',
      'ticket': 'BOLETO',
      'account_money': 'DINHEIRO',
    }
    const method = methodMap[payment.payment_type_id] || payment.payment_type_id?.toUpperCase() || 'OUTRO'

    // Salva como Transação no banco
    if (payment.status === 'approved') {
      const { error } = await supabase.from('Transaction').insert({
        type: 'RECEITA',
        amount: payment.transaction_amount,
        description: `Pagamento MP #${data.id}`,
        status: 'PAGO',
        paymentMethod: method,
        date: payment.date_approved ?? new Date().toISOString(),
        notes: `MP ID: ${data.id} | Pagador: ${payment.payer?.email ?? 'N/A'} | Parcelas: ${payment.installments ?? 1}`,
      })

      if (error) {
        console.error('[MP Webhook] Erro ao salvar no banco:', error)
        return new Response(JSON.stringify({ error: 'Falha ao salvar transação' }), { status: 500 })
      }

      console.log('[MP Webhook] ✅ Transação salva com sucesso!')
    } else if (payment.status === 'refunded' || payment.status === 'cancelled') {
      // Registra estorno/cancelamento
      await supabase.from('Transaction').insert({
        type: 'DESPESA',
        amount: payment.transaction_amount,
        description: `Estorno MP #${data.id}`,
        status: 'PAGO',
        paymentMethod: method,
        date: new Date().toISOString(),
        notes: `Estorno/Cancelamento MP | Status: ${payment.status}`,
      })
    }

    return new Response(JSON.stringify({ received: true, status: payment.status }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('[MP Webhook] Erro inesperado:', err)
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500 })
  }
})

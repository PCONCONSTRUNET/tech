import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: 'Webhook ativo', gateway: 'pagbank' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json()
    console.log('[PagBank Webhook] Recebido:', JSON.stringify(body))

    // PagBank envia notificações de charges (cobranças)
    // Exemplo do formato esperado:
    // {
    //   "id": "NOT-12345678-1234-1234-1234-123456789012",
    //   "reference_id": "minha-referencia-interna",
    //   "created_at": "2023-01-01T00:00:00-03:00",
    //   "charges": [
    //     {
    //       "id": "CHAR_1234567890",
    //       "status": "PAID",
    //       "amount": { "value": 10000, "currency": "BRL" },
    //       "payment_method": { "type": "CREDIT_CARD" }
    //     }
    //   ]
    // }

    const charges = body.charges || []
    
    if (charges.length === 0) {
       return new Response(JSON.stringify({ received: true, skipped: true, reason: 'No charges' }), { status: 200 })
    }

    // Conecta ao banco usando o Service Role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const results = []

    for (const charge of charges) {
      const chargeId = charge.id
      const status = charge.status // PAID, DECLINED, CANCELED, WAITING...
      const amount = (charge.amount?.value || 0) / 100 // PagBank envia em centavos
      const rawMethod = charge.payment_method?.type || 'OUTRO'

      console.log(`[PagBank Webhook] Processando Charge ${chargeId} | Status: ${status}`)

      // Verifica se já existe uma transação para esse pagamento
      const { data: existing } = await supabase
        .from('Transaction')
        .select('id')
        .eq('description', `Pagamento PagBank #${chargeId}`)
        .maybeSingle()

      if (existing) {
        console.log(`[PagBank Webhook] Charge ${chargeId} já registrado, ignorando.`)
        results.push({ chargeId, duplicate: true })
        continue
      }

      // Mapeia o método de pagamento
      const methodMap: Record<string, string> = {
        'PIX': 'PIX',
        'CREDIT_CARD': 'CARTAO',
        'DEBIT_CARD': 'CARTAO',
        'BOLETO': 'BOLETO',
      }
      const method = methodMap[rawMethod] || rawMethod.toUpperCase() || 'OUTRO'

      if (status === 'PAID') {
        const { error } = await supabase.from('Transaction').insert({
          type: 'RECEITA',
          amount: amount,
          description: `Pagamento PagBank #${chargeId}`,
          status: 'PAGO',
          paymentMethod: method,
          date: charge.paid_at ?? new Date().toISOString(),
          notes: `PagBank Charge ID: ${chargeId} | Ref: ${body.reference_id ?? 'N/A'}`,
        })

        if (error) {
          console.error('[PagBank Webhook] Erro ao salvar no banco:', error)
          results.push({ chargeId, error: 'Falha ao salvar' })
        } else {
          console.log(`[PagBank Webhook] ✅ Transação ${chargeId} salva com sucesso!`)
          results.push({ chargeId, saved: true })
        }
      } else if (status === 'CANCELED' || status === 'REFUNDED') {
         // Registra estorno/cancelamento
        await supabase.from('Transaction').insert({
          type: 'DESPESA',
          amount: amount,
          description: `Estorno PagBank #${chargeId}`,
          status: 'PAGO',
          paymentMethod: method,
          date: new Date().toISOString(),
          notes: `Estorno/Cancelamento PagBank | Status: ${status}`,
        })
        results.push({ chargeId, saved: true, type: 'refund' })
      } else {
         results.push({ chargeId, skipped: true, reason: `Status ${status} not mapped for insert` })
      }
    }

    return new Response(JSON.stringify({ received: true, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('[PagBank Webhook] Erro inesperado:', err)
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500 })
  }
})

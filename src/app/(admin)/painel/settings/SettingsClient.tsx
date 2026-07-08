'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { maskCPFOrCNPJ, maskCEP, maskPhone } from '@/lib/masks'
import { updateSettings } from '@/actions/settings'
import { useRouter } from 'next/navigation'

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    storeName: initialSettings?.storeName || 'Digital Tech',
    fiscalData: initialSettings?.fiscalData || '',
    whatsapp: initialSettings?.whatsapp || '',
    cep: initialSettings?.cep || '',
    neighborhood: initialSettings?.neighborhood || '',
    street: initialSettings?.street || '',
    number: initialSettings?.number || '',
    city: initialSettings?.city || '',
    state: initialSettings?.state || '',
    warrantyTerm: initialSettings?.warrantyTerm || 'Garantia de 90 dias para serviços executados...'
  })

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setIsLoading(true)
    const res = await updateSettings(formData)
    setIsLoading(false)
    if (res.error) {
      alert(res.error)
    } else {
      alert('Configurações salvas com sucesso!')
      router.refresh()
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Configurações</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Ajustes gerais da loja e do sistema.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: '8px' }} onClick={handleSave} disabled={isLoading}>
          <Save size={18} /> {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid-responsive-2" style={{ gap: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '24px' }}>Dados da Loja</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nome da Loja</label>
              <input type="text" className="input" value={formData.storeName} onChange={e => handleChange('storeName', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>CNPJ</label>
              <input type="text" className="input" placeholder="00.000.000/0001-00" value={formData.fiscalData} onChange={e => handleChange('fiscalData', maskCPFOrCNPJ(e.target.value))} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>WhatsApp (Atendimento)</label>
              <input type="text" className="input" placeholder="(00) 90000-0000" value={formData.whatsapp} onChange={e => handleChange('whatsapp', maskPhone(e.target.value))} />
            </div>
            <div className="grid-responsive-2">
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>CEP</label>
                <input type="text" className="input" placeholder="00000-000" value={formData.cep} onChange={e => handleChange('cep', maskCEP(e.target.value))} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Bairro</label>
                <input type="text" className="input" value={formData.neighborhood} onChange={e => handleChange('neighborhood', e.target.value)} />
              </div>
            </div>
            <div className="grid-responsive-3-1">
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Rua</label>
                <input type="text" className="input" value={formData.street} onChange={e => handleChange('street', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Número</label>
                <input type="text" className="input" value={formData.number} onChange={e => handleChange('number', e.target.value)} />
              </div>
            </div>
            <div className="grid-responsive-2-1">
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Cidade</label>
                <input type="text" className="input" value={formData.city} onChange={e => handleChange('city', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Estado</label>
                <input type="text" className="input" placeholder="UF" value={formData.state} onChange={e => handleChange('state', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '24px' }}>Vitrine Pública</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="checkbox" id="showVitrine" defaultChecked style={{ width: '20px', height: '20px' }} />
              <label htmlFor="showVitrine" style={{ fontWeight: '500' }}>Habilitar Vitrine Online</label>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Texto de Boas-vindas</label>
              <input type="text" className="input" defaultValue="A melhor assistência técnica para o seu dispositivo." />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Termos de Garantia Padrão</label>
              <textarea className="input" rows={5} value={formData.warrantyTerm} onChange={e => handleChange('warrantyTerm', e.target.value)}></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Configurações</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Ajustes gerais da loja e do sistema.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: '8px' }}>
          <Save size={18} /> Salvar Alterações
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '24px' }}>Dados da Loja</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nome da Loja</label>
              <input type="text" className="input" defaultValue="Digital Tech" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>CNPJ</label>
              <input type="text" className="input" placeholder="00.000.000/0001-00" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>WhatsApp (Atendimento)</label>
              <input type="text" className="input" placeholder="(00) 90000-0000" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Endereço Completo</label>
              <textarea className="input" rows={3} placeholder="Rua, Número, Bairro, Cidade - Estado"></textarea>
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
              <textarea className="input" rows={5} defaultValue="Garantia de 90 dias para serviços executados..."></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

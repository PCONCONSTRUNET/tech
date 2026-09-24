'use client'

import { useState, useMemo, useRef } from 'react'
import { Plus, Search, Trash2, X, FileText, SlidersHorizontal, Clock, AlertCircle, Eye, Wrench, Smartphone, CheckCircle, Phone, ChevronDown, Mail, Printer, Users } from 'lucide-react'
import { createQuote, deleteQuote, updateQuoteStatus } from '@/actions/quote'
import { createCustomer } from '@/actions/customer'
import QuoteDetailsModal from './QuoteDetailsModal'
import OSFilterModal from '../os/OSFilterModal'

const PatternLock = ({ onChange }: { onChange: (pattern: string) => void }) => {
  const [pattern, setPattern] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const dots = [
    { id: 1, x: 50, y: 50 }, { id: 2, x: 150, y: 50 }, { id: 3, x: 250, y: 50 },
    { id: 4, x: 50, y: 150 }, { id: 5, x: 150, y: 150 }, { id: 6, x: 250, y: 150 },
    { id: 7, x: 50, y: 250 }, { id: 8, x: 150, y: 250 }, { id: 9, x: 250, y: 250 },
  ];

  const handlePointerDown = (id: number) => {
    setIsDrawing(true);
    setPattern([id]);
    onChange(id.toString());
  };

  const handlePointerEnter = (id: number) => {
    if (isDrawing && !pattern.includes(id)) {
      const newPattern = [...pattern, id];
      setPattern(newPattern);
      onChange(newPattern.join('-'));
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleReset = () => {
    setPattern([]);
    onChange('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div 
        ref={containerRef}
        style={{ position: 'relative', width: '300px', height: '300px', touchAction: 'none' }}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {pattern.length > 1 && (
            <polyline
              points={pattern.map(id => {
                const dot = dots.find(d => d.id === id);
                return `${dot?.x},${dot?.y}`;
              }).join(' ')}
              fill="none"
              stroke="#6366f1"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
        {dots.map(dot => (
          <div
            key={dot.id}
            onPointerDown={() => handlePointerDown(dot.id)}
            onPointerEnter={() => handlePointerEnter(dot.id)}
            style={{
              position: 'absolute',
              left: dot.x - 24,
              top: dot.y - 24,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: pattern[0] === dot.id ? '#22c55e' : pattern.includes(dot.id) ? '#6366f1' : '#e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
          >
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: pattern.includes(dot.id) ? 'white' : '#94a3b8' }} />
          </div>
        ))}
      </div>
      <button type="button" onClick={handleReset} style={{ marginTop: '16px', background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>Limpar Desenho</button>
    </div>
  );
};

/* ── helpers ── */
const fmt = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const STATUS_LABEL: Record<string, string> = {
  RECEBIDO: 'Recebido',
  EM_ANALISE: 'Em Análise',
  AGUARDANDO_APROVACAO: 'Aguard. Aprovação',
  AGUARDANDO_PECA: 'Aguard. Peça',
  EM_CONSERTO: 'Em Serviço',
  PRONTO: 'Pronto',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

const STATUS_COLOR: Record<string, { bg: string; color: string; border: string }> = {
  RECEBIDO:             { bg: 'rgba(107,114,128,0.1)',   color: '#475569', border: '#cbd5e1' },
  EM_ANALISE:           { bg: 'rgba(59,130,246,0.1)',    color: '#2563eb', border: '#bfdbfe' },
  AGUARDANDO_APROVACAO: { bg: 'rgba(245,158,11,0.1)',    color: '#d97706', border: '#fde68a' },
  AGUARDANDO_PECA:      { bg: 'rgba(245,158,11,0.1)',    color: '#d97706', border: '#fde68a' },
  EM_CONSERTO:          { bg: 'rgba(168,85,247,0.1)',    color: '#9333ea', border: '#e9d5ff' },
  PRONTO:               { bg: 'rgba(16,185,129,0.1)',    color: '#059669', border: '#a7f3d0' },
  ENTREGUE:             { bg: 'rgba(20,184,166,0.1)',    color: '#0d9488', border: '#99f6e4' },
  CANCELADO:            { bg: 'rgba(239,68,68,0.1)',     color: '#dc2626', border: '#fecaca' },
}

const EM_ANDAMENTO = ['RECEBIDO', 'EM_ANALISE', 'AGUARDANDO_APROVACAO', 'AGUARDANDO_PECA', 'EM_CONSERTO']
const FINALIZADAS  = ['PRONTO', 'ENTREGUE']
const INTERROMPIDAS = ['AGUARDANDO_APROVACAO', 'AGUARDANDO_PECA', 'CANCELADO']

const PAGE_SIZE = 15

type Tab = 'todas' | 'andamento' | 'finalizadas' | 'interrompidas'

export default function QuotesClient({ quotes, customers, products }: { quotes: any[]; customers: any[]; products: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState(1)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('todas')
  const [page, setPage] = useState(1)

  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false)
  const [localCustomers, setLocalCustomers] = useState(customers)
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({ 
    name: '', phone: '', document: '', email: '', birthDate: '', cep: '', street: '', number: '', complement: '', neighborhood: '', city: '' 
  })
  const [osDevice, setOsDevice] = useState({
    type: 'Celular', brand: '', model: '', imei: '', color: ''
  })
  const [physicalChecklist, setPhysicalChecklist] = useState<string[]>([])
  const [lockType, setLockType] = useState<'padrao' | 'desenho'>('padrao')
  const [devicePassword, setDevicePassword] = useState('')
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  console.log("QuotesClient rendered, lockType:", lockType, "physicalChecklist:", physicalChecklist)

  /* ── derived stats ── */
  const emBancada = quotes.filter(o => !['ENTREGUE', 'CANCELADO'].includes(o.status))
  const interrompidasCount = quotes.filter(o => INTERROMPIDAS.includes(o.status))
  const valorEstimado = quotes.reduce((acc, o) => acc + (o.price || 0), 0)

  const gerarRelatorio = () => {
    const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR')
    const rows = quotes.map(o => `
      <tr style="border-bottom:1px solid #eee">
        <td style="padding:8px 6px">#${o.number || '-'}</td>
        <td style="padding:8px 6px">${o.customer?.name || '-'}</td>
        <td style="padding:8px 6px">${o.brand || ''} ${o.model || ''}</td>
        <td style="padding:8px 6px">${STATUS_LABEL[o.status] || o.status}</td>
        <td style="padding:8px 6px;text-align:right">${fmt(o.price || 0)}</td>
        <td style="padding:8px 6px">${fmtDate(o.createdAt)}</td>
      </tr>`).join('')
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório de Orçamentos</title>
      <style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{font-size:1.4rem;margin-bottom:4px}p{color:#555;font-size:0.85rem;margin-bottom:24px}table{width:100%;border-collapse:collapse;font-size:0.85rem}th{background:#f3f4f6;padding:8px 6px;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:.04em}tr:nth-child(even){background:#fafafa}.summary{display:flex;gap:32px;margin-bottom:24px;flex-wrap:wrap}.stat{background:#f9f9f9;border:1px solid #e5e7eb;border-radius:8px;padding:12px 20px}.stat-label{font-size:0.7rem;text-transform:uppercase;color:#888;font-weight:700}.stat-value{font-size:1.3rem;font-weight:800;margin-top:2px}@media print{button{display:none}}</style>
      </head><body>
      <h1>Relatório Geral de Orçamentos</h1>
      <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
      <div class="summary">
        <div class="stat"><div class="stat-label">Total de Orçamentos</div><div class="stat-value">${quotes.length}</div></div>
        <div class="stat"><div class="stat-label">Ativos</div><div class="stat-value">${emBancada.length}</div></div>
        <div class="stat"><div class="stat-label">Valor Estimado</div><div class="stat-value">${fmt(valorEstimado)}</div></div>
        <div class="stat"><div class="stat-label">Interrompidos</div><div class="stat-value">${interrompidasCount.length}</div></div>
      </div>
      <table><thead><tr><th>#</th><th>Cliente</th><th>Aparelho</th><th>Status</th><th style="text-align:right">Valor</th><th>Data</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <script>window.onload=function(){window.print()}<\/script>
      </body></html>`
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
  }

  /* ── filtered list ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return quotes
      .filter(o => {
        if (tab === 'andamento')   return EM_ANDAMENTO.includes(o.status)
        if (tab === 'finalizadas') return FINALIZADAS.includes(o.status)
        if (tab === 'interrompidas') return INTERROMPIDAS.includes(o.status)
        return true
      })
      .filter(o =>
        !q ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.brand?.toLowerCase().includes(q) ||
        o.model?.toLowerCase().includes(q) ||
        o.imei?.toLowerCase().includes(q) ||
        o.defect?.toLowerCase().includes(q)
      )
  }, [quotes, tab, search])

  const filteredCustomers = useMemo(() => {
    const q = customerSearchQuery.toLowerCase()
    if (!q) return localCustomers
    return localCustomers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.document && c.document.includes(q)) || 
      (c.phone && c.phone.includes(q))
    )
  }, [localCustomers, customerSearchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleTabChange(t: Tab) { setTab(t); setPage(1) }

  async function handleAdd(formData: FormData) {
    const totalAmount = parseFloat(formData.get('price')?.toString() || '0');
    const device = formData.get('device')?.toString() || '';
    const brand = formData.get('brand')?.toString() || '';
    const model = formData.get('model')?.toString() || '';
    const imei = formData.get('imei')?.toString() || '';
    const defect = formData.get('defect')?.toString() || '';
    const diagnostic = formData.get('diagnostic')?.toString() || '';
    const password = formData.get('password')?.toString() || '';
    const accessories = formData.get('accessories')?.toString() || '';
    const customerId = formData.get('customerId')?.toString() || null;
    const physicalCondition = formData.get('physicalCondition')?.toString() || '';
    
    const items = [{
      name: defect || 'Orçamento de Reparo',
      quantity: 1,
      price: totalAmount
    }];

    await createQuote({
      customerId,
      totalAmount,
      items,
      device, brand, model, imei, defect, diagnostic, password, accessories, physicalCondition
    });
    setModalStep(7);
  }
  async function handleDelete(id: string) {
    if (confirm('Excluir este orçamento?')) await deleteQuote(id)
  }

  /* ── number helper ── */
  const numberMap = useMemo(() => {
    const sorted = [...quotes].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    const map: Record<string, number> = {}
    sorted.forEach((o, i) => { map[o.id] = i + 1 })
    return map
  }, [quotes])

  return (
    <>
      <style>{`
        .mobile-cards { display: none; }
        .desktop-table { display: block; overflow-x: auto; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
        @media (max-width: 768px) {
          .desktop-table { display: none !important; }
          .mobile-cards { display: flex !important; flex-direction: column; gap: 16px; padding: 16px 0; }
          .stats-grid { grid-template-columns: 1fr; }
          .tabs-container { overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
          .search-filter-container { flex-direction: column; align-items: stretch; width: 100%; }
          .search-filter-container input { width: 100% !important; }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)' }}>
            <Wrench size={24} style={{ color: 'white' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Orçamentos
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              Gerencia orçamentos, envie aprovações por WhatsApp e converta em ordens de serviço
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={gerarRelatorio} style={{ fontSize: '0.85rem', gap: '6px', backgroundColor: 'white', height: '40px', whiteSpace: 'nowrap' }}>
            <FileText size={16} /> Relatório Geral
          </button>
          <button
            className="btn btn-primary"
            style={{ gap: '6px', fontSize: '0.85rem', height: '40px', padding: '0 20px', fontWeight: '700', whiteSpace: 'nowrap' }}
            onClick={() => { setModalStep(1); setIsModalOpen(true); }}
          >
            <Plus size={18} /> Novo Orçamento
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card" style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>TOTAL EM BANCADA</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {emBancada.length}
            <span style={{ fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '9999px' }}>Ativos</span>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>VALOR ESTIMADO</span>
            <Eye size={14} style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-text)' }}>
            {fmt(valorEstimado)}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>TOTAL INTERROMPIDO</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-text)' }}>
            {interrompidasCount.length}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>TEMPO MÉDIO EM BANCADA</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-text)', marginTop: '8px' }}>
            1-5 dias
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '16px', backgroundColor: 'var(--color-surface)' }}>
          <div className="tabs-container" style={{ display: 'flex', maxWidth: '100%' }}>
            {([
              { key: 'todas',        label: 'Todas as OS' },
              { key: 'andamento',    label: 'Em Andamento' },
              { key: 'finalizadas',  label: 'Finalizadas' },
              { key: 'interrompidas',label: 'Aguardando / Interrompidas' },
            ] as { key: Tab; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                style={{
                  padding: '16px 20px', border: 'none', cursor: 'pointer',
                  background: 'none', fontFamily: 'inherit',
                  fontSize: '0.85rem', fontWeight: tab === t.key ? '700' : '500',
                  color: tab === t.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  borderBottom: tab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="search-filter-container" style={{ display: 'flex', gap: '8px', padding: '12px 0', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar cliente, IMEI, OS..."
                className="input"
                style={{ paddingLeft: '36px', fontSize: '0.85rem', height: '40px', width: '280px', borderRadius: '8px', boxSizing: 'border-box' }}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className="btn btn-outline" 
              style={{ fontSize: '0.85rem', gap: '8px', height: '40px', backgroundColor: 'white', borderRadius: '8px', whiteSpace: 'nowrap' }}
            >
              <SlidersHorizontal size={16} /> Filtros
            </button>
          </div>
        </div>

        <div className="desktop-table">
          <table className="table">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', padding: '14px 24px', color: '#64748b', textTransform: 'uppercase', width: '80px' }}># OS</th>
                <th style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', padding: '14px 24px', color: '#64748b', textTransform: 'uppercase' }}>CLIENTE / DISPOSITIVO</th>
                <th style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', padding: '14px 24px', color: '#64748b', textTransform: 'uppercase' }}>SERVIÇO</th>
                <th style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', padding: '14px 24px', color: '#64748b', textTransform: 'uppercase' }}>STATUS</th>
                <th style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', padding: '14px 24px', color: '#64748b', textTransform: 'uppercase' }}>VALOR</th>
                <th style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', padding: '14px 24px', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(os => {
                const sc = STATUS_COLOR[os.status] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' }
                return (
                  <tr key={os.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.1s' }} className="hover:bg-gray-50">
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>
                        #{numberMap[os.id] ?? 0}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a', marginBottom: '6px' }}>{os.customer?.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#64748b' }}>
                        {os.device && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Smartphone size={12} style={{ color: '#3b82f6' }} /> {os.device}
                          </span>
                        )}
                        {os.customer?.email && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                            <Mail size={10} /> {os.customer.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                        {os.defect || 'Nenhum serviço'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', position: 'relative' }}>
                      <div 
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontSize: '0.75rem', fontWeight: '600',
                          color: sc.color, backgroundColor: 'white',
                          border: `1px solid ${sc.color}`, cursor: 'pointer',
                          padding: '4px 12px', borderRadius: '16px',
                        }}
                      >
                        <Clock size={12} /> {STATUS_LABEL[os.status as keyof typeof STATUS_LABEL]}
                        <ChevronDown size={12} />
                      </div>
                      <select
                        value={os.status}
                        onChange={e => updateQuoteStatus(os.id, e.target.value)}
                        style={{
                          position: 'absolute', top: '16px', left: '24px', width: '100px', height: '24px',
                          opacity: 0, cursor: 'pointer'
                        }}
                      >
                        {Object.entries(STATUS_LABEL).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>
                          {os.price ? fmt(os.price) : 'R$ 0,00'}
                        </div>
                        {os.price && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: '700', color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '12px', width: 'fit-content' }}>
                            <CheckCircle size={10} /> Entrada Paga
                          </div>
                        )}
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                          {new Date(os.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => setSelectedQuote(os)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }} title="Ver Detalhes">
                          <Eye size={18} />
                        </button>
                        <button style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }} title="Contato">
                          <Phone size={18} />
                        </button>
                        <button onClick={() => window.open(`/painel/quotes/${os.id}`, '_blank')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }} title="Imprimir">
                          <Printer size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(os.id)}
                          style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--color-text-muted)' }}>
                      <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                      <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '8px' }}>Nenhum orçamento encontrado</p>
                      <p style={{ fontSize: '0.85rem' }}>Altere os filtros de busca ou crie um novo orçamento.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        {paginated.length > 0 && (
          <div className="mobile-cards" style={{ padding: '0 16px' }}>
            {paginated.map(os => {
              const sc = STATUS_COLOR[os.status] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' }
              return (
                <div key={os.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', color: '#64748b' }}>
                        #{numberMap[os.id] ?? 0}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a' }}>{os.customer?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Smartphone size={12} style={{ color: '#3b82f6' }} /> {os.device || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>
                        {os.price ? fmt(os.price) : 'R$ 0,00'}
                      </div>
                      {os.price && (
                        <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#16a34a', marginTop: '2px' }}>
                          <CheckCircle size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> Entrada Paga
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#334155', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }}>
                    <strong>Serviço:</strong> {os.defect || 'Nenhum serviço'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '60%' }}>
                      <div 
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontSize: '0.75rem', fontWeight: '600',
                          color: sc.color, backgroundColor: 'white',
                          border: `1px solid ${sc.color}`, cursor: 'pointer',
                          padding: '4px 12px', borderRadius: '16px',
                        }}
                      >
                        <Clock size={12} /> {STATUS_LABEL[os.status as keyof typeof STATUS_LABEL]}
                        <ChevronDown size={12} />
                      </div>
                      <select
                        value={os.status}
                        onChange={e => updateQuoteStatus(os.id, e.target.value)}
                        style={{
                          position: 'absolute', top: '0', left: '0', width: '100px', height: '24px',
                          opacity: 0, cursor: 'pointer'
                        }}
                      >
                        {Object.entries(STATUS_LABEL).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setSelectedQuote(os)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer' }}>
                        <Eye size={16} />
                      </button>
                      <button onClick={() => window.open(`/painel/quotes/${os.id}`, '_blank')} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', cursor: 'pointer' }}>
                        <Printer size={16} />
                      </button>
                      <button onClick={() => handleDelete(os.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 24px', borderTop: '1px solid var(--color-border)', backgroundColor: '#f8fafc',
          fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '500'
        }}>
          <span>Página <strong style={{ color: 'var(--color-text)' }}>{page}</strong> de <strong style={{ color: 'var(--color-text)' }}>{totalPages}</strong> &nbsp;·&nbsp; {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem', padding: '6px 16px', backgroundColor: 'white', opacity: page === 1 ? 0.4 : 1, borderRadius: '6px' }}
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem', padding: '6px 16px', backgroundColor: 'white', opacity: page === totalPages ? 0.4 : 1, borderRadius: '6px' }}
            >
              Próxima →
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '800px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            
            {modalStep < 7 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={20} style={{ color: '#6366f1' }} />
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Nova Ordem de Serviço</h2>
                </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[1, 2, 3, 4, 5, 6].map(step => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      backgroundColor: modalStep === step ? '#2563eb' : modalStep > step ? '#bfdbfe' : '#f1f5f9',
                      color: modalStep === step ? 'white' : modalStep > step ? '#2563eb' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700',
                      transition: 'all 0.2s'
                    }}>
                      {modalStep > step ? <CheckCircle size={12} /> : step}
                    </div>
                    {step < 6 && <div style={{ width: '16px', height: '2px', backgroundColor: modalStep > step ? '#bfdbfe' : '#e2e8f0' }} />}
                  </div>
                ))}
              </div>

              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            )}

            <div style={{ padding: modalStep === 7 ? '0' : '32px 48px', overflowY: 'auto', flex: 1, backgroundColor: modalStep === 7 ? '#f8fafc' : 'white' }}>
              <form action={handleAdd} id="os-form" style={{ height: modalStep === 7 ? '100%' : 'auto' }}>
                
                <div style={{ display: modalStep === 1 ? 'block' : 'none' }}>
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Quem é o cliente?</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Busque na base ou cadastre um novo.</p>
                  </div>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', backgroundColor: 'white' }}>
                    <div style={{ position: 'relative', display: 'flex', gap: '12px' }}>
                      <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                      
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input type="hidden" name="customerId" value={selectedCustomer} required={modalStep === 1} />
                        <input
                          type="text"
                          className="input"
                          placeholder="Busque por nome, CPF ou telefone..."
                          value={selectedCustomer ? localCustomers.find(c => c.id === selectedCustomer)?.name : customerSearchQuery}
                          onChange={(e) => {
                            setCustomerSearchQuery(e.target.value)
                            setSelectedCustomer('')
                            setIsCustomerDropdownOpen(true)
                          }}
                          onFocus={() => setIsCustomerDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setIsCustomerDropdownOpen(false), 200)}
                          style={{ paddingLeft: '48px', height: '52px', fontSize: '1rem', width: '100%', cursor: selectedCustomer ? 'default' : 'text' }}
                        />
                        {selectedCustomer && (
                          <button
                            type="button"
                            onClick={() => { setSelectedCustomer(''); setCustomerSearchQuery(''); setIsCustomerDropdownOpen(true); }}
                            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                          >
                            <X size={16} />
                          </button>
                        )}
                        
                        {isCustomerDropdownOpen && !selectedCustomer && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '8px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                              <div
                                key={c.id}
                                onClick={() => {
                                  setSelectedCustomer(c.id)
                                  setCustomerSearchQuery('')
                                  setIsCustomerDropdownOpen(false)
                                }}
                                style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                              >
                                <span style={{ fontWeight: '500' }}>{c.name}</span>
                                {c.phone && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.phone}</span>}
                              </div>
                            )) : (
                              <div style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>Nenhum cliente encontrado.</div>
                            )}
                          </div>
                        )}
                      </div>

                      <button type="button" onClick={() => setIsNewCustomerModalOpen(true)} style={{ height: '52px', width: '52px', borderRadius: '8px', border: 'none', backgroundColor: '#eff6ff', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: modalStep === 2 ? 'block' : 'none' }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Aparelho Principal</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Identifique o dispositivo que será reparado.</p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Tipo de Dispositivo *</label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {['Celular', 'Tablet', 'Notebook', 'Console', 'Watch', 'Outro'].map(t => (
                          <div 
                            key={t} 
                            onClick={() => setOsDevice({ ...osDevice, type: t })}
                            style={{ flex: 1, padding: '16px 8px', borderRadius: '8px', border: osDevice.type === t ? '2px solid #6366f1' : '1px solid var(--color-border)', backgroundColor: osDevice.type === t ? '#eef2ff' : 'white', textAlign: 'center', cursor: 'pointer', color: osDevice.type === t ? '#4f46e5' : '#64748b' }}
                          >
                            <Smartphone size={24} style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontSize: '0.75rem', fontWeight: '600' }}>{t}</div>
                          </div>
                        ))}
                      </div>
                      <input type="hidden" name="device" value={osDevice.type} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Marca do dispositivo *</label>
                        <input name="brand" value={osDevice.brand} onChange={e => setOsDevice({...osDevice, brand: e.target.value})} type="text" className="input" placeholder="Ex: Apple, Samsung..." style={{ height: '48px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Modelo do dispositivo *</label>
                        <input name="model" value={osDevice.model} onChange={e => setOsDevice({...osDevice, model: e.target.value})} type="text" className="input" placeholder="Ex: iPhone 13 Pro Max" style={{ height: '48px' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Cor do aparelho</label>
                        <input name="color" value={osDevice.color} onChange={e => setOsDevice({...osDevice, color: e.target.value})} type="text" className="input" placeholder="Ex: Preto, Azul Metálico..." style={{ height: '48px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>IMEI (Opcional)</label>
                        <input name="imei" value={osDevice.imei} onChange={e => setOsDevice({...osDevice, imei: e.target.value})} type="text" className="input" placeholder="# 3592810 123456" style={{ height: '48px', fontFamily: 'monospace', letterSpacing: '0.05em' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: modalStep === 3 ? 'block' : 'none' }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Diagnóstico & Estado Físico</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Relate o problema, checklist físico e fotos do aparelho.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div className="card" style={{ padding: '20px' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                          Defeito Relatado * <span style={{ color: '#ef4444' }}>Obrigatório</span>
                        </label>
                        <textarea name="defect" rows={4} className="input" placeholder="Ex: Cliente relata que o aparelho não carrega..." style={{ resize: 'vertical' }} />
                      </div>
                      <div className="card" style={{ padding: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                          Valor Estimado (R$)
                        </label>
                        <input name="price" type="number" step="0.01" className="input" defaultValue="0" style={{ height: '48px', fontSize: '1.2rem', fontWeight: '700' }} />
                      </div>
                    </div>
                    
                    <div className="card" style={{ padding: '20px', backgroundColor: '#f8fafc' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px' }}>
                        <Search size={14} /> Checklist Físico
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {['Carcaça Amassada', 'Botões Falhando', 'Câmera Danificada', 'Riscos na Tela', 'Vidro Quebrado'].map(item => (
                          <div 
                            key={item} 
                            onClick={() => {
                              setPhysicalChecklist(prev => 
                                prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
                              )
                            }}
                            style={{ 
                              padding: '10px 12px', 
                              border: physicalChecklist.includes(item) ? '2px solid #6366f1' : '1px solid var(--color-border)', 
                              borderRadius: '6px', 
                              fontSize: '0.8rem', 
                              backgroundColor: physicalChecklist.includes(item) ? '#eef2ff' : 'white',
                              color: physicalChecklist.includes(item) ? '#4f46e5' : '#64748b',
                              fontWeight: physicalChecklist.includes(item) ? '600' : 'normal',
                              cursor: 'pointer',
                              pointerEvents: 'auto',
                              transition: 'all 0.2s'
                            }}>
                            {item}
                          </div>
                        ))}
                      </div>
                      <input type="hidden" name="physicalCondition" value={physicalChecklist.join(', ')} />
                    </div>
                  </div>
                </div>

                <div style={{ display: modalStep === 4 ? 'block' : 'none' }}>
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Segurança do Dispositivo</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Informe a senha para que o técnico possa testar todas as funções.</p>
                  </div>

                  <div style={{ maxWidth: '400px', margin: '0 auto' }} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Tipo de Bloqueio</label>
                      <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                        <button 
                          type="button" 
                          onClick={(e) => { e.preventDefault(); console.log('Clicked padrao'); setLockType('padrao'); setDevicePassword(''); }}
                          style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: lockType === 'padrao' ? 'white' : 'transparent', borderRadius: '4px', border: 'none', color: lockType === 'padrao' ? '#2563eb' : '#64748b', boxShadow: lockType === 'padrao' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', pointerEvents: 'auto' }}>Senha Padrão</button>
                        <button 
                          type="button" 
                          onClick={(e) => { e.preventDefault(); console.log('Clicked desenho'); setLockType('desenho'); setDevicePassword(''); }}
                          style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: lockType === 'desenho' ? 'white' : 'transparent', borderRadius: '4px', border: 'none', color: lockType === 'desenho' ? '#2563eb' : '#64748b', boxShadow: lockType === 'desenho' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', pointerEvents: 'auto' }}>Desenho</button>
                      </div>
                    </div>
                    
                    {lockType === 'padrao' ? (
                      <div style={{ textAlign: 'center' }}>
                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Senha Numérica ou Alfanumérica</label>
                        <input type="text" name="password" value={devicePassword} onChange={e => setDevicePassword(e.target.value)} className="input" placeholder="* * * * * *" style={{ height: '56px', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.2em' }} />
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '12px' }}>Caso não tenha senha, deixe em branco.</p>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Desenhe o Padrão</label>
                        <PatternLock onChange={(pattern) => setDevicePassword(pattern)} />
                        <input type="hidden" name="password" value={`Desenho: ${devicePassword}`} disabled={!devicePassword} />
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '12px' }}>Pressione e passe sobre os pontos para formar a senha.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: modalStep === 5 ? 'block' : 'none' }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Serviços e Valores</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Selecione os serviços a serem realizados e defina os responsáveis.</p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <div className="card" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>Selecione os Serviços *</label>
                        <button type="button" style={{ fontSize: '0.75rem', fontWeight: '600', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={14} /> Personalizado</button>
                      </div>
                      <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input type="text" className="input" placeholder="Buscar serviço (ex: Troca de Tela)..." style={{ paddingLeft: '36px', height: '40px', backgroundColor: '#f8fafc' }} />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { name: 'Troca de Tela', price: 150 },
                          { name: 'Troca de Bateria', price: 80 },
                          { name: 'Reparo de Placa', price: 200 }
                        ].map((srv, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: i === 0 ? '1px solid #bfdbfe' : '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: i === 0 ? '#eff6ff' : 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <input type="checkbox" defaultChecked={i === 0} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                              <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#334155' }}>{srv.name}</span>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>R$ {srv.price},00</span>
                          </div>
                        ))}
                        <button type="button" style={{ padding: '12px', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: 'transparent', color: '#475569', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
                          <Plus size={16} /> Adicionar Serviço Personalizado
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="card" style={{ padding: '20px', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>TOTAL PREVISTO</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a' }}>R$ 150,00</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#059669', marginTop: '8px' }}>Lucro Estimado: R$ 150,00</div>
                      </div>
                      
                      <div className="card" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>Pagamento ao Abrir</label>
                          <div style={{ width: '36px', height: '20px', backgroundColor: '#e2e8f0', borderRadius: '10px', position: 'relative' }}>
                            <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="card" style={{ padding: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Responsáveis</label>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Recebido Por</div>
                          <div style={{ backgroundColor: '#2563eb', color: 'white', fontSize: '0.75rem', fontWeight: '600', padding: '6px 12px', borderRadius: '6px', display: 'inline-block' }}>lucaspereirabn10</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Executor do Reparo</div>
                          <div style={{ backgroundColor: '#a855f7', color: 'white', fontSize: '0.75rem', fontWeight: '600', padding: '6px 12px', borderRadius: '6px', display: 'inline-block' }}>lucaspereirabn10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: modalStep === 6 ? 'block' : 'none' }}>
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Revisão Final</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Confira os dados antes de gerar a OS.</p>
                  </div>
                  
                  <div className="card" style={{ padding: '0', overflow: 'hidden', borderTop: '4px solid #a855f7' }}>
                    <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)' }}>
                      <div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Cliente Teste</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>(48) 99619-5303</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Smartphone</h4>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>IMEI: 4343</p>
                      </div>
                    </div>
                    
                    <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', borderBottom: '1px solid var(--color-border)' }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Serviço / Problema</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a' }}>Não liga, tela quebrada</div>
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: '600', padding: '4px 8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>Troca de Tela</span>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Aberto por</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>lucaspereirabn10</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Executor</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>lucaspereirabn10</div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '24px', backgroundColor: '#f8fafc' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Estado Físico</div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '4px 8px', borderRadius: '4px' }}>CARCAÇA AMASSADA</span>
                      
                      <div style={{ marginTop: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                          <Wrench size={14} color="#6366f1" /> Notas Técnicas
                        </label>
                        <textarea className="input" rows={3} placeholder="Anotações internas para o técnico..." style={{ resize: 'vertical' }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="card" style={{ padding: '24px', marginTop: '24px', display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Receita Total</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>R$ 150,00</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Custo Peças</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ef4444' }}>R$ 0,00</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Lucro Estimado</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#10b981' }}>R$ 150,00</div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', fontSize: '0.8rem', color: '#1e40af', display: 'flex', gap: '12px' }}>
                    <AlertCircle size={20} style={{ flexShrink: 0 }} />
                    Ao confirmar, o cliente receberá automaticamente uma mensagem no WhatsApp com o número da OS e o link de acompanhamento.
                  </div>
                </div>

                <div style={{ display: modalStep === 7 ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
                  <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', borderBottom: '1px solid var(--color-border)' }}>
                    <CheckCircle size={24} style={{ color: '#10b981' }} />
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Orçamento Criado</h2>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                      <CheckCircle size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Orçamento Criado com Sucesso!</h3>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '32px' }}>A orçamento foi registrado.</p>
                    
                    <div style={{ backgroundColor: 'white', padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', width: '100%', maxWidth: '400px', justifyContent: 'space-between' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ accentColor: '#2563eb', width: '16px', height: '16px' }} />
                        Incluir fotos anexadas no PDF (A4)
                      </label>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '12px' }}>0 fotos</span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', width: '100%', maxWidth: '600px', marginBottom: '24px' }}>
                      <button type="button" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '12px', cursor: 'pointer', gap: '12px', transition: 'all 0.2s' }} className="hover-shadow">
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={24} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Padrão A4</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>PDF completo (ideal para arquivo/email)</div>
                        </div>
                      </button>
                      
                      <button type="button" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '12px', cursor: 'pointer', gap: '12px', transition: 'all 0.2s' }} className="hover-shadow">
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#faf5ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={24} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Cupom Térmico</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Comprovante para o cliente (80mm)</div>
                        </div>
                      </button>
                      
                      <button type="button" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '12px', cursor: 'pointer', gap: '12px', transition: 'all 0.2s' }} className="hover-shadow">
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={24} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Etiqueta Adesiva</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Para colar no aparelho</div>
                        </div>
                      </button>
                    </div>
                    
                    <button type="button" onClick={() => window.open('https://api.whatsapp.com/send?text=Ol%C3%A1', '_blank')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '12px', cursor: 'pointer', gap: '12px', transition: 'all 0.2s', width: '200px', marginBottom: '32px' }} className="hover-shadow">
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Smartphone size={24} />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Enviar pelo WhatsApp</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>API de WhatsApp Desbloqueada</div>
                      </div>
                    </button>
                    
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button type="button" onClick={() => setModalStep(1)} style={{ padding: '10px 24px', fontSize: '0.9rem', fontWeight: '700', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={16} /> Novo Orçamento
                      </button>
                      <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 24px', fontSize: '0.9rem', fontWeight: '600', color: '#334155', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {modalStep < 7 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderTop: '1px solid var(--color-border)', backgroundColor: 'white' }}>
              <button 
                type="button" 
                onClick={() => modalStep > 1 ? setModalStep(s => s - 1) : setIsModalOpen(false)} 
                style={{ padding: '12px 20px', fontSize: '0.9rem', fontWeight: '600', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {modalStep === 1 ? 'Cancelar' : '← Voltar'}
              </button>
              
              {modalStep < 6 ? (
                <button 
                  type="button" 
                  onClick={() => setModalStep(s => s + 1)} 
                  className="btn btn-primary" 
                  style={{ padding: '12px 32px', fontSize: '0.9rem', fontWeight: '700', backgroundColor: '#2563eb' }}
                >
                  Continuar →
                </button>
              ) : (
                <button 
                  type="submit" 
                  form="os-form"
                  className="btn btn-primary" 
                  style={{ padding: '12px 32px', fontSize: '0.9rem', fontWeight: '700', backgroundColor: '#10b981' }}
                >
                  <CheckCircle size={18} style={{ marginRight: '6px' }} /> Finalizar Orçamento
                </button>
              )}
            </div>
            )}
          </div>
        </div>
      )}

      {selectedQuote && (
        <QuoteDetailsModal 
          quote={selectedQuote} 
          quoteNumber={numberMap[selectedQuote.id] ?? 0} 
          onClose={() => setSelectedQuote(null)} 
        />
      )}

      {isFilterModalOpen && (
        <OSFilterModal 
          onClose={() => setIsFilterModalOpen(false)} 
          onApply={(filters) => {
            setIsFilterModalOpen(false);
          }} 
        />
      )}

      {/* NOVO CLIENTE & APARELHO MODAL */}
      {isNewCustomerModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', padding: '24px 32px', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
              <button onClick={() => setIsNewCustomerModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginRight: '16px', display: 'flex' }}>
                <X size={24} />
              </button>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Novo Cliente & Aparelho</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', padding: '32px' }}>
              
              {/* LEFT COLUMN: DADOS DO CLIENTE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '8px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Dados do Cliente</h4>
                </div>
                
                <div style={{ backgroundColor: '#eff6ff', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#bfdbfe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={14} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#1e3a8a', fontWeight: '500' }}>Essas informações ficam salvas na aba Clientes.</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Nome Completo *</label>
                    <input type="text" className="input" value={newCustomerData.name} onChange={e => setNewCustomerData({ ...newCustomerData, name: e.target.value })} placeholder="Ex: João da Silva" style={{ height: '48px', backgroundColor: '#f8fafc' }} />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Telefone / WhatsApp <span style={{ textTransform: 'none', fontWeight: '400', color: '#94a3b8' }}>(Opcional)</span></label>
                    <input type="text" className="input" value={newCustomerData.phone} onChange={e => setNewCustomerData({ ...newCustomerData, phone: e.target.value })} placeholder="(00) 00000-0000" style={{ height: '48px', backgroundColor: '#f8fafc' }} />
                    <span style={{ fontSize: '0.7rem', color: '#d97706', display: 'flex', gap: '4px', marginTop: '6px', fontWeight: '500' }}>Sem telefone, não será possível enviar mensagens via WhatsApp.</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>CPF / CNPJ</label>
                      <input type="text" className="input" value={newCustomerData.document} onChange={e => setNewCustomerData({ ...newCustomerData, document: e.target.value })} placeholder="000.000.000-00" style={{ height: '48px', backgroundColor: '#f8fafc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>E-mail</label>
                      <input type="email" className="input" value={newCustomerData.email} onChange={e => setNewCustomerData({ ...newCustomerData, email: e.target.value })} placeholder="cliente@email.com" style={{ height: '48px', backgroundColor: '#f8fafc' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Data de Nascimento <span style={{ float: 'right', textTransform: 'none', fontWeight: '500', color: '#94a3b8' }}>Opcional</span></label>
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px', backgroundColor: '#f8fafc', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Clock size={16} style={{ color: '#64748b' }} />
                      <input type="date" value={newCustomerData.birthDate} onChange={e => setNewCustomerData({ ...newCustomerData, birthDate: e.target.value })} style={{ border: 'none', background: 'transparent', flex: 1, outline: 'none', color: '#334155', fontWeight: '500' }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Plus size={16} style={{ color: '#2563eb' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase' }}>Endereço</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>CEP</label>
                      <input type="text" className="input" value={newCustomerData.cep} onChange={e => setNewCustomerData({ ...newCustomerData, cep: e.target.value })} placeholder="00000-000" style={{ height: '40px', backgroundColor: '#f8fafc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Logradouro</label>
                      <input type="text" className="input" value={newCustomerData.street} onChange={e => setNewCustomerData({ ...newCustomerData, street: e.target.value })} placeholder="Rua, Avenida..." style={{ height: '40px', backgroundColor: '#f8fafc' }} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Número</label>
                      <input type="text" className="input" value={newCustomerData.number} onChange={e => setNewCustomerData({ ...newCustomerData, number: e.target.value })} placeholder="123" style={{ height: '40px', backgroundColor: '#f8fafc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Complemento</label>
                      <input type="text" className="input" value={newCustomerData.complement} onChange={e => setNewCustomerData({ ...newCustomerData, complement: e.target.value })} placeholder="Apartamento, bloco, casa 2..." style={{ height: '40px', backgroundColor: '#f8fafc' }} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Bairro</label>
                      <input type="text" className="input" value={newCustomerData.neighborhood} onChange={e => setNewCustomerData({ ...newCustomerData, neighborhood: e.target.value })} placeholder="Bairro" style={{ height: '40px', backgroundColor: '#f8fafc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Cidade</label>
                      <input type="text" className="input" value={newCustomerData.city} onChange={e => setNewCustomerData({ ...newCustomerData, city: e.target.value })} placeholder="Cidade" style={{ height: '40px', backgroundColor: '#f8fafc' }} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* RIGHT COLUMN: APARELHO PRINCIPAL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ borderBottom: '2px solid #a855f7', paddingBottom: '8px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Aparelho Principal</h4>
                </div>
                
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px', backgroundColor: '#faf5ff' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Tipo de Dispositivo</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {['Celular', 'Tablet', 'Notebook', 'Console', 'Watch', 'Outro'].map(t => (
                          <div 
                            key={t} 
                            onClick={() => setOsDevice({ ...osDevice, type: t })}
                            style={{ padding: '12px 4px', borderRadius: '8px', border: osDevice.type === t ? '2px solid #a855f7' : '1px solid var(--color-border)', backgroundColor: 'white', textAlign: 'center', cursor: 'pointer', color: osDevice.type === t ? '#a855f7' : '#64748b' }}
                          >
                            <Smartphone size={20} style={{ margin: '0 auto 4px' }} />
                            <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase' }}>{t}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Smartphone size={16} style={{ color: '#a855f7' }} />
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>Modelo do dispositivo *</label>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '8px', paddingLeft: '24px' }}>O mesmo nome exibido nas ordens e na ficha do cliente.</p>
                      <input type="text" className="input" value={osDevice.model} onChange={e => {
                        const val = e.target.value;
                        const firstWord = val.split(' ')[0] || '';
                        setOsDevice({ ...osDevice, model: val, brand: firstWord });
                      }} placeholder="Ex: iPhone 13 Pro Max" style={{ height: '48px', backgroundColor: 'white' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Cor do aparelho</label>
                      <div style={{ position: 'relative' }}>
                        <SlidersHorizontal size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input type="text" className="input" value={osDevice.color} onChange={e => setOsDevice({ ...osDevice, color: e.target.value })} placeholder="Ex: Preto, Azul Metálico..." style={{ height: '48px', paddingLeft: '40px', backgroundColor: 'white' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>IMEI</label>
                        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '4px', padding: '2px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#2563eb', padding: '2px 8px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>IMEI</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: '600', color: '#64748b', padding: '2px 8px' }}>Serial</span>
                        </div>
                      </div>
                      <input type="text" className="input" value={osDevice.imei} onChange={e => setOsDevice({ ...osDevice, imei: e.target.value })} placeholder="# 3592810 123456" style={{ height: '48px', fontFamily: 'monospace', letterSpacing: '0.05em', backgroundColor: 'white' }} />
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 32px', borderTop: '1px solid var(--color-border)', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: 0, zIndex: 10 }}>
              <button 
                type="button" 
                disabled={isCreatingCustomer || !newCustomerData.name}
                onClick={async () => {
                  setIsCreatingCustomer(true)
                  const res = await createCustomer(newCustomerData)
                  if (res.success && res.customer) {
                    setLocalCustomers([res.customer, ...localCustomers])
                    setSelectedCustomer(res.customer.id)
                    setIsNewCustomerModalOpen(false)
                    setNewCustomerData({ name: '', phone: '', document: '', email: '', birthDate: '', cep: '', street: '', number: '', complement: '', neighborhood: '', city: '' })
                  } else {
                    alert(res.error || 'Erro ao criar cliente')
                  }
                  setIsCreatingCustomer(false)
                }}
                style={{ padding: '14px 32px', borderRadius: '8px', border: 'none', backgroundColor: '#60a5fa', color: 'white', fontWeight: '700', cursor: (!newCustomerData.name || isCreatingCustomer) ? 'not-allowed' : 'pointer', opacity: (!newCustomerData.name || isCreatingCustomer) ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} /> {isCreatingCustomer ? 'Salvando...' : 'Salvar Cliente'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState, useMemo } from 'react'
import {
  Users, Plus, Trash2, X, Search, SlidersHorizontal,
  Upload, Smartphone, Tablet, Laptop, Gamepad2, Watch, LayoutGrid,
  MapPin, User, FileText, MessageCircle, TrendingUp, Edit, Wrench, ShoppingBag
} from 'lucide-react'
import WhatsappIcon from '@/components/WhatsappIcon'
import { createCustomer, deleteCustomer, updateCustomer } from '@/actions/customer'
import { maskCPFOrCNPJ, maskCEP, maskPhone } from '@/lib/masks'

/* ── device types ── */
const DEVICE_TYPES = [
  { key: 'Celular',    icon: Smartphone },
  { key: 'Tablet',    icon: Tablet },
  { key: 'Notebook',  icon: Laptop },
  { key: 'Video Game',icon: Gamepad2 },
  { key: 'Smartwatch',icon: Watch },
  { key: 'Outro',     icon: LayoutGrid },
]

type Device = { type: string; model: string; imei: string; color: string }

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 80 }, (_, i) => CURRENT_YEAR - i)

function avatarInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
function avatarColor(name: string) {
  const colors = ['#6366f1','#8b5cf6','#ec4899','#f97316','#14b8a6','#3b82f6','#10b981']
  let h = 0; for (const c of name) h = (h + c.charCodeAt(0)) % colors.length
  return colors[h]
}

const PAGE_SIZE = 10

export default function CustomerClient({ customers }: { customers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  /* ── modal state ── */
  const [viewingCustomer, setViewingCustomer] = useState<any>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName]           = useState('')
  const [document, setDocument]   = useState('')
  const [phone, setPhone]         = useState('')
  const [email, setEmail]         = useState('')
  const [birthDay, setBirthDay]   = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [cep, setCep]             = useState('')
  const [street, setStreet]       = useState('')
  const [addrNumber, setAddrNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity]           = useState('')
  const [state, setState]         = useState('')
  const [notes, setNotes]         = useState('')

  /* ── devices ── */
  const [devices, setDevices]         = useState<Device[]>([])
  const [deviceType, setDeviceType]   = useState('Celular')
  const [deviceModel, setDeviceModel] = useState('')
  const [deviceImei, setDeviceImei]   = useState('')
  const [deviceColor, setDeviceColor] = useState('')

  /* ── stats ── */
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
  const newThisMonth = customers.filter(c => new Date(c.createdAt) >= startOfMonth).length

  /* ── filter ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return customers.filter(c =>
      !q || c.name.toLowerCase().includes(q) ||
      c.phone?.includes(q) || c.document?.includes(q) || c.city?.toLowerCase().includes(q)
    )
  }, [customers, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  /* ── CEP autocomplete ── */
  async function handleCepBlur() {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    try {
      const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const d = await r.json()
      if (!d.erro) {
        setStreet(d.logradouro || '')
        setNeighborhood(d.bairro || '')
        setCity(d.localidade || '')
        setState(d.uf || '')
      }
    } catch {}
  }

  function addDevice() {
    if (!deviceModel) return
    setDevices([...devices, { type: deviceType, model: deviceModel, imei: deviceImei, color: deviceColor }])
    setDeviceModel(''); setDeviceImei(''); setDeviceColor('')
  }

  function resetModal() {
    setEditingId(null)
    setName(''); setDocument(''); setPhone(''); setEmail('')
    setBirthDay(''); setBirthMonth(''); setBirthYear('')
    setCep(''); setStreet(''); setAddrNumber(''); setComplement('')
    setNeighborhood(''); setCity(''); setState(''); setNotes('')
    setDevices([]); setDeviceModel(''); setDeviceImei(''); setDeviceColor('')
    setDeviceType('Celular')
  }

  function handleEdit(c: any) {
    setEditingId(c.id)
    setName(c.name || '')
    setDocument(c.document || '')
    setPhone(c.phone || c.whatsapp || '')
    setEmail(c.email || '')
    if (c.birthDate) {
      const parts = c.birthDate.split('/')
      if (parts[0]) setBirthDay(parts[0])
      if (parts[1]) setBirthMonth(parts[1])
      if (parts[2]) setBirthYear(parts[2])
    } else {
      setBirthDay(''); setBirthMonth(''); setBirthYear('')
    }
    setCep(c.cep || '')
    setStreet(c.street || '')
    setAddrNumber(c.number || '')
    setComplement(c.complement || '')
    setNeighborhood(c.neighborhood || '')
    setCity(c.city || '')
    setState(c.state || '')
    setNotes(c.notes || '')
    try {
      if (c.devices) setDevices(JSON.parse(c.devices))
      else setDevices([])
    } catch { setDevices([]) }
    setIsModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    const birthDate = birthDay && birthMonth ? `${birthDay}/${birthMonth}${birthYear ? '/' + birthYear : ''}` : undefined
    const data = {
      name, document, phone, email, birthDate,
      cep, street, number: addrNumber, complement, neighborhood, city, state,
      devices: devices.length > 0 ? JSON.stringify(devices) : undefined,
      notes,
    }
    const res = editingId 
      ? await updateCustomer(editingId, data)
      : await createCustomer(data)
      
    if (res?.error) alert(res.error)
    else { setIsModalOpen(false); resetModal() }
  }

  async function handleDelete(id: string) {
    if (confirm('Excluir este cliente?')) await deleteCustomer(id)
  }

  return (
    <>
      <style>{`
        .mobile-cards { display: none; }
        .desktop-table { display: block; overflow-x: auto; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
        @media (max-width: 768px) {
          .desktop-table { display: none !important; }
          .mobile-cards { display: flex !important; flex-direction: column; gap: 16px; padding: 16px 0; }
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={22} style={{ color: 'var(--color-primary)' }} />
              Base de Clientes
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
              Gerencie seus clientes e veja o histórico completo
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" style={{ fontSize: '0.85rem', gap: '6px', backgroundColor: 'white' }}>
            <Upload size={15} /> Exportar
          </button>
          <button className="btn btn-primary" style={{ gap: '6px', fontSize: '0.85rem' }} onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Novo Cliente
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.67rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total de Clientes</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: 1.1 }}>{customers.length}</div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.67rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Cadastrados Este Mês</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: 1.1 }}>{newThisMonth}</div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(168,85,247,0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.67rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Gasto Total (Médio)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', lineHeight: 1.1 }}>R$ 0,00</div>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Search + filter bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            {filtered.length} cliente{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar por nome, telefone ou documento..."
                className="input"
                style={{ paddingLeft: '30px', fontSize: '0.82rem', height: '36px', width: '100%', boxSizing: 'border-box' }}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <button className="btn btn-outline" style={{ fontSize: '0.82rem', gap: '6px', height: '36px', backgroundColor: 'white', whiteSpace: 'nowrap' }}>
              <SlidersHorizontal size={14} /> Filtrar
            </button>
          </div>
        </div>

        {/* Customer list */}
        {paginated.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-text-muted)' }}>
            <Users size={44} style={{ opacity: 0.2, marginBottom: '14px' }} />
            <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>Nenhum cliente encontrado</p>
            <p style={{ fontSize: '0.8rem' }}>Não encontramos resultados para sua busca ou<br />você ainda não possui clientes cadastrados.</p>
            {search && <button onClick={() => setSearch('')} style={{ marginTop: '12px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Limpar filtros</button>}
          </div>
        ) : (
          <div className="desktop-table">
            <table className="table" style={{ minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg)' }}>
                  <th style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.06em' }}>CLIENTE</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.06em' }}>CONTATO</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.06em' }}>DOCUMENTO</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.06em' }}>CIDADE</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.06em' }}>CADASTRO</th>
                  <th style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.06em' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setViewingCustomer(c)}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          backgroundColor: avatarColor(c.name),
                          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.8rem', fontWeight: '700', flexShrink: 0,
                        }}>
                          {avatarInitials(c.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{c.name}</div>
                          {c.email && <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{c.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      {c.phone || c.whatsapp ? (
                        <div style={{ fontSize: '0.82rem' }}>{c.phone || c.whatsapp}</div>
                      ) : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>—</span>}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{c.document || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}</td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {c.city ? `${c.city}${c.state ? ` - ${c.state}` : ''}` : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(c.phone || c.whatsapp) && (
                          <a href={`https://wa.me/55${c.phone?.replace(/\D/g, '') || ''}?text=Olá ${c.name.split(' ')[0]}...`} target="_blank" style={{ textDecoration: 'none', backgroundColor: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Chamar no WhatsApp">
                            <WhatsappIcon size={15} color="#25D366" />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(c)}
                          title="Editar"
                          style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: '#6366f1' }}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          title="Excluir"
                          style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: '#ef4444' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile View */}
        {paginated.length > 0 && (
          <div className="mobile-cards" style={{ padding: '0 16px' }}>
            {paginated.map(c => (
              <div key={c.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    backgroundColor: avatarColor(c.name),
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontWeight: '700', flexShrink: 0,
                    cursor: 'pointer'
                  }} onClick={() => setViewingCustomer(c)}>
                    {avatarInitials(c.name)}
                  </div>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setViewingCustomer(c)}>
                    <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--color-text)' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{c.email || ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(c.phone || c.whatsapp) && (
                      <a href={`https://wa.me/55${c.phone?.replace(/\D/g, '') || ''}?text=Olá ${c.name.split(' ')[0]}...`} target="_blank" style={{ textDecoration: 'none', backgroundColor: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Chamar no WhatsApp">
                        <WhatsappIcon size={15} color="#25D366" />
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(c)}
                      title="Editar"
                      style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: '#6366f1' }}
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="Excluir"
                      style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '5px 7px', cursor: 'pointer', color: '#ef4444' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.7rem' }}>Contato</span>
                    <span style={{ fontWeight: '500' }}>{c.phone || c.whatsapp || '—'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.7rem' }}>Documento</span>
                    <span style={{ fontWeight: '500' }}>{c.document || '—'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.7rem' }}>Cidade</span>
                    <span style={{ fontWeight: '500' }}>{c.city ? `${c.city}${c.state ? ` - ${c.state}` : ''}` : '—'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.7rem' }}>Cadastro</span>
                    <span style={{ fontWeight: '500' }}>{new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <span>Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} cliente{filtered.length !== 1 ? 's' : ''}</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>‹</button>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', padding: '0 8px' }}>{page}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>›</button>
          </div>
        </div>
      </div>

      {/* ── Modal: Novo Cliente ── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 50, padding: '24px', overflowY: 'auto' }}>
          <div style={{
            background: 'var(--color-surface)', borderRadius: '16px', width: '100%', maxWidth: '680px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Preencha os dados do cliente e dispositivos associados.</p>
                </div>
              </div>
              <button onClick={() => { setIsModalOpen(false); resetModal() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '75vh', overflowY: 'auto' }}>

                {/* ── Dados Pessoais ── */}
                <Section icon={<User size={16} />} iconBg="rgba(99,102,241,0.1)" iconColor="#6366f1" title="Dados Pessoais">
                  <div>
                    <Label>NOME COMPLETO <Required /></Label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                      <input required className="input" style={{ paddingLeft: '34px' }} placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid-responsive-2">
                    <div>
                      <Label>CPF / CNPJ</Label>
                      <input className="input" placeholder="000.000.000-00" value={document}
                        onChange={e => setDocument(maskCPFOrCNPJ(e.target.value))} />
                    </div>
                    <div>
                      <Label>WHATSAPP / TELEFONE</Label>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-warning)', marginBottom: '4px', marginTop: '-4px', fontWeight: '500' }}>(obrigatório para WhatsApp)</div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <select className="input" style={{ width: '90px', flexShrink: 0 }}>
                          <option>BR +55</option>
                        </select>
                        <input className="input" placeholder="(11) 99999-9999" value={phone}
                          onChange={e => setPhone(maskPhone(e.target.value))} />
                      </div>
                      <p style={{ fontSize: '0.68rem', color: '#f59e0b', marginTop: '4px' }}>⚠ Sem telefone, não será possível enviar mensagens via WhatsApp.</p>
                    </div>
                  </div>
                  <div>
                    <Label>E-MAIL</Label>
                    <input className="input" type="email" placeholder="cliente@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <Label style={{ marginBottom: 0 }}>DATA DE NASCIMENTO</Label>
                      <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>opcional</span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Campo opcional para relacionamento com o cliente.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
                      <select className="input" value={birthDay} onChange={e => setBirthDay(e.target.value)}>
                        <option value="">Dia</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d}>{d}</option>)}
                      </select>
                      <select className="input" value={birthMonth} onChange={e => setBirthMonth(e.target.value)}>
                        <option value="">Mes</option>
                        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                      </select>
                      <select className="input" value={birthYear} onChange={e => setBirthYear(e.target.value)}>
                        <option value="">Ano</option>
                        {YEARS.map(y => <option key={y}>{y}</option>)}
                      </select>
                      {(birthDay || birthMonth || birthYear) && (
                        <button type="button" onClick={() => { setBirthDay(''); setBirthMonth(''); setBirthYear('') }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>×</button>
                      )}
                    </div>
                  </div>
                </Section>

                {/* ── Endereço ── */}
                <Section icon={<MapPin size={16} />} iconBg="rgba(59,130,246,0.1)" iconColor="#3b82f6" title="Endereço Principal">
                  <div className="grid-responsive-2">
                    <div>
                      <Label>CEP</Label>
                      <input className="input" placeholder="00000-000" value={cep}
                        onChange={e => setCep(maskCEP(e.target.value))}
                        onBlur={handleCepBlur} />
                    </div>
                    <div>
                      <Label>ENDEREÇO</Label>
                      <input className="input" placeholder="Rua, Avenida..." value={street} onChange={e => setStreet(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid-responsive-2">
                    <div>
                      <Label>NÚMERO</Label>
                      <input className="input" placeholder="123" value={addrNumber} onChange={e => setAddrNumber(e.target.value)} />
                    </div>
                    <div>
                      <Label>COMPLEMENTO</Label>
                      <input className="input" placeholder="Apartamento, bloco, casa..." value={complement} onChange={e => setComplement(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>BAIRRO</Label>
                    <input className="input" placeholder="Bairro" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} />
                  </div>
                  <div>
                    <Label>CIDADE</Label>
                    <input className="input" placeholder="Cidade" value={city} onChange={e => setCity(e.target.value)} />
                  </div>
                </Section>

                {/* ── Dispositivos ── */}
                <Section icon={<Smartphone size={16} />} iconBg="rgba(16,185,129,0.1)" iconColor="#10b981" title="Dispositivos Associados">
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--color-primary)', letterSpacing: '0.08em' }}>ADICIONAR NOVO</span>
                    {/* Type selector */}
                    <div>
                      <Label>TIPO DE APARELHO</Label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {DEVICE_TYPES.map(dt => {
                          const Icon = dt.icon
                          const active = deviceType === dt.key
                          return (
                            <button key={dt.key} type="button" onClick={() => setDeviceType(dt.key)}
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                                border: active ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                backgroundColor: active ? 'rgba(99,102,241,0.08)' : 'transparent',
                                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                fontWeight: active ? '700' : '500', fontSize: '0.72rem', fontFamily: 'inherit',
                              }}>
                              <Icon size={20} />
                              {dt.key}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div className="grid-responsive-2">
                      <div>
                        <Label>EX: IPHONE 13 PRO MAX</Label>
                        <input className="input" placeholder={`Ex: iPhone 13 Pro Max`} value={deviceModel} onChange={e => setDeviceModel(e.target.value)} />
                      </div>
                      <div>
                        <Label>IMEI
                          <span style={{ marginLeft: '6px', fontSize: '0.65rem', fontWeight: '600', color: 'var(--color-primary)', backgroundColor: 'rgba(99,102,241,0.1)', padding: '1px 6px', borderRadius: '4px' }}>IMEI</span>
                          <span style={{ marginLeft: '4px', fontSize: '0.65rem', fontWeight: '600', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', padding: '1px 6px', borderRadius: '4px' }}>SERIAL</span>
                        </Label>
                        <input className="input" placeholder="0000 0000 0000 000" value={deviceImei} onChange={e => setDeviceImei(e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                      <div>
                        <Label>COR (OPCIONAL)</Label>
                        <input className="input" placeholder="Ex: Azul, Preto, Prata..." value={deviceColor} onChange={e => setDeviceColor(e.target.value)} />
                      </div>
                      <button type="button" onClick={addDevice} className="btn btn-primary" style={{ height: '42px', gap: '6px', whiteSpace: 'nowrap' }}>
                        <Plus size={15} /> Adicionar Dispositivo
                      </button>
                    </div>
                  </div>
                  {/* Device list */}
                  {devices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
                      <Smartphone size={28} style={{ opacity: 0.3, marginBottom: '6px' }} />
                      <p style={{ fontSize: '0.8rem' }}>Nenhum dispositivo associado</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {devices.map((d, i) => {
                        const DIcon = DEVICE_TYPES.find(t => t.key === d.type)?.icon || Smartphone
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <DIcon size={18} style={{ color: 'var(--color-primary)' }} />
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{d.model}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                                  {d.type}{d.imei ? ` · IMEI: ${d.imei}` : ''}{d.color ? ` · ${d.color}` : ''}
                                </div>
                              </div>
                            </div>
                            <button type="button" onClick={() => setDevices(devices.filter((_, j) => j !== i))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                              <X size={16} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Section>

                {/* ── Observações ── */}
                <Section icon={<FileText size={16} />} iconBg="rgba(245,158,11,0.1)" iconColor="#f59e0b" title="Observações Internas">
                  <textarea
                    className="input" rows={3}
                    placeholder="Anote aqui preferências do cliente, histórico importante, etc."
                    value={notes} onChange={e => setNotes(e.target.value)}
                  />
                </Section>

              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" onClick={() => { setIsModalOpen(false); resetModal() }} className="btn btn-outline" style={{ backgroundColor: 'white' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ gap: '8px' }}>
                  💾 {editingId ? 'Atualizar Cliente' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Ficha Técnica do Cliente ── */}
      {viewingCustomer && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px', overflowY: 'auto' }}>
          <div style={{
            background: 'var(--color-surface)', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '24px 32px', borderBottom: '1px solid var(--color-border)', flexShrink: 0, backgroundColor: 'var(--color-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%', backgroundColor: avatarColor(viewingCustomer.name),
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '700'
                }}>
                  {avatarInitials(viewingCustomer.name)}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0, color: 'var(--color-text)' }}>{viewingCustomer.name}</h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {viewingCustomer.document && <span><FileText size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }}/>{viewingCustomer.document}</span>}
                    {(viewingCustomer.phone || viewingCustomer.whatsapp) && <span><Smartphone size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }}/>{viewingCustomer.phone || viewingCustomer.whatsapp}</span>}
                    {viewingCustomer.email && <span>✉ {viewingCustomer.email}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', backgroundColor: 'var(--color-surface)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Ordens de Serviço */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)' }}>
                    <Wrench size={18} style={{ color: 'var(--color-primary)' }} /> Histórico de Serviços (OS)
                  </h3>
                  {viewingCustomer.serviceOrders && viewingCustomer.serviceOrders.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {viewingCustomer.serviceOrders.map((os: any) => (
                        <div key={os.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>OS #{os.id.slice(-5).toUpperCase()} · {os.brand} {os.model}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{os.defect}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '700', color: 'var(--color-text)', fontSize: '0.9rem', marginBottom: '4px' }}>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.price || 0)}
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e2e8f0', color: '#475569', display: 'inline-block' }}>
                              {os.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Nenhuma ordem de serviço registrada para este cliente.</p>
                  )}
                </div>

                {/* Vendas */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)' }}>
                    <ShoppingBag size={18} style={{ color: 'var(--color-primary)' }} /> Compras na Loja / PDV
                  </h3>
                  {viewingCustomer.sales && viewingCustomer.sales.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {viewingCustomer.sales.map((sale: any) => (
                        <div key={sale.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>Venda em {new Date(sale.createdAt).toLocaleDateString('pt-BR')}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Método: {sale.paymentMethod}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '700', color: '#16a34a', fontSize: '0.9rem', marginBottom: '4px' }}>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.totalAmount || 0)}
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e2e8f0', color: '#475569', display: 'inline-block' }}>
                              {sale.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Nenhuma venda registrada para este cliente.</p>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Helper components ── */
function Section({ icon, iconBg, iconColor, title, children }: {
  icon: React.ReactNode; iconBg: string; iconColor: string; title: string; children: React.ReactNode
}) {
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{title}</span>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
      </div>
    </div>
  )
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase', ...style }}>
      {children}
    </div>
  )
}

function Required() {
  return <span style={{ color: '#ef4444' }}> *</span>
}

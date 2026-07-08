'use client';

import { useState } from 'react';
import { Tag, Plus, Pencil, Trash2, Power, Search } from 'lucide-react';
import { createCoupon, updateCoupon, deleteCoupon } from '@/actions/coupon';

export default function CouponClient({ coupons }: { coupons: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState('PERCENTAGE'); // PERCENTAGE, FIXED
  const [value, setValue] = useState('');

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await createCoupon({
      code: code.trim(),
      type,
      value: Number(value),
    });
    setLoading(false);

    if (result.success) {
      setShowModal(false);
      setCode('');
      setType('PERCENTAGE');
      setValue('');
    } else {
      alert(result.error);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await updateCoupon(id, { active: !currentActive });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cupom?')) {
      await deleteCoupon(id);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--color-text)' }}>Cupons de Desconto</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Gerencie os códigos promocionais da sua vitrine
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus size={18} /> Novo Cupom
        </button>
      </div>

      <div className="card">
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por código..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input" 
              style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }} 
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Desconto</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                      <Tag size={16} color="var(--color-primary)" />
                      {coupon.code}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 'bold' }}>
                      {coupon.type === 'PERCENTAGE' 
                        ? `${coupon.value}%` 
                        : `R$ ${coupon.value.toFixed(2).replace('.', ',')}`}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      backgroundColor: coupon.active ? 'rgba(37, 211, 102, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                      color: coupon.active ? 'var(--color-success)' : 'var(--color-error)'
                    }}>
                      {coupon.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="icon-btn" 
                        title={coupon.active ? "Desativar" : "Ativar"}
                        onClick={() => handleToggleActive(coupon.id, coupon.active)}
                      >
                        <Power size={18} color={coupon.active ? "var(--color-success)" : "var(--color-text-muted)"} />
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Excluir"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 size={18} color="var(--color-error)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCoupons.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    Nenhum cupom encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Novo Cupom</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group">
                <label>Código do Cupom</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Ex: PROMO10"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo de Desconto</label>
                <select 
                  className="input" 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="PERCENTAGE">Porcentagem (%)</option>
                  <option value="FIXED">Valor Fixo (R$)</option>
                </select>
              </div>

              <div className="form-group">
                <label>{type === 'PERCENTAGE' ? 'Porcentagem de Desconto' : 'Valor do Desconto (R$)'}</label>
                <input 
                  type="number" 
                  step={type === 'PERCENTAGE' ? '1' : '0.01'}
                  className="input" 
                  placeholder={type === 'PERCENTAGE' ? 'Ex: 10' : 'Ex: 15.00'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Salvando...' : 'Salvar Cupom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

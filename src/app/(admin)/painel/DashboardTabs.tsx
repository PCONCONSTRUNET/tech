'use client';

import { useState } from 'react';

type PaymentItem = {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  customerName?: string | null;
};

type Props = {
  paymentsToReceive: PaymentItem[];
  paymentsToPay: PaymentItem[];
};

const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

export default function DashboardTabs({ paymentsToReceive, paymentsToPay }: Props) {
  const [activeTab, setActiveTab] = useState<'receber' | 'pagar' | 'aniversarios'>('receber');

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'receber', label: 'A Receber' },
    { key: 'pagar', label: 'A Pagar' },
    { key: 'aniversarios', label: 'Aniversários' },
  ];

  const activeList = activeTab === 'receber' ? paymentsToReceive : activeTab === 'pagar' ? paymentsToPay : [];

  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Title */}
      <div style={{ marginBottom: '14px' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
          🔔 LEMBRETES E PENDÊNCIAS
        </span>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0', marginBottom: '16px',
        backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '4px'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: '7px 4px', border: 'none', cursor: 'pointer',
              borderRadius: 'calc(var(--radius-md) - 2px)',
              fontSize: '0.78rem', fontWeight: activeTab === tab.key ? '700' : '500',
              backgroundColor: activeTab === tab.key ? 'white' : 'transparent',
              color: activeTab === tab.key ? 'var(--color-text)' : 'var(--color-text-muted)',
              boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'aniversarios' ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎂</div>
          <p style={{ fontSize: '0.875rem' }}>Nenhum aniversário por hoje.</p>
        </div>
      ) : activeList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔔</div>
          <p style={{ fontSize: '0.875rem' }}>
            {activeTab === 'receber'
              ? 'Tudo em dia! Nenhum recebimento pendente.'
              : 'Nenhum pagamento pendente.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeList.map((item) => {
            const isOverdue = new Date(item.dueDate) < new Date();
            return (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--color-border)'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{item.description}</div>
                  {item.customerName && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.customerName}</div>
                  )}
                  <div style={{ fontSize: '0.72rem', color: isOverdue ? 'var(--color-error)' : 'var(--color-text-muted)', marginTop: '2px' }}>
                    Vence: {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                    {isOverdue && ' ⚠️ Atrasado'}
                  </div>
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: activeTab === 'receber' ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {formatCurrency(item.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

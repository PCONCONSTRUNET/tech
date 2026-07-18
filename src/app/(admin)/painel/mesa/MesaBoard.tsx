'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Archive, Plus, Smartphone } from 'lucide-react';
import MesaCardMenu from '@/components/MesaCardMenu';

type OSCard = {
  id: string;
  number: number;
  customerName: string;
  customerPhone: string;
  device: string;
  brand: string;
  model: string;
  defect: string;
  status: string;
  createdAt: string;
};

type Column = {
  key: string;
  label: string;
  color: string;
  bg: string;
  iconColor: string;
};

const COLUMNS: Column[] = [
  { key: 'EM_ANALISE',      label: 'EM ANÁLISE',   color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  iconColor: '#3b82f6' },
  { key: 'AGUARDANDO_PECA', label: 'AGUARD. PEÇA', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  iconColor: '#f59e0b' },
  { key: 'EM_CONSERTO',     label: 'EM SERVIÇO',   color: '#a855f7', bg: 'rgba(168,85,247,0.1)',  iconColor: '#a855f7' },
  { key: 'PRONTO',          label: 'CONCLUÍDO',    color: '#10b981', bg: 'rgba(16,185,129,0.1)',  iconColor: '#10b981' },
  { key: 'ENTREGUE',        label: 'PAGO',         color: '#14b8a6', bg: 'rgba(20,184,166,0.1)',  iconColor: '#14b8a6' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function MesaBoard({ cards }: { cards: OSCard[] }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.device.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        String(c.number).includes(q)
    );
  }, [cards, search]);

  const byStatus = useMemo(() => {
    const map: Record<string, OSCard[]> = {};
    for (const col of COLUMNS) map[col.key] = [];
    for (const card of filtered) {
      if (map[card.status] !== undefined) {
        map[card.status].push(card);
      } else if (card.status === 'RECEBIDO') {
        map['EM_ANALISE'].push(card);
      }
    }
    return map;
  }, [filtered]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>📋</span> Mesa de Reparo
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
              Gerencia o fluxo de trabalho dos dispositivos
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar OS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: '32px', width: '200px', fontSize: '0.85rem', height: '38px' }}
            />
          </div>
          <Link
            href="/painel/os"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              border: '1px solid var(--color-border)', color: 'var(--color-text)',
              backgroundColor: 'white', padding: '8px 14px', borderRadius: 'var(--radius-md)',
              textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500',
            }}
          >
            <Archive size={15} /> Ver Arquivados
          </Link>
          <Link
            href="/painel/os"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              backgroundColor: 'var(--color-primary)', color: 'white',
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600',
            }}
          >
            <Plus size={15} /> Nova OS
          </Link>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{
        display: 'flex', gap: '14px', overflowX: 'auto',
        paddingBottom: '16px', flex: 1,
        alignItems: 'flex-start',
      }}>
        {COLUMNS.map((col) => {
          const colCards = byStatus[col.key] ?? [];
          return (
            <div
              key={col.key}
              style={{
                minWidth: '240px', flex: '1 0 240px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
              }}
            >
              {/* Column Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    backgroundColor: col.color,
                    boxShadow: `0 0 6px ${col.color}`,
                  }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.07em', color: 'var(--color-text-muted)' }}>
                    {col.label}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.78rem', fontWeight: '700',
                  backgroundColor: col.bg, color: col.color,
                  padding: '2px 10px', borderRadius: '9999px',
                }}>
                  {colCards.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '200px' }}>
                {colCards.length === 0 ? (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', padding: '40px 12px',
                    color: 'var(--color-text-muted)', textAlign: 'center',
                  }}>
                    <Smartphone size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Nenhuma OS encontrada</span>
                  </div>
                ) : (
                  colCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => window.location.href = `/painel/os/${card.id}`}
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px',
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        position: 'relative'
                      }}
                    >
                      <MesaCardMenu card={card} />
                      {/* OS Number + Date */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', paddingRight: '24px' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--color-text-muted)' }}>#{card.number}</span>
                          {card.status === 'RECEBIDO' ? (
                            <span style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>Entrada</span>
                          ) : (
                            <span style={{ backgroundColor: col.bg, color: col.color, padding: '2px 8px', borderRadius: '12px' }}>{col.label}</span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                          {formatDate(card.createdAt)}
                        </span>
                      </div>
                      {/* Customer */}
                      <div style={{ fontWeight: '700', fontSize: '0.82rem', marginBottom: '3px', color: 'var(--color-text)' }}>
                        {card.customerName}
                      </div>
                      {/* Device */}
                      <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                        {card.brand} {card.model}
                      </div>
                      {/* Defect */}
                      <div style={{
                        fontSize: '0.72rem', color: 'var(--color-text-muted)',
                        marginTop: '6px', overflow: 'hidden',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4,
                      }}>
                        {card.defect}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Trash2 } from 'lucide-react'

type Notification = {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Nova Ordem de Serviço',
    message: 'Uma nova OS #1002 foi recebida para iPhone 13.',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Estoque Baixo',
    message: 'A peça "Tela iPhone 11" está abaixo do estoque mínimo.',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    title: 'Meta Batida',
    message: 'Parabéns, a meta diária de vendas foi atingida!',
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
]

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load from local storage or use initial
    const stored = localStorage.getItem('dt_notifications')
    if (stored) {
      try {
        setNotifications(JSON.parse(stored))
      } catch (e) {
        setNotifications(INITIAL_NOTIFICATIONS)
      }
    } else {
      setNotifications(INITIAL_NOTIFICATIONS)
      localStorage.setItem('dt_notifications', JSON.stringify(INITIAL_NOTIFICATIONS))
    }
  }, [])

  useEffect(() => {
    // Close on click outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const save = (newNotifs: Notification[]) => {
    setNotifications(newNotifs)
    localStorage.setItem('dt_notifications', JSON.stringify(newNotifs))
  }

  const markAsRead = (id: string) => {
    save(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    save(notifications.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    save(notifications.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <div 
        style={{ cursor: 'pointer', position: 'relative' }} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} style={{ color: 'var(--color-text-muted)' }} />
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', top: '-6px', right: '-6px', 
            backgroundColor: 'var(--color-error)', color: 'white', 
            fontSize: '10px', fontWeight: 'bold', width: '18px', height: '18px', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 2px white'
          }}>
            {unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div style={{ 
          position: 'absolute', top: '100%', right: '-80px', marginTop: '12px',
          width: '320px', backgroundColor: 'white', borderRadius: '12px',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)', border: '1px solid var(--color-border)',
          zIndex: 100, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          maxHeight: '400px'
        }}>
          {/* Header */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0, color: 'var(--color-text)' }}>Notificações</h3>
            {unreadCount > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); markAllAsRead() }}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                Nenhuma notificação no momento.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {notifications.map(notif => (
                  <div key={notif.id} style={{ 
                    padding: '16px', 
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: notif.read ? 'white' : '#f1f5f9',
                    display: 'flex', gap: '12px',
                    transition: 'background-color 0.2s'
                  }}>
                    <div style={{ 
                      width: '8px', height: '8px', borderRadius: '50%', 
                      backgroundColor: notif.read ? 'transparent' : 'var(--color-primary)',
                      marginTop: '6px', flexShrink: 0
                    }} />
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '2px' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4, marginBottom: '8px' }}>
                        {notif.message}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {!notif.read && (
                          <button 
                            onClick={() => markAsRead(notif.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                          >
                            <Check size={12} /> Marcar como lida
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notif.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--color-error)', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                        >
                          <Trash2 size={12} /> Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

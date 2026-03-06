'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { fetchInbox, fetchAllUsers, sendMessage, markAsRead } from './actions';
import { Send, Inbox, Mail, MailOpen, RefreshCw } from 'lucide-react';

type Message = { id: string; content: string; created_at: string; read_at?: string | null; sender?: { full_name?: string } };
type User = { user_id: string; full_name: string; role: string };

type Props = { currentUserId: string; currentUserName: string };

export default function MessagesClient({ currentUserId, currentUserName }: Props) {
    const [inbox, setInbox] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
    const [view, setView] = useState<'inbox' | 'compose'>('inbox');
    const [receiverId, setReceiverId] = useState('');
    const [content, setContent] = useState('');
    const [isPending, startTransition] = useTransition();
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchInbox(currentUserId).then(setInbox);
        fetchAllUsers(currentUserId).then(setUsers);
    }, [currentUserId]);

    const handleOpenMessage = async (msg: Message) => {
        setSelectedMsg(msg);
        if (!msg.read_at) {
            await markAsRead(msg.id);
            setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, read_at: new Date().toISOString() } : m));
        }
    };

    const handleSend = () => {
        if (!receiverId || !content.trim()) return;
        startTransition(async () => {
            const res = await sendMessage(currentUserId, receiverId, content);
            if (res.success) {
                setContent('');
                setReceiverId('');
                setSuccessMsg('¡Mensaje enviado exitosamente!');
                setTimeout(() => setSuccessMsg(''), 3000);
                setView('inbox');
            }
        });
    };

    const unreadCount = inbox.filter(m => !m.read_at).length;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--card-foreground)' }}>Mensajes</h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Sistema de comunicación interno del colegio.</p>
                </div>
                <button onClick={() => setView(view === 'compose' ? 'inbox' : 'compose')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                    <Send size={16} /> Redactar Mensaje
                </button>
            </div>

            {successMsg && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--success-bg)', color: 'var(--success-fg)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 500 }}>
                    ✅ {successMsg}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Sidebar */}
                <div>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <button onClick={() => { setView('inbox'); setSelectedMsg(null); }}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', border: 'none', cursor: 'pointer', backgroundColor: view === 'inbox' ? 'var(--secondary)' : 'transparent', color: 'var(--foreground)', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--border)' }}>
                            <Inbox size={18} color="var(--primary)" />
                            Bandeja de Entrada
                            {unreadCount > 0 && (
                                <span style={{ marginLeft: 'auto', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>{unreadCount}</span>
                            )}
                        </button>
                        <button onClick={() => setView('compose')}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', border: 'none', cursor: 'pointer', backgroundColor: view === 'compose' ? 'var(--secondary)' : 'transparent', color: 'var(--foreground)', fontWeight: 600, fontSize: '0.875rem' }}>
                            <Send size={18} color="var(--accent)" /> Redactar Nuevo
                        </button>
                    </div>
                </div>

                {/* Main Area */}
                <div>
                    {view === 'inbox' && !selectedMsg && (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                {inbox.length} mensaje(s)
                            </div>
                            {inbox.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                    <MailOpen size={48} style={{ marginBottom: '1rem', opacity: 0.3, display: 'block', margin: '0 auto 1rem' }} />
                                    Tu bandeja de entrada está vacía.
                                </div>
                            ) : (
                                inbox.map(m => (
                                    <button key={m.id} onClick={() => handleOpenMessage(m)}
                                        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem 1.5rem', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', backgroundColor: !m.read_at ? 'rgba(139,92,246,0.05)' : 'transparent', textAlign: 'left', transition: 'background 0.2s' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0, marginTop: '0.125rem' }}>
                                            {(m.sender?.full_name || 'US').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: !m.read_at ? 700 : 500, fontSize: '0.875rem' }}>{m.sender?.full_name || 'Desconocido'}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                                                    {new Date(m.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.1rem' }}>
                                                {m.content}
                                            </div>
                                        </div>
                                        {!m.read_at && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '0.5rem', flexShrink: 0 }} />}
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {view === 'inbox' && selectedMsg && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <button onClick={() => setSelectedMsg(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1.5rem', padding: 0 }}>
                                ← Volver a bandeja
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                    {(selectedMsg.sender?.full_name || 'US').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{selectedMsg.sender?.full_name || 'Desconocido'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                        {new Date(selectedMsg.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--foreground)' }}>
                                {selectedMsg.content}
                            </div>
                        </div>
                    )}

                    {view === 'compose' && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Redactar Nuevo Mensaje</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>DESTINATARIO</label>
                                    <select value={receiverId} onChange={e => setReceiverId(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', outline: 'none', fontSize: '0.875rem' }}>
                                        <option value="">— Seleccionar destinatario —</option>
                                        {users.map(u => (
                                            <option key={u.user_id} value={u.user_id}>{u.full_name} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>MENSAJE</label>
                                    <textarea value={content} onChange={e => setContent(e.target.value)} rows={7} placeholder="Escribe tu mensaje aquí..."
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', resize: 'vertical', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                                </div>
                                <button onClick={handleSend} disabled={isPending || !receiverId || !content.trim()}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', cursor: receiverId && content.trim() ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.875rem', opacity: receiverId && content.trim() ? 1 : 0.6, transition: 'all 0.2s' }}>
                                    <Send size={18} /> {isPending ? 'Enviando...' : 'Enviar Mensaje'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

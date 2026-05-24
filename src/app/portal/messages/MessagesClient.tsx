'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { fetchInbox, fetchAllUsers, sendMessage, markAsRead } from './actions';
import { Send, Inbox, Mail, MailOpen, RefreshCw, Share2, Smartphone, MessageCircle, Globe, Users } from 'lucide-react';

type Message = { id: string; content: string; created_at: string; read_at?: string | null; sender?: { full_name?: string } };
type User = { user_id: string; full_name: string; role: string };

type Props = { currentUserId: string; currentUserName: string };

export default function MessagesClient({ currentUserId, currentUserName }: Props) {
    const [inbox, setInbox] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
    const [view, setView] = useState<'inbox' | 'compose' | 'external'>('inbox');
    const [receiverId, setReceiverId] = useState('');
    const [content, setContent] = useState('');
    const [isPending, startTransition] = useTransition();
    const [successMsg, setSuccessMsg] = useState('');

    // External communication channels states
    const [extContactType, setExtContactType] = useState<'registered' | 'manual'>('registered');
    const [extSelectedUserId, setExtSelectedUserId] = useState('');
    const [extManualName, setExtManualName] = useState('');
    const [extManualPhone, setExtManualPhone] = useState('');
    const [extManualEmail, setExtManualEmail] = useState('');
    const [extTemplate, setExtTemplate] = useState<'grades' | 'attendance' | 'incident' | 'custom'>('grades');
    const [extStudentName, setExtStudentName] = useState('');
    const [extStudentDetail, setExtStudentDetail] = useState('');
    const [extCustomText, setExtCustomText] = useState('');

    const getMessageText = () => {
        if (extTemplate === 'grades') {
            return `¡Hola! Le escribo desde Luminar para informarle que el estudiante ${extStudentName || '[Nombre del estudiante]'} ha mostrado un excelente desempeño académico. Detalle del avance: ${extStudentDetail || '[Calificaciones/Competencias]'}. ¡Felicitaciones por su esfuerzo!`;
        }
        if (extTemplate === 'attendance') {
            return `Estimado tutor, le escribo desde Luminar para notificarle que el estudiante ${extStudentName || '[Nombre del estudiante]'} registró una novedad de asistencia hoy. Detalle: ${extStudentDetail || '[Inasistencia/Tardanza]'}. Favor de estar al tanto de los registros en el portal.`;
        }
        if (extTemplate === 'incident') {
            return `Hola, le escribo de parte del equipo docente de Luminar. Queremos informarle sobre un reporte de comportamiento del estudiante ${extStudentName || '[Nombre del estudiante]'} en el aula. Detalle: ${extStudentDetail || '[Descripción de la incidencia]'}. Agradecemos su colaboración en casa para guiar su aprendizaje integral.`;
        }
        return extCustomText;
    };

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
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', border: 'none', cursor: 'pointer', backgroundColor: view === 'compose' ? 'var(--secondary)' : 'transparent', color: 'var(--foreground)', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid var(--border)' }}>
                            <Send size={18} color="var(--accent)" /> Redactar Nuevo
                        </button>
                        <button onClick={() => setView('external')}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', border: 'none', cursor: 'pointer', backgroundColor: view === 'external' ? 'var(--secondary)' : 'transparent', color: 'var(--foreground)', fontWeight: 600, fontSize: '0.875rem' }}>
                            <Share2 size={18} color="var(--primary)" /> Canales Externos
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

                    {view === 'external' && (
                        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--card-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Share2 size={20} color="var(--primary)" /> Ecosistema de Comunicación Externa
                                </h2>
                                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.825rem', marginTop: '0.2rem' }}>
                                    Envía reportes académicos, incidencias o avisos directamente a través de WhatsApp, Telegram, SMS o Correo.
                                </p>
                            </div>

                            {/* Contact Mode Selector */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.25rem', backgroundColor: 'var(--muted)', borderRadius: '8px' }}>
                                <button onClick={() => setExtContactType('registered')}
                                    style={{ padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', border: 'none', backgroundColor: extContactType === 'registered' ? 'var(--card)' : 'transparent', color: extContactType === 'registered' ? 'var(--foreground)' : 'var(--muted-foreground)', cursor: 'pointer' }}>
                                    Contacto Registrado
                                </button>
                                <button onClick={() => setExtContactType('manual')}
                                    style={{ padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', border: 'none', backgroundColor: extContactType === 'manual' ? 'var(--card)' : 'transparent', color: extContactType === 'manual' ? 'var(--foreground)' : 'var(--muted-foreground)', cursor: 'pointer' }}>
                                    Contacto Manual
                                </button>
                            </div>

                            {/* Contact Details Card */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {extContactType === 'registered' ? (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Seleccionar Destinatario</label>
                                        <select value={extSelectedUserId} onChange={e => {
                                            const id = e.target.value;
                                            setExtSelectedUserId(id);
                                            const found = users.find(u => u.user_id === id);
                                            if (found) {
                                                setExtManualName(found.full_name);
                                            }
                                        }}
                                            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '0.85rem', outline: 'none' }}>
                                            <option value="">— Seleccionar —</option>
                                            {users.map(u => (
                                                <option key={u.user_id} value={u.user_id}>{u.full_name} ({u.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Nombre del Contacto</label>
                                        <input type="text" placeholder="Ej. Juan Pérez (Padre)" value={extManualName} onChange={e => setExtManualName(e.target.value)}
                                            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                )}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>WhatsApp / Celular (con código)</label>
                                    <input type="tel" placeholder="Ej. 18290000000" value={extManualPhone} onChange={e => setExtManualPhone(e.target.value)}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Correo Electrónico (Opcional)</label>
                                <input type="email" placeholder="Ej. tutor@correo.com" value={extManualEmail} onChange={e => setExtManualEmail(e.target.value)}
                                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
                                </div>

                            {/* Template Selector */}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Tipo de Mensaje / Plantilla Inteligente</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {[
                                        { id: 'grades', label: '📈 Avance Académico' },
                                        { id: 'attendance', label: '📅 Novedad Asistencia' },
                                        { id: 'incident', label: '⚠️ Reporte Conducta' },
                                        { id: 'custom', label: '✏️ Texto Personalizado' }
                                    ].map(t => (
                                        <button key={t.id} onClick={() => setExtTemplate(t.id as any)}
                                            style={{ padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: 600, backgroundColor: extTemplate === t.id ? 'var(--primary)' : 'var(--card)', color: extTemplate === t.id ? 'white' : 'var(--foreground)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Template Form Inputs */}
                            {extTemplate !== 'custom' ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Nombre del Estudiante</label>
                                        <input type="text" placeholder="Ej. Mateo Moreno" value={extStudentName} onChange={e => setExtStudentName(e.target.value)}
                                            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>
                                            {extTemplate === 'grades' ? 'Detalle de Notas / Logros' : extTemplate === 'attendance' ? 'Fecha y Motivo Asistencia' : 'Detalle de Incidencia / Comportamiento'}
                                        </label>
                                        <input type="text" placeholder={extTemplate === 'grades' ? 'Ej. P1: 95, P2: 90 · Líder en matemáticas' : extTemplate === 'attendance' ? 'Ej. Ausencia el 24/05 sin excusa' : 'Ej. Conversando en clase de español'} value={extStudentDetail} onChange={e => setExtStudentDetail(e.target.value)}
                                            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                            ) : (
                                <div style={{ backgroundColor: 'var(--secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Mensaje Libre</label>
                                    <textarea placeholder="Redacta el mensaje que deseas enviar..." value={extCustomText} onChange={e => setExtCustomText(e.target.value)} rows={4}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '0.85rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                                </div>
                            )}

                            {/* Preview */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Vista Previa del Mensaje</label>
                                <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--foreground)', fontStyle: 'italic', borderLeft: '4px solid var(--primary)' }}>
                                    "{getMessageText()}"
                                </div>
                            </div>

                            {/* Send Channels Grid */}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Selecciona el Canal de Envío</label>
                                <div className="external-channels-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                    
                                    {/* WhatsApp */}
                                    <a href={`https://wa.me/${extManualPhone.replace(/\D/g, '')}?text=${encodeURIComponent(getMessageText())}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', color: 'white', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', transition: 'all 0.2s', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', boxShadow: '0 4px 10px rgba(37,211,102,0.2)' }}>
                                        <MessageCircle size={16} /> WhatsApp Directo
                                    </a>

                                    {/* Telegram */}
                                    <a href={`https://t.me/share/url?url=https://luminar.app&text=${encodeURIComponent(getMessageText())}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', color: 'white', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', transition: 'all 0.2s', background: 'linear-gradient(135deg, #0088cc 0%, #0077b5 100%)', boxShadow: '0 4px 10px rgba(0,136,204,0.2)' }}>
                                        <Globe size={16} /> Compartir Telegram
                                    </a>

                                    {/* SMS */}
                                    <a href={`sms:${extManualPhone.replace(/\D/g, '')}?body=${encodeURIComponent(getMessageText())}`}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', color: 'white', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', transition: 'all 0.2s', background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)', boxShadow: '0 4px 10px rgba(13,148,136,0.2)' }}>
                                        <Smartphone size={16} /> Enviar SMS Celular
                                    </a>

                                    {/* Email */}
                                    <a href={`mailto:${extManualEmail}?subject=${encodeURIComponent('Reporte de Luminar Académico')}&body=${encodeURIComponent(getMessageText())}`}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', color: 'white', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', transition: 'all 0.2s', background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)', boxShadow: '0 4px 10px rgba(71,85,105,0.2)' }}>
                                        <Mail size={16} /> Redactar Correo
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

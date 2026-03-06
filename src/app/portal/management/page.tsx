'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { getUsers, getStudents, getParentUsers, getStudentParentLinks, linkStudentParent, unlinkStudentParent } from './actions';
import { getPendingRegistrations, approveRegistration, rejectRegistration } from '@/app/login/actions';
import { CheckCircle, XCircle, Clock, Users, UserCheck, Link2, Unlink, Copy, Eye, EyeOff } from 'lucide-react';

type UserProfile = { user_id: string; role: string; full_name: string; created_at: string };
type PendingReg = { id: string; full_name: string; email: string; requested_role: string; status: string; created_at: string; notes?: string };
type Student = { id: string; full_name: string; identification_number: string };
type ParentUser = { user_id: string; full_name: string; avatar_url?: string };
type SPLink = { id: string; student_id: string; parent_id: string; students: { full_name: string }; profiles: { full_name: string } };

const ROLE_LABELS: Record<string, string> = {
    teacher: 'Docente', student: 'Estudiante', parent: 'Representante', admin: 'Administrador',
};
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    admin: { bg: 'var(--error-bg)', color: 'var(--error-fg)' },
    teacher: { bg: 'rgba(99,102,241,0.12)', color: 'var(--primary)' },
    student: { bg: 'var(--success-bg)', color: 'var(--success-fg)' },
    parent: { bg: 'rgba(192,132,252,0.15)', color: '#7c3aed' },
};
const STATUS_STYLES: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    pending: { bg: 'var(--warning-bg)', color: 'var(--warning-fg)', icon: <Clock size={13} /> },
    approved: { bg: 'var(--success-bg)', color: 'var(--success-fg)', icon: <CheckCircle size={13} /> },
    rejected: { bg: 'var(--error-bg)', color: 'var(--error-fg)', icon: <XCircle size={13} /> },
};

export default function PortalManagementPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [pending, setPending] = useState<PendingReg[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [parents, setParents] = useState<ParentUser[]>([]);
    const [links, setLinks] = useState<SPLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'linking'>('pending');
    const [isPending, startTransition] = useTransition();

    // Approve result
    const [approvedResult, setApprovedResult] = useState<{ name: string; email: string; password: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectNotes, setRejectNotes] = useState('');
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Linking state
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedParent, setSelectedParent] = useState('');

    useEffect(() => {
        async function load() {
            const [u, p, s, par, l] = await Promise.all([
                getUsers(), getPendingRegistrations(), getStudents(), getParentUsers(), getStudentParentLinks()
            ]);
            setUsers(u as UserProfile[]);
            setPending(p as PendingReg[]);
            setStudents(s as Student[]);
            setParents(par as ParentUser[]);
            setLinks(l as SPLink[]);
            setLoading(false);
        }
        load();
    }, []);

    const pendingCount = pending.filter(p => p.status === 'pending').length;
    const showMsg = (text: string, type: 'success' | 'error') => {
        setMsg({ text, type });
        setTimeout(() => setMsg(null), 6000);
    };

    const handleApprove = (regId: string, regName: string, regEmail: string) => {
        startTransition(async () => {
            const res = await approveRegistration(regId);
            if (res.success && res.tempPassword) {
                setApprovedResult({ name: regName, email: regEmail, password: res.tempPassword });
                setPending(await getPendingRegistrations() as PendingReg[]);
                setUsers(await getUsers() as UserProfile[]);
                setParents(await getParentUsers() as ParentUser[]);
            } else {
                showMsg(res.message || 'Error al aprobar', 'error');
            }
        });
    };

    const handleReject = () => {
        if (!rejectingId) return;
        startTransition(async () => {
            const res = await rejectRegistration(rejectingId, rejectNotes);
            showMsg(res.success ? '❌ Solicitud rechazada.' : (res.message || 'Error'), res.success ? 'success' : 'error');
            if (res.success) setPending(await getPendingRegistrations() as PendingReg[]);
            setRejectingId(null);
            setRejectNotes('');
        });
    };

    const handleLink = () => {
        if (!selectedStudent || !selectedParent) return;
        startTransition(async () => {
            const res = await linkStudentParent(selectedStudent, selectedParent);
            showMsg(res.message, res.success ? 'success' : 'error');
            if (res.success) {
                setLinks(await getStudentParentLinks() as SPLink[]);
                setSelectedStudent('');
                setSelectedParent('');
            }
        });
    };

    const handleUnlink = (linkId: string) => {
        startTransition(async () => {
            const res = await unlinkStudentParent(linkId);
            showMsg(res.message, res.success ? 'success' : 'error');
            if (res.success) setLinks(await getStudentParentLinks() as SPLink[]);
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showMsg('📋 Copiado al portapapeles', 'success');
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.65rem 0.875rem', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)', backgroundColor: 'var(--secondary)',
        color: 'var(--foreground)', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box',
    };

    const tabs = [
        { key: 'pending', label: `Solicitudes${pendingCount > 0 ? ` (${pendingCount})` : ''}`, icon: <Clock size={15} /> },
        { key: 'users', label: `Usuarios (${users.length})`, icon: <Users size={15} /> },
        { key: 'linking', label: `Vínculos`, icon: <Link2 size={15} /> },
    ];

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--card-foreground)', marginBottom: '0.35rem' }}>
                    Gestión de Usuarios
                </h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                    Aprueba solicitudes, gestiona cuentas y vincula estudiantes con sus representantes.
                </p>
            </div>

            {msg && (
                <div style={{ marginBottom: '1.5rem', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: msg.type === 'success' ? 'var(--success-bg)' : 'var(--error-bg)', color: msg.type === 'success' ? 'var(--success-fg)' : 'var(--error-fg)', fontWeight: 500, fontSize: '0.875rem' }}>
                    {msg.text}
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)' }}>
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', fontWeight: 600, fontSize: '0.85rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: activeTab === tab.key ? 'var(--primary)' : 'transparent', color: activeTab === tab.key ? 'white' : 'var(--muted-foreground)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', marginBottom: '-2px', borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent' }}>
                        {tab.icon} {tab.label}
                        {tab.key === 'pending' && pendingCount > 0 && (
                            <span style={{ marginLeft: '0.25rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '1rem', padding: '0.05rem 0.4rem', fontSize: '0.65rem', fontWeight: 700 }}>{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Cargando...</div>
            ) : (
                <>
                    {/* ── PENDING REGISTRATIONS */}
                    {activeTab === 'pending' && (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <UserCheck size={18} /> Solicitudes de Registro
                            </div>
                            {pending.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No hay solicitudes de registro todavía.</div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--muted)', textAlign: 'left', color: 'var(--muted-foreground)' }}>
                                            <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Solicitante</th>
                                            <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Correo</th>
                                            <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Rol</th>
                                            <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Estado</th>
                                            <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Fecha</th>
                                            <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pending.map(reg => {
                                            const roleStyle = ROLE_COLORS[reg.requested_role] || ROLE_COLORS.teacher;
                                            const st = STATUS_STYLES[reg.status] || STATUS_STYLES.pending;
                                            return (
                                                <tr key={reg.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{reg.full_name}</td>
                                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--muted-foreground)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{reg.email}</td>
                                                    <td style={{ padding: '1rem 1.5rem' }}>
                                                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, backgroundColor: roleStyle.bg, color: roleStyle.color }}>
                                                            {ROLE_LABELS[reg.requested_role] || reg.requested_role}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem' }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.7rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, backgroundColor: st.bg, color: st.color }}>
                                                            {st.icon}
                                                            {reg.status === 'pending' ? 'Pendiente' : reg.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>
                                                        {new Date(reg.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem' }}>
                                                        {reg.status === 'pending' ? (
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button onClick={() => handleApprove(reg.id, reg.full_name, reg.email)} disabled={isPending}
                                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.9rem', backgroundColor: 'var(--success-bg)', color: 'var(--success-fg)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', opacity: isPending ? 0.5 : 1 }}>
                                                                    <CheckCircle size={13} /> {isPending ? 'Creando...' : 'Aprobar'}
                                                                </button>
                                                                <button onClick={() => { setRejectingId(reg.id); setRejectNotes(''); }}
                                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.9rem', backgroundColor: 'var(--error-bg)', color: 'var(--error-fg)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                                                                    <XCircle size={13} /> Rechazar
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
                                                                {reg.status === 'approved' ? '✓ Creado' : reg.notes || '—'}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ── ACTIVE USERS */}
                    {activeTab === 'users' && (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} /> Cuentas Activas</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 500, backgroundColor: 'var(--muted)', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>{users.length} usuarios</span>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--muted)', textAlign: 'left', color: 'var(--muted-foreground)' }}>
                                        <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Nombre</th>
                                        <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Rol</th>
                                        <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Fecha de Registro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => {
                                        const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.teacher;
                                        return (
                                            <tr key={u.user_id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1rem 1.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                                                            {u.full_name?.substring(0, 2).toUpperCase() || 'US'}
                                                        </div>
                                                        <span style={{ fontWeight: 500 }}>{u.full_name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem' }}>
                                                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, backgroundColor: roleStyle.bg, color: roleStyle.color }}>
                                                        {ROLE_LABELS[u.role] || u.role}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem', color: 'var(--muted-foreground)' }}>
                                                    {new Date(u.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {users.length === 0 && (
                                        <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No hay usuarios todavía.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── STUDENT-PARENT LINKING */}
                    {activeTab === 'linking' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Link Form */}
                            <div className="card">
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>🔗 Vincular Estudiante con Representante</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '1.25rem' }}>
                                    Selecciona un estudiante y uno o más representantes para vincularlos. Un estudiante puede tener varios representantes.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>Estudiante</label>
                                        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} style={inputStyle}>
                                            <option value="">— Seleccionar estudiante —</option>
                                            {students.map(s => (
                                                <option key={s.id} value={s.id}>{s.full_name} ({s.identification_number})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>Representante</label>
                                        <select value={selectedParent} onChange={e => setSelectedParent(e.target.value)} style={inputStyle}>
                                            <option value="">— Seleccionar representante —</option>
                                            {parents.map(p => (
                                                <option key={p.user_id} value={p.user_id}>{p.full_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button onClick={handleLink} disabled={!selectedStudent || !selectedParent || isPending}
                                        style={{ padding: '0.65rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: (!selectedStudent || !selectedParent) ? 0.5 : 1, whiteSpace: 'nowrap' }}>
                                        <Link2 size={15} /> Vincular
                                    </button>
                                </div>
                            </div>

                            {/* Existing Links */}
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Link2 size={18} /> Vínculos Actuales</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 500, backgroundColor: 'var(--muted)', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>{links.length} vínculos</span>
                                </div>
                                {links.length === 0 ? (
                                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No hay vínculos estudiante-representante todavía.</div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: 'var(--muted)', textAlign: 'left', color: 'var(--muted-foreground)' }}>
                                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>👦 Estudiante</th>
                                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>👨 Representante</th>
                                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {links.map(link => (
                                                <tr key={link.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                                                        {(link.students as any)?.full_name || 'Desconocido'}
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                                                        {(link.profiles as any)?.full_name || 'Desconocido'}
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem' }}>
                                                        <button onClick={() => handleUnlink(link.id)} disabled={isPending}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', backgroundColor: 'var(--error-bg)', color: 'var(--error-fg)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                                                            <Unlink size={13} /> Desvincular
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ──── APPROVED RESULT MODAL (shows auto-generated password) */}
            {approvedResult && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <CheckCircle size={28} color="var(--success-fg)" />
                            </div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>✅ ¡Usuario Creado!</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                                Se creó la cuenta y se envió un correo a <strong>{approvedResult.email}</strong> con un enlace para configurar su contraseña.
                            </p>
                        </div>

                        <div style={{ backgroundColor: 'var(--muted)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Nombre</span>
                                <div style={{ fontWeight: 600 }}>{approvedResult.name}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Correo</span>
                                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{approvedResult.email}</div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Contraseña temporal (respaldo)</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                    <code style={{ padding: '0.4rem 0.75rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.5px', flex: 1, border: '1px solid var(--border)' }}>
                                        {showPassword ? approvedResult.password : '••••••••••••'}
                                    </code>
                                    <button onClick={() => setShowPassword(!showPassword)} title={showPassword ? 'Ocultar' : 'Mostrar'}
                                        style={{ padding: '0.4rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--background)', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button onClick={() => copyToClipboard(approvedResult.password)} title="Copiar"
                                        style={{ padding: '0.4rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--background)', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
                                        <Copy size={16} />
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.35rem' }}>
                                    💡 El usuario recibirá un correo para configurar su contraseña. Esta clave temporal es solo un respaldo.
                                </p>
                            </div>
                        </div>

                        <button onClick={() => { setApprovedResult(null); setShowPassword(false); }}
                            style={{ padding: '0.7rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {/* ──── REJECT MODAL */}
            {rejectingId && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>❌ Rechazar Solicitud</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Puedes agregar un motivo (opcional) para tu registro interno.</p>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Motivo (opcional)</label>
                            <textarea value={rejectNotes} onChange={e => setRejectNotes(e.target.value)}
                                placeholder="Ej: No pertenece a esta institución" rows={3}
                                style={{ ...inputStyle, resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setRejectingId(null)} style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--muted-foreground)', fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handleReject} disabled={isPending}
                                style={{ padding: '0.6rem 1.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <XCircle size={16} /> {isPending ? 'Rechazando...' : 'Rechazar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { getStudentsList, getIncidents, getIncidentsForParent, createIncident, deleteIncident } from './actions';
import { AlertTriangle, Plus, Trash2, Filter } from 'lucide-react';

type Student = { id: string; full_name: string; identification_number: string };
type Incident = {
    id: string; student_id: string; title: string; description: string;
    severity: string; incident_date: string; created_at: string;
    students?: { full_name: string }; profiles?: { full_name: string };
};

const SEVERITY_LABELS: Record<string, string> = {
    low: 'Leve', moderate: 'Moderada', high: 'Alta', critical: 'Crítica',
};
const SEVERITY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
    low: { bg: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
    moderate: { bg: 'var(--warning-bg)', color: 'var(--warning-fg)', border: 'rgba(245,158,11,0.3)' },
    high: { bg: 'rgba(249,115,22,0.1)', color: '#ea580c', border: 'rgba(249,115,22,0.3)' },
    critical: { bg: 'var(--error-bg)', color: 'var(--error-fg)', border: 'rgba(239,68,68,0.3)' },
};

export default function IncidenciasClient({ isParent = false }: { isParent?: boolean }) {
    const [students, setStudents] = useState<Student[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [filterStudent, setFilterStudent] = useState('');

    useEffect(() => {
        async function load() {
            const [s, inc] = await Promise.all([
                getStudentsList(),
                isParent ? getIncidentsForParent() : getIncidents(),
            ]);
            setStudents(s as Student[]);
            setIncidents(inc as Incident[]);
            setLoading(false);
        }
        load();
    }, [isParent]);

    const showMsg = (text: string, type: 'success' | 'error') => {
        setMsg({ text, type }); setTimeout(() => setMsg(null), 4500);
    };

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await createIncident(fd);
            showMsg(res.message, res.success ? 'success' : 'error');
            if (res.success) {
                setIncidents(await getIncidents() as Incident[]);
                setShowForm(false);
            }
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm('¿Eliminar esta incidencia?')) return;
        startTransition(async () => {
            const res = await deleteIncident(id);
            showMsg(res.message, res.success ? 'success' : 'error');
            if (res.success) setIncidents(await getIncidents() as Incident[]);
        });
    };

    const filtered = filterStudent
        ? incidents.filter(i => i.student_id === filterStudent)
        : incidents;

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.65rem 0.875rem', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)', backgroundColor: 'var(--secondary)',
        color: 'var(--foreground)', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box' as const,
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Cargando incidencias...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={26} color="var(--warning-fg)" /> Incidencias
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                        {isParent ? 'Revisa las incidencias de tus representados.' : 'Registra y consulta incidencias de estudiantes.'}
                    </p>
                </div>
                {!isParent && (
                    <button onClick={() => setShowForm(!showForm)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                        <Plus size={17} /> Nueva Incidencia
                    </button>
                )}
            </div>

            {msg && (
                <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: msg.type === 'success' ? 'var(--success-bg)' : 'var(--error-bg)', color: msg.type === 'success' ? 'var(--success-fg)' : 'var(--error-fg)', fontWeight: 500, fontSize: '0.875rem' }}>
                    {msg.text}
                </div>
            )}

            {/* Create Form */}
            {showForm && !isParent && (
                <form onSubmit={handleCreate} className="card" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>📝 Registrar Incidencia</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Estudiante *</label>
                            <select name="student_id" required style={inputStyle}>
                                <option value="">— Seleccionar —</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.identification_number})</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Gravedad</label>
                            <select name="severity" defaultValue="moderate" style={inputStyle}>
                                <option value="low">🟦 Leve</option>
                                <option value="moderate">🟨 Moderada</option>
                                <option value="high">🟧 Alta</option>
                                <option value="critical">🟥 Crítica</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Título *</label>
                            <input name="title" type="text" required placeholder="Ej: Conducta inapropiada en clase" style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Fecha</label>
                            <input name="incident_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} style={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Descripción detallada *</label>
                        <textarea name="description" required rows={4} placeholder="Describe lo ocurrido con detalle: qué sucedió, dónde, involucrados, acciones tomadas..."
                            style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setShowForm(false)}
                            style={{ padding: '0.6rem 1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'transparent', color: 'var(--muted-foreground)', fontWeight: 500, cursor: 'pointer' }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={isPending}
                            style={{ padding: '0.6rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}>
                            {isPending ? 'Guardando...' : 'Registrar Incidencia'}
                        </button>
                    </div>
                </form>
            )}

            {/* Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <Filter size={16} color="var(--muted-foreground)" />
                <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)}
                    style={{ ...inputStyle, width: 'auto', minWidth: '250px' }}>
                    <option value="">Todos los estudiantes</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
                {filterStudent && (
                    <button onClick={() => setFilterStudent('')}
                        style={{ padding: '0.4rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'transparent', color: 'var(--muted-foreground)', fontSize: '0.8rem', cursor: 'pointer' }}>
                        Limpiar filtro
                    </button>
                )}
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                    {filtered.length} incidencia{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Incidents List */}
            {filtered.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                    <AlertTriangle size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p style={{ fontWeight: 500 }}>No hay incidencias registradas{filterStudent ? ' para este estudiante' : ''}.</p>
                    {isParent && <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>¡Excelente! Tus representados no tienen incidencias. 🎉</p>}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filtered.map(inc => {
                        const sev = SEVERITY_STYLE[inc.severity] || SEVERITY_STYLE.moderate;
                        return (
                            <div key={inc.id} className="card" style={{ padding: 0, overflow: 'hidden', borderLeft: `4px solid ${sev.color}` }}>
                                <div style={{ padding: '1rem 1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{inc.title}</span>
                                                <span style={{ padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.68rem', fontWeight: 700, backgroundColor: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                                                    {SEVERITY_LABELS[inc.severity] || inc.severity}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--muted-foreground)', flexWrap: 'wrap' }}>
                                                <span>👤 <strong>{(inc.students as any)?.full_name || 'Desconocido'}</strong></span>
                                                <span>📅 {new Date(inc.incident_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                {(inc.profiles as any)?.full_name && <span>✏️ Reportado por: {(inc.profiles as any).full_name}</span>}
                                            </div>
                                        </div>
                                        {!isParent && (
                                            <button onClick={() => handleDelete(inc.id)} disabled={isPending}
                                                title="Eliminar incidencia"
                                                style={{ padding: '0.35rem', border: 'none', backgroundColor: 'transparent', color: 'var(--muted-foreground)', cursor: 'pointer', borderRadius: 'var(--radius-md)', flexShrink: 0 }}>
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', lineHeight: 1.6, marginTop: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-md)' }}>
                                        {inc.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

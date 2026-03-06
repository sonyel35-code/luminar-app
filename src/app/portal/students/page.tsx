'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { getStudents, addStudent } from './actions';

type Enrollment = { course_id: string; courses?: { name: string; grade_level: string; section: string } };
type Student = { id: string; full_name: string; identification_number: string; enrollments?: Enrollment[] };

export default function PortalStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        async function load() {
            setStudents(await getStudents() as Student[]);
            setLoading(false);
        }
        load();
    }, []);

    const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await addStudent(formData);
            if (res.success) {
                setMsg({ text: res.message, type: 'success' });
                setStudents(await getStudents() as Student[]);
                (e.target as HTMLFormElement).reset();
            } else {
                setMsg({ text: res.message || 'Error al agregar', type: 'error' });
            }
            setTimeout(() => setMsg(null), 4000);
        });
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--card-foreground)', marginBottom: '0.5rem' }}>
                Estudiantes
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                Directorio y registro de nuevos estudiantes. Usa el módulo de <strong>Matrículas</strong> para asignarles cursos.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem' }}>
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>Alumnos Registrados</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{students.length} total</span>
                    </div>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Cargando...</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--muted)', textAlign: 'left', color: 'var(--muted-foreground)' }}>
                                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Nombre Completo</th>
                                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Identificación</th>
                                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Cursos Matriculados</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s) => {
                                    const enrollments = s.enrollments || [];
                                    return (
                                        <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}>
                                                        {s.full_name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    {s.full_name}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{s.identification_number}</td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                {enrollments.length === 0 ? (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>Sin matrículas</span>
                                                ) : (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                        {enrollments.map((enr, i) => (
                                                            <span key={i} style={{ backgroundColor: 'rgba(139,92,246,0.1)', color: 'var(--primary)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '1rem', padding: '0.15rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                                {enr.courses?.name || 'Curso'} {enr.courses ? `· ${enr.courses.grade_level}°${enr.courses.section}` : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {students.length === 0 && (
                                    <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No hay estudiantes registrados.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div>
                    <div className="card" style={{ position: 'sticky', top: '2rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Nuevo Estudiante</h2>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Nombre y Apellidos</label>
                                <input name="name" type="text" required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--background)', color: 'var(--foreground)', boxSizing: 'border-box' }} placeholder="Ej: María Gómez" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Matrícula / Identificación</label>
                                <input name="identification" type="text" required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--background)', color: 'var(--foreground)', boxSizing: 'border-box' }} placeholder="Ej: 1004" />
                            </div>
                            <button disabled={isPending} type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 600, opacity: isPending ? 0.7 : 1, cursor: isPending ? 'wait' : 'pointer', border: 'none' }}>
                                {isPending ? 'Guardando...' : 'Registrar Estudiante'}
                            </button>
                            {msg && <div style={{ padding: '0.5rem', fontSize: '0.875rem', color: msg.type === 'error' ? 'var(--error-fg)' : 'var(--success-fg)', backgroundColor: msg.type === 'error' ? 'var(--error-bg)' : 'var(--success-bg)', borderRadius: '4px', textAlign: 'center' }}>{msg.text}</div>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

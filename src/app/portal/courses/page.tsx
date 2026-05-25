'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { getCourses, addCourse } from './actions';

type Course = { id: string; name: string; grade_level: string; section: string; description: string; created_at: string };

export default function PortalCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        async function load() {
            setCourses(await getCourses());
            setLoading(false);
        }
        load();
    }, []);

    const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await addCourse(formData);
            if (res.success) {
                setMsg({ text: res.message, type: 'success' });
                const updated = await getCourses();
                setCourses(updated);
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
                Cursos y Grados
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                Configuración académica de las áreas de estudio.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem' }}>
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                        Cursos Registrados
                    </div>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Cargando datos...</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--muted)', textAlign: 'left', color: 'var(--muted-foreground)' }}>
                                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Nombre del Curso</th>
                                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Grado</th>
                                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Sección</th>
                                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Descripción</th>
                                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((c) => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{c.name}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>{c.grade_level || '-'}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>{c.section || '-'}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: 'var(--muted-foreground)' }}>{c.description || '-'}</td>
                                        <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Link href={`/portal/courses/${c.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                                                → Abrir Aula
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    const link = `${window.location.origin}/join/${c.id}`;
                                                    navigator.clipboard.writeText(link);
                                                    alert(`¡Enlace de invitación copiado para el curso: ${c.name}!\n\nEnvíaselo a los padres para que se registren y matriculen automáticamente: ${link}`);
                                                }}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--success-fg)', border: '1px solid var(--success)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'transparent', transition: 'all 0.2s' }}
                                            >
                                                🔗 Enlace
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {courses.length === 0 && (
                                    <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No hay cursos configurados.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div>
                    <div className="card" style={{ position: 'sticky', top: '2rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Nuevo Curso</h2>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Nombre</label>
                                <input name="name" type="text" required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }} placeholder="Ej: Álgebra Avanzada" />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Grado</label>
                                    <input name="grade_level" type="text" required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }} placeholder="Ej: 9no Grado" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Sección</label>
                                    <input name="section" type="text" required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }} placeholder="Ej: A" />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Descripción</label>
                                <textarea name="description" rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none', resize: 'vertical' }} placeholder="Detalles o tutor..." />
                            </div>
                            <button disabled={isPending} type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 600, opacity: isPending ? 0.7 : 1 }}>
                                {isPending ? 'Guardando...' : 'Crear Curso'}
                            </button>
                            {msg && <div style={{ padding: '0.5rem', fontSize: '0.875rem', color: msg.type === 'error' ? 'var(--error-fg)' : 'var(--success-fg)', backgroundColor: msg.type === 'error' ? 'var(--error-bg)' : 'var(--success-bg)', borderRadius: '4px', textAlign: 'center' }}>{msg.text}</div>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

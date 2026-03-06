'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { getTeachers, addTeacherMock } from './actions';

type Profile = { user_id: string; full_name: string; email: string; role: string; created_at: string };

export default function PortalTeachersPage() {
    const [teachers, setTeachers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTeachers() {
            setTeachers(await getTeachers());
            setLoading(false);
        }
        fetchTeachers();
    }, []);

    const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const res = await addTeacherMock(formData);
            setMsg(res.message);
            setTimeout(() => setMsg(null), 4000);
        });
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--card-foreground)', marginBottom: '0.5rem' }}>
                Directorio Docente
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                Visualiza la nómina de profesores y gestiona nuevos ingresos.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem' }}>
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                        Profesores Registrados
                    </div>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Cargando...</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--muted)', textAlign: 'left', color: 'var(--muted-foreground)' }}>
                                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Nombre</th>
                                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Email</th>
                                    <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Rol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.map((t) => (
                                    <tr key={t.user_id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{t.full_name}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: 'var(--muted-foreground)' }}>{t.email}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                                                {t.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {teachers.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                            No hay profesores registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div>
                    <div className="card" style={{ position: 'sticky', top: '2rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Agregar Profesor</h2>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Nombre Completo</label>
                                <input name="name" type="text" required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }} placeholder="Ej: Juan Pérez" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Email</label>
                                <input name="email" type="email" required style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }} placeholder="juan@colegio.edu" />
                            </div>
                            <button disabled={isPending} type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 600, opacity: isPending ? 0.7 : 1 }}>
                                {isPending ? 'Procesando...' : 'Agregar Docente'}
                            </button>
                            {msg && <div style={{ padding: '0.5rem', fontSize: '0.875rem', color: 'var(--error-fg)', backgroundColor: 'var(--error-bg)', borderRadius: '4px', textAlign: 'center' }}>{msg}</div>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import { getRepresentantes } from '@/app/portal/management/actions';
import { Heart, User, Calendar, ExternalLink, Mail, Phone } from 'lucide-react';

interface Representante {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    created_at: string;
    student_parents: Array<{
        student_id: string;
        students: {
            full_name: string;
        };
    }>;
}

export default function RepresentantesPage() {
    const [representantes, setRepresentantes] = useState<Representante[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getRepresentantes();
                setRepresentantes(data as unknown as Representante[]);
            } catch (error) {
                console.error('Error loading representantes:', error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Cargando representantes...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Heart size={32} color="var(--primary)" />
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Representantes</h1>
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem' }}>
                    Listado de padres, tutores y responsables registrados en el ecosistema.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {representantes.length === 0 ? (
                    <div className="card" style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center' }}>
                        <User size={48} color="var(--muted-foreground)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>No hay representantes registrados todavía.</h2>
                    </div>
                ) : (
                    representantes.map((rep) => (
                        <div key={rep.user_id} className="card" style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: 'default' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                {rep.avatar_url?.startsWith('emoji:') ? (
                                    <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(192,132,252,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                        {rep.avatar_url.replace('emoji:', '')}
                                    </div>
                                ) : rep.avatar_url ? (
                                    <img src={rep.avatar_url} alt={rep.full_name} style={{ width: '56px', height: '56px', borderRadius: '1rem', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.25rem' }}>
                                        {rep.full_name.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{rep.full_name}</h3>
                                    <p style={{ margin: '0.2rem 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>
                                        <Calendar size={12} /> Miembro desde {new Date(rep.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ background: 'rgba(var(--secondary), 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                    <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estudiantes Vinculados ({rep.student_parents.length})</h4>
                                    {rep.student_parents.length === 0 ? (
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--muted-foreground)' }}>Sin estudiantes asociados</p>
                                    ) : (
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {rep.student_parents.map((link, idx) => (
                                                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: 500 }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                                                    {link.students.full_name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem', fontSize: '0.8rem' }}>
                                    <Mail size={14} /> Correo
                                </button>
                                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem', fontSize: '0.8rem' }}>
                                    <Phone size={14} /> Contacto
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .btn-secondary {
                    background: var(--secondary);
                    border: 1px solid var(--border);
                    color: var(--foreground);
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-secondary:hover {
                    background: var(--border);
                }
            `}</style>
        </div>
    );
}

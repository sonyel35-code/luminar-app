import Link from 'next/link';
import Image from 'next/image';
import { signup } from '@/app/login/actions';
import { GraduationCap, Users, Heart } from 'lucide-react';

const ROLES = [
    { value: 'teacher', label: 'Docente', description: 'Creo y gestiono cursos', icon: '🧑‍🏫' },
    { value: 'student', label: 'Estudiante', description: 'Soy alumno de un curso', icon: '🎓' },
    { value: 'parent', label: 'Padre / Tutor', description: 'Soy representante legal', icon: '👨‍👩‍👧' },
];

export default function RegisterPage({ searchParams }: { searchParams: { error?: string; message?: string } }) {
    return (
        <div className="bg-animated-mesh" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="card glass-panel" style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                    <Image src="/logo.png" alt="Luminar Logo" width={56} height={56} priority style={{ margin: '0 auto 1rem', borderRadius: 'var(--radius-md)' }} />
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Solicitar Acceso
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                        El administrador revisará tu solicitud y habilitará tu cuenta.
                    </p>
                </div>

                {/* Alerts */}
                {searchParams?.error && (
                    <div style={{ padding: '0.875rem', backgroundColor: 'var(--error-bg)', color: 'var(--error-fg)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', textAlign: 'center', fontWeight: 500 }}>
                        {searchParams.error}
                    </div>
                )}
                {searchParams?.message && (
                    <div style={{ padding: '0.875rem', backgroundColor: 'var(--success-bg)', color: 'var(--success-fg)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', textAlign: 'center', fontWeight: 500 }}>
                        {searchParams.message}
                    </div>
                )}

                {/* Registration Form */}
                {!searchParams?.message && (
                    <form action={signup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Full Name */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label htmlFor="full_name" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)' }}>
                                Nombre Completo *
                            </label>
                            <input
                                id="full_name" name="full_name" type="text" required
                                placeholder="Ej: Laura Martínez"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Email */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)' }}>
                                Correo Electrónico *
                            </label>
                            <input
                                id="email" name="email" type="email" required
                                placeholder="tu@colegio.edu"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Role selector */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)' }}>
                                ¿Cuál es tu rol? *
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {ROLES.map(r => (
                                    <label key={r.value}
                                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', cursor: 'pointer', transition: 'all 0.2s' }}
                                        className="role-option">
                                        <input type="radio" name="role" value={r.value} required style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', flexShrink: 0 }} />
                                        <span style={{ fontSize: '1.4rem' }}>{r.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--foreground)' }}>{r.label}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{r.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Notice */}
                        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                            📋 Al enviar, el administrador revisará tu solicitud. <strong style={{ color: 'var(--foreground)' }}>No se crea tu cuenta todavía.</strong> Recibirás una contraseña temporal una vez aprobado.
                        </div>

                        <button type="submit" className="btn-futuristic"
                            style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.95rem', width: '100%' }}>
                            Enviar Solicitud de Acceso
                        </button>
                    </form>
                )}

                {/* Back to login */}
                <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Iniciar sesión →
                    </Link>
                </div>
            </div>

            <style>{`
                .role-option:has(input:checked) {
                    border-color: var(--primary);
                    background-color: rgba(99,102,241,0.06);
                }
                .role-option:hover {
                    border-color: rgba(99,102,241,0.5);
                }
            `}</style>
        </div>
    );
}

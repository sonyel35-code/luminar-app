import Link from 'next/link';
import Image from 'next/image';
import { login } from './actions';

export default function LoginPage({ searchParams }: { searchParams: { error?: string, message?: string } }) {
    return (
        <div className="bg-animated-mesh" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card glass-panel" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'float 6s ease-in-out infinite' }}>
                <div style={{ textAlign: 'center' }}>
                    <Image src="/logo.png" alt="Luminar Logo" width={64} height={64} priority style={{ margin: '0 auto 1rem', borderRadius: 'var(--radius-md)' }} />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bienvenido a Luminar</h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Ingresa tus credenciales para acceder al portal
                    </p>
                </div>

                {searchParams?.error && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--error-bg)', color: 'var(--error-fg)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', textAlign: 'center' }}>
                        {searchParams.error}
                    </div>
                )}
                {searchParams?.message && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--success-bg)', color: 'var(--success-fg)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', textAlign: 'center' }}>
                        {searchParams.message}
                    </div>
                )}

                <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>Correo Electrónico</label>
                        <input
                            id="email" name="email" type="email" required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', outline: 'none', transition: 'border-color 0.2s' }}
                            placeholder="tu@colegio.edu"
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>Contraseña</label>
                            <Link href="#" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>¿Olvidaste tu contraseña?</Link>
                        </div>
                        <input
                            id="password" name="password" type="password" required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', outline: 'none', transition: 'border-color 0.2s' }}
                        />
                    </div>

                    <button type="submit" className="btn-futuristic" style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Ingresar
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    ¿No tienes cuenta?{' '}
                    <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Solicitar acceso →
                    </Link>
                </div>
            </div>
        </div>
    );
}

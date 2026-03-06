import Link from 'next/link';

export default function GlobalNotFound() {
    return (
        <div suppressHydrationWarning style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', textAlign: 'center'
        }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem' }}>
                Página no encontrada
            </h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem', maxWidth: '400px' }}>
                Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
            <Link href="/" style={{
                padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 600
            }}>
                Volver al Inicio
            </Link>
        </div>
    );
}

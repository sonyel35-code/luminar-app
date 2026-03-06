import Link from 'next/link';

export default function ProgramsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="flex-between p-6 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}><Link href="/">Luminar</Link></h1>
            </header>
            <main className="flex-1 flex flex-col pt-24 pb-12 items-center text-center" style={{ paddingInline: '2rem' }}>
                <h2 style={{ fontSize: '3.5rem', lineHeight: 1.1, color: 'var(--card-foreground)' }}>Programas Académicos</h2>
                <p style={{ marginTop: '1rem', color: 'var(--muted-foreground)' }}>Esta página está en construcción.</p>
                <Link href="/" style={{ marginTop: '2rem', color: 'var(--primary)', fontWeight: 600 }}>Volver al Inicio</Link>
            </main>
        </div>
    );
}

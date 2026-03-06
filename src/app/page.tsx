import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex-between p-6 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="flex-center" style={{ gap: '0.5rem' }}>
          <Image src="/logo.png" alt="Luminar Logo" width={40} height={40} priority style={{ borderRadius: 'var(--radius-sm)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>Luminar</h1>
        </div>
        <nav>
          <ul className="flex-center" style={{ gap: '2rem' }}>
            <li><Link href="/" style={{ fontWeight: 500 }}>Inicio</Link></li>
            <li><Link href="/about" style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}>Quiénes Somos</Link></li>
            <li><Link href="/programs" style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}>Programas</Link></li>
            <li><Link href="/student-life" style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}>Vida Estudiantil</Link></li>
            <li><Link href="/contact" style={{ fontWeight: 500, color: 'var(--muted-foreground)' }}>Contacto</Link></li>
          </ul>
        </nav>
        <div>
          <Link href="/login" style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            padding: '0.625rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 500,
            boxShadow: 'var(--shadow-sm)'
          }}>
            Ingresar al Portal
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col pt-24 pb-12 items-center text-center" style={{ paddingInline: '2rem' }}>
        <h2 style={{ fontSize: '3.5rem', lineHeight: 1.1, color: 'var(--card-foreground)', maxWidth: '800px', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
          El Ecosistema Educativo <br /><span style={{ color: 'var(--primary)' }}>del Futuro</span>
        </h2>
        <p style={{ fontSize: '1.25rem', color: 'var(--muted-foreground)', maxWidth: '600px', marginBottom: '3rem', lineHeight: 1.6 }}>
          Luminar conecta a padres, docentes y estudiantes en una plataforma centralizada que potencia el rendimiento académico mediante datos en tiempo real y comunicación segura.
        </p>

        <div className="flex-center" style={{ gap: '1rem' }}>
          <Link href="/login" style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            padding: '1rem 2rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '1.125rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            Acceder a Mi Cuenta
          </Link>
          <Link href="/contact" style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--card-foreground)',
            padding: '1rem 2rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '1.125rem'
          }}>
            Solicitar Admisión
          </Link>
        </div>
      </main>

      {/* Features snippet */}
      <section className="p-12" style={{ backgroundColor: 'var(--card)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '1.25rem' }}>Análisis Predictivo</h3>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.5 }}>Algoritmos avanzados que permiten a los docentes identificar áreas de mejora y planes de recuperación automática.</p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--success-fg)', fontSize: '1.25rem' }}>Control Activo</h3>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.5 }}>Los padres reciben notificaciones inmediatas sobre la asistencia y rendimiento de sus hijos.</p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--warning-fg)', fontSize: '1.25rem' }}>Desarrollo Integral</h3>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.5 }}>Evaluación profunda basada en múltiples competencias, no solo números estáticos.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-8 text-center" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
        <p>&copy; 2026 Luminar Ecosistema Educativo. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

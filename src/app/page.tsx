'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  Shield,
  Zap,
  ArrowRight,
  GraduationCap,
  Star,
  BarChart3,
  CheckCircle2,
  Globe,
  Sparkles,
  Heart,
  TrendingUp,
  Award,
  Menu,
  X,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════
   Luminar — Página Principal v2.1 (Responsive)
   Mobile-First: 320px → 768px → 1024px → 1280px+
   ═══════════════════════════════════════════════════ */

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Inicio', active: true },
    { href: '/about', label: 'Nosotros' },
    { href: '/programs', label: 'Programas' },
    { href: '/student-life', label: 'Comunidad' },
    { href: '/contact', label: 'Contacto' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-animated-mesh">

      {/* ────────── Header ────────── */}
      <header
        className="sticky top-0 z-50 w-full glass-panel border-b"
        style={{ paddingBlock: '0.875rem', position: 'relative' }}
      >
        <div className="container-7xl flex-between">

          {/* Logo */}
          <div className="flex-center" style={{ gap: '0.65rem' }}>
            <div
              style={{
                padding: '0.35rem',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                boxShadow: '0 4px 12px rgba(13,148,136,0.25)',
                flexShrink: 0,
              }}
            >
              <Image src="/logo.png" alt="Luminar Logo" width={28} height={28} priority />
            </div>
            <h1
              className="text-gradient"
              style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 800, letterSpacing: '-0.03em' }}
            >
              Luminar
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hide-mobile" style={{ display: 'none' }} aria-label="Navegación principal">
            {/* override hide-mobile to flex for md+ via css class */}
          </nav>
          <nav
            aria-label="Navegación principal"
            style={{
              display: 'none',
            }}
            className="hide-mobile"
          >
            <ul className="flex-center" style={{ gap: '2rem' }}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: link.active ? 600 : 500,
                      color: link.active ? 'var(--primary)' : 'var(--muted-foreground)',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right actions */}
          <div className="flex-center" style={{ gap: '0.75rem' }}>
            {/* CTA — desktop */}
            <Link
              href="/login"
              className="btn-futuristic hide-mobile"
              style={{
                padding: '0.625rem 1.35rem',
                borderRadius: '2rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                display: 'none', /* overridden by .hide-mobile */
              }}
            >
              Entrar al Portal
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className={`hamburger-btn show-mobile${mobileMenuOpen ? ' open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        <nav className={`mobile-nav${mobileMenuOpen ? ' open' : ''}`} aria-label="Menú móvil">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: link.active ? 'var(--primary)' : 'var(--foreground)',
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-futuristic"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '0.875rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              marginTop: '0.75rem',
              fontSize: '1rem',
            }}
          >
            Entrar al Portal
          </Link>
        </nav>
      </header>

      {/* ────────── Main ────────── */}
      <main className="flex-1">

        {/* ═══ Hero Section ═══ */}
        <section style={{ position: 'relative', paddingBlock: 'clamp(3rem, 8vw, 6rem) clamp(4rem, 10vw, 8rem)' }}>
          <div className="container-7xl grid-2" style={{ alignItems: 'center', gap: 'clamp(2rem, 5vw, 4rem)' }}>

            {/* Left Column — Text */}
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 1rem',
                  borderRadius: '2rem',
                  backgroundColor: 'rgba(13, 148, 136, 0.08)',
                  border: '1px solid rgba(13, 148, 136, 0.2)',
                  color: 'var(--primary)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  letterSpacing: '0.04em',
                  flexWrap: 'nowrap',
                }}
              >
                <Sparkles size={13} />
                ECOSISTEMA EDUCATIVO INTELIGENTE
              </div>

              <h2
                style={{
                  fontSize: 'clamp(2rem, 6vw, 4.25rem)',
                  fontWeight: 900,
                  lineHeight: 1.08,
                  color: 'var(--foreground)',
                  marginBottom: '1.25rem',
                  letterSpacing: '-0.04em',
                }}
              >
                Educación que{' '}
                <span className="text-gradient">Transforma</span>,<br />
                Futuro que{' '}
                <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Inspira</span>.
              </h2>

              <p
                style={{
                  fontSize: 'clamp(0.95rem, 2vw, 1.125rem)',
                  color: 'var(--muted-foreground)',
                  marginBottom: '2rem',
                  maxWidth: '540px',
                  lineHeight: 1.7,
                }}
              >
                Luminar unifica aprendizaje, comunicación y gestión académica en una plataforma
                diseñada para potenciar el éxito de estudiantes, docentes y familias.
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem' }}>
                <Link
                  href="/login"
                  className="btn-futuristic"
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2.5rem)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                  }}
                >
                  Comenzar Ahora <ArrowRight size={18} />
                </Link>
                <Link
                  href="/contact"
                  className="glass-panel"
                  style={{
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2.5rem)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
                    fontWeight: 700,
                    color: 'var(--foreground)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <BookOpen size={17} /> Saber Más
                </Link>
              </div>

              {/* Social Proof */}
              <div
                style={{
                  marginTop: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={15} fill="var(--warning)" color="var(--warning)" />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--muted-foreground)',
                  }}
                >
                  Confianza total de +100 instituciones líderes
                </span>
              </div>
            </div>

            {/* Right Column — Hero Image (hidden on small mobile) */}
            <div
              style={{ position: 'relative' }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: '-2rem',
                  background: 'radial-gradient(circle, rgba(13, 148, 136, 0.12) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />
              <div
                className="animate-float"
                style={{
                  position: 'relative',
                  backgroundColor: 'white',
                  padding: 'clamp(0.4rem, 1.5vw, 0.75rem)',
                  borderRadius: 'clamp(1rem, 3vw, 2rem)',
                  boxShadow: '0 25px 60px -12px rgba(13, 148, 136, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                <Image
                  src="/hero-futuristic.png"
                  alt="Ambiente Educativo Moderno"
                  width={600}
                  height={500}
                  style={{
                    borderRadius: 'clamp(0.75rem, 2vw, 1.5rem)',
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    objectFit: 'cover',
                  }}
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Trusted By Strip ═══ */}
        <section
          style={{
            paddingBlock: '2rem',
            borderBlock: '1px solid var(--border)',
            backgroundColor: 'rgba(255,255,255,0.3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="container-7xl"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(1.25rem, 4vw, 3rem)',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                flexShrink: 0,
              }}
            >
              Confiado por
            </span>
            {['Ministerio de Educación', 'UNESCO', 'BID Educación', 'UNICEF'].map((org) => (
              <span
                key={org}
                style={{
                  fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
                  fontWeight: 700,
                  color: 'var(--muted-foreground)',
                  opacity: 0.5,
                  letterSpacing: '-0.01em',
                }}
              >
                {org}
              </span>
            ))}
          </div>
        </section>

        {/* ═══ Features Section ═══ */}
        <section
          style={{
            backgroundColor: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(20px)',
            paddingBlock: 'clamp(3.5rem, 8vw, 6rem)',
          }}
        >
          <div className="container-7xl">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 4rem)' }}>
              <div className="section-divider" />
              <h2
                style={{
                  fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
                  fontWeight: 800,
                  color: 'var(--foreground)',
                  marginBottom: '1rem',
                  letterSpacing: '-0.03em',
                }}
              >
                Diseñado para la Excelencia
              </h2>
              <p
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 'clamp(0.9rem, 2vw, 1.125rem)',
                  maxWidth: '600px',
                  marginInline: 'auto',
                  lineHeight: 1.6,
                }}
              >
                Herramientas de última generación para una comunidad educativa conectada y empoderada.
              </p>
            </div>

            <div className="grid-3">
              {[
                {
                  icon: <BarChart3 size={30} color="var(--primary)" />,
                  title: 'Análisis Inteligente',
                  desc: 'Métricas de rendimiento en tiempo real para identificar oportunidades antes de que se conviertan en retos académicos.',
                  badge: 'Tiempo Real',
                },
                {
                  icon: <Shield size={30} color="var(--success)" />,
                  title: 'Seguridad Total',
                  desc: 'Datos académicos y personales protegidos con los estándares criptográficos más altos. Cumplimiento FERPA & COPPA.',
                  badge: 'Zero Trust',
                },
                {
                  icon: <GraduationCap size={30} color="var(--accent)" />,
                  title: 'Éxito Estudiantil',
                  desc: 'Perfiles personalizados y seguimiento de competencias humanas que fomentan el desarrollo integral del estudiante.',
                  badge: 'Personalizado',
                },
              ].map((item, i) => (
                <div key={i} className="card" style={{ textAlign: 'center' }}>
                  <div
                    className="flex-center"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '1.25rem',
                      backgroundColor: 'var(--muted)',
                      marginInline: 'auto',
                      marginBottom: '1.25rem',
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--primary)',
                      backgroundColor: 'rgba(13, 148, 136, 0.08)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '2rem',
                      marginBottom: '1rem',
                    }}
                  >
                    {item.badge}
                  </span>
                  <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 700, marginBottom: '0.75rem' }}>
                    {item.title}
                  </h3>
                  <p
                    style={{
                      color: 'var(--muted-foreground)',
                      lineHeight: 1.65,
                      fontSize: 'clamp(0.875rem, 1.8vw, 0.95rem)',
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Statistics Section ═══ */}
        <section style={{ paddingBlock: 'clamp(3rem, 7vw, 5rem)' }}>
          <div className="container-7xl">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3.5rem)' }}>
              <div className="section-divider" />
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                  fontWeight: 800,
                  color: 'var(--foreground)',
                  letterSpacing: '-0.03em',
                }}
              >
                Impacto Real en Números
              </h2>
            </div>

            <div className="grid-4">
              {[
                { icon: <Users size={26} color="var(--primary)" />, value: '+500', label: 'Estudiantes' },
                { icon: <Award size={26} color="var(--accent)" />, value: '+50', label: 'Docentes' },
                { icon: <Heart size={26} color="var(--error)" />, value: '98%', label: 'Satisfacción' },
                { icon: <TrendingUp size={26} color="var(--success)" />, value: '+100', label: 'Cursos Activos' },
              ].map((stat, i) => (
                <div key={i} className="stat-card">
                  <div
                    className="flex-center"
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--muted)',
                      marginInline: 'auto',
                      marginBottom: '1.125rem',
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                      fontWeight: 900,
                      color: 'var(--foreground)',
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Why Luminar Section ═══ */}
        <section
          style={{
            paddingBlock: 'clamp(3.5rem, 8vw, 6rem)',
            backgroundColor: 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(16px)',
            borderBlock: '1px solid var(--border)',
          }}
        >
          <div className="container-7xl grid-2" style={{ alignItems: 'center', gap: 'clamp(2rem, 5vw, 4rem)' }}>
            <div>
              <div className="section-divider" style={{ marginInline: '0' }} />
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                  fontWeight: 800,
                  color: 'var(--foreground)',
                  marginBottom: '1.25rem',
                  letterSpacing: '-0.03em',
                }}
              >
                ¿Por qué Luminar?
              </h2>
              <p
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
                  lineHeight: 1.7,
                  marginBottom: '1.75rem',
                  maxWidth: '480px',
                }}
              >
                Porque la educación merece herramientas que estén a la altura de su importancia.
                Luminar no es solo software — es un ecosistema pensado para que cada actor de la
                comunidad educativa alcance su máximo potencial.
              </p>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  'Dashboard personalizado para cada rol',
                  'Comunicación segura entre docentes y familias',
                  'Registro de calificaciones y asistencia en tiempo real',
                  'Reportes y analytics para decisiones informadas',
                  'Accesible desde cualquier dispositivo, en cualquier momento',
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      fontSize: 'clamp(0.875rem, 2vw, 0.95rem)',
                      color: 'var(--foreground)',
                      fontWeight: 500,
                      lineHeight: 1.5,
                    }}
                  >
                    <CheckCircle2
                      size={19}
                      color="var(--success)"
                      style={{ flexShrink: 0, marginTop: '1px' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Side — Feature Cards */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--secondary) 0%, rgba(13,148,136,0.05) 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(1.5rem, 4vw, 3rem)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {[
                {
                  icon: <Globe size={22} color="var(--primary)" />,
                  title: 'Acceso Universal',
                  desc: 'Plataforma web responsive accesible desde cualquier navegador.',
                },
                {
                  icon: <Zap size={22} color="var(--warning)" />,
                  title: 'Rendimiento Ultra Rápido',
                  desc: 'Tiempos de carga menores a 2 segundos, optimizado al máximo.',
                },
                {
                  icon: <Shield size={22} color="var(--success)" />,
                  title: 'Cumplimiento Normativo',
                  desc: 'Estándares FERPA, COPPA y protección de datos estudiantiles.',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    padding: 'clamp(0.875rem, 2vw, 1.25rem)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="flex-center"
                    style={{
                      width: '42px',
                      height: '42px',
                      minWidth: '42px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--muted)',
                    }}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h4
                      style={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        marginBottom: '0.2rem',
                        color: 'var(--foreground)',
                      }}
                    >
                      {feature.title}
                    </h4>
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--muted-foreground)',
                        lineHeight: 1.5,
                      }}
                    >
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Final CTA ═══ */}
        <section style={{ paddingBlock: 'clamp(3.5rem, 8vw, 6rem) clamp(4rem, 10vw, 8rem)' }}>
          <div className="container-7xl" style={{ position: 'relative' }}>
            <div
              style={{
                backgroundColor: '#0a0f1a',
                borderRadius: 'clamp(1.25rem, 4vw, 2.5rem)',
                padding: 'clamp(3rem, 8vw, 5rem) clamp(1.5rem, 5vw, 3rem)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Glow Effects */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '250px',
                  height: '250px',
                  background: 'var(--primary)',
                  filter: 'blur(100px)',
                  opacity: 0.15,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '250px',
                  height: '250px',
                  background: 'var(--accent)',
                  filter: 'blur(100px)',
                  opacity: 0.15,
                }}
              />

              <h2
                style={{
                  fontSize: 'clamp(1.6rem, 5vw, 3rem)',
                  fontWeight: 900,
                  color: 'white',
                  marginBottom: '1.25rem',
                  position: 'relative',
                  letterSpacing: '-0.03em',
                }}
              >
                ¿Listo para transformar tu institución?
              </h2>
              <p
                style={{
                  color: '#94a3b8',
                  fontSize: 'clamp(0.9rem, 2vw, 1.125rem)',
                  marginBottom: '2.5rem',
                  maxWidth: '560px',
                  marginInline: 'auto',
                  lineHeight: 1.6,
                  position: 'relative',
                }}
              >
                Únete a la nueva era donde el docente lidera, el estudiante brilla y las familias
                participan del éxito educativo.
              </p>

              <div
                className="flex-center"
                style={{ gap: '1rem', flexWrap: 'wrap', position: 'relative' }}
              >
                <Link
                  href="/login"
                  className="btn-futuristic"
                  style={{
                    padding: 'clamp(0.875rem, 2vw, 1.125rem) clamp(1.75rem, 5vw, 3rem)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'clamp(0.95rem, 2vw, 1.125rem)',
                    fontWeight: 800,
                  }}
                >
                  Solicitar Acceso
                </Link>
                <Link
                  href="/contact"
                  style={{
                    padding: 'clamp(0.875rem, 2vw, 1.125rem) clamp(1.75rem, 5vw, 3rem)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                    fontWeight: 700,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    fontSize: 'clamp(0.95rem, 2vw, 1.125rem)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Contáctanos
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ────────── Footer ────────── */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          paddingBlock: 'clamp(2rem, 5vw, 3.5rem)',
          backgroundColor: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="container-7xl">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
            }}
          >
            {/* Brand */}
            <div className="flex-center" style={{ gap: '0.65rem' }}>
              <Image src="/logo.png" alt="Luminar Logo" width={22} height={22} />
              <span style={{ fontWeight: 800, color: 'var(--foreground)', fontSize: '0.95rem' }}>Luminar.</span>
            </div>

            {/* Links */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(1rem, 4vw, 2.5rem)',
                flexWrap: 'wrap',
              }}
            >
              {[
                { href: '/about', label: 'Nosotros' },
                { href: '/programs', label: 'Programas' },
                { href: '/contact', label: 'Contacto' },
                { href: '/login', label: 'Portal' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: link.label === 'Portal' ? 'var(--primary)' : 'var(--muted-foreground)',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Copyright */}
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--muted-foreground)',
                fontWeight: 500,
              }}
            >
              © 2026 Luminar Ecosistema Educativo.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

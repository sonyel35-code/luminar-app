import Link from 'next/link';
import { LogOut, Home, BookOpen, Users, UserCog, Settings, Bell, UserPlus, Mail, GraduationCap, Heart, ShieldCheck, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logout } from '@/app/login/actions';
import { countUnread } from '@/app/portal/messages/actions';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

    const initials = profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'US';
    const avatarUrl = profile?.avatar_url;
    const role = profile?.role || 'teacher';
    const unreadMessages = user ? await countUnread(user.id) : 0;

    // Count pending registration requests (admin only)
    let pendingCount = 0;
    if (role === 'admin') {
        const { count } = await supabase
            .from('pending_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
        pendingCount = count || 0;
    }

    const roleLabels: Record<string, { label: string; color: string }> = {
        admin: { label: 'Administrador', color: '#ef4444' },
        teacher: { label: 'Docente', color: 'var(--primary)' },
        parent: { label: 'Representante', color: 'var(--accent)' },
        student: { label: 'Estudiante', color: '#10b981' },
    };
    const roleInfo = roleLabels[role] || roleLabels.teacher;

    /* ── Navigation groups by role ── */
    const isAdminOrTeacher = role === 'admin' || role === 'teacher';
    const isParent = role === 'parent';

    return (
        <div suppressHydrationWarning className="bg-animated-mesh" style={{ display: 'flex', height: '100vh', padding: '1.5rem', boxSizing: 'border-box' }}>
            <div suppressHydrationWarning className="glass-panel" style={{ display: 'flex', width: '100%', height: '100%', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>

                {/* ── Sidebar */}
                <aside style={{ width: '275px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '1.5rem', flexShrink: 0, backgroundColor: 'rgba(var(--card), 0.3)' }}>
                    <div suppressHydrationWarning style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>

                        {/* Logo */}
                        <div suppressHydrationWarning style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <GraduationCap size={30} color="var(--primary)" />
                            <span style={{ fontSize: '1.35rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>Luminar</span>
                        </div>

                        {/* User Profile Card */}
                        <div suppressHydrationWarning style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem', backgroundColor: 'rgba(var(--card), 0.5)' }}>
                            {avatarUrl?.startsWith('emoji:') ? (
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(192,132,252,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                                    {avatarUrl.replace('emoji:', '')}
                                </div>
                            ) : avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                                    {initials}
                                </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'Usuario'}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: roleInfo.color, marginTop: '0.1rem' }}>{roleInfo.label}</div>
                            </div>
                        </div>

                        {/* ── Navigation */}
                        <div style={{ flex: 1, overflowY: 'auto' }}>

                            {/* Admin / Teacher nav */}
                            {isAdminOrTeacher && (
                                <>
                                    <div className="nav-section-label">Vista General</div>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', marginBottom: '1.5rem' }}>
                                        <li><Link href="/portal" className="sidebar-link"><Home size={17} /> Dashboard</Link></li>
                                        <li><Link href="/portal/courses" className="sidebar-link"><BookOpen size={17} /> Cursos</Link></li>
                                        <li><Link href="/portal/students" className="sidebar-link"><Users size={17} /> Estudiantes</Link></li>
                                        <li><Link href="/portal/enrollments" className="sidebar-link"><UserPlus size={17} /> Matrículas</Link></li>
                                        <li>
                                            <Link href="/portal/grades" className="sidebar-link">
                                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                                Calificaciones
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/portal/messages" className="sidebar-link" style={{ position: 'relative' }}>
                                                <Mail size={17} /> Mensajes
                                                {unreadMessages > 0 && (
                                                    <span style={{ marginLeft: 'auto', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>
                                                        {unreadMessages}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                        <li><Link href="/portal/teachers" className="sidebar-link"><UserCog size={17} /> Profesores</Link></li>
                                        <li><Link href="/portal/representantes" className="sidebar-link"><Heart size={17} /> Representantes</Link></li>
                                        <li><Link href="/portal/incidencias" className="sidebar-link"><AlertTriangle size={17} /> Incidencias</Link></li>
                                        {role === 'admin' && (
                                            <li>
                                                <Link href="/portal/management" className="sidebar-link" style={{ position: 'relative' }}>
                                                    <ShieldCheck size={17} /> Solicitudes de Acceso
                                                    {pendingCount > 0 && (
                                                        <span style={{ marginLeft: 'auto', backgroundColor: '#ef4444', color: 'white', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>
                                                            {pendingCount}
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        )}
                                    </ul>

                                    <div className="nav-section-label">Cuenta</div>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                                        <li><Link href="/portal/settings" className="sidebar-link"><Settings size={17} /> Configuración</Link></li>
                                    </ul>
                                </>
                            )}

                            {/* Parent nav */}
                            {isParent && (
                                <>
                                    <div className="nav-section-label">Mi Familia</div>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', marginBottom: '1.5rem' }}>
                                        <li><Link href="/portal/parent" className="sidebar-link"><Heart size={17} /> Progreso de mis hijos</Link></li>
                                        <li><Link href="/portal/incidencias" className="sidebar-link"><AlertTriangle size={17} /> Incidencias</Link></li>
                                        <li>
                                            <Link href="/portal/messages" className="sidebar-link">
                                                <Mail size={17} /> Mensajes
                                                {unreadMessages > 0 && (
                                                    <span style={{ marginLeft: 'auto', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>
                                                        {unreadMessages}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    </ul>
                                    <div className="nav-section-label">Cuenta</div>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                                        <li><Link href="/portal/settings" className="sidebar-link"><Settings size={17} /> Configuración</Link></li>
                                    </ul>
                                </>
                            )}

                            {/* Student nav (future) */}
                            {role === 'student' && (
                                <>
                                    <div className="nav-section-label">Mi Aprendizaje</div>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', marginBottom: '1.5rem' }}>
                                        <li><Link href="/portal" className="sidebar-link"><Home size={17} /> Dashboard</Link></li>
                                        <li><Link href="/portal/courses" className="sidebar-link"><BookOpen size={17} /> Mis Cursos</Link></li>
                                        <li>
                                            <Link href="/portal/messages" className="sidebar-link">
                                                <Mail size={17} /> Mensajes
                                                {unreadMessages > 0 && (
                                                    <span style={{ marginLeft: 'auto', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>
                                                        {unreadMessages}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    </ul>
                                    <div className="nav-section-label">Cuenta</div>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                                        <li><Link href="/portal/settings" className="sidebar-link"><Settings size={17} /> Configuración</Link></li>
                                    </ul>
                                </>
                            )}
                        </div>

                        {/* Logout */}
                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <form action={logout}>
                                <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: 500, padding: '0.5rem 0.75rem', width: '100%', borderRadius: 'var(--radius-md)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <LogOut size={18} /> Cerrar Sesión
                                </button>
                            </form>
                        </div>
                    </div>
                </aside>

                {/* ── Main Content Area */}
                <div suppressHydrationWarning style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'transparent', minWidth: 0 }}>
                    {/* Topbar */}
                    <header suppressHydrationWarning style={{ height: '64px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 2rem', backgroundColor: 'rgba(var(--card), 0.3)', backdropFilter: 'blur(8px)', gap: '1rem', flexShrink: 0 }}>
                        <Link href="/portal/messages" style={{ position: 'relative', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
                            <Bell size={20} />
                            {unreadMessages > 0 && (
                                <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700 }}>
                                    {unreadMessages > 9 ? '9+' : unreadMessages}
                                </span>
                            )}
                        </Link>
                        {avatarUrl?.startsWith('emoji:') ? (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(192,132,252,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                                {avatarUrl.replace('emoji:', '')}
                            </div>
                        ) : avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '0.85rem' }}>
                                {initials}
                            </div>
                        )}
                    </header>

                    <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                        {children}
                    </main>
                </div>
            </div>

            <style>{`
        .nav-section-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--muted-foreground);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          letter-spacing: 0.08em;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          color: var(--muted-foreground);
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: var(--radius-md);
          transition: all 0.2s;
        }
        .sidebar-link:hover {
          background-color: var(--secondary);
          color: var(--foreground);
        }
        .sidebar-link.active {
          background-color: var(--secondary);
          color: var(--foreground);
          font-weight: 600;
        }
      `}</style>
        </div>
    );
}

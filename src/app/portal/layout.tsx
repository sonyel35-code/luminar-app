import Link from 'next/link';
import { LogOut, Home, BookOpen, Users, UserCog, Settings, UserPlus, Mail, GraduationCap, Heart, ShieldCheck, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logout } from '@/app/login/actions';
import { countUnread } from '@/app/portal/messages/actions';
import { PortalShell } from './PortalShell';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

    const initials = profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'US';
    const avatarUrl = profile?.avatar_url;
    const role = profile?.role || 'teacher';
    const unreadMessages = user ? await countUnread(user.id) : 0;

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

    const isAdminOrTeacher = role === 'admin' || role === 'teacher';
    const isParent = role === 'parent';

    /* ── Avatar node (server-rendered HTML, passed as a prop to PortalShell) */
    const avatarNode = avatarUrl?.startsWith('emoji:') ? (
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(192,132,252,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
            {avatarUrl.replace('emoji:', '')}
        </div>
    ) : avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
    ) : (
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '0.85rem' }}>
            {initials}
        </div>
    );

    /* ── Sidebar content (server-rendered) */
    const sidebarContent = (
        <>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <GraduationCap size={30} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span className="logo-text" style={{ fontSize: '1.35rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>Luminar</span>
            </div>

            {/* User card */}
            <div className="user-card-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem', backgroundColor: 'rgba(255,255,255,0.5)', transition: 'all 0.3s' }}>
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
                <div className="user-text" style={{ minWidth: 0, transition: 'opacity 0.2s' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'Usuario'}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: roleInfo.color, marginTop: '0.1rem' }}>{roleInfo.label}</div>
                </div>
            </div>

            {/* Navigation */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {isAdminOrTeacher && (
                    <>
                        <div className="nav-section-label">Vista General</div>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', marginBottom: '1.5rem' }}>
                            <li><Link href="/portal" className="sidebar-link" title="Dashboard"><Home size={17} style={{ flexShrink: 0 }} /> <span className="sidebar-text">Dashboard</span></Link></li>
                            <li><Link href="/portal/courses" className="sidebar-link" title="Cursos"><BookOpen size={17} style={{ flexShrink: 0 }} /> <span className="sidebar-text">Cursos</span></Link></li>
                            <li><Link href="/portal/students" className="sidebar-link" title="Estudiantes"><Users size={17} style={{ flexShrink: 0 }} /> <span className="sidebar-text">Estudiantes</span></Link></li>
                            <li><Link href="/portal/enrollments" className="sidebar-link" title="Matrículas"><UserPlus size={17} style={{ flexShrink: 0 }} /> <span className="sidebar-text">Matrículas</span></Link></li>
                            <li>
                                <Link href="/portal/grades" className="sidebar-link" title="Calificaciones">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                    <span className="sidebar-text">Calificaciones</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/portal/messages" className="sidebar-link" title="Mensajes" style={{ position: 'relative' }}>
                                    <Mail size={17} style={{ flexShrink: 0 }} />
                                    <span className="sidebar-text" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        Mensajes
                                        {unreadMessages > 0 && (
                                            <span style={{ marginLeft: 'auto', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
                                                {unreadMessages}
                                            </span>
                                        )}
                                    </span>
                                </Link>
                            </li>
                            <li><Link href="/portal/teachers" className="sidebar-link" title="Profesores"><UserCog size={17} style={{ flexShrink: 0 }} /> <span className="sidebar-text">Profesores</span></Link></li>
                            <li><Link href="/portal/representantes" className="sidebar-link" title="Representantes"><Heart size={17} style={{ flexShrink: 0 }} /> <span className="sidebar-text">Representantes</span></Link></li>
                            <li><Link href="/portal/incidencias" className="sidebar-link" title="Incidencias"><AlertTriangle size={17} style={{ flexShrink: 0 }} /> <span className="sidebar-text">Incidencias</span></Link></li>
                            {role === 'admin' && (
                                <li>
                                    <Link href="/portal/management" className="sidebar-link" title="Solicitudes de Acceso">
                                        <ShieldCheck size={17} style={{ flexShrink: 0 }} />
                                        <span className="sidebar-text" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            Solicitudes
                                            {pendingCount > 0 && (
                                                <span style={{ marginLeft: 'auto', backgroundColor: '#ef4444', color: 'white', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
                                                    {pendingCount}
                                                </span>
                                            )}
                                        </span>
                                    </Link>
                                </li>
                            )}
                        </ul>
                        <div className="nav-section-label">Cuenta</div>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                            <li><Link href="/portal/settings" className="sidebar-link" title="Configuración"><Settings size={17} style={{ flexShrink: 0 }} /> <span className="sidebar-text">Configuración</span></Link></li>
                        </ul>
                    </>
                )}

                {isParent && (
                    <>
                        <div className="nav-section-label">Mi Familia</div>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', marginBottom: '1.5rem' }}>
                            <li><Link href="/portal/parent" className="sidebar-link" title="Progreso de mis hijos"><Heart size={17} style={{ flexShrink: 0 }} /> <span className="sidebar-text">Progreso de mis hijos</span></Link></li>
                            <li><Link href="/portal/incidencias" className="sidebar-link" title="Incidencias"><AlertTriangle size={17} style={{ flexShrink: 0 }} /> <span className="sidebar-text">Incidencias</span></Link></li>
                            <li>
                                <Link href="/portal/messages" className="sidebar-link" title="Mensajes">
                                    <Mail size={17} style={{ flexShrink: 0 }} />
                                    <span className="sidebar-text" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        Mensajes
                                        {unreadMessages > 0 && (
                                            <span style={{ marginLeft: 'auto', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
                                                {unreadMessages}
                                            </span>
                                        )}
                                    </span>
                                </Link>
                            </li>
                        </ul>
                        <div className="nav-section-label">Cuenta</div>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                            <li><Link href="/portal/settings" className="sidebar-link" title="Configuración"><Settings size={17} style={{ flexShrink: 0 }} /> <span className="sidebar-text">Configuración</span></Link></li>
                        </ul>
                    </>
                )}

                {role === 'student' && (
                    <>
                        <div className="nav-section-label">Mi Aprendizaje</div>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', marginBottom: '1.5rem' }}>
                            <li><Link href="/portal" className="sidebar-link" title="Dashboard"><Home size={17} style={{ flexShrink: 0 }} /> <span className="sidebar-text">Dashboard</span></Link></li>
                            <li><Link href="/portal/courses" className="sidebar-link" title="Mis Cursos"><BookOpen size={17} style={{ flexShrink: 0 }} /> <span className="sidebar-text">Mis Cursos</span></Link></li>
                            <li>
                                <Link href="/portal/messages" className="sidebar-link" title="Mensajes">
                                    <Mail size={17} style={{ flexShrink: 0 }} />
                                    <span className="sidebar-text" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        Mensajes
                                        {unreadMessages > 0 && (
                                            <span style={{ marginLeft: 'auto', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '1rem', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
                                                {unreadMessages}
                                            </span>
                                        )}
                                    </span>
                                </Link>
                            </li>
                        </ul>
                        <div className="nav-section-label">Cuenta</div>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                            <li><Link href="/portal/settings" className="sidebar-link" title="Configuración"><Settings size={17} style={{ flexShrink: 0 }} /> <span className="sidebar-text">Configuración</span></Link></li>
                        </ul>
                    </>
                )}
            </div>

            {/* Logout */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                <form action={logout}>
                    <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: 500, padding: '0.5rem 0.75rem', width: '100%', borderRadius: 'var(--radius-md)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <LogOut size={18} style={{ flexShrink: 0 }} /> <span className="logout-text" style={{ transition: 'opacity 0.2s' }}>Cerrar Sesión</span>
                    </button>
                </form>
            </div>
        </>
    );

    return (
        <PortalShell
            sidebarContent={sidebarContent}
            avatarNode={avatarNode}
            unreadMessages={unreadMessages}
        >
            {children}
        </PortalShell>
    );
}

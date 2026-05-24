'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PortalShellProps {
    sidebarContent: React.ReactNode;
    children: React.ReactNode;
    avatarNode: React.ReactNode;
    unreadMessages: number;
}

/**
 * PortalShell — client component that owns the responsive layout state.
 * The server layout fetches data and passes pre-rendered server nodes as props.
 */
export function PortalShell({ sidebarContent, children, avatarNode, unreadMessages }: PortalShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Read initial collapse state from localStorage on mount (hydration-safe)
    useEffect(() => {
        const saved = localStorage.getItem('portal-sidebar-collapsed');
        if (saved === 'true') {
            setIsCollapsed(true);
        }
    }, []);

    const toggleCollapse = () => {
        const newVal = !isCollapsed;
        setIsCollapsed(newVal);
        localStorage.setItem('portal-sidebar-collapsed', String(newVal));
    };

    // Close on route change
    useEffect(() => {
        const close = () => setSidebarOpen(false);
        window.addEventListener('popstate', close);
        return () => window.removeEventListener('popstate', close);
    }, []);

    // Lock body scroll when sidebar is open on mobile
    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen]);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div suppressHydrationWarning className={`bg-animated-mesh portal-root${isCollapsed ? ' sidebar-is-collapsed' : ''}`}>
            <div suppressHydrationWarning className="glass-panel portal-glass">

                {/* ── Backdrop (mobile) */}
                {sidebarOpen && (
                    <div
                        className="sidebar-backdrop"
                        onClick={closeSidebar}
                        aria-hidden="true"
                    />
                )}

                {/* ── Sidebar */}
                <aside className={`portal-sidebar${sidebarOpen ? ' open' : ''}${isCollapsed ? ' collapsed' : ''}`} style={{ position: 'relative' }}>
                    {/* Collapse toggle button on desktop (floating on the right border) */}
                    <button
                        onClick={toggleCollapse}
                        className="desktop-toggle-btn"
                        aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>

                    {/* Mobile close button */}
                    <div className="topbar-hamburger" style={{ marginLeft: 'auto', marginBottom: '0.75rem' }}>
                        <button
                            onClick={closeSidebar}
                            aria-label="Cerrar menú"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Sidebar nav — clicking any anchor link closes the sidebar on mobile */}
                    <div
                        style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}
                        onClick={(e) => {
                            if ((e.target as HTMLElement).closest('a, button[type="submit"]')) closeSidebar();
                        }}
                    >
                        {sidebarContent}
                    </div>
                </aside>

                {/* ── Main content area */}
                <div suppressHydrationWarning className="portal-main-area">
                    {/* Topbar */}
                    <header suppressHydrationWarning className="portal-topbar">
                        {/* Hamburger (mobile only, shown via CSS) */}
                        <button
                            className="topbar-hamburger"
                            onClick={() => setSidebarOpen(o => !o)}
                            aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        {/* Right side: bell + avatar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
                            <Link href="/portal/messages" style={{ position: 'relative', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
                                <Bell size={20} />
                                {unreadMessages > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '-4px', right: '-4px',
                                        backgroundColor: 'var(--primary)', color: 'white',
                                        borderRadius: '50%', width: '16px', height: '16px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.55rem', fontWeight: 700,
                                    }}>
                                        {unreadMessages > 9 ? '9+' : unreadMessages}
                                    </span>
                                )}
                            </Link>
                            {avatarNode}
                        </div>
                    </header>

                    <main className="portal-content">
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
      `}</style>
        </div>
    );
}

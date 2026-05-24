'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

/**
 * MobileSidebarWrapper
 * Wraps the sidebar and provides open/close toggle for mobile.
 * The server layout renders both the sidebar content (as children)
 * and the topbar hamburger button through this client boundary.
 */
export function MobileSidebarWrapper({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    // Close sidebar on route change (popstate)
    useEffect(() => {
        const close = () => setOpen(false);
        window.addEventListener('popstate', close);
        return () => window.removeEventListener('popstate', close);
    }, []);

    // Prevent body scroll while sidebar is open on mobile
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <>
            {/* Hamburger button rendered in the topbar (visible only on mobile via CSS) */}
            <button
                className="topbar-hamburger"
                onClick={() => setOpen(o => !o)}
                aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            >
                {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Backdrop — clicking closes the sidebar */}
            {open && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar panel */}
            <aside className={`portal-sidebar${open ? ' open' : ''}`}>
                {/* Close button inside sidebar (mobile only) */}
                <button
                    className="topbar-hamburger"
                    style={{ marginLeft: 'auto', marginBottom: '1rem' }}
                    onClick={() => setOpen(false)}
                    aria-label="Cerrar menú"
                >
                    <X size={20} />
                </button>

                {/* Sidebar content passed from server layout */}
                <div
                    style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}
                    onClick={() => setOpen(false)}  // any nav link click closes the menu
                    onClickCapture={e => {
                        // Only close if clicking an anchor link, not everything
                        if ((e.target as HTMLElement).closest('a')) setOpen(false);
                    }}
                >
                    {children}
                </div>
            </aside>
        </>
    );
}

'use client';

import React, { useEffect, useState, useTransition, useRef } from 'react';
import { getProfile, updateProfile, uploadAvatar, setPresetAvatar } from './actions';
import { UserCog, Moon, Sun, Save, Camera, Upload, Check } from 'lucide-react';

const PRESET_AVATARS = [
    { id: 'teacher-m', emoji: '👨‍🏫', label: 'Docente' },
    { id: 'teacher-f', emoji: '👩‍🏫', label: 'Docente' },
    { id: 'student-m', emoji: '👦', label: 'Estudiante' },
    { id: 'student-f', emoji: '👧', label: 'Estudiante' },
    { id: 'parent-m', emoji: '👨', label: 'Padre' },
    { id: 'parent-f', emoji: '👩', label: 'Madre' },
    { id: 'grad', emoji: '🎓', label: 'Graduado' },
    { id: 'star', emoji: '⭐', label: 'Estrella' },
    { id: 'rocket', emoji: '🚀', label: 'Cohete' },
    { id: 'book', emoji: '📚', label: 'Libros' },
    { id: 'brain', emoji: '🧠', label: 'Cerebro' },
    { id: 'robot', emoji: '🤖', label: 'Robot' },
    { id: 'alien', emoji: '👽', label: 'Alien' },
    { id: 'cat', emoji: '🐱', label: 'Gato' },
    { id: 'dog', emoji: '🐶', label: 'Perro' },
    { id: 'unicorn', emoji: '🦄', label: 'Unicornio' },
    { id: 'panda', emoji: '🐼', label: 'Panda' },
    { id: 'owl', emoji: '🦉', label: 'Búho' },
];

export default function PortalSettingsPage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [currentAvatar, setCurrentAvatar] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function load() {
            const data = await getProfile();
            setProfile(data);
            setCurrentAvatar(data?.avatar_url || '');
            setLoading(false);
        }
        load();
    }, []);

    const showMsg = (text: string, type: 'success' | 'error') => {
        setMsg({ text, type });
        setTimeout(() => setMsg(null), 4000);
    };

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set('avatar_url', currentAvatar);
        startTransition(async () => {
            const res = await updateProfile(formData);
            if (res.success) {
                showMsg(res.message, 'success');
                const newTheme = formData.get('theme') as string;
                if (newTheme) document.documentElement.setAttribute('data-theme', newTheme);
            } else {
                showMsg(res.message || 'Error', 'error');
            }
        });
    };

    const handlePresetClick = (emoji: string) => {
        const emojiAvatar = `emoji:${emoji}`;
        setCurrentAvatar(emojiAvatar);
        startTransition(async () => {
            const res = await setPresetAvatar(emojiAvatar);
            showMsg(res.success ? '✅ Avatar actualizado' : res.message, res.success ? 'success' : 'error');
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        const res = await uploadAvatar(formData);
        if (res.success) {
            setCurrentAvatar(res.url);
            showMsg('✅ Foto de perfil subida correctamente', 'success');
        } else {
            showMsg(res.message, 'error');
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isEmojiAvatar = currentAvatar?.startsWith('emoji:');
    const currentEmoji = isEmojiAvatar ? currentAvatar.replace('emoji:', '') : null;
    const initials = profile?.full_name?.substring(0, 2).toUpperCase() || 'US';

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Cargando perfil...</div>;
    if (!profile) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--error-fg)' }}>Error: Perfil no encontrado</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCog size={24} />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--card-foreground)' }}>Mi Perfil y Ajustes</h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Personaliza tu cuenta y la apariencia de la plataforma</p>
                </div>
            </div>

            {/* Alert */}
            {msg && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: msg.type === 'success' ? 'var(--success-bg)' : 'var(--error-bg)', color: msg.type === 'success' ? 'var(--success-fg)' : 'var(--error-fg)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {msg.text}
                </div>
            )}

            {/* ─── AVATAR SECTION ─── */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Foto de Perfil</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '1.25rem' }}>Elige un avatar o sube tu propia foto</p>

                {/* Current Avatar Preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--primary)', overflow: 'hidden', background: isEmojiAvatar ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(192,132,252,0.1))' : currentAvatar ? 'transparent' : 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                        {isEmojiAvatar ? (
                            <span style={{ fontSize: '2.75rem' }}>{currentEmoji}</span>
                        ) : currentAvatar ? (
                            <img src={currentAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem' }}>{initials}</span>
                        )}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{profile.full_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                            {isEmojiAvatar ? 'Avatar de emoji' : currentAvatar ? 'Foto personalizada' : 'Sin foto de perfil'}
                        </div>
                        {currentAvatar && (
                            <button onClick={() => { setCurrentAvatar(''); startTransition(async () => { await setPresetAvatar(''); showMsg('Avatar eliminado', 'success'); }); }}
                                style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--error-fg)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                                Quitar foto de perfil
                            </button>
                        )}
                    </div>
                </div>

                {/* Upload Custom Photo */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        📷 Subir foto desde tu dispositivo
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileUpload}
                            style={{ display: 'none' }} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                            {uploading ? (
                                <><span className="spin-loader" /> Subiendo...</>
                            ) : (
                                <><Upload size={16} /> Elegir archivo</>
                            )}
                        </button>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>JPG, PNG, WebP o GIF · Máx 2MB</span>
                    </div>
                </div>

                {/* Preset Avatars Grid */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                        🎨 Elegir un avatar
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '0.5rem' }}>
                        {PRESET_AVATARS.map(a => {
                            const isSelected = currentAvatar === `emoji:${a.emoji}`;
                            return (
                                <button key={a.id} type="button" onClick={() => handlePresetClick(a.emoji)} disabled={isPending}
                                    title={a.label}
                                    style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', cursor: 'pointer', border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)', backgroundColor: isSelected ? 'rgba(99,102,241,0.12)' : 'var(--background)', transition: 'all 0.15s', position: 'relative', boxShadow: isSelected ? '0 0 0 2px rgba(99,102,241,0.3)' : 'none' }}>
                                    {a.emoji}
                                    {isSelected && (
                                        <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Check size={10} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ─── PROFILE FORM ─── */}
            <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Name & Description */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem' }}>Nombre Completo</label>
                    <input name="full_name" type="text" defaultValue={profile.full_name} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem' }}>Biografía o Descripción Profesional</label>
                    <textarea name="description" rows={4} defaultValue={profile.description || ''} placeholder="Docente en el área de ciencias enfocada en el desarrollo..." style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>

                {/* Theme */}
                <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--card-foreground)', marginBottom: '1rem' }}>Apariencia del Sistema</h2>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem 1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--background)', flex: 1 }}>
                            <input type="radio" name="theme" value="light" defaultChecked={profile.theme !== 'dark'} style={{ accentColor: 'var(--primary)' }} />
                            <Sun size={20} color="var(--primary)" />
                            <span style={{ fontWeight: 500, color: 'var(--foreground)' }}>Modo Claro</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem 1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--background)', flex: 1 }}>
                            <input type="radio" name="theme" value="dark" defaultChecked={profile.theme === 'dark'} style={{ accentColor: 'var(--primary)' }} />
                            <Moon size={20} color="var(--primary)" />
                            <span style={{ fontWeight: 500, color: 'var(--foreground)' }}>Modo Oscuro</span>
                        </label>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
                    <button type="submit" disabled={isPending} className="btn-futuristic" style={{ padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isPending ? 0.7 : 1 }}>
                        <Save size={18} /> {isPending ? 'Guardando ajustes...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>

            <style>{`
                .spin-loader {
                    width: 16px; height: 16px;
                    border: 2px solid var(--border);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); }}
            `}</style>
        </div>
    );
}

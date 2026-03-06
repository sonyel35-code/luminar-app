'use client';

import React, { useState, useTransition, useEffect } from 'react';
import {
    getAnnouncements, postAnnouncement, deleteAnnouncement, getCourseStudents,
    getTasks, createTask, deleteTask,
    getMaterials, addMaterial, deleteMaterial,
} from './actions';
import {
    BookOpen, Users, TrendingUp, Send, Trash2, MessageSquare,
    ClipboardList, FileText, Plus, X, Link2, Film, FileImage, ExternalLink, Calendar,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type Student = { id: string; full_name: string; identification_number: string; grades?: { final_score?: number }[] };
type Announcement = { id: string; content: string; title?: string; created_at: string; profiles?: { full_name?: string } };
type Task = {
    id: string; title: string; description?: string; due_date?: string;
    max_score?: number; created_at: string; profiles?: { full_name?: string };
};
type Material = {
    id: string; title: string; url: string; type: string; created_at: string;
    profiles?: { full_name?: string };
};

type Props = {
    course: { id: string; name: string; grade_level: string; section: string; description?: string };
    userId: string;
    authorName: string;
    userRole: string;
};

const MATERIAL_TYPES = [
    { value: 'pdf', label: 'PDF', icon: <FileText size={16} /> },
    { value: 'video', label: 'Video', icon: <Film size={16} /> },
    { value: 'link', label: 'Enlace', icon: <Link2 size={16} /> },
    { value: 'image', label: 'Imagen', icon: <FileImage size={16} /> },
];

function getMaterialIcon(type: string) {
    switch (type) {
        case 'pdf': return <FileText size={20} color="#ef4444" />;
        case 'video': return <Film size={20} color="#8b5cf6" />;
        case 'image': return <FileImage size={20} color="#10b981" />;
        default: return <Link2 size={20} color="#06b6d4" />;
    }
}

function getMaterialBg(type: string) {
    switch (type) {
        case 'pdf': return 'rgba(239,68,68,0.08)';
        case 'video': return 'rgba(139,92,246,0.08)';
        case 'image': return 'rgba(16,185,129,0.08)';
        default: return 'rgba(6,182,212,0.08)';
    }
}

const isTeacherOrAdmin = (role: string) => role === 'teacher' || role === 'admin';

export default function CourseDetailClient({ course, userId, authorName, userRole }: Props) {
    const canEdit = isTeacherOrAdmin(userRole);
    const [activeTab, setActiveTab] = useState<'announcements' | 'tasks' | 'materials' | 'students' | 'grades'>('announcements');
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [content, setContent] = useState('');
    const [isPending, startTransition] = useTransition();

    // Task form
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [taskDue, setTaskDue] = useState('');
    const [taskMax, setTaskMax] = useState(100);

    // Material form
    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [matTitle, setMatTitle] = useState('');
    const [matUrl, setMatUrl] = useState('');
    const [matType, setMatType] = useState('link');

    useEffect(() => {
        getAnnouncements(course.id).then(setAnnouncements);
        getCourseStudents(course.id).then(setStudents);
        getTasks(course.id).then(setTasks);
        getMaterials(course.id).then(setMaterials);
    }, [course.id]);

    /** Posts an announcement */
    const handlePost = () => {
        if (!content.trim()) return;
        startTransition(async () => {
            await postAnnouncement(course.id, userId, content);
            setContent('');
            setAnnouncements(await getAnnouncements(course.id));
        });
    };

    const handleDeleteAnnouncement = (id: string) => {
        startTransition(async () => {
            await deleteAnnouncement(course.id, id);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        });
    };

    /** Creates a task */
    const handleCreateTask = () => {
        if (!taskTitle.trim()) return;
        startTransition(async () => {
            await createTask(course.id, userId, taskTitle, taskDesc, taskDue || null, taskMax);
            setShowTaskForm(false);
            setTaskTitle(''); setTaskDesc(''); setTaskDue(''); setTaskMax(100);
            setTasks(await getTasks(course.id));
        });
    };

    const handleDeleteTask = (id: string) => {
        startTransition(async () => {
            await deleteTask(course.id, id);
            setTasks(prev => prev.filter(t => t.id !== id));
        });
    };

    /** Adds a material */
    const handleAddMaterial = () => {
        if (!matTitle.trim() || !matUrl.trim()) return;
        startTransition(async () => {
            await addMaterial(course.id, userId, matTitle, matUrl, matType);
            setShowMaterialForm(false);
            setMatTitle(''); setMatUrl(''); setMatType('link');
            setMaterials(await getMaterials(course.id));
        });
    };

    const handleDeleteMaterial = (id: string) => {
        startTransition(async () => {
            await deleteMaterial(course.id, id);
            setMaterials(prev => prev.filter(m => m.id !== id));
        });
    };

    const tabs = [
        { key: 'announcements', label: 'Anuncios', icon: <MessageSquare size={15} /> },
        { key: 'tasks', label: `Tareas (${tasks.length})`, icon: <ClipboardList size={15} /> },
        { key: 'materials', label: `Materiales (${materials.length})`, icon: <BookOpen size={15} /> },
        { key: 'students', label: `Estudiantes (${students.length})`, icon: <Users size={15} /> },
        { key: 'grades', label: 'Calificaciones', icon: <TrendingUp size={15} /> },
    ] as const;

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.65rem 0.875rem', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)', backgroundColor: 'var(--secondary)',
        color: 'var(--foreground)', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box',
    };

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>

            {/* ── Course Header */}
            <div className="card" style={{ overflow: 'hidden', marginBottom: '1.75rem' }}>
                <div style={{ height: '110px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '1.5rem' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.25, background: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'0.3\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{course.name}</h1>
                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>Grado {course.grade_level} • Sección {course.section}</p>
                    </div>
                </div>
                {course.description && (
                    <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--border)', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                        {course.description}
                    </div>
                )}
            </div>

            {/* ── Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.6rem 1rem', fontWeight: 600, fontSize: '0.8rem',
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                            backgroundColor: activeTab === tab.key ? 'var(--primary)' : 'transparent',
                            color: activeTab === tab.key ? 'white' : 'var(--muted-foreground)',
                            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                            marginBottom: '-2px',
                            borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                        }}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* ════════════════════════════════════════ ANNOUNCEMENTS */}
            {activeTab === 'announcements' && (
                <div>
                    {canEdit && (
                        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                                    {authorName.substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <textarea value={content} onChange={e => setContent(e.target.value)}
                                        placeholder="Comparte un anuncio o tarea con tu clase..." rows={3}
                                        style={{ ...inputStyle, resize: 'none' }} />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                                        <button onClick={handlePost} disabled={isPending || !content.trim()}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.25rem', backgroundColor: content.trim() ? 'var(--primary)' : 'var(--muted)', color: content.trim() ? 'white' : 'var(--muted-foreground)', borderRadius: 'var(--radius-md)', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: content.trim() ? 'pointer' : 'not-allowed' }}>
                                            <Send size={15} /> {isPending ? 'Publicando...' : 'Publicar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {announcements.length === 0 ? (
                        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            Aún no hay anuncios en este curso. {canEdit && '¡Sé el primero en publicar!'}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {announcements.map(a => (
                                <div key={a.id} className="card" style={{ padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}>
                                                {(a.profiles?.full_name || 'US').substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.profiles?.full_name || 'Docente'}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>
                                                    {new Date(a.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        {canEdit && (
                                            <button onClick={() => handleDeleteAnnouncement(a.id)} style={{ color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                    <p style={{ color: 'var(--foreground)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{a.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════ TASKS */}
            {activeTab === 'tasks' && (
                <div>
                    {canEdit && (
                        <div style={{ marginBottom: '1.25rem' }}>
                            {!showTaskForm ? (
                                <button onClick={() => setShowTaskForm(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                                    <Plus size={16} /> Nueva Tarea
                                </button>
                            ) : (
                                <div className="card" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Crear Nueva Tarea</h3>
                                        <button onClick={() => setShowTaskForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}><X size={18} /></button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--muted-foreground)' }}>Título *</label>
                                            <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Ej: Ensayo sobre la fotosíntesis" style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--muted-foreground)' }}>Descripción</label>
                                            <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Instrucciones, criterios de evaluación..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--muted-foreground)' }}>Fecha límite</label>
                                                <input type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)} style={inputStyle} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--muted-foreground)' }}>Puntaje máximo</label>
                                                <input type="number" value={taskMax} onChange={e => setTaskMax(Number(e.target.value))} min={0} max={100} style={inputStyle} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => setShowTaskForm(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--muted-foreground)', fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
                                            <button onClick={handleCreateTask} disabled={isPending || !taskTitle.trim()}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: !taskTitle.trim() ? 0.6 : 1 }}>
                                                <Send size={15} /> {isPending ? 'Creando...' : 'Crear Tarea'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {tasks.length === 0 ? (
                        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            <ClipboardList size={40} style={{ display: 'block', margin: '0 auto 0.75rem', opacity: 0.3 }} />
                            No hay tareas en este curso todavía.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {tasks.map(task => {
                                const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                                return (
                                    <div key={task.id} className="card" style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <ClipboardList size={18} color="var(--primary)" />
                                                    </div>
                                                    <div>
                                                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--card-foreground)' }}>{task.title}</h3>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>
                                                            Por {task.profiles?.full_name || 'Docente'} · {new Date(task.created_at).toLocaleDateString('es-ES')}
                                                        </div>
                                                    </div>
                                                </div>
                                                {task.description && (
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginLeft: '3rem', lineHeight: 1.5 }}>{task.description}</p>
                                                )}
                                                <div style={{ display: 'flex', gap: '1rem', marginLeft: '3rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                                    {task.due_date && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: isOverdue ? 'var(--error-fg)' : 'var(--warning-fg)', backgroundColor: isOverdue ? 'var(--error-bg)' : 'var(--warning-bg)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                                                            <Calendar size={12} />
                                                            Entrega: {new Date(task.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            {isOverdue && ' (Vencida)'}
                                                        </span>
                                                    )}
                                                    {task.max_score !== undefined && (
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'rgba(99,102,241,0.08)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                                                            Puntaje: {task.max_score} pts
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {canEdit && (
                                                <button onClick={() => handleDeleteTask(task.id)} style={{ color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', marginLeft: '1rem' }}>
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════ MATERIALS */}
            {activeTab === 'materials' && (
                <div>
                    {canEdit && (
                        <div style={{ marginBottom: '1.25rem' }}>
                            {!showMaterialForm ? (
                                <button onClick={() => setShowMaterialForm(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                                    <Plus size={16} /> Agregar Material
                                </button>
                            ) : (
                                <div className="card" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Agregar Recurso</h3>
                                        <button onClick={() => setShowMaterialForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}><X size={18} /></button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--muted-foreground)' }}>Título *</label>
                                            <input value={matTitle} onChange={e => setMatTitle(e.target.value)} placeholder="Ej: Guía de Estudio - Capítulo 3" style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--muted-foreground)' }}>URL *</label>
                                            <input value={matUrl} onChange={e => setMatUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: 'var(--muted-foreground)' }}>Tipo</label>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {MATERIAL_TYPES.map(t => (
                                                    <button key={t.value} onClick={() => setMatType(t.value)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: `1px solid ${matType === t.value ? 'var(--primary)' : 'var(--border)'}`, backgroundColor: matType === t.value ? 'rgba(99,102,241,0.1)' : 'transparent', color: matType === t.value ? 'var(--primary)' : 'var(--muted-foreground)', cursor: 'pointer', fontWeight: 500, fontSize: '0.8rem' }}>
                                                        {t.icon} {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => setShowMaterialForm(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--muted-foreground)', fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
                                            <button onClick={handleAddMaterial} disabled={isPending || !matTitle.trim() || !matUrl.trim()}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: (!matTitle.trim() || !matUrl.trim()) ? 0.6 : 1 }}>
                                                <Plus size={15} /> {isPending ? 'Guardando...' : 'Agregar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {materials.length === 0 ? (
                        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            <BookOpen size={40} style={{ display: 'block', margin: '0 auto 0.75rem', opacity: 0.3 }} />
                            No hay materiales en este curso todavía.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                            {materials.map(mat => (
                                <div key={mat.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: getMaterialBg(mat.type), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {getMaterialIcon(mat.type)}
                                        </div>
                                        {canEdit && (
                                            <button onClick={() => handleDeleteMaterial(mat.id)} style={{ color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--card-foreground)', marginBottom: '0.25rem' }}>{mat.title}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>
                                            {mat.profiles?.full_name || 'Docente'} · {new Date(mat.created_at).toLocaleDateString('es-ES')}
                                        </div>
                                    </div>
                                    <a href={mat.url} target="_blank" rel="noopener noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginTop: 'auto' }}>
                                        <ExternalLink size={14} /> Abrir recurso
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════ STUDENTS */}
            {activeTab === 'students' && (
                <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={18} /> {students.length} estudiantes matriculados
                    </div>
                    {students.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No hay estudiantes matriculados.</div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {students.map((s, i) => {
                                const finalScore = s.grades?.[0]?.final_score;
                                return (
                                    <li key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: i < students.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '0.8rem' }}>
                                                {s.full_name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{s.full_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Matrícula: {s.identification_number}</div>
                                            </div>
                                        </div>
                                        {finalScore !== null && finalScore !== undefined ? (
                                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, backgroundColor: Number(finalScore) >= 70 ? 'var(--success-bg)' : 'var(--error-bg)', color: Number(finalScore) >= 70 ? 'var(--success-fg)' : 'var(--error-fg)' }}>
                                                {Number(finalScore).toFixed(1)} — {Number(finalScore) >= 70 ? 'Aprobado' : 'Reprobado'}
                                            </span>
                                        ) : (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Sin nota</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════ GRADES */}
            {activeTab === 'grades' && (
                <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={18} /> Resumen de Calificaciones</span>
                        <a href="/portal/grades" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}>Ir al editor completo →</a>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--muted)', textAlign: 'left', color: 'var(--muted-foreground)' }}>
                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500 }}>Estudiante</th>
                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500, textAlign: 'center' }}>Promedio Final</th>
                                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 500, textAlign: 'center' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => {
                                const finalScore = s.grades?.[0]?.final_score;
                                const passed = finalScore !== null && finalScore !== undefined && Number(finalScore) >= 70;
                                return (
                                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.875rem 1.5rem' }}>{s.full_name}</td>
                                        <td style={{ padding: '0.875rem 1.5rem', textAlign: 'center', fontWeight: 700 }}>
                                            {finalScore !== null && finalScore !== undefined ? Number(finalScore).toFixed(1) : '—'}
                                        </td>
                                        <td style={{ padding: '0.875rem 1.5rem', textAlign: 'center' }}>
                                            {finalScore !== null && finalScore !== undefined ? (
                                                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, backgroundColor: passed ? 'var(--success-bg)' : 'var(--error-bg)', color: passed ? 'var(--success-fg)' : 'var(--error-fg)' }}>
                                                    {passed ? '✓ Aprobado' : '✗ Reprobado'}
                                                </span>
                                            ) : <span style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>Sin nota</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                            {students.length === 0 && (
                                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No hay estudiantes matriculados.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

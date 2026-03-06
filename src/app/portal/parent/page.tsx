import { createClient } from '@/lib/supabase/server';
import { TrendingUp, CheckSquare, User, ClipboardList, Megaphone } from 'lucide-react';

async function getParentData(parentId: string) {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data: children } = await supabase
        .from('students')
        .select(`
            id, full_name, identification_number,
            enrollments(
                course_id,
                courses(id, name, grade_level, section)
            ),
            grades(final_score, p1, p2, p3, p4, rp),
            attendance(status, record_date)
        `)
        .eq('parent_id', parentId);

    const processed = await Promise.all(
        (children || []).map(async child => {
            const todayAtt = (child.attendance as any[])?.find((a: any) => a.record_date === today);
            const finalScore = (child.grades as any[])?.[0]?.final_score;
            const courseIds = ((child.enrollments as any[]) || []).map((e: any) => e.course_id).filter(Boolean);

            // Last 5 attendance records
            const last5Att = [...((child.attendance as any[]) || [])]
                .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime())
                .slice(0, 5);

            // Tasks and recent announcements for enrolled courses
            let tasks: any[] = [];
            let announcements: any[] = [];
            if (courseIds.length > 0) {
                const { data: t } = await supabase
                    .from('tasks')
                    .select(`id, title, due_date, max_score, course_id, courses(name)`)
                    .in('course_id', courseIds)
                    .order('due_date', { ascending: true, nullsFirst: false })
                    .limit(5);
                tasks = t || [];

                const { data: a } = await supabase
                    .from('announcements')
                    .select(`id, content, created_at, course_id, courses(name)`)
                    .in('course_id', courseIds)
                    .order('created_at', { ascending: false })
                    .limit(3);
                announcements = a || [];
            }

            return {
                ...child,
                todayAttendance: todayAtt?.status || null,
                finalScore: finalScore !== undefined ? finalScore : null,
                last5Att,
                tasks,
                announcements,
            };
        })
    );

    return processed;
}

const attStatusLabels: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
    P: { label: 'Presente', emoji: '✅', color: 'var(--success-fg)', bg: 'var(--success-bg)' },
    A: { label: 'Ausente', emoji: '❌', color: 'var(--error-fg)', bg: 'var(--error-bg)' },
    T: { label: 'Tarde', emoji: '⚠️', color: 'var(--warning-fg)', bg: 'var(--warning-bg)' },
    E: { label: 'Excusado', emoji: 'ℹ️', color: 'var(--primary)', bg: 'rgba(139,92,246,0.08)' },
};

export default async function ParentPortalPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('user_id', user!.id).single();
    const children = await getParentData(user!.id);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--card-foreground)' }}>
                    Bienvenido, {profile?.full_name} 👨‍👩‍👧
                </h1>
                <p style={{ color: 'var(--muted-foreground)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    Aquí puedes ver el progreso académico, asistencia, tareas y anuncios de tu(s) hijo(s).
                </p>
            </div>

            {children.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                    <User size={48} style={{ display: 'block', margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>No tienes estudiantes vinculados a tu cuenta.</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Pide al administrador que enlace el perfil de tu hijo(a).</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {children.map((child: any) => {
                        const att = child.todayAttendance ? attStatusLabels[child.todayAttendance] : null;
                        const passed = child.finalScore !== null && Number(child.finalScore) >= 70;
                        return (
                            <div key={child.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                                {/* Child Header */}
                                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(192,132,252,0.06))' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                                        {child.full_name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--card-foreground)' }}>{child.full_name}</h2>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Matrícula: {child.identification_number}</p>
                                    </div>
                                    {att ? (
                                        <div style={{ padding: '0.4rem 0.875rem', borderRadius: '2rem', backgroundColor: att.bg, color: att.color, fontSize: '0.8rem', fontWeight: 700 }}>
                                            {att.emoji} Hoy: {att.label}
                                        </div>
                                    ) : (
                                        <div style={{ padding: '0.4rem 0.875rem', borderRadius: '2rem', backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>
                                            Sin registro hoy
                                        </div>
                                    )}
                                </div>

                                {/* Stats row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ padding: '1.25rem 1.5rem', borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: child.finalScore !== null ? (passed ? 'var(--success-bg)' : 'var(--error-bg)') : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <TrendingUp size={20} color={child.finalScore !== null ? (passed ? 'var(--success-fg)' : 'var(--error-fg)') : 'var(--muted-foreground)'} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Promedio Final</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--card-foreground)', lineHeight: 1 }}>
                                                {child.finalScore !== null ? Number(child.finalScore).toFixed(1) : '—'}
                                            </div>
                                            {child.finalScore !== null && (
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: passed ? 'var(--success-fg)' : 'var(--error-fg)' }}>
                                                    {passed ? '✓ Aprobado' : '✗ Reprobado'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Attendance history */}
                                    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <CheckSquare size={20} color="var(--primary)" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Últimas Asistencias</div>
                                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                                {child.last5Att.length === 0 ? (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Sin registros</span>
                                                ) : child.last5Att.map((a: any, i: number) => {
                                                    const al = attStatusLabels[a.status] || attStatusLabels['E'];
                                                    return (
                                                        <span key={i} title={`${a.record_date} — ${al.label}`}
                                                            style={{ padding: '0.15rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.72rem', fontWeight: 700, backgroundColor: al.bg, color: al.color }}>
                                                            {a.status}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tasks */}
                                <div style={{ padding: '1.25rem 1.5rem', borderBottom: child.announcements.length > 0 ? '1px solid var(--border)' : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                        <ClipboardList size={16} color="var(--primary)" />
                                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Próximas Tareas</h3>
                                    </div>
                                    {child.tasks.length === 0 ? (
                                        <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>No hay tareas próximas.</p>
                                    ) : (
                                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {child.tasks.map((task: any) => {
                                                const due = task.due_date ? new Date(task.due_date) : null;
                                                const overdue = due && due < new Date();
                                                return (
                                                    <li key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--muted)' }}>
                                                        <span style={{ fontWeight: 500 }}>{task.title} <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>— {task.courses?.name}</span></span>
                                                        {due && (
                                                            <span style={{ fontWeight: 600, color: overdue ? 'var(--error-fg)' : 'var(--warning-fg)', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                                                                {due.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                                                {overdue && ' ⚠'}
                                                            </span>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>

                                {/* Announcements */}
                                {child.announcements.length > 0 && (
                                    <div style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                            <Megaphone size={16} color="var(--primary)" />
                                            <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Anuncios Recientes</h3>
                                        </div>
                                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {child.announcements.map((ann: any) => (
                                                <li key={ann.id} style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--muted)', borderLeft: '3px solid var(--primary)' }}>
                                                    <span style={{ color: 'var(--muted-foreground)', fontSize: '0.72rem' }}>{ann.courses?.name} · {new Date(ann.created_at).toLocaleDateString('es-ES')}</span>
                                                    <p style={{ marginTop: '0.2rem', color: 'var(--foreground)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{ann.content}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

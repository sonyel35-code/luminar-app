import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BookOpen, Users, TrendingUp, CheckSquare, ArrowRight, AlertTriangle, ClipboardList } from 'lucide-react';

async function getDashboardStats(userId: string, role: string) {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Courses: teachers see their own, admins see all
    const coursesQuery = supabase.from('courses').select('id, name, grade_level, section, description');
    if (role === 'teacher') coursesQuery.eq('teacher_id', userId);
    const { data: courses } = await coursesQuery.order('name');

    const courseIds = (courses || []).map(c => c.id);

    // Total students enrolled in those courses (unique count via enrollments)
    let totalStudents = 0;
    if (courseIds.length > 0) {
        const { count } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).in('course_id', courseIds);
        totalStudents = count || 0;
    }

    // Average final score across all grades in those courses
    let avgGrade = 0;
    let atRiskStudents: { id: string; full_name: string; final_score: number; course_name: string }[] = [];
    if (courseIds.length > 0) {
        const { data: rawGrades } = await supabase
            .from('grades')
            .select('final_score, student_id, students(full_name), courses(name)')
            .in('course_id', courseIds)
            .not('final_score', 'is', null);

        const grades = (rawGrades || []).map(g => ({
            ...g,
            students: Array.isArray(g.students) ? g.students[0] : g.students,
            courses: Array.isArray(g.courses) ? g.courses[0] : g.courses
        }));

        const validGrades = grades.map(g => Number(g.final_score)).filter(n => !isNaN(n));
        avgGrade = validGrades.length > 0 ? Math.round(validGrades.reduce((a, b) => a + b, 0) / validGrades.length) : 0;

        // At-risk: below 70
        atRiskStudents = grades
            .filter(g => Number(g.final_score) < 70)
            .map(g => ({
                id: g.student_id as string,
                full_name: (g.students as any)?.full_name || 'Desconocido',
                final_score: Number(g.final_score),
                course_name: (g.courses as any)?.name || '—',
            }))
            .slice(0, 5);
    }

    // Attendance rate for today
    let attendanceRate = 0;
    if (courseIds.length > 0 && totalStudents > 0) {
        const { count: present } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).in('course_id', courseIds).eq('record_date', today).eq('status', 'P');
        attendanceRate = Math.round(((present || 0) / totalStudents) * 100);
    }

    // Pending task submissions (tasks with no score in those courses)
    let pendingReview = 0;
    if (courseIds.length > 0) {
        const { data: taskIds } = await supabase.from('tasks').select('id').in('course_id', courseIds);
        const ids = (taskIds || []).map(t => t.id);
        if (ids.length > 0) {
            const { count } = await supabase.from('task_submissions').select('*', { count: 'exact', head: true }).in('task_id', ids).is('score', null);
            pendingReview = count || 0;
        }
    }

    return { courses: courses || [], totalStudents, avgGrade, attendanceRate, atRiskStudents, pendingReview };
}

export default async function PortalDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    const role = profile?.role || 'teacher';
    const { courses, totalStudents, avgGrade, attendanceRate, atRiskStudents, pendingReview } = await getDashboardStats(user.id, role);

    const statCards = [
        { icon: <BookOpen size={22} color="var(--primary)" />, label: 'Cursos Activos', value: courses.length, color: 'var(--primary)', bg: 'rgba(99,102,241,0.1)' },
        { icon: <Users size={22} color="var(--accent)" />, label: 'Alumnos Matriculados', value: totalStudents, color: 'var(--accent)', bg: 'rgba(192,132,252,0.1)' },
        { icon: <TrendingUp size={22} color="var(--success)" />, label: 'Promedio General', value: avgGrade > 0 ? `${avgGrade}` : 'S/D', color: 'var(--success)', bg: 'var(--success-bg)' },
        { icon: <CheckSquare size={22} color="var(--warning)" />, label: 'Asistencia Hoy', value: totalStudents > 0 ? `${attendanceRate}%` : 'S/D', color: 'var(--warning)', bg: 'var(--warning-bg)' },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 0' }}>
            {/* Welcome */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--card-foreground)', marginBottom: '0.5rem' }}>
                    Bienvenido, {profile?.full_name || 'Profesor'} 👋
                </h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                    Aquí tienes un resumen de tu actividad académica en tiempo real.
                </p>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                {statCards.map((stat, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--card-foreground)', lineHeight: 1 }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem', fontWeight: 500 }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Two-column lower area */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Courses Grid */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--card-foreground)' }}>Mis Cursos</h2>
                        <Link href="/portal/courses" style={{ fontSize: '0.875rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                            Ver todos <ArrowRight size={16} />
                        </Link>
                    </div>
                    {courses.length === 0 ? (
                        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--muted-foreground)' }}>No tienes cursos asignados. <Link href="/portal/courses" style={{ color: 'var(--primary)' }}>Crea tu primer curso →</Link></p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.1rem' }}>
                            {courses.map((course, i) => {
                                const gradients = [
                                    'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    'linear-gradient(135deg, #06b6d4, #3b82f6)',
                                    'linear-gradient(135deg, #10b981, #059669)',
                                    'linear-gradient(135deg, #f59e0b, #ef4444)',
                                    'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                    'linear-gradient(135deg, #14b8a6, #06b6d4)',
                                ];
                                return (
                                    <Link key={course.id} href={`/portal/courses/${course.id}`} style={{ textDecoration: 'none' }}>
                                        <div className="card course-card" style={{ overflow: 'hidden', cursor: 'pointer' }}>
                                            <div style={{ height: '5px', background: gradients[i % gradients.length] }} />
                                            <div style={{ padding: '1.25rem' }}>
                                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--card-foreground)', marginBottom: '0.2rem' }}>{course.name}</h3>
                                                <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginBottom: '0.875rem' }}>
                                                    Grado {course.grade_level} • Sección {course.section}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                                                    <ArrowRight size={13} /> Abrir Aula
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right column — analytics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Pending reviews */}
                    <div className="card" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ClipboardList size={18} color="var(--warning)" />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--card-foreground)' }}>{pendingReview}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>Entregas por revisar</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>Tareas enviadas sin calificación.</p>
                    </div>

                    {/* At-risk students */}
                    <div className="card" style={{ padding: '1.25rem', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <AlertTriangle size={17} color="var(--error)" />
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Estudiantes en Riesgo</h3>
                        </div>
                        {atRiskStudents.length === 0 ? (
                            <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>
                                ¡Excelente! Todos los estudiantes tienen nota aprobatoria.
                            </p>
                        ) : (
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                {atRiskStudents.map((s, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: i < atRiskStudents.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                        <div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--card-foreground)' }}>{s.full_name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>{s.course_name}</div>
                                        </div>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--error-fg)', backgroundColor: 'var(--error-bg)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem' }}>
                                            {s.final_score.toFixed(1)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Link href="/portal/grades" style={{ display: 'block', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                            Ver calificaciones completas →
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
          .course-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .course-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.15);
          }
        `}</style>
        </div>
    );
}

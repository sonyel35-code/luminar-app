import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GraduationCap, UserPlus, LogIn, CheckCircle2, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { joinCourseWithInvite, enrollExistingParent } from '../actions';

interface JoinPageProps {
    params: {
        courseId: string;
    };
    searchParams: {
        error?: string;
        message?: string;
    };
}

export default async function JoinCoursePage({ params, searchParams }: JoinPageProps) {
    const { courseId } = params;
    const supabase = await createClient();

    // 1. Fetch Course details
    const { data: course, error: courseErr } = await supabase
        .from('courses')
        .select('id, name, grade_level, section, description')
        .eq('id', courseId)
        .maybeSingle();

    if (!course || courseErr) {
        return (
            <div className="bg-animated-mesh" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="card glass-panel" style={{ width: '100%', maxWidth: '480px', textAlign: 'center', padding: '3rem 2rem' }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--error-fg)' }}>Curso no encontrado</h1>
                    <p style={{ color: 'var(--muted-foreground)', marginTop: '1rem' }}>El enlace de invitación no es válido o ha expirado. Por favor, solicita uno nuevo a tu maestro.</p>
                    <Link href="/login" className="btn-futuristic" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700 }}>
                        Ir al Login
                    </Link>
                </div>
            </div>
        );
    }

    // 2. Check if user is already logged in
    const { data: { user } } = await supabase.auth.getUser();
    let isParent = false;
    let profileName = '';
    let linkedStudents: { id: string; name: string }[] = [];

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('user_id', user.id)
            .maybeSingle();

        if (profile) {
            isParent = profile.role === 'parent';
            profileName = profile.full_name;

            if (isParent) {
                // Fetch linked students
                const { data: linked } = await supabase
                    .from('student_parents')
                    .select('student_id, students(full_name)')
                    .eq('parent_id', user.id);

                if (linked) {
                    linkedStudents = linked.map((l: any) => ({
                        id: l.student_id,
                        name: l.students?.full_name || 'Estudiante'
                    }));
                }
            }
        }
    }

    // Server-action handlers for local client submission
    const handleJoinNew = async (formData: FormData) => {
        'use server';
        const res = await joinCourseWithInvite(courseId, formData);
        if (res.success && res.redirect) {
            redirect(res.redirect);
        } else {
            redirect(`/join/${courseId}?error=${encodeURIComponent(res.message || 'Error')}`);
        }
    };

    const handleEnrollExisting = async (formData: FormData) => {
        'use server';
        const studentId = formData.get('student_id') as string;
        if (!studentId) {
            redirect(`/join/${courseId}?error=Debes seleccionar un estudiante`);
        }
        const res = await enrollExistingParent(courseId, studentId);
        if (res.success && res.redirect) {
            redirect(res.redirect);
        } else {
            redirect(`/join/${courseId}?error=${encodeURIComponent(res.message || 'Error')}`);
        }
    };

    // If parent doesn't have a linked student but has an account, allow them to link one now
    const handleLinkAndEnroll = async (formData: FormData) => {
        'use server';
        const childName = (formData.get('child_name') as string)?.trim();
        if (!childName || !user) {
            redirect(`/join/${courseId}?error=El nombre del estudiante es obligatorio`);
        }

        // Create student
        const randomIdNum = 'EST-' + Math.floor(100000 + Math.random() * 900000);
        const { data: newStudent, error: studentError } = await supabase
            .from('students')
            .insert({ full_name: childName, identification_number: randomIdNum })
            .select('id')
            .single();

        if (studentError || !newStudent) {
            redirect(`/join/${courseId}?error=Error al registrar al estudiante`);
        }

        // Link parent & student
        await supabase.from('student_parents').insert({ parent_id: user.id, student_id: newStudent.id });

        // Enroll
        await supabase.from('enrollments').insert({ student_id: newStudent.id, course_id: courseId });

        redirect('/portal');
    };

    return (
        <div className="bg-animated-mesh" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="card glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                
                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: '2rem', backgroundColor: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)', color: 'var(--primary)', fontSize: '0.68rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                        <Sparkles size={11} /> INVITACIÓN AL CURSO
                    </div>
                    <h1 style={{ fontSize: '1.45rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
                        {course.name}
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 500 }}>
                        Grado {course.grade_level} · Sección {course.section}
                    </p>
                    {course.description && (
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.78rem', fontStyle: 'italic', marginTop: '0.5rem', paddingInline: '1rem' }}>
                            "{course.description}"
                        </p>
                    )}
                </div>

                {/* Status Alert */}
                {searchParams?.error && (
                    <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--error-bg)', color: 'var(--error-fg)', borderRadius: '10px', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, border: '1px solid rgba(239,68,68,0.15)' }}>
                        ⚠️ {searchParams.error}
                    </div>
                )}

                {/* Dynamic Onboarding Interface */}
                {user ? (
                    /* CASE A: User is already logged in */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center' }}>
                            <span style={{ fontSize: '1.8rem' }}>👋</span>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem' }}>¡Hola, {profileName}!</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                                Detectamos tu cuenta activa como **{isParent ? 'Padre / Tutor' : 'Usuario'}**.
                            </p>
                        </div>

                        {isParent ? (
                            linkedStudents.length > 0 ? (
                                /* Parent has linked students */
                                <form action={handleEnrollExisting} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                                            ¿A qué estudiante deseas matricular?
                                        </label>
                                        <select name="student_id" required
                                            style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '0.875rem', outline: 'none' }}>
                                            {linkedStudents.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button type="submit" className="btn-futuristic" style={{ padding: '0.875rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        Confirmar Matrícula <ArrowRight size={15} />
                                    </button>
                                </form>
                            ) : (
                                /* Parent has no linked student, allow linking one */
                                <form action={handleLinkAndEnroll} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                                            Nombre completo de tu hijo/a (Estudiante) *
                                        </label>
                                        <input name="child_name" type="text" required placeholder="Apellido, Nombre"
                                            style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                    <button type="submit" className="btn-futuristic" style={{ padding: '0.875rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        Vincular y Matricular <ArrowRight size={15} />
                                    </button>
                                </form>
                            )
                        ) : (
                            /* Logged in user is not a parent */
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                                    Los enlaces de auto-matrícula están reservados para cuentas de Padres y Tutores.
                                </p>
                                <Link href="/portal" className="btn-futuristic" style={{ display: 'block', marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
                                    Ir a mi Dashboard
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    /* CASE B: Parent is NOT logged in. Show quick signup form. */
                    <form action={handleJoinNew} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                        
                        {/* Parent Name */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--foreground)' }}>
                                Nombre completo del Padre / Tutor *
                            </label>
                            <input name="parent_name" type="text" required placeholder="Ej: Laura Martínez"
                                style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                        </div>

                        {/* Child Name */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--foreground)' }}>
                                Nombre de su Hijo/a (Estudiante) *
                            </label>
                            <input name="child_name" type="text" required placeholder="Ej: Mateo Moreno"
                                style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                        </div>

                        {/* Email */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--foreground)' }}>
                                Correo Electrónico *
                            </label>
                            <input name="email" type="email" required placeholder="padre@correo.com"
                                style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                        </div>

                        {/* Password */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--foreground)' }}>
                                Contraseña *
                            </label>
                            <input name="password" type="password" required placeholder="Crea tu contraseña segura"
                                style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                        </div>

                        {/* Safe Notice */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>
                            <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>
                                Al unirte, se creará tu cuenta de Tutor y matricularás automáticamente a tu hijo en este curso.
                            </span>
                        </div>

                        <button type="submit" className="btn-futuristic" style={{ padding: '0.875rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.92rem', width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            Comenzar y Unirme al Curso <ArrowRight size={15} />
                        </button>
                    </form>
                )}

                {/* Back to login */}
                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                    <span>¿Ya tienes una cuenta general?</span>
                    <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        Iniciar sesión aquí →
                    </Link>
                </div>
            </div>
        </div>
    );
}

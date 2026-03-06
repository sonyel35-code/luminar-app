'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getCoursesList, getEnrollmentData, enrollStudent, unenrollStudent } from './actions';
import { UserPlus, UserMinus, Search } from 'lucide-react';

type Course = { id: string; name: string; grade_level: string; section: string; };
type Student = { id: string; full_name: string; identification_number: string; };

export default function EnrollmentsPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [enrolled, setEnrolled] = useState<Student[]>([]);
    const [available, setAvailable] = useState<Student[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        async function init() {
            try {
                const data = await getCoursesList();
                setCourses(data);
                if (data.length > 0) {
                    setSelectedCourse(data[0].id);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingCourses(false);
            }
        }
        init();
    }, []);

    useEffect(() => {
        if (!selectedCourse) return;
        async function loadStudents() {
            setLoadingData(true);
            try {
                const { enrolledStudents, availableStudents } = await getEnrollmentData(selectedCourse);
                setEnrolled(enrolledStudents || []);
                setAvailable(availableStudents || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingData(false);
            }
        }
        loadStudents();
    }, [selectedCourse]);

    const handleEnroll = (studentId: string) => {
        startTransition(async () => {
            const res = await enrollStudent(selectedCourse, studentId);
            if (res.success) {
                const s = available.find(x => x.id === studentId);
                if (s) {
                    setAvailable(prev => prev.filter(x => x.id !== studentId));
                    setEnrolled(prev => [...prev, s].sort((a, b) => a.full_name.localeCompare(b.full_name)));
                }
            }
        });
    };

    const handleUnenroll = (studentId: string) => {
        startTransition(async () => {
            const res = await unenrollStudent(selectedCourse, studentId);
            if (res.success) {
                const s = enrolled.find(x => x.id === studentId);
                if (s) {
                    setEnrolled(prev => prev.filter(x => x.id !== studentId));
                    setAvailable(prev => [...prev, s].sort((a, b) => a.full_name.localeCompare(b.full_name)));
                }
            }
        });
    };

    if (loadingCourses) {
        return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Cargando cursos...</div>;
    }

    if (courses.length === 0) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--foreground)' }}>No hay cursos activos</h2>
                <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>Debes crear al menos un curso para generar matrículas.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--card-foreground)', marginBottom: '0.5rem' }}>Gestión de Matrículas</h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Asigna y desasigna estudiantes a los cursos activos del sistema.</p>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>Seleccionar Curso</label>
                <select
                    className="input-select"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    style={{
                        width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                        backgroundColor: 'var(--background)', color: 'var(--foreground)', outline: 'none'
                    }}
                >
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name} - Grado {c.grade_level} "{c.section}"</option>
                    ))}
                </select>
            </div>

            {loadingData ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Cargando directorio de estudiantes...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

                    {/* ENROLLED STUDENTS */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--success-bg)' }}>
                            <h3 style={{ fontWeight: 600, color: 'var(--success-fg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Estudiantes Matriculados ({enrolled.length})
                            </h3>
                        </div>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '500px', overflowY: 'auto' }}>
                            {enrolled.map(s => (
                                <li key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{s.full_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Matrícula: {s.identification_number}</div>
                                    </div>
                                    <button
                                        disabled={isPending}
                                        onClick={() => handleUnenroll(s.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--error-bg)', color: 'var(--error-fg)', border: 'none', cursor: isPending ? 'wait' : 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}
                                    >
                                        <UserMinus size={14} /> Remover
                                    </button>
                                </li>
                            ))}
                            {enrolled.length === 0 && (
                                <li style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>No hay estudiantes en este curso.</li>
                            )}
                        </ul>
                    </div>

                    {/* AVAILABLE STUDENTS */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--secondary)' }}>
                            <h3 style={{ fontWeight: 600, color: 'var(--secondary-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Search size={18} /> Directorio Disponible ({available.length})
                            </h3>
                        </div>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '500px', overflowY: 'auto' }}>
                            {available.map(s => (
                                <li key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{s.full_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Matrícula: {s.identification_number}</div>
                                    </div>
                                    <button
                                        disabled={isPending}
                                        onClick={() => handleEnroll(s.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary)', color: 'white', border: 'none', cursor: isPending ? 'wait' : 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}
                                    >
                                        <UserPlus size={14} /> Matricular
                                    </button>
                                </li>
                            ))}
                            {available.length === 0 && (
                                <li style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>No hay más estudiantes disponibles en el ecosistema.</li>
                            )}
                        </ul>
                    </div>

                </div>
            )}
        </div>
    );
}

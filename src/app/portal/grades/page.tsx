'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { fetchStudentsWithGrades, saveGrades, fetchCourses } from './actions';

type StudentData = {
    id: string;
    name: string;
    identification: string;
    attendance: Record<number, 'P' | 'A' | 'T' | 'E'>;
    grades: {
        p1: number | null;
        p2: number | null;
        p3: number | null;
        p4: number | null;
        rp: number | null;
        comp_communicative: number | null;
        comp_logical: number | null;
        comp_problem: number | null;
    };
};

export default function GradeRegistrationWindow() {
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [students, setStudents] = useState<StudentData[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    useEffect(() => {
        async function loadCourses() {
            try {
                const data = await fetchCourses();
                setCourses(data);
                if (data.length > 0) {
                    setSelectedCourseId(data[0].id);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingCourses(false);
            }
        }
        loadCourses();
    }, []);

    useEffect(() => {
        async function loadData() {
            if (!selectedCourseId) return;
            setLoadingStudents(true);
            try {
                const data = await fetchStudentsWithGrades(selectedCourseId);
                setStudents(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingStudents(false);
            }
        }
        loadData();
    }, [selectedCourseId]);

    const calculateFinalScore = (grades: StudentData['grades']) => {
        let sum = 0;
        let count = 0;
        if (grades.p1 !== null) { sum += grades.p1; count++; }
        if (grades.p2 !== null) { sum += grades.p2; count++; }
        if (grades.p3 !== null) { sum += grades.p3; count++; }
        if (grades.p4 !== null) { sum += grades.p4; count++; }

        const periodAvg = count > 0 ? sum / count : 0;
        const finalScore = grades.rp !== null && grades.rp > periodAvg ? grades.rp : periodAvg;

        return {
            score: Math.round(finalScore),
            status: finalScore >= 70 ? 'A' : (count > 0 ? 'R' : '-')
        };
    };

    const handleGradeChange = (studentId: string, field: keyof StudentData['grades'], value: string) => {
        const numValue = value === '' ? null : Number(value);
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                return { ...s, grades: { ...s.grades, [field]: numValue } };
            }
            return s;
        }));
    };

    const handleSave = () => {
        if (!selectedCourseId) return;
        startTransition(async () => {
            setSaveStatus('Guardando...');
            try {
                await saveGrades(selectedCourseId, students);
                setSaveStatus('¡Cambios guardados exitosamente!');
                setTimeout(() => setSaveStatus(null), 3000);
            } catch (error) {
                setSaveStatus('Error al guardar. Intente de nuevo.');
            }
        });
    };

    const handleAttendanceChange = (studentId: string, status: 'P' | 'A' | 'T' | 'E') => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                // Determine if we are un-toggling or setting a new status for today
                const currentStatus = s.attendance[0] === status ? undefined : status;
                return { ...s, attendance: { ...s.attendance, 0: currentStatus as any } };
            }
            return s;
        }));
    };

    const getAttendanceClass = (studentAttendance: Record<number, string>, targetStatus: string) => {
        const isActive = studentAttendance[0] === targetStatus;
        if (!isActive) return 'att-btn';
        return `att-btn ${targetStatus.toLowerCase()}-active`;
    };

    if (loadingCourses) {
        return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Cargando cursos...</div>;
    }

    if (courses.length === 0) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--foreground)' }}>No hay cursos activos</h2>
                <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>Debes crear al menos un curso y matricular estudiantes para poder registrar calificaciones.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--card-foreground)', marginBottom: '0.25rem' }}>Registro Académico Central</h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Ingreso de calificaciones, asistencias y competencias formativas.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {saveStatus && <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--success-fg)' }}>{saveStatus}</span>}
                    <button
                        onClick={handleSave}
                        disabled={isPending || loadingStudents || !selectedCourseId}
                        style={{
                            backgroundColor: 'var(--primary)', color: 'white', padding: '0.625rem 1.25rem',
                            borderRadius: 'var(--radius-md)', fontWeight: 500, opacity: (isPending || loadingStudents) ? 0.7 : 1,
                            cursor: (isPending || loadingStudents) ? 'not-allowed' : 'pointer', boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        {isPending ? 'Guardando...' : 'Guardar Cambios BD'}
                    </button>
                </div>
            </div>

            <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem', marginBottom: '2rem', padding: '1rem 1.5rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>Seleccionar Curso</label>
                    <select
                        className="input-select"
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                    >
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.name} - Grado {c.grade_level} "{c.section}"</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                {loadingStudents ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Cargando estudiantes desde BD...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        {/* Table Header exactly as before */}
                        <thead>
                            <tr style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem', fontWeight: 600, minWidth: '200px' }}>Estudiante</th>
                                <th style={{ padding: '1rem', fontWeight: 600, borderLeft: '1px solid var(--border)' }}>Asistencia</th>
                                <th colSpan={4} style={{ padding: '1rem', fontWeight: 600, borderLeft: '1px solid var(--border)', textAlign: 'center' }}>Períodos</th>
                                <th style={{ padding: '1rem', fontWeight: 600, borderLeft: '1px solid var(--border)' }}>RP</th>
                                <th colSpan={3} style={{ padding: '1rem', fontWeight: 600, borderLeft: '1px solid var(--border)', textAlign: 'center' }}>Competencias</th>
                                <th style={{ padding: '1rem', fontWeight: 600, borderLeft: '1px solid var(--border)', textAlign: 'center' }}>Final</th>
                            </tr>
                            <tr style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', textAlign: 'center', borderBottom: '1px solid var(--border)', fontSize: '0.75rem' }}>
                                <th style={{ padding: '0.5rem' }}>Nombre / ID</th>
                                <th style={{ padding: '0.5rem', borderLeft: '1px solid var(--border)' }}>% (P, A, T, E)</th>
                                <th style={{ padding: '0.5rem', borderLeft: '1px solid var(--border)', width: '60px' }}>P1</th>
                                <th style={{ padding: '0.5rem', width: '60px' }}>P2</th>
                                <th style={{ padding: '0.5rem', width: '60px' }}>P3</th>
                                <th style={{ padding: '0.5rem', width: '60px' }}>P4</th>
                                <th style={{ padding: '0.5rem', borderLeft: '1px solid var(--border)', width: '60px' }}>Nota</th>
                                <th style={{ padding: '0.5rem', borderLeft: '1px solid var(--border)', width: '70px' }}>Com.</th>
                                <th style={{ padding: '0.5rem', width: '70px' }}>Lóg.</th>
                                <th style={{ padding: '0.5rem', width: '70px' }}>Prob.</th>
                                <th style={{ padding: '0.5rem', borderLeft: '1px solid var(--border)', width: '80px' }}>Prom / Est</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, idx) => {
                                const { score, status } = calculateFinalScore(student.grades);
                                const needsRP = score > 0 && score < 70;

                                return (
                                    <tr key={student.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--muted)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>{student.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>ID: {student.identification}</div>
                                        </td>
                                        <td style={{ padding: '1rem', borderLeft: '1px solid var(--border)', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                                <button onClick={() => handleAttendanceChange(student.id, 'P')} className={getAttendanceClass(student.attendance, 'P')}>P</button>
                                                <button onClick={() => handleAttendanceChange(student.id, 'A')} className={getAttendanceClass(student.attendance, 'A')}>A</button>
                                                <button onClick={() => handleAttendanceChange(student.id, 'T')} className={getAttendanceClass(student.attendance, 'T')}>T</button>
                                                <button onClick={() => handleAttendanceChange(student.id, 'E')} className={getAttendanceClass(student.attendance, 'E')}>E</button>
                                            </div>
                                        </td>
                                        {['p1', 'p2', 'p3', 'p4'].map(p => (
                                            <td key={p} style={{ padding: '0.5rem', borderLeft: p === 'p1' ? '1px solid var(--border)' : 'none' }}>
                                                <input
                                                    type="number" min="0" max="100"
                                                    className="grade-input"
                                                    value={student.grades[p as keyof StudentData['grades']] || ''}
                                                    onChange={(e) => handleGradeChange(student.id, p as keyof StudentData['grades'], e.target.value)}
                                                />
                                            </td>
                                        ))}

                                        <td style={{ padding: '0.5rem', borderLeft: '1px solid var(--border)', backgroundColor: needsRP ? 'var(--warning-bg)' : 'transparent' }}>
                                            <input
                                                type="number" min="0" max="100"
                                                className="grade-input"
                                                disabled={!needsRP && !student.grades.rp}
                                                value={student.grades.rp || ''}
                                                onChange={(e) => handleGradeChange(student.id, 'rp', e.target.value)}
                                            />
                                        </td>

                                        {['comp_communicative', 'comp_logical', 'comp_problem'].map(c => (
                                            <td key={c} style={{ padding: '0.5rem', borderLeft: c === 'comp_communicative' ? '1px solid var(--border)' : 'none' }}>
                                                <input
                                                    type="number" min="0" max="100"
                                                    className="grade-input"
                                                    value={student.grades[c as keyof StudentData['grades']] || ''}
                                                    onChange={(e) => handleGradeChange(student.id, c as keyof StudentData['grades'], e.target.value)}
                                                />
                                            </td>
                                        ))}

                                        <td style={{ padding: '1rem', borderLeft: '1px solid var(--border)', textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: status === 'A' ? 'var(--success-fg)' : (status === 'R' ? 'var(--error-fg)' : 'var(--muted-foreground)') }}>
                                                {score > 0 ? score : '-'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: status === 'A' ? 'var(--success-fg)' : (status === 'R' ? 'var(--error-fg)' : 'var(--muted-foreground)') }}>
                                                {status === 'A' ? 'APROBADO' : (status === 'R' ? 'REPROBADO' : '')}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
        .input-select {
          width: 100%;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background-color: var(--background);
          color: var(--foreground);
          outline: none;
        }
        .grade-input {
          width: 100%;
          padding: 0.5rem 0.25rem;
          text-align: center;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background-color: var(--card);
          color: var(--foreground);
          font-weight: 500;
          outline: none;
        }
        .grade-input:disabled {
          background-color: var(--muted);
          color: var(--muted-foreground);
          cursor: not-allowed;
        }
        .att-btn {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 700;
          border: 1px solid var(--border);
          color: var(--muted-foreground);
          background: transparent;
          cursor: pointer;
        }
        .att-btn.p-active {
          background-color: var(--success-bg);
          color: var(--success-fg);
          border-color: var(--success);
        }
        .att-btn.a-active {
          background-color: var(--error-bg);
          color: var(--error-fg);
          border-color: var(--error);
        }
        .att-btn.t-active {
          background-color: var(--warning-bg);
          color: var(--warning-fg);
          border-color: var(--warning);
        }
        .att-btn.e-active {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
        }
      `}</style>
        </div>
    );
}

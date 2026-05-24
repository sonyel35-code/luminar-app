'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
    fetchStudentsWithGrades, saveGrades, fetchCourses,
    addStudentToCourse, updateStudent, removeStudentFromCourse
} from './actions';
import { UserPlus, Edit2, Trash2, X, Check, BookOpen, ChevronDown, ChevronUp, Save, Users } from 'lucide-react';

/* ─────────────────────────────── Types ────────────────────────────────── */

type GradeFields = {
    p1: number | null; p2: number | null; p3: number | null; p4: number | null;
    rp: number | null;
    comp_communicative: number | null; comp_logical: number | null; comp_problem: number | null;
};

type StudentData = {
    id: string; enrollmentId: string | null;
    name: string; identification: string; gender?: string; dateOfBirth?: string;
    attendance: Record<number, 'P' | 'A' | 'T' | 'E'>;
    grades: GradeFields;
};

type Course = { id: string; name: string; grade_level: string; section: string; profiles?: { full_name: string }[] };

const EMPTY_FORM = { fullName: '', identificationNumber: '', gender: '', dateOfBirth: '' };

/* ─────────────────────────── Helpers ──────────────────────────────────── */

function calcFinal(g: GradeFields): { score: number; status: 'A' | 'R' | '-' } {
    const vals = [g.p1, g.p2, g.p3, g.p4].filter((v): v is number => v !== null);
    if (vals.length === 0) return { score: 0, status: '-' };
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const score = g.rp !== null && g.rp > avg ? g.rp : avg;
    const rounded = Math.round(score);
    return { score: rounded, status: rounded >= 70 ? 'A' : 'R' };
}

/* ─────────────────────────── Sub-components ───────────────────────────── */

function GradeCell({ value, onChange, disabled = false, highlight = false }: {
    value: number | null; onChange: (v: string) => void; disabled?: boolean; highlight?: boolean;
}) {
    return (
        <input
            type="number" min="0" max="100"
            disabled={disabled}
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            style={{
                width: '52px', padding: '0.35rem 0.2rem', textAlign: 'center',
                borderRadius: '6px', border: `1px solid ${highlight ? 'var(--warning)' : 'var(--border)'}`,
                backgroundColor: disabled ? 'var(--muted)' : (highlight ? 'var(--warning-bg)' : 'var(--background)'),
                color: disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
                fontWeight: 600, fontSize: '0.85rem', outline: 'none',
                cursor: disabled ? 'not-allowed' : 'text',
            }}
        />
    );
}

/* ─────────────────────────── Main Page ────────────────────────────────── */

export default function GradeRegistryPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [students, setStudents] = useState<StudentData[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    // Student panel
    const [panelOpen, setPanelOpen] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');
    const [formPending, setFormPending] = useState(false);

    /* ── Load courses ── */
    useEffect(() => {
        fetchCourses().then(data => {
            setCourses(data as Course[]);
            if (data.length > 0) setSelectedCourseId(data[0].id);
            setLoadingCourses(false);
        });
    }, []);

    /* ── Load students on course change ── */
    const loadStudents = useCallback(async (courseId: string) => {
        if (!courseId) return;
        setLoadingStudents(true);
        const data = await fetchStudentsWithGrades(courseId);
        setStudents(data as StudentData[]);
        setLoadingStudents(false);
    }, []);

    useEffect(() => { loadStudents(selectedCourseId); }, [selectedCourseId, loadStudents]);

    /* ── Grade change ── */
    const handleGradeChange = (studentId: string, field: keyof GradeFields, value: string) => {
        const num = value === '' ? null : Math.min(100, Math.max(0, Number(value)));
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, grades: { ...s.grades, [field]: num } } : s
        ));
    };

    const handleAttendanceChange = (studentId: string, status: 'P' | 'A' | 'T' | 'E') => {
        setStudents(prev => prev.map(s =>
            s.id === studentId
                ? { ...s, attendance: { ...s.attendance, 0: s.attendance[0] === status ? undefined as any : status } }
                : s
        ));
    };

    /* ── Save grades ── */
    const handleSave = () => {
        if (!selectedCourseId) return;
        startTransition(async () => {
            setSaveStatus('saving');
            try {
                await saveGrades(selectedCourseId, students);
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } catch {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 4000);
            }
        });
    };

    /* ── Student form ── */
    const openAddForm = () => {
        setForm(EMPTY_FORM);
        setFormError('');
        setEditingStudentId(null);
        setFormMode('add');
        setPanelOpen(true);
    };

    const openEditForm = (s: StudentData) => {
        setForm({
            fullName: s.name,
            identificationNumber: s.identification,
            gender: s.gender ?? '',
            dateOfBirth: s.dateOfBirth ?? '',
        });
        setFormError('');
        setEditingStudentId(s.id);
        setFormMode('edit');
        setPanelOpen(true);
    };

    const closeForm = () => { setFormMode(null); setEditingStudentId(null); };

    const handleFormSubmit = async () => {
        if (!form.fullName.trim() || !form.identificationNumber.trim()) {
            setFormError('Nombre e identificación son obligatorios.');
            return;
        }
        setFormError('');
        setFormPending(true);
        try {
            if (formMode === 'add') {
                await addStudentToCourse(selectedCourseId, {
                    fullName: form.fullName.trim(),
                    identificationNumber: form.identificationNumber.trim(),
                    gender: form.gender || undefined,
                    dateOfBirth: form.dateOfBirth || undefined,
                });
            } else if (formMode === 'edit' && editingStudentId) {
                await updateStudent(editingStudentId, {
                    fullName: form.fullName.trim(),
                    identificationNumber: form.identificationNumber.trim(),
                    gender: form.gender || undefined,
                    dateOfBirth: form.dateOfBirth || undefined,
                });
            }
            closeForm();
            await loadStudents(selectedCourseId);
        } catch (e: any) {
            setFormError(e?.message || 'Error al guardar.');
        } finally {
            setFormPending(false);
        }
    };

    const handleRemove = async (s: StudentData) => {
        if (!s.enrollmentId) return;
        if (!confirm(`¿Quitar a ${s.name} del curso? (No se elimina el estudiante del sistema)`)) return;
        await removeStudentFromCourse(s.enrollmentId);
        await loadStudents(selectedCourseId);
    };

    /* ── Stats ── */
    const stats = students.reduce(
        (acc, s) => {
            const { status } = calcFinal(s.grades);
            if (status === 'A') acc.aprobados++;
            else if (status === 'R') acc.reprobados++;
            return acc;
        },
        { aprobados: 0, reprobados: 0 }
    );

    const selectedCourse = courses.find(c => c.id === selectedCourseId);

    /* ── Render ── */
    if (loadingCourses) return (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <BookOpen size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>Cargando cursos...</p>
        </div>
    );

    if (courses.length === 0) return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <BookOpen size={48} style={{ margin: '0 auto 1rem', color: 'var(--primary)', opacity: 0.5 }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Sin cursos disponibles</h2>
            <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                Crea un curso primero para poder registrar calificaciones.
            </p>
        </div>
    );

    return (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── Page header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Registro de Calificaciones
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                        Ingreso de notas por período, recuperación y competencias formativas.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {saveStatus === 'success' && (
                        <span style={{ fontSize: '0.875rem', color: 'var(--success-fg)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Check size={16} /> ¡Guardado exitosamente!
                        </span>
                    )}
                    {saveStatus === 'error' && (
                        <span style={{ fontSize: '0.875rem', color: 'var(--error-fg)', fontWeight: 500 }}>Error al guardar. Intente de nuevo.</span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isPending || loadingStudents || !selectedCourseId || students.length === 0}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            color: 'white', padding: '0.6rem 1.25rem',
                            borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem',
                            opacity: (isPending || loadingStudents || students.length === 0) ? 0.6 : 1,
                            cursor: (isPending || loadingStudents || students.length === 0) ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)',
                            border: 'none', transition: 'all 0.2s',
                        }}
                    >
                        <Save size={16} />
                        {saveStatus === 'saving' ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            {/* ── Course selector + info bar ── */}
            <div className="card grade-info-bar" style={{ padding: '1.25rem 1.5rem' }}>
                <div>
                    <label style={labelStyle}>Curso / Asignatura</label>
                    <select
                        className="input-select"
                        value={selectedCourseId}
                        onChange={e => { setSelectedCourseId(e.target.value); closeForm(); }}
                    >
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.name} — Grado {c.grade_level} · Sección {c.section}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div>
                        <div style={labelStyle}>Docente</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedCourse?.profiles?.[0]?.full_name || '—'}</div>
                    </div>
                    <div>
                        <div style={labelStyle}>Sección</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedCourse?.section || '—'}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <StatBadge label="Total" value={students.length} color="var(--primary)" />
                    <StatBadge label="Aprobados" value={stats.aprobados} color="var(--success-fg)" />
                    <StatBadge label="Reprobados" value={stats.reprobados} color="var(--error-fg)" />
                </div>
            </div>

            {/* ── Student management panel ── */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <button
                    onClick={() => setPanelOpen(p => !p)}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '1rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--foreground)', fontWeight: 600, fontSize: '0.95rem',
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Users size={18} color="var(--primary)" />
                        Gestión de Estudiantes
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--muted-foreground)' }}>
                            ({students.length} inscritos)
                        </span>
                    </span>
                    {panelOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {panelOpen && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 1.5rem' }}>
                        {/* Add button */}
                        {formMode !== 'add' && (
                            <button onClick={openAddForm} style={addBtnStyle}>
                                <UserPlus size={15} /> Agregar Estudiante
                            </button>
                        )}

                        {/* Inline form */}
                        {formMode !== null && (
                            <div style={{
                                background: 'var(--secondary)', borderRadius: '12px', padding: '1.25rem',
                                marginTop: '1rem', border: '1px solid var(--border)',
                            }}>
                                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--foreground)' }}>
                                    {formMode === 'add' ? '➕ Agregar Estudiante' : '✏️ Editar Estudiante'}
                                </h3>
                                <div className="grade-student-form-grid">
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={labelStyle}>Nombre completo *</label>
                                        <input
                                            style={inputStyle}
                                            placeholder="Apellido, Nombre"
                                            value={form.fullName}
                                            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>No. Identificación *</label>
                                        <input
                                            style={inputStyle}
                                            placeholder="001-0000000-0"
                                            value={form.identificationNumber}
                                            onChange={e => setForm(f => ({ ...f, identificationNumber: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Género</label>
                                        <select
                                            className="input-select"
                                            value={form.gender}
                                            onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                                        >
                                            <option value="">— Seleccionar —</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                </div>
                                {formError && (
                                    <p style={{ color: 'var(--error-fg)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{formError}</p>
                                )}
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button onClick={handleFormSubmit} disabled={formPending} style={confirmBtnStyle}>
                                        <Check size={15} /> {formPending ? 'Guardando...' : (formMode === 'add' ? 'Agregar' : 'Guardar')}
                                    </button>
                                    <button onClick={closeForm} style={cancelBtnStyle}>
                                        <X size={15} /> Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Students list */}
                        {students.length > 0 && (
                            <div style={{ marginTop: formMode ? '1rem' : '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '260px', overflowY: 'auto' }}>
                                {students.map((s, i) => {
                                    const { status } = calcFinal(s.grades);
                                    return (
                                        <div key={s.id} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '0.6rem 0.875rem', borderRadius: '8px',
                                            background: i % 2 === 0 ? 'transparent' : 'var(--muted)',
                                            border: '1px solid var(--border)',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{
                                                    width: '26px', height: '26px', borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
                                                }}>{i + 1}</span>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.name}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>ID: {s.identification}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {status !== '-' && (
                                                    <span style={{
                                                        fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem',
                                                        background: status === 'A' ? 'var(--success-bg)' : 'var(--error-bg)',
                                                        color: status === 'A' ? 'var(--success-fg)' : 'var(--error-fg)',
                                                    }}>{status === 'A' ? 'APROBADO' : 'REPROBADO'}</span>
                                                )}
                                                <button onClick={() => openEditForm(s)} style={iconBtnStyle}>
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => handleRemove(s)} style={{ ...iconBtnStyle, color: 'var(--error-fg)' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Grade table ── */}
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                {loadingStudents ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                        Cargando estudiantes...
                    </div>
                ) : students.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                        <Users size={36} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p>No hay estudiantes inscritos. Usa el panel de arriba para agregarlos.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '900px' }}>
                        <thead>
                            {/* Group header row */}
                            <tr style={{ backgroundColor: 'var(--primary)', color: 'white', textAlign: 'center' }}>
                                <th style={th({ width: '30px' })} rowSpan={2}>#</th>
                                <th style={{ ...th({}), textAlign: 'left', minWidth: '180px' }} rowSpan={2}>Estudiante</th>
                                <th style={th({})} colSpan={4}>Períodos</th>
                                <th style={{ ...th({}), background: 'rgba(0,0,0,0.15)' }}>Recup.</th>
                                <th style={th({})} colSpan={3}>Competencias</th>
                                <th style={{ ...th({}), background: 'rgba(0,0,0,0.2)', minWidth: '90px' }} rowSpan={2}>Calif. Final</th>
                            </tr>
                            {/* Sub-header */}
                            <tr style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.7)', color: 'white', textAlign: 'center', fontSize: '0.78rem' }}>
                                {['P1', 'P2', 'P3', 'P4'].map(p => (
                                    <th key={p} style={th({ width: '60px' })}>{p}</th>
                                ))}
                                <th style={{ ...th({ width: '60px' }), background: 'rgba(0,0,0,0.15)' }}>RP</th>
                                <th style={th({ width: '65px' })}>Com.</th>
                                <th style={th({ width: '65px' })}>Lóg.</th>
                                <th style={th({ width: '65px' })}>Prob.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, idx) => {
                                const { score, status } = calcFinal(student.grades);
                                const needsRP = score > 0 && score < 70;

                                return (
                                    <tr
                                        key={student.id}
                                        style={{
                                            borderBottom: '1px solid var(--border)',
                                            backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--muted)',
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        {/* Number */}
                                        <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--muted-foreground)', fontWeight: 600, fontSize: '0.78rem' }}>
                                            {idx + 1}
                                        </td>

                                        {/* Name */}
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{student.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                                                {student.identification} {student.gender ? `· ${student.gender}` : ''}
                                            </div>
                                        </td>

                                        {/* P1-P4 */}
                                        {(['p1', 'p2', 'p3', 'p4'] as const).map(p => (
                                            <td key={p} style={{ padding: '0.4rem', textAlign: 'center' }}>
                                                <GradeCell
                                                    value={student.grades[p]}
                                                    onChange={v => handleGradeChange(student.id, p, v)}
                                                />
                                            </td>
                                        ))}

                                        {/* RP */}
                                        <td style={{ padding: '0.4rem', textAlign: 'center', backgroundColor: needsRP ? 'rgba(var(--warning-rgb), 0.07)' : 'transparent' }}>
                                            <GradeCell
                                                value={student.grades.rp}
                                                onChange={v => handleGradeChange(student.id, 'rp', v)}
                                                disabled={!needsRP && !student.grades.rp}
                                                highlight={needsRP}
                                            />
                                        </td>

                                        {/* Competencies */}
                                        {(['comp_communicative', 'comp_logical', 'comp_problem'] as const).map(c => (
                                            <td key={c} style={{ padding: '0.4rem', textAlign: 'center' }}>
                                                <GradeCell
                                                    value={student.grades[c]}
                                                    onChange={v => handleGradeChange(student.id, c, v)}
                                                />
                                            </td>
                                        ))}

                                        {/* Final */}
                                        <td style={{ padding: '0.75rem', textAlign: 'center', borderLeft: '2px solid var(--border)' }}>
                                            {score > 0 ? (
                                                <>
                                                    <div style={{
                                                        fontSize: '1.4rem', fontWeight: 800, lineHeight: 1,
                                                        color: status === 'A' ? 'var(--success-fg)' : 'var(--error-fg)',
                                                    }}>{score}</div>
                                                    <div style={{
                                                        fontSize: '0.62rem', fontWeight: 700, marginTop: '0.2rem',
                                                        color: status === 'A' ? 'var(--success-fg)' : 'var(--error-fg)',
                                                    }}>
                                                        {status === 'A' ? '✓ APROBADO' : '✗ REPROBADO'}
                                                    </div>
                                                </>
                                            ) : (
                                                <span style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
        .input-select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background-color: var(--background);
          color: var(--foreground);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-select:focus { border-color: var(--primary); }
        table th { border-right: 1px solid rgba(255,255,255,0.15); }
        table td:not(:first-child) { border-left: 1px solid var(--border); }
        tbody tr:hover { background-color: rgba(var(--primary-rgb), 0.04) !important; }
      `}</style>
        </div>
    );
}

/* ─────────────────────────── Inline styles ─────────────────────────────── */

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: 'var(--muted-foreground)', textTransform: 'uppercase',
    letterSpacing: '0.05em', marginBottom: '0.375rem',
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.5rem 0.75rem',
    border: '1px solid var(--border)', borderRadius: '8px',
    background: 'var(--background)', color: 'var(--foreground)',
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
};

const addBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 1rem', borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    color: 'white', fontWeight: 600, fontSize: '0.85rem',
    border: 'none', cursor: 'pointer',
};

const confirmBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 1.125rem', borderRadius: '8px',
    background: 'var(--success-fg)', color: 'white',
    fontWeight: 600, fontSize: '0.85rem', border: 'none', cursor: 'pointer',
};

const cancelBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 1rem', borderRadius: '8px',
    background: 'var(--secondary)', color: 'var(--muted-foreground)',
    fontWeight: 600, fontSize: '0.85rem', border: '1px solid var(--border)', cursor: 'pointer',
};

const iconBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '28px', height: '28px', borderRadius: '6px',
    background: 'var(--secondary)', color: 'var(--muted-foreground)',
    border: '1px solid var(--border)', cursor: 'pointer',
};

function th(extra: React.CSSProperties): React.CSSProperties {
    return { padding: '0.75rem 0.5rem', fontWeight: 700, fontSize: '0.8rem', ...extra };
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', fontWeight: 600, marginTop: '0.1rem' }}>{label}</div>
        </div>
    );
}

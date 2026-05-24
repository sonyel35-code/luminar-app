'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/* ─────────────────────────────────────────────────────────────────────────
   COURSES
───────────────────────────────────────────────────────────────────────── */

export async function fetchCourses() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

    let query = supabase
        .from('courses')
        .select('id, name, grade_level, section, teacher_id, profiles(full_name)')
        .order('grade_level')
        .order('name');

    // Teachers only see their own courses; admins see all
    if (profile?.role === 'teacher') {
        query = query.eq('teacher_id', user.id);
    }

    const { data } = await query;
    return data || [];
}

/* ─────────────────────────────────────────────────────────────────────────
   STUDENTS — read
───────────────────────────────────────────────────────────────────────── */

export async function fetchStudentsWithGrades(courseId: string) {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data: students, error } = await supabase
        .from('students')
        .select(`
            id,
            full_name,
            identification_number,
            date_of_birth,
            gender,
            enrollments!inner(id, course_id),
            grades(p1, p2, p3, p4, rp, comp_communicative, comp_logical, comp_problem_solving),
            attendance(status, record_date)
        `)
        .eq('enrollments.course_id', courseId)
        .order('full_name');

    if (error) {
        console.error('Error fetching students:', error);
        return [];
    }

    return students.map((s: any) => {
        const currentGrades = s.grades?.[0] ?? {
            p1: null, p2: null, p3: null, p4: null, rp: null,
            comp_communicative: null, comp_logical: null, comp_problem_solving: null
        };

        const todayAttendance = s.attendance?.find((a: any) => a.record_date === today);
        const enrollment = s.enrollments?.[0];

        return {
            id: s.id,
            enrollmentId: enrollment?.id ?? null,
            name: s.full_name,
            identification: s.identification_number,
            dateOfBirth: s.date_of_birth,
            gender: s.gender,
            attendance: (todayAttendance ? { 0: todayAttendance.status } : {}) as Record<number, 'P' | 'A' | 'T' | 'E'>,
            grades: {
                p1: currentGrades.p1,
                p2: currentGrades.p2,
                p3: currentGrades.p3,
                p4: currentGrades.p4,
                rp: currentGrades.rp,
                comp_communicative: currentGrades.comp_communicative,
                comp_logical: currentGrades.comp_logical,
                comp_problem: currentGrades.comp_problem_solving,
            }
        };
    });
}

/* ─────────────────────────────────────────────────────────────────────────
   STUDENTS — create
───────────────────────────────────────────────────────────────────────── */

export async function addStudentToCourse(
    courseId: string,
    data: { fullName: string; identificationNumber: string; gender?: string; dateOfBirth?: string }
) {
    const supabase = await createClient();

    // Check if student already exists by ID number
    const { data: existing } = await supabase
        .from('students')
        .select('id')
        .eq('identification_number', data.identificationNumber)
        .maybeSingle();

    let studentId: string;

    if (existing) {
        studentId = existing.id;
    } else {
        const { data: newStudent, error: insertErr } = await supabase
            .from('students')
            .insert({
                full_name: data.fullName,
                identification_number: data.identificationNumber,
                gender: data.gender || null,
                date_of_birth: data.dateOfBirth || null,
            })
            .select('id')
            .single();

        if (insertErr || !newStudent) {
            throw new Error(insertErr?.message || 'Error al crear el estudiante');
        }
        studentId = newStudent.id;
    }

    // Enroll in course (idempotent)
    const { data: existingEnroll } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .maybeSingle();

    if (!existingEnroll) {
        const { error: enrollErr } = await supabase
            .from('enrollments')
            .insert({ student_id: studentId, course_id: courseId });

        if (enrollErr) {
            throw new Error(enrollErr.message || 'Error al matricular al estudiante');
        }
    }

    revalidatePath('/portal/grades');
    return { success: true, studentId };
}

/* ─────────────────────────────────────────────────────────────────────────
   STUDENTS — update
───────────────────────────────────────────────────────────────────────── */

export async function updateStudent(
    studentId: string,
    data: { fullName: string; identificationNumber: string; gender?: string; dateOfBirth?: string }
) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('students')
        .update({
            full_name: data.fullName,
            identification_number: data.identificationNumber,
            gender: data.gender || null,
            date_of_birth: data.dateOfBirth || null,
        })
        .eq('id', studentId);

    if (error) throw new Error(error.message);

    revalidatePath('/portal/grades');
    return { success: true };
}

/* ─────────────────────────────────────────────────────────────────────────
   STUDENTS — remove from course
───────────────────────────────────────────────────────────────────────── */

export async function removeStudentFromCourse(enrollmentId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId);

    if (error) throw new Error(error.message);

    revalidatePath('/portal/grades');
    return { success: true };
}

/* ─────────────────────────────────────────────────────────────────────────
   GRADES — save
───────────────────────────────────────────────────────────────────────── */

export async function saveGrades(courseId: string, studentsData: any[]) {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    for (const student of studentsData) {
        const { error: gradeError } = await supabase
            .from('grades')
            .upsert(
                {
                    student_id: student.id,
                    course_id: courseId,
                    p1: student.grades.p1,
                    p2: student.grades.p2,
                    p3: student.grades.p3,
                    p4: student.grades.p4,
                    rp: student.grades.rp,
                    comp_communicative: student.grades.comp_communicative,
                    comp_logical: student.grades.comp_logical,
                    comp_problem_solving: student.grades.comp_problem,
                },
                { onConflict: 'student_id,course_id' }
            );

        if (gradeError) {
            console.error('Error saving grades for student', student.id, gradeError);
        }

        if (student.attendance?.[0]) {
            const { error: attError } = await supabase
                .from('attendance')
                .upsert(
                    {
                        student_id: student.id,
                        course_id: courseId,
                        record_date: today,
                        status: student.attendance[0]
                    },
                    { onConflict: 'student_id,course_id,record_date' }
                );
            if (attError) console.error('Error saving attendance:', attError);
        }
    }

    revalidatePath('/portal/grades');
    return { success: true };
}

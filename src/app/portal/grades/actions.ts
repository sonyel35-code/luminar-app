'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function fetchCourses() {
    const supabase = await createClient();
    const { data } = await supabase.from('courses').select('*').order('name');
    return data || [];
}

export async function fetchStudentsWithGrades(courseId: string) {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Basic query to get enrollments -> students -> grades & attendance
    const { data: students, error: studentError } = await supabase
        .from('students')
        .select(`
      id,
      full_name,
      identification_number,
      enrollments!inner(course_id),
      grades(p1, p2, p3, p4, rp, comp_communicative, comp_logical, comp_problem_solving),
      attendance(status, record_date)
    `)
        .eq('enrollments.course_id', courseId);

    if (studentError) {
        console.error('Error fetching students:', studentError);
        return [];
    }

    // Format to match UI
    return students.map((s: any) => {
        // Determine grades if row exists, otherwise nulls
        const currentGrades = s.grades?.[0] || {
            p1: null, p2: null, p3: null, p4: null, rp: null,
            comp_communicative: null, comp_logical: null, comp_problem_solving: null
        };

        const todayAttendance = s.attendance?.find((a: any) => a.record_date === today);

        return {
            id: s.id,
            name: s.full_name,
            identification: s.identification_number,
            attendance: (todayAttendance ? { 0: todayAttendance.status } : {}) as Record<number, 'P' | 'A' | 'T' | 'E'>,
            grades: {
                ...currentGrades,
                comp_problem: currentGrades.comp_problem_solving
            }
        };
    });
}

export async function saveGrades(courseId: string, studentsData: any[]) {
    const supabase = await createClient();

    const today = new Date().toISOString().split('T')[0];

    for (const student of studentsData) {
        // Upsert grades. Need both student_id and course_id to exist or update.
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

        // Upsert attendance if specified
        if (student.attendance && student.attendance[0]) {
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

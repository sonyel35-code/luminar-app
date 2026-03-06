'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCoursesList() {
    const supabase = await createClient();
    const { data } = await supabase.from('courses').select('id, name, grade_level, section').order('name');
    return data || [];
}

export async function getEnrollmentData(courseId: string) {
    const supabase = await createClient();

    // 1. Get all students
    const { data: allStudents } = await supabase.from('students').select('id, full_name, identification_number').order('full_name');

    // 2. Get enrollments for this specific course
    const { data: enrolledLinks } = await supabase.from('enrollments').select('student_id').eq('course_id', courseId);

    const enrolledIds = new Set((enrolledLinks || []).map(link => link.student_id));

    const enrolledStudents = (allStudents || []).filter(s => enrolledIds.has(s.id));
    const availableStudents = (allStudents || []).filter(s => !enrolledIds.has(s.id));

    return { enrolledStudents, availableStudents };
}

export async function enrollStudent(courseId: string, studentId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('enrollments').insert({ course_id: courseId, student_id: studentId });
    if (error) {
        console.error('Enroll error:', error);
    } else {
        revalidatePath('/portal/enrollments');
    }
    return { success: !error };
}

export async function unenrollStudent(courseId: string, studentId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('enrollments').delete().match({ course_id: courseId, student_id: studentId });
    if (error) {
        console.error('Unenroll error:', error);
    } else {
        revalidatePath('/portal/enrollments');
    }
    return { success: !error };
}

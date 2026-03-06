'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getStudents() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('students')
        .select(`id, full_name, identification_number, enrollments(course_id, courses(name, grade_level, section))`)
        .order('full_name');

    return (data || []).map(student => ({
        ...student,
        enrollments: (student.enrollments || []).map(enr => ({
            ...enr,
            courses: Array.isArray(enr.courses) ? enr.courses[0] : enr.courses
        }))
    }));
}

export async function addStudent(formData: FormData) {
    const supabase = await createClient();
    const data = {
        full_name: formData.get('name') as string,
        identification_number: formData.get('identification') as string,
    };

    // Using simple anon key, relies on RLS allowing inserts internally. Fast insert.
    const { error } = await supabase.from('students').insert(data);
    if (error) {
        return { success: false, message: error.message };
    }
    revalidatePath('/portal/students');
    return { success: true, message: 'Estudiante agregado correctamente.' };
}

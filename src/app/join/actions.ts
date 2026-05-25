'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * joinCourseWithInvite
 * 1. Signs up a new parent account (role = 'parent')
 * 2. Connects/Creates their student child record
 * 3. Links parent and child in student_parents
 * 4. Enrolls child in the invited course
 */
export async function joinCourseWithInvite(courseId: string, formData: FormData) {
    const supabase = await createClient();

    const parentName = (formData.get('parent_name') as string)?.trim();
    const childName = (formData.get('child_name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const password = (formData.get('password') as string);

    if (!parentName || !childName || !email || !password) {
        return { success: false, message: 'Todos los campos son obligatorios.' };
    }

    // 1. Sign up the parent in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: parentName,
                role: 'parent'
            }
        }
    });

    if (authError || !authData.user) {
        return { success: false, message: `Error al crear tu cuenta: ${authError?.message || 'Verifica los datos'}` };
    }

    const parentUserId = authData.user.id;

    // 2. Find or Insert Child in public.students
    let studentId: string;
    const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('full_name', childName)
        .maybeSingle();

    if (existingStudent) {
        studentId = existingStudent.id;
    } else {
        // Generate a random student school ID number
        const randomIdNum = 'EST-' + Math.floor(100000 + Math.random() * 900000);
        const { data: newStudent, error: studentError } = await supabase
            .from('students')
            .insert({ full_name: childName, identification_number: randomIdNum })
            .select('id')
            .single();

        if (studentError || !newStudent) {
            return { success: false, message: `Error al registrar al estudiante: ${studentError?.message}` };
        }
        studentId = newStudent.id;
    }

    // 3. Link parent and student in public.student_parents
    const { error: parentStudentErr } = await supabase
        .from('student_parents')
        .insert({ parent_id: parentUserId, student_id: studentId });

    if (parentStudentErr) {
        console.error('Error linking parent and student:', parentStudentErr);
    }

    // 4. Enroll child in course in public.enrollments
    const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({ student_id: studentId, course_id: courseId });

    if (enrollError) {
        console.error('Error enrolling student:', enrollError);
    }

    // Establish dynamic session by logging in
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
        return { success: false, message: `Tu cuenta fue creada pero no pudimos iniciar sesión automáticamente: ${loginError.message}. Por favor ve al login.` };
    }

    revalidatePath('/portal');
    return { success: true, redirect: '/portal' };
}

/**
 * enrollExistingParent
 * Enrolls a linked child of an already logged-in parent into a course
 */
export async function enrollExistingParent(courseId: string, studentId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'No autenticado' };

    // Verify student is actually linked to this parent
    const { data: isLinked } = await supabase
        .from('student_parents')
        .select('id')
        .eq('parent_id', user.id)
        .eq('student_id', studentId)
        .maybeSingle();

    if (!isLinked) {
        return { success: false, message: 'No autorizado: Este estudiante no está vinculado a tu cuenta.' };
    }

    // Check if already enrolled
    const { data: alreadyEnrolled } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .maybeSingle();

    if (alreadyEnrolled) {
        return { success: true, message: 'Ya se encuentra matriculado en este curso.', redirect: '/portal' };
    }

    const { error } = await supabase
        .from('enrollments')
        .insert({ student_id: studentId, course_id: courseId });

    if (error) {
        return { success: false, message: `Error al matricular: ${error.message}` };
    }

    revalidatePath('/portal');
    return { success: true, message: 'Matrícula exitosa.', redirect: '/portal' };
}

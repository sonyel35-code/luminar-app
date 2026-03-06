'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, role, created_at, avatar_url')
        .order('created_at', { ascending: false });
    return data || [];
}

// ─── Student-Parent Linking ────────────────────────────────────────────────────

export async function getStudents() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('students')
        .select('id, full_name, identification_number')
        .order('full_name');
    return data || [];
}

export async function getParentUsers() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .eq('role', 'parent')
        .order('full_name');
    return data || [];
}

export async function getStudentParentLinks() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('student_parents')
        .select('id, student_id, parent_id, students(full_name), profiles!student_parents_parent_id_fkey(full_name)')
        .order('created_at', { ascending: false });

    // Map to ensure students and profiles are objects, not arrays
    return (data || []).map(link => ({
        ...link,
        students: Array.isArray(link.students) ? link.students[0] : link.students,
        profiles: Array.isArray(link.profiles) ? link.profiles[0] : link.profiles
    }));
}

export async function linkStudentParent(studentId: string, parentId: string) {
    const supabase = await createClient();

    // Check if link already exists
    const { data: existing } = await supabase
        .from('student_parents')
        .select('id')
        .eq('student_id', studentId)
        .eq('parent_id', parentId)
        .maybeSingle();

    if (existing) return { success: false, message: 'Esta vinculación ya existe.' };

    const { error } = await supabase
        .from('student_parents')
        .insert({ student_id: studentId, parent_id: parentId });

    if (error) return { success: false, message: error.message };

    revalidatePath('/portal/management');
    return { success: true, message: 'Vinculación creada exitosamente.' };
}

export async function unlinkStudentParent(linkId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('student_parents')
        .delete()
        .eq('id', linkId);

    if (error) return { success: false, message: error.message };

    revalidatePath('/portal/management');
    return { success: true, message: 'Vinculación eliminada.' };
}

export async function getRepresentantes() {
    const supabase = await createClient();

    // Fetch profiles with role 'parent'
    const { data: parents, error } = await supabase
        .from('profiles')
        .select(`
            user_id,
            full_name,
            avatar_url,
            created_at,
            student_parents (
                student_id,
                students (
                    full_name
                )
            )
        `)
        .eq('role', 'parent')
        .order('full_name');

    if (error) {
        console.error('Error fetching representantes:', error);
        return [];
    }

    return (parents || []).map(parent => ({
        ...parent,
        student_parents: (parent.student_parents || []).map(sp => ({
            ...sp,
            students: Array.isArray(sp.students) ? sp.students[0] : sp.students
        }))
    }));
}

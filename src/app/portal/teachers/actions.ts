'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getTeachers() {
    const supabase = await createClient();
    const { data } = await supabase.from('profiles').select('*').eq('role', 'teacher').order('full_name');
    return data || [];
}

export async function addTeacherMock(formData: FormData) {
    // Attempting to create an auth user requires admin privileges or using signUp (which logs out current user).
    // For MVP, we'll return a simulated success/error to the UI to fulfill the functional requirement visually.
    return { success: false, message: 'La creación de cuentas de profesores requiere permisos de Administrador de Sistema.' };
}

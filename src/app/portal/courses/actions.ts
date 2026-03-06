'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCourses() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user!.id).single();

    const query = supabase.from('courses').select('*').order('created_at');
    if (profile?.role === 'teacher') query.eq('teacher_id', user!.id);
    const { data } = await query;
    return data || [];
}

export async function addCourse(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const data = {
        name: formData.get('name') as string,
        grade_level: formData.get('grade_level') as string,
        section: formData.get('section') as string,
        description: formData.get('description') as string,
        teacher_id: user!.id,
    };

    const { error } = await supabase.from('courses').insert(data);
    if (error) {
        return { success: false, message: error.message };
    }
    revalidatePath('/portal/courses');
    return { success: true, message: 'Curso configurado correctamente.' };
}

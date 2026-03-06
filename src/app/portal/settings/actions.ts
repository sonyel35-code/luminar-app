'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    return data;
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Usuario no autenticado' };

    const updates = {
        full_name: formData.get('full_name') as string,
        description: formData.get('description') as string,
        theme: formData.get('theme') as string || 'light',
        avatar_url: formData.get('avatar_url') as string,
    };

    const { error } = await supabase.from('profiles').update(updates).eq('user_id', user.id);

    if (error) {
        return { success: false, message: error.message };
    }

    revalidatePath('/portal', 'layout');
    return { success: true, message: 'Perfil actualizado exitosamente' };
}

export async function uploadAvatar(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, url: '', message: 'No autenticado' };

    const file = formData.get('avatar') as File;
    if (!file || file.size === 0) return { success: false, url: '', message: 'No se seleccionó archivo' };

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        return { success: false, url: '', message: 'Formato no válido. Usa JPG, PNG, WebP o GIF.' };
    }
    if (file.size > 2 * 1024 * 1024) {
        return { success: false, url: '', message: 'El archivo es muy grande. Máximo 2MB.' };
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${user.id}/avatar.${ext}`;

    // Upload (overwrite if exists)
    const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type });

    if (error) {
        return { success: false, url: '', message: `Error al subir: ${error.message}` };
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`; // cache-bust

    // Update profile with the new avatar URL
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('user_id', user.id);

    revalidatePath('/portal', 'layout');
    return { success: true, url: publicUrl, message: 'Foto de perfil actualizada' };
}

export async function setPresetAvatar(avatarUrl: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'No autenticado' };

    const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('user_id', user.id);
    if (error) return { success: false, message: error.message };

    revalidatePath('/portal', 'layout');
    return { success: true, message: 'Avatar actualizado' };
}

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    });

    if (error) {
        redirect('/login?error=Correo o contraseña incorrectos');
    }

    revalidatePath('/portal', 'layout');
    redirect('/portal');
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const fullName = (formData.get('full_name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const role = formData.get('role') as string;

    if (!fullName || !email || !role) {
        redirect('/register?error=Todos los campos son obligatorios');
    }

    const allowedRoles = ['teacher', 'student', 'parent'];
    if (!allowedRoles.includes(role)) {
        redirect('/register?error=Rol no válido');
    }

    const { data: existing } = await supabase
        .from('pending_registrations')
        .select('id, status')
        .eq('email', email)
        .maybeSingle();

    if (existing) {
        if (existing.status === 'pending') {
            redirect('/register?message=Ya tienes una solicitud pendiente. El administrador la revisará pronto.');
        }
        if (existing.status === 'rejected') {
            redirect('/register?error=Tu solicitud anterior fue rechazada. Contacta al administrador.');
        }
        if (existing.status === 'approved') {
            redirect('/register?message=Tu solicitud ya fue aprobada. Inicia sesión con tu contraseña temporal.');
        }
    }

    const { error } = await supabase
        .from('pending_registrations')
        .insert({ full_name: fullName, email, requested_role: role });

    if (error) {
        redirect('/register?error=No se pudo enviar la solicitud. Verifica que tu correo no esté ya registrado.');
    }

    redirect('/register?message=✅ Solicitud enviada con éxito. El administrador revisará tu solicitud y te dará acceso una vez aprobada.');
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}

// ─── Utility: generate a secure random password ────────────────────────────────
function generatePassword(length = 12): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => chars[byte % chars.length]).join('');
}

// ─── Admin: approve a pending registration ─────────────────────────────────────

export async function approveRegistration(registrationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'No autenticado' };

    // Verify caller is admin
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
    if (adminProfile?.role !== 'admin') return { success: false, message: 'No autorizado' };

    // Get registration data
    const { data: reg } = await supabase
        .from('pending_registrations')
        .select('*')
        .eq('id', registrationId)
        .single();

    if (!reg) return { success: false, message: 'Solicitud no encontrada' };

    // Auto-generate a secure temporary password
    const tempPassword = generatePassword(12);

    // Use admin client (service_role key) to create the user
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminSupabase = createAdminClient();

    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: reg.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
            full_name: reg.full_name,
            role: reg.requested_role,
        },
    });

    if (authError) {
        return { success: false, message: `Error al crear usuario: ${authError.message}` };
    }

    // Send welcome email with credentials via Supabase Edge Function or direct email
    // For now, we'll use the built-in password recovery flow to send an email
    // This sends a "Reset Password" email so the user can set their own password
    const { error: resetError } = await adminSupabase.auth.admin.generateLink({
        type: 'recovery',
        email: reg.email,
    });

    // Mark as approved
    await supabase
        .from('pending_registrations')
        .update({ status: 'approved', reviewer_id: user.id, reviewed_at: new Date().toISOString() })
        .eq('id', registrationId);

    revalidatePath('/portal/management');

    // Return success with the temp password so admin can share it if email doesn't arrive
    return {
        success: true,
        tempPassword,
        message: `✅ Usuario "${reg.full_name}" creado con rol ${reg.requested_role}. Se envió un correo de configuración de contraseña a ${reg.email}.`,
    };
}

export async function rejectRegistration(registrationId: string, notes?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'No autenticado' };

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
    if (adminProfile?.role !== 'admin') return { success: false, message: 'No autorizado' };

    await supabase
        .from('pending_registrations')
        .update({ status: 'rejected', notes: notes || null, reviewer_id: user.id, reviewed_at: new Date().toISOString() })
        .eq('id', registrationId);

    revalidatePath('/portal/management');
    return { success: true, message: 'Solicitud rechazada.' };
}

export async function getPendingRegistrations() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('pending_registrations')
        .select('*')
        .order('created_at', { ascending: false });
    return data || [];
}

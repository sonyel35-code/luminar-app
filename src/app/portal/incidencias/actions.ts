'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getStudentsList() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('students')
        .select('id, full_name, identification_number')
        .order('full_name');
    return data || [];
}

export async function getIncidents() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('incidents')
        .select('*, students(full_name), profiles!incidents_reported_by_fkey(full_name)')
        .order('incident_date', { ascending: false });

    return (data || []).map(inc => ({
        ...inc,
        students: Array.isArray(inc.students) ? inc.students[0] : inc.students,
        profiles: Array.isArray(inc.profiles) ? inc.profiles[0] : inc.profiles
    }));
}

export async function getIncidentsByStudent(studentId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('incidents')
        .select('*, profiles!incidents_reported_by_fkey(full_name)')
        .eq('student_id', studentId)
        .order('incident_date', { ascending: false });

    return (data || []).map(inc => ({
        ...inc,
        profiles: Array.isArray(inc.profiles) ? inc.profiles[0] : inc.profiles
    }));
}

export async function getIncidentsForParent() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get all student IDs linked to this parent
    const { data: links } = await supabase
        .from('student_parents')
        .select('student_id')
        .eq('parent_id', user.id);

    if (!links || links.length === 0) return [];

    const studentIds = links.map(l => l.student_id);

    const { data } = await supabase
        .from('incidents')
        .select('*, students(full_name), profiles!incidents_reported_by_fkey(full_name)')
        .in('student_id', studentIds)
        .order('incident_date', { ascending: false });

    return (data || []).map(inc => ({
        ...inc,
        students: Array.isArray(inc.students) ? inc.students[0] : inc.students,
        profiles: Array.isArray(inc.profiles) ? inc.profiles[0] : inc.profiles
    }));
}

export async function createIncident(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'No autenticado' };

    const studentId = formData.get('student_id') as string;
    const title = (formData.get('title') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const severity = formData.get('severity') as string;
    const incidentDate = formData.get('incident_date') as string;

    if (!studentId || !title || !description) {
        return { success: false, message: 'Estudiante, título y descripción son obligatorios.' };
    }

    const { error } = await supabase.from('incidents').insert({
        student_id: studentId,
        reported_by: user.id,
        title,
        description,
        severity: severity || 'moderate',
        incident_date: incidentDate || new Date().toISOString().split('T')[0],
    });

    if (error) return { success: false, message: error.message };

    revalidatePath('/portal/incidencias');
    return { success: true, message: 'Incidencia registrada correctamente.' };
}

export async function deleteIncident(incidentId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('incidents').delete().eq('id', incidentId);
    if (error) return { success: false, message: error.message };
    revalidatePath('/portal/incidents');
    return { success: true, message: 'Incidencia eliminada.' };
}

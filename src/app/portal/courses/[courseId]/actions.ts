'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCourseDetail(courseId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('courses')
        .select(`*, profiles(full_name, avatar_url)`)
        .eq('id', courseId)
        .single();

    if (data && data.profiles) {
        data.profiles = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
    }
    return data;
}

export async function getAnnouncements(courseId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('announcements')
        .select(`*, profiles(full_name)`)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

    return (data || []).map(a => ({
        ...a,
        profiles: Array.isArray(a.profiles) ? a.profiles[0] : a.profiles
    }));
}

export async function postAnnouncement(courseId: string, authorId: string, content: string, title?: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('announcements').insert({ course_id: courseId, author_id: authorId, content, title });
    if (!error) revalidatePath(`/portal/courses/${courseId}`);
    return { success: !error };
}

export async function deleteAnnouncement(courseId: string, announcementId: string) {
    const supabase = await createClient();
    await supabase.from('announcements').delete().eq('id', announcementId);
    revalidatePath(`/portal/courses/${courseId}`);
}

export async function getCourseStudents(courseId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('students')
        .select(`id, full_name, identification_number, enrollments!inner(course_id), grades(final_score)`)
        .eq('enrollments.course_id', courseId)
        .order('full_name');
    return data || [];
}

// ─── TASKS ───────────────────────────────────────────────────────────────────

export async function getTasks(courseId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('tasks')
        .select(`*, profiles(full_name)`)
        .eq('course_id', courseId)
        .order('due_date', { ascending: true, nullsFirst: false });

    return (data || []).map(t => ({
        ...t,
        profiles: Array.isArray(t.profiles) ? t.profiles[0] : t.profiles
    }));
}

export async function createTask(
    courseId: string,
    authorId: string,
    title: string,
    description: string,
    dueDate: string | null,
    maxScore: number
) {
    const supabase = await createClient();
    const { error } = await supabase.from('tasks').insert({
        course_id: courseId,
        author_id: authorId,
        title,
        description,
        due_date: dueDate || null,
        max_score: maxScore,
    });
    if (!error) revalidatePath(`/portal/courses/${courseId}`);
    return { success: !error };
}

export async function deleteTask(courseId: string, taskId: string) {
    const supabase = await createClient();
    await supabase.from('tasks').delete().eq('id', taskId);
    revalidatePath(`/portal/courses/${courseId}`);
}

export async function getTaskSubmissions(taskId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('task_submissions')
        .select(`*, students(full_name, identification_number)`)
        .eq('task_id', taskId)
        .order('submitted_at', { ascending: false });

    return (data || []).map(s => ({
        ...s,
        students: Array.isArray(s.students) ? s.students[0] : s.students
    }));
}

export async function gradSubmission(submissionId: string, score: number, feedback: string) {
    const supabase = await createClient();
    await supabase.from('task_submissions').update({ score, feedback }).eq('id', submissionId);
}

// ─── MATERIALS ───────────────────────────────────────────────────────────────

export async function getMaterials(courseId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('materials')
        .select(`*, profiles(full_name)`)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

    return (data || []).map(m => ({
        ...m,
        profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    }));
}

export async function addMaterial(
    courseId: string,
    authorId: string,
    title: string,
    url: string,
    type: string
) {
    const supabase = await createClient();
    const { error } = await supabase.from('materials').insert({
        course_id: courseId,
        author_id: authorId,
        title,
        url,
        type,
    });
    if (!error) revalidatePath(`/portal/courses/${courseId}`);
    return { success: !error };
}

export async function deleteMaterial(courseId: string, materialId: string) {
    const supabase = await createClient();
    await supabase.from('materials').delete().eq('id', materialId);
    revalidatePath(`/portal/courses/${courseId}`);
}

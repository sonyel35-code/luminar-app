import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CourseDetailClient from './CourseDetailClient';
import { getCourseDetail } from './actions';

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('user_id', user!.id).single();

    const course = await getCourseDetail(courseId);
    if (!course) notFound();

    return (
        <CourseDetailClient
            course={course}
            userId={user!.id}
            authorName={profile?.full_name || 'Docente'}
            userRole={profile?.role || 'teacher'}
        />
    );
}

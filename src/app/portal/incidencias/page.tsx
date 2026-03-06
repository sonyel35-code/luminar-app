import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import IncidenciasClient from './IncidentsClient';

export default async function IncidenciasPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

    const isParent = profile?.role === 'parent';

    return <IncidenciasClient isParent={isParent} />;
}

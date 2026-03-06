'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function fetchInbox(userId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('messages')
        .select(`*, sender:profiles!messages_sender_id_fkey(full_name, avatar_url)`)
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false });

    return (data || []).map(msg => ({
        ...msg,
        sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender
    }));
}

export async function fetchAllUsers(excludeUserId: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('profiles').select('user_id, full_name, role').neq('user_id', excludeUserId).order('full_name');
    return data || [];
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('messages').insert({ sender_id: senderId, receiver_id: receiverId, content });
    if (!error) revalidatePath('/portal/messages');
    return { success: !error };
}

export async function markAsRead(messageId: string) {
    const supabase = await createClient();
    await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', messageId);
}

export async function countUnread(userId: string) {
    const supabase = await createClient();
    const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', userId).is('read_at', null);
    return count || 0;
}

import type { Metadata } from 'next';
import './globals.css';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Luminar: Ecosistema Educativo del Futuro',
  description: 'Plataforma educativa integral para estudiantes, padres y docentes.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let theme = 'light';
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('theme').eq('user_id', user.id).single();
      if (data && data.theme) {
        theme = data.theme;
      }
    }
  } catch (e) { }

  return (
    <html lang="es" suppressHydrationWarning data-theme={theme}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

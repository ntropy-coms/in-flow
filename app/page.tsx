import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth-server';

// Server-side root redirect: route users to dashboard/login/sandbox per session and flag
export default async function RootPage() {
  const user = await verifySession();

  if (user) {
    // Authenticated -> dashboard
    redirect('/dashboard');
  }

  // If META review mode enabled, send unauthenticated users to sandbox
  if (process.env.NEXT_PUBLIC_META_REVIEW_MODE === 'true') {
    redirect('/sandbox');
  }

  // Default -> login
  redirect('/login');
}

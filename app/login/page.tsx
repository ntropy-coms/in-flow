'use client';

import Auth from '@/components/Auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div>
      <Auth
        onSignedIn={() => router.push('/dashboard')}
        onSignedOut={() => router.push('/login')}
      />
    </div>
  );
}

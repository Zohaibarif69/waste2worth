'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './context/AppContext';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn } = useApp();

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  return null;
}

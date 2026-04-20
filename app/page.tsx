'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-4">
          <span className="text-4xl">🌾</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">KisaanSathi</h1>
        <p className="text-muted-text">Loading...</p>
      </div>
    </div>
  );
}

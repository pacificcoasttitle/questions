'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if authenticated
    const isAuth = document.cookie.includes('pct_admin_auth=authenticated');
    if (isAuth) {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="text-slate-500">Redirecting...</div>
    </div>
  );
}

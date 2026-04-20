'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { BarChart3, Leaf, TrendingUp, MessageSquare, Building2, User, Bell, LogOut } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  { label: 'Crops', path: '/crops', icon: Leaf },
  { label: 'Market', path: '/market', icon: TrendingUp },
  { label: 'Chat', path: '/chat', icon: MessageSquare },
  { label: 'Schemes', path: '/schemes', icon: Building2 },
  { label: 'Profile', path: '/profile', icon: User },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout } = useAuthStore();
  const [isMobile, setIsMobile] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.push('/login');
    }

    // Check screen size
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [token, router]);

  if (!mounted || !token) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
              K
            </div>
            <h1 className="text-2xl font-bold text-primary">KisaanSathi</h1>
          </div>
          <div className="text-base">
            <p className="font-semibold text-foreground">{user?.name || 'Farmer'}</p>
            <p className="text-muted-foreground text-sm">{user?.state || user?.district}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-base transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <Icon size={24} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors text-base"
          >
            <LogOut size={24} />
            लॉगआउट
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="hidden md:flex items-center justify-between h-16 px-6 bg-white border-b border-border">
          <h2 className="text-xl font-bold text-foreground">स्वागत है, {user?.name}!</h2>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center">
              <Bell size={24} className="text-primary" />
            </button>
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-secondary transition-colors font-bold text-lg">
              {user?.name?.charAt(0) || 'K'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-28 md:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-border">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex-1 flex flex-col items-center justify-center py-4 gap-1 transition-colors min-h-20 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <Icon size={28} />
                  <span className="text-sm font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

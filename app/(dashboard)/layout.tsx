'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Leaf, LayoutDashboard, Brain, PlusCircle, Camera, Send,
  Gift, BarChart2, Building2, Truck, Bell, ChevronRight,
  LogOut, Menu, Inbox, CheckCircle, Star
} from 'lucide-react';
import { useApp } from '@/app/context/AppContext';

const kitchenNav = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/predict', icon: Brain, label: 'Predict Food' },
  { path: '/leftover', icon: PlusCircle, label: 'Add Leftover' },
  { path: '/decision', icon: CheckCircle, label: 'Human Decision' },
  { path: '/ngo-send', icon: Send, label: 'Send to NGO' },
  { path: '/waste-scan', icon: Camera, label: 'Scan Waste' },
  { path: '/rewards', icon: Gift, label: 'Rewards' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
];

const ngoNav = [
  { path: '/ngo-dashboard', icon: Inbox, label: 'NGO Dashboard', exact: true },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
];

const recyclerNav = [
  { path: '/recycler', icon: Truck, label: 'Recycler Hub', exact: true },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
];

const adminNav = [
  { path: '/analytics', icon: BarChart2, label: 'Analytics', exact: true },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Kitchen Dashboard' },
  { path: '/ngo-dashboard', icon: Inbox, label: 'NGO Dashboard' },
  { path: '/recycler', icon: Truck, label: 'Recycler Hub' },
  { path: '/rewards', icon: Gift, label: 'Rewards' },
];

const pageLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/predict': 'Predict Food',
  '/leftover': 'Add Leftover',
  '/decision': 'Human Decision',
  '/ngo-send': 'Send to NGO',
  '/waste-scan': 'Scan Waste',
  '/rewards': 'Rewards',
  '/analytics': 'Analytics',
  '/ngo-dashboard': 'NGO Dashboard',
  '/recycler': 'Recycler Hub',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role, userName, orgName, totalPoints } = useApp();
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  const navItems = role === 'kitchen' ? kitchenNav : role === 'ngo' ? ngoNav : role === 'recycler' ? recyclerNav : adminNav;
  const roleColor = role === 'kitchen' ? 'bg-green-500' : role === 'ngo' ? 'bg-blue-500' : role === 'recycler' ? 'bg-orange-500' : 'bg-slate-500';
  const roleLabel = role === 'kitchen' ? 'Kitchen Manager' : role === 'ngo' ? 'NGO Partner' : role === 'recycler' ? 'Recycler' : 'Admin';
  const RoleIcon = role === 'kitchen' ? Leaf : role === 'ngo' ? Building2 : role === 'recycler' ? Truck : BarChart2;
  const currentPage = pageLabels[pathname] || 'Page';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/40">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>Waste2Worth</p>
            <p style={{ color: '#4ade80', fontSize: '0.7rem', fontWeight: 500 }}>AI Platform</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className={`w-6 h-6 ${roleColor} rounded-lg flex items-center justify-center`}>
            <RoleIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <span style={{ color: '#cbd5e1', fontSize: '0.78rem', fontWeight: 600 }}>{roleLabel}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                router.push(item.path);
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative w-full text-left ${
                isActive
                  ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/20 text-green-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-400 rounded-r-full" />
              )}
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-green-400' : ''}`} />
              <span style={{ fontSize: '0.88rem', fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-green-400" />}
            </button>
          );
        })}
      </nav>

      {/* Points (kitchen only) */}
      {(role === 'kitchen' || role === 'admin') && (
        <div className="px-6 py-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-yellow-500/30" style={{ background: 'rgba(234,179,8,0.1)' }}>
            <Star className="w-4 h-4 text-yellow-400" />
            <div>
              <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>{totalPoints.toLocaleString()} pts</p>
              <p style={{ color: '#78716c', fontSize: '0.7rem' }}>Your Rewards</p>
            </div>
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group">
          <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.78rem' }}>{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</p>
            <p style={{ color: '#64748b', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{orgName}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col" style={{ background: '#0f172a' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col"
              style={{ background: '#0f172a' }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h3 style={{ color: '#111827', fontWeight: 700 }}>{currentPage}</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all border border-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 700 }}>3</span>
              </span>
            </div>
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
              <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <span style={{ color: 'white', fontWeight: 700, fontSize: '0.78rem' }}>{initials}</span>
              </div>
              <div className="hidden sm:block">
                <p style={{ color: '#111827', fontWeight: 600, fontSize: '0.85rem' }}>{userName}</p>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${role === 'kitchen' ? 'bg-green-100' : role === 'ngo' ? 'bg-blue-100' : role === 'recycler' ? 'bg-orange-100' : 'bg-slate-100'}`}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: role === 'kitchen' ? '#15803d' : role === 'ngo' ? '#1d4ed8' : role === 'recycler' ? '#c2410c' : '#334155' }}>
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

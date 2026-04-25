"use client";

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  Brain, PlusCircle, Camera, Utensils, TrendingDown, Leaf,
  CheckCircle, Clock, Package, ArrowRight, ChevronRight,
  Users, BarChart3, Truck, AlertTriangle
} from 'lucide-react';
import { useApp } from '@/app/context/AppContext';

const activityFeed = [
  { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'NGO Pickup Completed', sub: 'Hope Foundation collected 15 meals', time: '2 hrs ago' },
  { icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Waste Collected by Recycler', sub: 'Green Collect Pvt Ltd — 5 kg organic waste', time: '4 hrs ago' },
  { icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50', label: 'AI Prediction Made', sub: 'Recommended 140 meals for tomorrow', time: '6 hrs ago' },
  { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Surplus Alert', sub: '20 meals leftover detected', time: '8 hrs ago' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { userName, orgName } = useApp();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const stats = [
    { label: 'Meals Planned', value: '120', icon: Utensils, color: 'text-blue-600', bg: 'from-blue-50 to-blue-100', iconBg: 'bg-blue-500', delta: '+5%' },
    { label: 'Meals Cooked', value: '140', icon: Package, color: 'text-purple-600', bg: 'from-purple-50 to-purple-100', iconBg: 'bg-purple-500', delta: '+12%' },
    { label: 'Leftover', value: '20', icon: AlertTriangle, color: 'text-orange-600', bg: 'from-orange-50 to-orange-100', iconBg: 'bg-orange-500', delta: '-8%' },
    { label: 'Donations', value: '15 meals', icon: Users, color: 'text-green-600', bg: 'from-green-50 to-green-100', iconBg: 'bg-green-500', delta: '+20%' },
    { label: 'Waste Diverted', value: '5 kg', icon: TrendingDown, color: 'text-teal-600', bg: 'from-teal-50 to-teal-100', iconBg: 'bg-teal-500', delta: '-15%' },
  ];

  const quickActions = [
    {
      label: 'Predict Food',
      sub: 'AI-powered meal forecast',
      icon: Brain,
      path: '/predict',
      gradient: 'from-purple-600 to-indigo-600',
      shadow: 'shadow-purple-500/30',
    },
    {
      label: 'Add Leftover',
      sub: 'Log surplus food',
      icon: PlusCircle,
      path: '/leftover',
      gradient: 'from-green-600 to-emerald-600',
      shadow: 'shadow-green-500/30',
    },
    {
      label: 'Scan Waste',
      sub: 'AI waste detection',
      icon: Camera,
      path: '/waste-scan',
      gradient: 'from-orange-500 to-amber-600',
      shadow: 'shadow-orange-500/30',
    },
  ];

  const impactStats = [
    { label: 'Food Saved', value: '300 meals', icon: Package, color: '#16a34a' },
    { label: 'Waste Reduced', value: '45%', icon: TrendingDown, color: '#0284c7' },
    { label: 'CO₂ Saved', value: '87 kg', icon: Leaf, color: '#059669' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-green-950 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-green-500/10 to-transparent" />
        <div className="absolute right-8 bottom-0 w-32 h-32 bg-green-400/10 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: '1.5rem' }}>👋</span>
            <p style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.9rem' }}>{greeting}!</p>
          </div>
          <h1 style={{ color: 'white', fontWeight: 800, marginBottom: '0.25rem' }}>{userName}</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{orgName} · Today's waste management dashboard</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-3">
          <div className="text-right">
            <p style={{ color: '#4ade80', fontWeight: 700, fontSize: '1.5rem' }}>92%</p>
            <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Efficiency Score</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-green-400" />
          </div>
        </div>
      </motion.div>

      {/* Today's Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ color: '#111827', fontWeight: 700 }}>📊 Today's Overview</h2>
          <button className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-4 border border-white shadow-sm hover:shadow-md transition-all cursor-pointer group`}
            >
              <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p style={{ color: '#111827', fontWeight: 800, fontSize: '1.3rem', lineHeight: 1.2 }}>{stat.value}</p>
              <p style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.25rem' }}>{stat.label}</p>
              <div className="mt-2 flex items-center gap-1">
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: stat.delta.startsWith('+') ? '#16a34a' : '#dc2626',
                  background: stat.delta.startsWith('+') ? '#dcfce7' : '#fee2e2',
                  padding: '1px 6px',
                  borderRadius: '999px'
                }}>
                  {stat.delta} vs yesterday
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem' }}>⚡ Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(action.path)}
              className={`bg-gradient-to-r ${action.gradient} text-white p-5 rounded-2xl shadow-lg ${action.shadow} hover:shadow-xl transition-all text-left group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '1.05rem' }}>{action.label}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginTop: '0.25rem' }}>{action.sub}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Impact Stats + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impact Stats */}
        <div>
          <h2 style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem' }}>📈 Your Impact</h2>
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Total Impact This Month</p>
              <div className="grid grid-cols-3 gap-4">
                {impactStats.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <s.icon className="w-5 h-5 text-white" />
                    </div>
                    <p style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>{s.value}</p>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem' }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push('/analytics')}
                className="mt-5 w-full py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2"
                style={{ fontSize: '0.85rem', fontWeight: 600 }}
              >
                View Full Analytics <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h2 style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem' }}>🔄 Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {activityFeed.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className={`flex items-start gap-4 p-4 ${i < activityFeed.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50 transition-all`}
              >
                <div className={`w-9 h-9 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: '#111827', fontWeight: 600, fontSize: '0.875rem' }}>{item.label}</p>
                  <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sub}</p>
                </div>
                <span style={{ color: '#d1d5db', fontSize: '0.72rem', flexShrink: 0 }}>{item.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Flow Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
      >
        <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem' }}>🔁 Your Daily Flow</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: 'Predict', color: 'bg-purple-100 text-purple-700', path: '/predict' },
            { label: '→', color: 'text-gray-400', path: null },
            { label: 'Cook', color: 'bg-blue-100 text-blue-700', path: null },
            { label: '→', color: 'text-gray-400', path: null },
            { label: 'Add Leftover', color: 'bg-green-100 text-green-700', path: '/leftover' },
            { label: '→', color: 'text-gray-400', path: null },
            { label: 'AI Check', color: 'bg-yellow-100 text-yellow-700', path: null },
            { label: '→', color: 'text-gray-400', path: null },
            { label: 'Decide', color: 'bg-orange-100 text-orange-700', path: '/decision' },
            { label: '→', color: 'text-gray-400', path: null },
            { label: 'NGO / Waste', color: 'bg-red-100 text-red-700', path: '/ngo-send' },
          ].map((step, i) => (
            step.path ? (
              <button
                key={i}
                onClick={() => router.push(step.path)}
                className={`px-3 py-1.5 rounded-lg ${step.color} hover:opacity-80 transition-all`}
                style={{ fontSize: '0.8rem', fontWeight: 600 }}
              >
                {step.label}
              </button>
            ) : (
              <span key={i} className={step.color} style={{ fontSize: step.label === '→' ? '1rem' : '0.8rem', fontWeight: step.label === '→' ? 400 : 600 }}>
                {step.label}
              </span>
            )
          ))}
        </div>
      </motion.div>
    </div>
  );
}

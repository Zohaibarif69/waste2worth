"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { BarChart2, Leaf, TrendingDown, Package, DollarSign, Calendar, Download } from 'lucide-react';

const monthlyData = [
  { month: 'Nov', meals: 280, waste: 45, co2: 56, cost: 14000 },
  { month: 'Dec', meals: 320, waste: 38, co2: 64, cost: 16000 },
  { month: 'Jan', meals: 380, waste: 32, co2: 76, cost: 19000 },
  { month: 'Feb', meals: 420, waste: 28, co2: 84, cost: 21000 },
  { month: 'Mar', meals: 460, waste: 22, co2: 92, cost: 23000 },
  { month: 'Apr', meals: 500, waste: 18, co2: 100, cost: 25000 },
];

const wasteBreakdown = [
  { name: 'Donated', value: 45, color: '#16a34a' },
  { name: 'Composted', value: 30, color: '#0284c7' },
  { name: 'Recycled', value: 15, color: '#7c3aed' },
  { name: 'Landfill', value: 10, color: '#dc2626' },
];

const weeklyData = [
  { day: 'Mon', planned: 100, cooked: 108, donated: 12 },
  { day: 'Tue', planned: 120, cooked: 115, donated: 8 },
  { day: 'Wed', planned: 90, cooked: 95, donated: 10 },
  { day: 'Thu', planned: 130, cooked: 140, donated: 18 },
  { day: 'Fri', planned: 150, cooked: 155, donated: 20 },
  { day: 'Sat', planned: 80, cooked: 85, donated: 6 },
  { day: 'Sun', planned: 70, cooked: 72, donated: 5 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg">
        <p style={{ fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontSize: '0.82rem' }}>
            {p.name}: <strong>{typeof p.value === 'number' && p.name === 'cost' ? `₹${p.value.toLocaleString()}` : p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'monthly' | 'weekly'>('monthly');

  const impactCards = [
    { label: 'Meals Saved', value: '500', sub: '+15% this month', icon: Package, color: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/25', trend: '+15%', trendUp: true },
    { label: 'Waste Reduced', value: '60%', sub: '-18 kg less waste', icon: TrendingDown, color: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/25', trend: '+12%', trendUp: true },
    { label: 'CO₂ Saved', value: '120 kg', sub: '≈ 600 trees planted', icon: Leaf, color: 'from-teal-500 to-emerald-600', shadow: 'shadow-teal-500/25', trend: '+22%', trendUp: true },
    { label: 'Cost Saved', value: '₹25K', sub: 'vs previous period', icon: DollarSign, color: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/25', trend: '+8%', trendUp: true },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <BarChart2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 style={{ color: '#111827', fontWeight: 800 }}>Analytics & Impact</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Track your environmental footprint</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all border border-gray-200"
          style={{ fontWeight: 600, fontSize: '0.85rem' }}>
          <Download className="w-4 h-4" /> Export Report
        </button>
      </motion.div>

      {/* Impact Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {impactCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 shadow-lg ${card.shadow} text-white relative overflow-hidden group hover:scale-105 transition-transform`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/30 transition-all">
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <p style={{ fontWeight: 900, fontSize: '1.8rem', lineHeight: 1, marginBottom: '0.25rem' }}>{card.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>{card.label}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.72rem', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '999px' }}>
                  ▲ {card.trend}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.68rem' }}>{card.sub}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 style={{ color: '#111827', fontWeight: 700 }}>📈 Monthly Trend</h2>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {(['monthly', 'weekly'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === tab ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'}`}
                  style={{ fontWeight: 600, fontSize: '0.78rem', textTransform: 'capitalize' }}
                >
                  {tab === 'monthly' ? 'Monthly' : 'Weekly'}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'monthly' ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mealsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="meals" name="Meals Saved" stroke="#16a34a" strokeWidth={2.5} fill="url(#mealsGrad)" dot={{ fill: '#16a34a', r: 3 }} />
                <Area type="monotone" dataKey="co2" name="CO₂ Saved (kg)" stroke="#0284c7" strokeWidth={2.5} fill="url(#co2Grad)" dot={{ fill: '#0284c7', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="planned" name="Planned" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cooked" name="Cooked" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="donated" name="Donated" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Waste Breakdown Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem' }}>♻️ Waste Breakdown</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={wasteBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {wasteBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `${val}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {wasteBreakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>{item.name}</span>
                </div>
                <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.8rem' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Waste Reduction Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <h2 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.5rem' }}>📊 Monthly Waste Reduction</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="waste" name="Waste (kg)" radius={[6, 6, 0, 0]}>
              {monthlyData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.waste > 35 ? '#ef4444' : entry.waste > 25 ? '#f97316' : '#16a34a'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-3">
          {[
            { color: '#16a34a', label: 'Good (<25 kg)' },
            { color: '#f97316', label: 'Medium (25–35 kg)' },
            { color: '#ef4444', label: 'High (>35 kg)' },
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
              <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Environmental Score',
            value: 'A+',
            desc: 'Excellent sustainability rating',
            color: 'bg-green-600',
            bg: 'bg-green-50 border-green-100',
            icon: Leaf,
          },
          {
            title: 'Prediction Accuracy',
            value: '92%',
            desc: 'AI prediction vs actual meals',
            color: 'bg-purple-600',
            bg: 'bg-purple-50 border-purple-100',
            icon: BarChart2,
          },
          {
            title: 'Reporting Period',
            value: 'Apr 2026',
            desc: 'Last updated: Today',
            color: 'bg-blue-600',
            bg: 'bg-blue-50 border-blue-100',
            icon: Calendar,
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className={`${card.bg} border rounded-2xl p-5 flex items-center gap-4`}
          >
            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600 }}>{card.title}</p>
              <p style={{ color: '#111827', fontWeight: 800, fontSize: '1.3rem', lineHeight: 1.2 }}>{card.value}</p>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.2rem' }}>{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

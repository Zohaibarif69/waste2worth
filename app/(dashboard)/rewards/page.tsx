"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { Gift, Star, CheckCircle, Zap, Trophy, Package, Brain, Leaf, ArrowRight, ChevronRight } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { toast } from 'sonner';

const achievements = [
  { icon: Package, label: 'Food Donations', sub: '15 meals donated this week', points: '+150 pts', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', done: true },
  { icon: Brain, label: 'Accurate Predictions', sub: '92% prediction accuracy', points: '+80 pts', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', done: true },
  { icon: Leaf, label: 'Proper Waste Sorting', sub: '5 kg sorted correctly', points: '+60 pts', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', done: true },
  { icon: Zap, label: 'Quick Response', sub: 'Responded within 30 min', points: '+40 pts', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', done: true },
  { icon: Star, label: '7-Day Streak', sub: 'Use app 7 days in a row', points: '+200 pts', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', done: false, progress: 5, total: 7 },
  { icon: Trophy, label: 'Zero Waste Week', sub: '0 waste to landfill this week', points: '+500 pts', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', done: false, progress: 3, total: 7 },
];

const redeemOptions = [
  {
    title: '10% Off Kitchen Supplies',
    desc: 'Valid at GreenMart stores',
    points: 500,
    emoji: '🛒',
    color: 'from-blue-500 to-indigo-600',
    available: true,
  },
  {
    title: 'Free Composting Kit',
    desc: 'Home composting starter kit',
    points: 800,
    emoji: '🌱',
    color: 'from-green-500 to-emerald-600',
    available: true,
  },
  {
    title: 'Eco Champion Badge',
    desc: 'Digital badge for your profile',
    points: 300,
    emoji: '🏆',
    color: 'from-yellow-500 to-amber-600',
    available: true,
  },
  {
    title: 'Carbon Offset Certificate',
    desc: 'Plant a tree in your name',
    points: 1000,
    emoji: '🌳',
    color: 'from-teal-500 to-cyan-600',
    available: false,
  },
];

const leaderboard = [
  { rank: 1, name: 'Priya Sharma', org: 'Sunrise Hostel', points: 2840, badge: '🥇' },
  { rank: 2, name: 'Rahul Patel', org: 'City College', points: 2310, badge: '🥈' },
  { rank: 3, name: 'Anjali Singh', org: 'Hotel Grand', points: 1980, badge: '🥉' },
  { rank: 4, name: 'You', org: 'Green Mess Hall', points: 1250, badge: '4️⃣', isYou: true },
  { rank: 5, name: 'Vikram Gupta', org: 'Office Canteen', points: 1100, badge: '5️⃣' },
];

export default function RewardsPage() {
  const { totalPoints } = useApp();
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const handleRedeem = async (title: string, pts: number) => {
    if (totalPoints < pts) {
      toast.error(`You need ${pts - totalPoints} more points to redeem this`);
      return;
    }
    setRedeeming(title);
    await new Promise(r => setTimeout(r, 1500));
    setRedeeming(null);
    toast.success(`🎉 "${title}" redeemed successfully!`);
  };

  const nextMilestone = totalPoints < 1500 ? 1500 : totalPoints < 2000 ? 2000 : 3000;
  const progressToMilestone = (totalPoints / nextMilestone) * 100;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 style={{ color: '#111827', fontWeight: 800 }}>Rewards</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Earn points, redeem rewards</p>
        </div>
      </motion.div>

      {/* Points Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-slate-900 to-yellow-950 rounded-2xl p-6 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>🏆 Your Points</p>
            <div className="flex items-end gap-2">
              <p style={{ color: 'white', fontWeight: 900, fontSize: '3.5rem', lineHeight: 1 }}>
                {totalPoints.toLocaleString()}
              </p>
              <p style={{ color: '#fbbf24', fontSize: '1.2rem', paddingBottom: '0.5rem' }}>pts</p>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.5rem' }}>
              Next milestone: {nextMilestone.toLocaleString()} pts
            </p>
            <div className="mt-2 w-64 h-2.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToMilestone}%` }}
                transition={{ duration: 1.2, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
              />
            </div>
            <p style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.3rem' }}>
              {Math.round(progressToMilestone)}% to next milestone
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { label: 'Rank', value: '#4', icon: Trophy },
              { label: 'Streak', value: '5 days 🔥', icon: Zap },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10">
                <s.icon className="w-4 h-4 text-yellow-400" />
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '0.68rem' }}>{s.label}</p>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Achievements */}
        <div>
          <h2 style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem' }}>🎯 Earned From</h2>
          <div className="space-y-3">
            {achievements.map((ach, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`bg-white rounded-xl border ${ach.border} p-4 flex items-center justify-between hover:shadow-sm transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${ach.bg} rounded-xl flex items-center justify-center`}>
                    <ach.icon className={`w-5 h-5 ${ach.color}`} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.88rem' }}>{ach.label}</p>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{ach.sub}</p>
                    {!ach.done && ach.progress !== undefined && (
                      <div className="mt-1 flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${ach.color.replace('text', 'bg')}`}
                            style={{ width: `${(ach.progress / ach.total!) * 100}%`, background: '#d97706' }}
                          />
                        </div>
                        <span style={{ color: '#9ca3af', fontSize: '0.68rem' }}>{ach.progress}/{ach.total}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-lg ${ach.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`} style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    {ach.done ? <><CheckCircle className="w-3 h-3 inline mr-0.5" />{ach.points}</> : ach.points}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <h2 style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem' }}>🏆 Leaderboard</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {leaderboard.map((user, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-5 py-4 ${i < leaderboard.length - 1 ? 'border-b border-gray-50' : ''} ${user.isYou ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'hover:bg-gray-50'} transition-all`}
              >
                <span style={{ fontSize: '1.2rem', width: '2rem', textAlign: 'center' }}>{user.badge}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${user.isYou ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  <span style={{ fontWeight: 700, fontSize: '0.78rem', color: user.isYou ? '#d97706' : '#6b7280' }}>
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <p style={{ fontWeight: user.isYou ? 700 : 600, color: '#111827', fontSize: '0.88rem' }}>
                    {user.name} {user.isYou && <span style={{ color: '#d97706', fontSize: '0.72rem' }}>(You)</span>}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '0.72rem' }}>{user.org}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <p style={{ fontWeight: 700, color: user.isYou ? '#d97706' : '#111827', fontSize: '0.88rem' }}>
                    {user.points.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Redeem Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ color: '#111827', fontWeight: 700 }}>🎁 Redeem Rewards</h2>
          <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>Balance: <strong style={{ color: '#111827' }}>{totalPoints.toLocaleString()} pts</strong></span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {redeemOptions.map((option, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all ${!option.available ? 'opacity-60' : ''}`}
            >
              <div className={`bg-gradient-to-r ${option.color} p-4`}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '2.5rem' }}>{option.emoji}</span>
                  <span className="px-3 py-1.5 bg-white/20 text-white rounded-xl border border-white/20" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {option.points} pts
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '0.25rem' }}>{option.title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '1rem' }}>{option.desc}</p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleRedeem(option.title, option.points)}
                  disabled={!option.available || redeeming === option.title || totalPoints < option.points}
                  className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    !option.available || totalPoints < option.points
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800 shadow-sm'
                  }`}
                  style={{ fontWeight: 700, fontSize: '0.88rem' }}
                >
                  {redeeming === option.title ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : !option.available ? (
                    'Coming Soon'
                  ) : totalPoints < option.points ? (
                    `Need ${option.points - totalPoints} more pts`
                  ) : (
                    <>Redeem <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

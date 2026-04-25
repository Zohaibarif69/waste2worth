"use client";

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Brain, AlertTriangle, Clock, Package, ChefHat, ArrowRight } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { toast } from 'sonner';

export default function HumanDecisionPage() {
  const router = useRouter();
  const { leftoverData, setFinalDecision, setTotalPoints, totalPoints } = useApp();

  const handleSafe = () => {
    setFinalDecision('safe');
    setTotalPoints(totalPoints + 50);
    toast.success('✅ Marked as SAFE — Notifying NGOs now!', { duration: 3000 });
    router.push('/ngo-send');
  };

  const handleNotSafe = () => {
    setFinalDecision('not-safe');
    toast.info('♻️ Marked as NOT SAFE — Routing to waste management', { duration: 3000 });
    router.push('/waste-scan');
  };

  const food = leftoverData || {
    foodType: 'Rice & Curry',
    quantity: 20,
    timeSinceCooked: '1-2hr',
    aiSuggestion: 'safe' as const,
  };

  const isSafe = food.aiSuggestion === 'safe';

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <ChefHat className="w-8 h-8 text-white" />
        </div>
        <h1 style={{ color: '#111827', fontWeight: 800, marginBottom: '0.5rem' }}>Final Decision</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
          You are the final authority. Review AI suggestion and decide.
        </p>
      </motion.div>

      {/* Food Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5"
      >
        <h3 style={{ color: '#374151', fontWeight: 700, marginBottom: '1rem' }}>📦 Food Details</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Package, label: 'Food Type', value: food.foodType, color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: ChefHat, label: 'Quantity', value: `${food.quantity} portions`, color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: Clock, label: 'Time Since Cooked', value: food.timeSinceCooked, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((detail, i) => (
            <div key={i} className={`${detail.bg} rounded-xl p-3 text-center`}>
              <detail.icon className={`w-5 h-5 ${detail.color} mx-auto mb-1`} />
              <p style={{ color: '#9ca3af', fontSize: '0.7rem', marginBottom: '0.25rem' }}>{detail.label}</p>
              <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{detail.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI Suggestion */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-5 mb-6 border-2 ${isSafe ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isSafe ? 'bg-green-500' : 'bg-orange-500'} shadow-md`}>
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🤖 AI Suggestion</span>
            </div>
            <p style={{
              fontWeight: 800,
              fontSize: '1.2rem',
              color: isSafe ? '#15803d' : '#c2410c'
            }}>
              {isSafe ? '✔ Likely Safe for Donation' : '⚠ Risky for Donation'}
            </p>
          </div>
        </div>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
          {isSafe
            ? 'Based on food type and time elapsed, the AI estimates this food is safe to donate. However, please use your judgment as you are in direct contact with the food.'
            : 'The food has exceeded optimal safe storage time. AI recommends against donation to avoid health risks. Consider routing to compost or waste collection.'
          }
        </p>

        <div className="mt-3 flex items-center gap-2 p-2.5 bg-white/80 rounded-xl border border-white">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p style={{ color: '#78716c', fontSize: '0.78rem' }}>
            <strong>Important:</strong> AI is advisory only. Your human judgment is final and legally responsible.
          </p>
        </div>
      </motion.div>

      {/* Decision Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      >
        <h2 style={{ color: '#111827', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem' }}>
          🧐 What do you want to do?
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', marginBottom: '2rem' }}>
          Your decision will determine the next steps
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* SAFE Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSafe}
            className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl shadow-green-500/40 hover:shadow-green-500/60 transition-all group"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-all">
                <CheckCircle className="w-9 h-9 text-white" />
              </div>
              <p style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                ✅ Mark as SAFE
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Food is safe to donate. Notify nearby NGOs for pickup.
              </p>
              <div className="mt-4 flex items-center justify-center gap-1.5 bg-white/20 rounded-xl py-2">
                <ArrowRight className="w-4 h-4" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Proceed to NGO Flow</span>
              </div>
            </div>
          </motion.button>

          {/* NOT SAFE Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNotSafe}
            className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xl shadow-red-500/40 hover:shadow-red-500/60 transition-all group"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-all">
                <XCircle className="w-9 h-9 text-white" />
              </div>
              <p style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                ❌ Mark as NOT SAFE
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Food is not safe to donate. Route to waste management.
              </p>
              <div className="mt-4 flex items-center justify-center gap-1.5 bg-white/20 rounded-xl py-2">
                <ArrowRight className="w-4 h-4" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Proceed to Waste Scan</span>
              </div>
            </div>
          </motion.button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
          <span style={{ fontSize: '1.2rem' }}>💡</span>
          <p style={{ color: '#92400e', fontSize: '0.8rem' }}>
            Selecting "SAFE" earns you <strong>+50 reward points</strong> for contributing to food security!
          </p>
        </div>
      </motion.div>
    </div>
  );
}

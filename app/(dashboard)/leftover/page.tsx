"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { PlusCircle, ChevronRight, CheckCircle, AlertTriangle, Clock, Package, Brain, ArrowRight } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { toast } from 'sonner';

const foodTypes = [
  { id: 'Rice', emoji: '🍚', label: 'Rice', desc: 'Boiled/fried rice' },
  { id: 'Curry', emoji: '🍛', label: 'Curry', desc: 'Vegetable/non-veg' },
  { id: 'Bread', emoji: '🫓', label: 'Bread', desc: 'Roti/Naan/Pav' },
  { id: 'Dal', emoji: '🥣', label: 'Dal', desc: 'Lentil soup' },
  { id: 'Sabzi', emoji: '🥗', label: 'Sabzi', desc: 'Cooked vegetables' },
  { id: 'Mixed', emoji: '🍱', label: 'Mixed', desc: 'Multiple items' },
];

const timeOptions = [
  { id: '<1hr', label: 'Less than 1 hour', safe: true, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { id: '1-2hr', label: '1 – 2 hours', safe: true, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { id: '2-4hr', label: '2 – 4 hours', safe: false, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { id: '>4hr', label: 'More than 4 hours', safe: false, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
];

export default function AddLeftoverPage() {
  const router = useRouter();
  const { setLeftoverData } = useApp();
  const [step, setStep] = useState(1);
  const [selectedFood, setSelectedFood] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [timeSinceCooked, setTimeSinceCooked] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<'safe' | 'risky' | null>(null);

  const isSafe = timeOptions.find(t => t.id === timeSinceCooked)?.safe ?? false;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 1500));
    setAiResult(isSafe ? 'safe' : 'risky');
    setAnalyzing(false);
    toast.success('AI analysis complete!');
  };

  const handleContinue = () => {
    setLeftoverData({
      foodType: selectedFood,
      quantity,
      timeSinceCooked,
      aiSuggestion: aiResult || 'risky',
    });
    router.push('/decision');
  };

  const steps = [
    { num: 1, label: 'Food Type' },
    { num: 2, label: 'Quantity' },
    { num: 3, label: 'Time & AI' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 style={{ color: '#111827', fontWeight: 800 }}>Add Leftover Food</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Log surplus and get AI safety check</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                step === s.num ? 'bg-green-600 text-white' : step > s.num ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > s.num ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>{s.num}</span>
                )}
                <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Food Type */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <h2 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.5rem' }}>
              🍽️ What type of food is left over?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {foodTypes.map((food) => (
                <button
                  key={food.id}
                  onClick={() => setSelectedFood(food.id)}
                  className={`p-4 rounded-2xl border-2 text-center transition-all hover:scale-105 ${
                    selectedFood === food.id
                      ? 'border-green-400 bg-green-50 shadow-md shadow-green-100'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{food.emoji}</div>
                  <p style={{ fontWeight: 700, color: selectedFood === food.id ? '#15803d' : '#111827', fontSize: '0.9rem' }}>{food.label}</p>
                  <p style={{ color: '#9ca3af', fontSize: '0.72rem', marginTop: '0.2rem' }}>{food.desc}</p>
                </button>
              ))}
            </div>
            <button
              disabled={!selectedFood}
              onClick={() => setStep(2)}
              className="mt-6 w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg shadow-green-500/20 hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontWeight: 700, fontSize: '1rem' }}
            >
              Next: Set Quantity <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Quantity */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <h2 style={{ color: '#111827', fontWeight: 700, marginBottom: '0.5rem' }}>
              ⚖️ How much {selectedFood} is left?
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '2rem' }}>
              Estimate in number of servings/meals
            </p>

            <div className="text-center mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-200">
                <div>
                  <p style={{ fontWeight: 800, fontSize: '2.5rem', color: '#16a34a', lineHeight: 1 }}>{quantity}</p>
                  <p style={{ color: '#86efac', fontSize: '0.78rem', fontWeight: 600 }}>portions</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <input
                type="range"
                min="1"
                max="200"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between mt-2">
                {[1, 50, 100, 150, 200].map(n => (
                  <span key={n} style={{ color: '#d1d5db', fontSize: '0.72rem' }}>{n}</span>
                ))}
              </div>
            </div>

            {/* Quick Set Buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {[5, 10, 20, 30, 50, 100].map(n => (
                <button
                  key={n}
                  onClick={() => setQuantity(n)}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${quantity === n ? 'bg-green-600 text-white border-green-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300'}`}
                  style={{ fontWeight: 600, fontSize: '0.82rem' }}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Quantity category hint */}
            <div className={`flex items-center gap-2 p-3 rounded-xl mb-6 ${quantity <= 10 ? 'bg-green-50 border border-green-100' : quantity <= 30 ? 'bg-yellow-50 border border-yellow-100' : 'bg-red-50 border border-red-100'}`}>
              <Package className={`w-4 h-4 ${quantity <= 10 ? 'text-green-500' : quantity <= 30 ? 'text-yellow-500' : 'text-red-500'}`} />
              <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                {quantity <= 10 ? 'Small batch — easy to donate quickly' : quantity <= 30 ? 'Medium batch — plan for 1-2 NGOs' : 'Large batch — coordinate multiple NGOs'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep(1)}
                className="py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                style={{ fontWeight: 700 }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-sm hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                style={{ fontWeight: 700 }}
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Time + AI */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.5rem' }}>
                <Clock className="w-5 h-5 inline mr-2 text-green-600" />
                Time Since Cooked
              </h2>
              <div className="space-y-3">
                {timeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setTimeSinceCooked(opt.id); setAiResult(null); }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${
                      timeSinceCooked === opt.id ? `${opt.bg}` : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        timeSinceCooked === opt.id ? (opt.safe ? 'bg-green-100' : 'bg-red-100') : 'bg-gray-100'
                      }`}>
                        <Clock className={`w-5 h-5 ${timeSinceCooked === opt.id ? opt.color : 'text-gray-400'}`} />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: timeSinceCooked === opt.id ? '#111827' : '#6b7280' }}>
                        {opt.label}
                      </span>
                    </div>
                    {timeSinceCooked === opt.id && (
                      <span className={`px-2 py-1 rounded-lg ${opt.safe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                        {opt.safe ? '✓ Likely Safe' : '⚠ Risk'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Analysis Button */}
            {timeSinceCooked && !aiResult && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ fontWeight: 700, fontSize: '1rem' }}
              >
                {analyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI Analyzing Safety...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" /> Get AI Safety Check
                  </>
                )}
              </motion.button>
            )}

            {/* AI Result */}
            <AnimatePresence>
              {aiResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`rounded-2xl p-6 border-2 ${aiResult === 'safe' ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${aiResult === 'safe' ? 'bg-green-500' : 'bg-orange-500'}`}>
                      {aiResult === 'safe' ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🤖 AI Insight
                      </p>
                      <p style={{ fontWeight: 800, color: aiResult === 'safe' ? '#15803d' : '#ea580c', fontSize: '1.15rem' }}>
                        {aiResult === 'safe' ? '✔ Likely Safe for Donation' : '⚠ Risky for Donation'}
                      </p>
                    </div>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    {aiResult === 'safe'
                      ? `${selectedFood} cooked ${timeSinceCooked} ago is within the safe donation window. The food quality is likely preserved.`
                      : `${selectedFood} has exceeded the safe donation window. It may pose health risks if donated. Consider composting instead.`
                    }
                  </p>

                  <div className="mt-4 pt-4 border-t border-white/50 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="py-3 bg-white/80 text-gray-700 rounded-xl border border-gray-200 hover:bg-white transition-all"
                      style={{ fontWeight: 600 }}
                    >
                      ← Restart
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleContinue}
                      className={`py-3 text-white rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all ${
                        aiResult === 'safe'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700'
                          : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600'
                      }`}
                      style={{ fontWeight: 700 }}
                    >
                      Make Decision <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!aiResult && (
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                style={{ fontWeight: 600 }}
              >
                ← Back
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

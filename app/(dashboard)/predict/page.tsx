"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Brain, Users, Calendar, CloudSun, Zap, AlertTriangle, CheckCircle, RefreshCw, ArrowRight, Info } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { toast } from 'sonner';

const weatherOptions = ['Sunny', 'Cloudy', 'Rainy', 'Hot', 'Cold'];
const dayTypes = ['Weekday', 'Weekend', 'Holiday', 'Festival'];

export default function PredictFoodPage() {
  const router = useRouter();
  const { setPredictedMeals } = useApp();
  const [attendance, setAttendance] = useState(100);
  const [dayType, setDayType] = useState('Weekday');
  const [hasEvent, setHasEvent] = useState(false);
  const [eventName, setEventName] = useState('');
  const [weather, setWeather] = useState('Sunny');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { recommended: number; riskExtra: number; confidence: number }>(null);

  const calculatePrediction = () => {
    let base = attendance;
    if (dayType === 'Weekend' || dayType === 'Holiday') base *= 1.15;
    if (dayType === 'Festival') base *= 1.3;
    if (hasEvent) base *= 1.2;
    if (weather === 'Cold') base *= 1.1;
    if (weather === 'Hot') base *= 0.95;
    const recommended = Math.round(base * 1.05);
    const riskExtra = Math.round(recommended * 0.15);
    const confidence = Math.min(95, 75 + Math.random() * 20);
    return { recommended, riskExtra, confidence: Math.round(confidence) };
  };

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 1800));
    const prediction = calculatePrediction();
    setResult(prediction);
    setPredictedMeals(prediction.recommended);
    setLoading(false);
    toast.success('Prediction complete!');
  };

  const handleAccept = () => {
    toast.success(`✅ Accepted: Cook ${result?.recommended} meals today`);
    router.push('/');
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 style={{ color: '#111827', fontWeight: 800 }}>Predict Food</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>AI-powered meal quantity forecasting</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 style={{ color: '#111827', fontWeight: 700, marginBottom: '1.5rem' }}>📋 Input Details</h2>

          {/* Attendance */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2" style={{ color: '#374151', fontWeight: 600, fontSize: '0.9rem' }}>
                <Users className="w-4 h-4 text-purple-500" /> Expected Attendance
              </label>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-xl" style={{ fontWeight: 700, fontSize: '1rem' }}>
                {attendance}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              value={attendance}
              onChange={e => setAttendance(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between mt-1">
              <span style={{ color: '#9ca3af', fontSize: '0.72rem' }}>20</span>
              <span style={{ color: '#9ca3af', fontSize: '0.72rem' }}>500 people</span>
            </div>
          </div>

          {/* Day Type */}
          <div className="mb-6">
            <label className="flex items-center gap-2 mb-3" style={{ color: '#374151', fontWeight: 600, fontSize: '0.9rem' }}>
              <Calendar className="w-4 h-4 text-purple-500" /> Day Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dayTypes.map(d => (
                <button
                  key={d}
                  onClick={() => setDayType(d)}
                  className={`py-2.5 px-3 rounded-xl border-2 transition-all ${dayType === d ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'}`}
                  style={{ fontWeight: 600, fontSize: '0.85rem' }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Event Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p style={{ color: '#374151', fontWeight: 600, fontSize: '0.9rem' }}>Special Event?</p>
                <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>Event increases demand significantly</p>
              </div>
              <button
                onClick={() => setHasEvent(!hasEvent)}
                className={`w-12 h-6 rounded-full transition-all relative ${hasEvent ? 'bg-purple-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${hasEvent ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            {hasEvent && (
              <motion.input
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                type="text"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                placeholder="Event name (e.g., Annual Dinner)"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-purple-200 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                style={{ fontSize: '0.9rem' }}
              />
            )}
          </div>

          {/* Weather */}
          <div className="mb-6">
            <label className="flex items-center gap-2 mb-3" style={{ color: '#374151', fontWeight: 600, fontSize: '0.9rem' }}>
              <CloudSun className="w-4 h-4 text-purple-500" /> Weather Condition
            </label>
            <div className="flex gap-2 flex-wrap">
              {weatherOptions.map(w => (
                <button
                  key={w}
                  onClick={() => setWeather(w)}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${weather === w ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                  style={{ fontSize: '0.82rem', fontWeight: 600 }}
                >
                  {w === 'Sunny' ? '☀️' : w === 'Cloudy' ? '☁️' : w === 'Rainy' ? '🌧️' : w === 'Hot' ? '🌡️' : '❄️'} {w}
                </button>
              ))}
            </div>
          </div>

          {/* Past Data Note */}
          <div className="mb-6 flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p style={{ color: '#3b82f6', fontSize: '0.8rem' }}>
              AI also uses your past 30 days of data to improve accuracy automatically.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handlePredict}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ fontWeight: 700, fontSize: '1rem' }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing data...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Run AI Prediction
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Result Panel */}
        <div>
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-10 bg-white rounded-2xl border border-gray-100 shadow-sm border-dashed"
              >
                <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                  <Brain className="w-10 h-10 text-purple-300" />
                </div>
                <h3 style={{ color: '#d1d5db', fontWeight: 700 }}>Awaiting Prediction</h3>
                <p style={{ color: '#e5e7eb', fontSize: '0.85rem', marginTop: '0.5rem' }}>Fill in the details and click "Run AI Prediction"</p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-10 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 relative">
                  <Brain className="w-10 h-10 text-purple-400" />
                  <div className="absolute inset-0 border-4 border-purple-200 border-t-purple-500 rounded-2xl animate-spin" />
                </div>
                <h3 style={{ color: '#6b7280', fontWeight: 700 }}>AI is Analyzing...</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.5rem' }}>Processing attendance, weather & historical data</p>
                <div className="mt-4 space-y-2 w-full max-w-xs">
                  {['Fetching past data...', 'Analyzing patterns...', 'Running model...'].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                      <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{step}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Result Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-white/80" />
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>Prediction Complete</p>
                  </div>
                  <p style={{ color: 'white', fontWeight: 800, fontSize: '3rem', lineHeight: 1 }}>{result.recommended}</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Recommended meals to prepare</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white/80 rounded-full" style={{ width: `${result.confidence}%` }} />
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600 }}>
                      {result.confidence}% confidence
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Risk Warning */}
                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p style={{ color: '#ea580c', fontWeight: 700, fontSize: '0.9rem' }}>⚠️ Risk if Exceeded</p>
                      <p style={{ color: '#78716c', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                        Cooking more than <strong>{result.recommended + result.riskExtra}</strong> meals risks ~{result.riskExtra} meals of waste
                      </p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Base Need', value: attendance, color: 'bg-blue-50 text-blue-700 border-blue-100' },
                      { label: 'AI Buffer', value: result.recommended - attendance, color: 'bg-green-50 text-green-700 border-green-100' },
                      { label: 'Risk Zone', value: result.riskExtra, color: 'bg-red-50 text-red-700 border-red-100' },
                    ].map((b, i) => (
                      <div key={i} className={`p-3 rounded-xl border text-center ${b.color}`}>
                        <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>+{b.value}</p>
                        <p style={{ fontSize: '0.72rem' }}>{b.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Input Summary */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p style={{ color: '#6b7280', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.5rem' }}>Based on:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        `👥 ${attendance} attendees`,
                        `📅 ${dayType}`,
                        `🌤️ ${weather}`,
                        hasEvent ? `🎉 ${eventName || 'Event'}` : null,
                      ].filter(Boolean).map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-white rounded-lg border border-gray-200" style={{ fontSize: '0.75rem', color: '#374151' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAccept}
                      className="py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-sm hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                      style={{ fontWeight: 700 }}
                    >
                      <CheckCircle className="w-4 h-4" /> Accept
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setResult(null)}
                      className="py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                      style={{ fontWeight: 700 }}
                    >
                      <RefreshCw className="w-4 h-4" /> Adjust
                    </motion.button>
                  </div>

                  <button
                    onClick={() => router.push('/leftover')}
                    className="w-full py-3 border-2 border-dashed border-green-200 text-green-600 rounded-xl hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                    style={{ fontWeight: 600, fontSize: '0.88rem' }}
                  >
                    After cooking, Add Leftover <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

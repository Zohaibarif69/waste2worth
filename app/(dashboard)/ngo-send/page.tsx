"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Send, MapPin, Clock, Package, Building2, Phone, CheckCircle, Bell, ChevronRight } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { toast } from 'sonner';

const nearbyNGOs = [
  { name: 'Hope Foundation', distance: '1.2 km', rating: 4.8, meals: '5-50', contact: '+91 9876543210', specialty: 'Homeless Shelter' },
  { name: 'Annapoorna Trust', distance: '2.5 km', rating: 4.9, meals: '10-100', contact: '+91 9876543211', specialty: 'Child Nutrition' },
  { name: 'Roti Ghar NGO', distance: '3.1 km', rating: 4.7, meals: '20-200', contact: '+91 9876543212', specialty: 'Elderly Care' },
];

export default function NGOSendPage() {
  const router = useRouter();
  const { leftoverData, orgName } = useApp();
  const [sent, setSent] = useState(false);
  const [selectedNGOs, setSelectedNGOs] = useState<string[]>([]);
  const [pickupTime, setPickupTime] = useState('2hr');
  const [sending, setSending] = useState(false);

  const food = leftoverData || {
    foodType: 'Rice & Curry',
    quantity: 20,
    timeSinceCooked: '1-2hr',
    aiSuggestion: 'safe' as const,
  };

  const toggleNGO = (name: string) => {
    setSelectedNGOs(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleSend = async () => {
    if (selectedNGOs.length === 0) {
      toast.error('Please select at least one NGO');
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 1800));
    setSending(false);
    setSent(true);
    toast.success(`🎉 Request sent to ${selectedNGOs.length} NGO(s)!`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 style={{ color: '#111827', fontWeight: 800 }}>Send to NGOs</h1>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Notify nearby NGOs for pickup</p>
              </div>
            </div>

            {/* Food Details Card */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-5 mb-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>✅ Marked Safe for Donation</p>
                </div>
                <h2 style={{ fontWeight: 800, marginBottom: '1rem' }}>📦 Food Package Details</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Package, label: 'Type', value: food.foodType },
                    { icon: Package, label: 'Quantity', value: `${food.quantity} meals` },
                    { icon: Clock, label: 'Pickup By', value: pickupTime === '1hr' ? 'Next 1 hr' : pickupTime === '2hr' ? 'Next 2 hrs' : 'Next 4 hrs' },
                  ].map((d, i) => (
                    <div key={i} className="bg-white/15 rounded-xl p-3 text-center">
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', marginBottom: '0.25rem' }}>{d.label}</p>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{d.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ color: '#111827', fontWeight: 700 }}>
                  <MapPin className="w-4 h-4 inline mr-1.5 text-red-500" /> Pickup Location
                </h3>
                <button style={{ color: '#3b82f6', fontSize: '0.82rem', fontWeight: 600 }}>Change</button>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p style={{ color: '#111827', fontWeight: 700 }}>{orgName}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.82rem' }}>📍 123 Main Street, Pune, Maharashtra 411001</p>
                  </div>
                </div>
                <div className="mt-3 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center border border-green-200">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-green-500 mx-auto mb-1" />
                    <p style={{ color: '#6b7280', fontSize: '0.78rem' }}>Map View · Auto-detected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Time */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
              <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem' }}>
                <Clock className="w-4 h-4 inline mr-1.5 text-orange-500" /> Pickup Window
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: '1hr', label: 'Within 1 hr', urgent: true },
                  { id: '2hr', label: 'Within 2 hrs', urgent: false },
                  { id: '4hr', label: 'Within 4 hrs', urgent: false },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPickupTime(opt.id)}
                    className={`py-3 rounded-xl border-2 transition-all ${
                      pickupTime === opt.id
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    }`}
                    style={{ fontWeight: 600, fontSize: '0.82rem' }}
                  >
                    {opt.urgent && <span className="block text-xs text-orange-500 mb-0.5">🔥 Urgent</span>}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* NGO Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ color: '#111827', fontWeight: 700 }}>
                  <Building2 className="w-4 h-4 inline mr-1.5 text-blue-500" /> Select NGOs to Notify
                </h3>
                <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{selectedNGOs.length} selected</span>
              </div>
              <div className="space-y-3">
                {nearbyNGOs.map((ngo) => (
                  <button
                    key={ngo.name}
                    onClick={() => toggleNGO(ngo.name)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedNGOs.includes(ngo.name)
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedNGOs.includes(ngo.name) ? 'bg-blue-500' : 'bg-gray-200'}`}>
                          {selectedNGOs.includes(ngo.name)
                            ? <CheckCircle className="w-5 h-5 text-white" />
                            : <Building2 className="w-5 h-5 text-gray-500" />
                          }
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: '#111827' }}>{ngo.name}</p>
                          <p style={{ color: '#6b7280', fontSize: '0.78rem' }}>{ngo.specialty}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span style={{ color: '#9ca3af', fontSize: '0.72rem' }}>📍 {ngo.distance}</span>
                            <span style={{ color: '#9ca3af', fontSize: '0.72rem' }}>⭐ {ngo.rating}</span>
                            <span style={{ color: '#9ca3af', fontSize: '0.72rem' }}>🍽️ {ngo.meals} meals</span>
                          </div>
                        </div>
                      </div>
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Send Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSend}
              disabled={sending || selectedNGOs.length === 0}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ fontWeight: 700, fontSize: '1rem' }}
            >
              {sending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <Bell className="w-5 h-5" />
                  Send Pickup Request to {selectedNGOs.length > 0 ? `${selectedNGOs.length} NGO(s)` : 'NGOs'}
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/40">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 style={{ color: '#111827', fontWeight: 800, marginBottom: '0.5rem' }}>Request Sent! 🎉</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Notified {selectedNGOs.length} NGO(s). Awaiting acceptance.
            </p>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4 text-left">
              <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem' }}>Notified NGOs</h3>
              {selectedNGOs.map((name, i) => {
                const ngo = nearbyNGOs.find(n => n.name === name)!;
                return (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{name}</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{ngo?.distance} away</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-lg" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                      ⏳ Pending
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-100">
              <p style={{ color: '#1d4ed8', fontSize: '0.85rem', fontWeight: 600 }}>
                📱 You'll receive a notification once an NGO accepts the request
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/ngo-dashboard')}
                className="py-3.5 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
                style={{ fontWeight: 700 }}
              >
                View NGO Dashboard <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/')}
                className="py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                style={{ fontWeight: 700 }}
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

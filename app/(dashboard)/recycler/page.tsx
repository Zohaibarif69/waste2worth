"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  Truck, MapPin, Package, Clock, CheckCircle, Phone,
  Navigation, Leaf, Star, AlertCircle, BarChart2
} from 'lucide-react';
import { toast } from 'sonner';

const pickupRequests = [
  {
    id: 1,
    source: 'Green Mess Hall',
    address: '123 Main Street, Pune',
    wasteType: 'Organic Waste',
    wasteEmoji: '🌿',
    quantity: '5 kg',
    distance: '1.5 km',
    urgency: 'high',
    contact: '+91 9876543210',
    postedAt: '20 min ago',
    reward: 120,
    action: 'Compost',
  },
  {
    id: 2,
    source: 'City Hotel',
    address: '45 MG Road, Pune',
    wasteType: 'Recyclable Packaging',
    wasteEmoji: '♻️',
    quantity: '8 kg',
    distance: '3 km',
    urgency: 'medium',
    contact: '+91 9876543225',
    postedAt: '1 hr ago',
    reward: 85,
    action: 'Recycle',
  },
  {
    id: 3,
    source: 'College Canteen',
    address: '67 University Road, Pune',
    wasteType: 'Mixed Kitchen Waste',
    wasteEmoji: '🗑️',
    quantity: '12 kg',
    distance: '5 km',
    urgency: 'low',
    contact: '+91 9876543230',
    postedAt: '2 hrs ago',
    reward: 200,
    action: 'Process',
  },
];

export default function RecyclerPage() {
  const router = useRouter();
  const [acceptedId, setAcceptedId] = useState<number | null>(null);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  const handleAccept = async (id: number) => {
    setAccepting(id);
    await new Promise(r => setTimeout(r, 1200));
    setAcceptedId(id);
    setAccepting(null);
    toast.success('🚛 Pickup accepted! Navigate to pickup location.');
  };

  const handleComplete = (id: number) => {
    setCompletedIds(prev => [...prev, id]);
    setAcceptedId(null);
    toast.success('✅ Pickup completed! Rewards credited.');
  };

  const acceptedReq = pickupRequests.find(r => r.id === acceptedId);
  const pendingRequests = pickupRequests.filter(r => !completedIds.includes(r.id) && r.id !== acceptedId);

  const urgencyConfig = {
    high: { label: 'Urgent', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
    medium: { label: 'Normal', color: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' },
    low: { label: 'Flexible', color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 style={{ color: '#111827', fontWeight: 800 }}>Recycler Hub</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Pickup & process waste requests</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/analytics')}
            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl border border-orange-100 hover:bg-orange-100 transition-all"
            style={{ fontWeight: 600, fontSize: '0.82rem' }}
          >
            <BarChart2 className="w-4 h-4" /> Stats
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Open Requests', value: pendingRequests.length, color: 'from-orange-50 to-amber-50 text-orange-700', icon: '📥' },
            { label: 'Active', value: acceptedId ? 1 : 0, color: 'from-blue-50 to-indigo-50 text-blue-700', icon: '🚛' },
            { label: 'Completed', value: completedIds.length, color: 'from-green-50 to-emerald-50 text-green-700', icon: '✅' },
            { label: 'Earnings', value: '₹850', color: 'from-yellow-50 to-amber-50 text-yellow-700', icon: '💰' },
          ].map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.color} rounded-xl p-3 text-center border border-white`}>
              <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
              <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>{s.value}</p>
              <p style={{ fontSize: '0.68rem', opacity: 0.8 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Active Pickup */}
      <AnimatePresence>
        {acceptedReq && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-5 mb-6 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '0.85rem' }}>🚛 Active Pickup</p>
              </div>
              <h2 style={{ fontWeight: 800, marginBottom: '0.25rem' }}>{acceptedReq.source}</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {acceptedReq.wasteEmoji} {acceptedReq.quantity} of {acceptedReq.wasteType}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { icon: MapPin, label: 'Distance', value: acceptedReq.distance },
                  { icon: Package, label: 'Quantity', value: acceptedReq.quantity },
                  { icon: Star, label: 'Reward', value: `+${acceptedReq.reward} pts` },
                ].map((d, i) => (
                  <div key={i} className="bg-white/15 rounded-xl p-2.5 text-center">
                    <d.icon className="w-4 h-4 mx-auto mb-1 text-white/70" />
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.68rem' }}>{d.label}</p>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>{d.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button className="py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center gap-1 transition-all border border-white/20"
                  style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  <Phone className="w-3.5 h-3.5" /> Call
                </button>
                <button className="py-2.5 bg-white text-orange-600 rounded-xl flex items-center justify-center gap-1 hover:bg-orange-50 transition-all"
                  style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                  <Navigation className="w-3.5 h-3.5" /> Navigate
                </button>
                <button
                  onClick={() => handleComplete(acceptedReq.id)}
                  className="py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center gap-1 transition-all"
                  style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                  <CheckCircle className="w-3.5 h-3.5" /> Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ color: '#111827', fontWeight: 700 }}>
            📥 Pickup Requests ({pendingRequests.length})
          </h2>
        </div>

        {pendingRequests.length === 0 && !acceptedId ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Truck className="w-8 h-8 text-gray-300" />
            </div>
            <h3 style={{ color: '#d1d5db', fontWeight: 700 }}>No Pending Requests</h3>
            <p style={{ color: '#e5e7eb', fontSize: '0.85rem', marginTop: '0.5rem' }}>All caught up! Check back later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req, i) => {
              const urgCfg = urgencyConfig[req.urgency as keyof typeof urgencyConfig];
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                >
                  {req.urgency === 'high' && (
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 px-4 py-1.5 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-white" />
                      <p style={{ color: 'white', fontSize: '0.72rem', fontWeight: 700 }}>🔥 Urgent Pickup Request</p>
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
                          <span style={{ fontSize: '1.8rem' }}>{req.wasteEmoji}</span>
                        </div>
                        <div>
                          <h3 style={{ color: '#111827', fontWeight: 700 }}>{req.source}</h3>
                          <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{req.address}</p>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${urgCfg.bg} mt-1`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${urgCfg.color}`} />
                            <span className={`${urgCfg.text}`} style={{ fontSize: '0.68rem', fontWeight: 700 }}>{urgCfg.label}</span>
                          </div>
                        </div>
                      </div>
                      <span style={{ color: '#d1d5db', fontSize: '0.72rem' }}>{req.postedAt}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[
                        { label: 'Type', value: req.wasteType, icon: Leaf },
                        { label: 'Quantity', value: req.quantity, icon: Package },
                        { label: 'Distance', value: req.distance, icon: MapPin },
                        { label: 'Reward', value: `+${req.reward}`, icon: Star },
                      ].map((d, j) => (
                        <div key={j} className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                          <d.icon className="w-3.5 h-3.5 mx-auto mb-1 text-gray-400" />
                          <p style={{ color: '#9ca3af', fontSize: '0.65rem' }}>{d.label}</p>
                          <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.75rem' }}>{d.value}</p>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAccept(req.id)}
                      disabled={accepting === req.id || !!acceptedId}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl shadow-sm hover:from-orange-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ fontWeight: 700 }}
                    >
                      {accepting === req.id ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Truck className="w-5 h-5" /> Accept Pickup
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

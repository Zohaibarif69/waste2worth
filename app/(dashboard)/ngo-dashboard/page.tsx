"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  Inbox, MapPin, Clock, Package, Phone, CheckCircle,
  XCircle, Navigation, Building2, AlertCircle, Star
} from 'lucide-react';
import { toast } from 'sonner';

const requests = [
  {
    id: 1,
    kitchen: 'Green Mess Hall',
    address: '123 Main Street, Pune',
    foodType: 'Rice & Curry',
    quantity: 20,
    pickupWindow: 'Next 2 hours',
    distance: '2 km',
    contact: '+91 9876543210',
    urgency: 'high',
    postedAt: '15 min ago',
    rating: 4.8,
  },
  {
    id: 2,
    kitchen: 'City Hotel Kitchen',
    address: '45 MG Road, Pune',
    foodType: 'Bread & Sabzi',
    quantity: 35,
    pickupWindow: 'Next 4 hours',
    distance: '3.5 km',
    contact: '+91 9876543215',
    urgency: 'medium',
    postedAt: '45 min ago',
    rating: 4.6,
  },
  {
    id: 3,
    kitchen: 'College Canteen',
    address: '67 University Road, Pune',
    foodType: 'Mixed Food',
    quantity: 50,
    pickupWindow: 'Next 2 hours',
    distance: '5 km',
    contact: '+91 9876543220',
    urgency: 'high',
    postedAt: '1 hr ago',
    rating: 4.4,
  },
];

export default function NGODashboardPage() {
  const router = useRouter();
  const [acceptedId, setAcceptedId] = useState<number | null>(null);
  const [declinedIds, setDeclinedIds] = useState<number[]>([]);
  const [accepting, setAccepting] = useState<number | null>(null);

  const handleAccept = async (id: number) => {
    setAccepting(id);
    await new Promise(r => setTimeout(r, 1200));
    setAcceptedId(id);
    setAccepting(null);
    toast.success('✅ Pickup accepted! Kitchen has been notified.');
  };

  const handleDecline = (id: number) => {
    setDeclinedIds(prev => [...prev, id]);
    toast.info('Request declined');
  };

  const acceptedRequest = requests.find(r => r.id === acceptedId);
  const pendingRequests = requests.filter(r => !declinedIds.includes(r.id) && r.id !== acceptedId);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Inbox className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 style={{ color: '#111827', fontWeight: 800 }}>NGO Dashboard</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Manage food pickup requests</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'New Requests', value: pendingRequests.length, color: 'bg-blue-50 text-blue-700', border: 'border-blue-100' },
            { label: 'Accepted Today', value: acceptedId ? 1 : 0, color: 'bg-green-50 text-green-700', border: 'border-green-100' },
            { label: 'Meals Collected', value: '185', color: 'bg-purple-50 text-purple-700', border: 'border-purple-100' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} ${s.border} border rounded-xl p-3 text-center`}>
              <p style={{ fontWeight: 800, fontSize: '1.5rem' }}>{s.value}</p>
              <p style={{ fontSize: '0.72rem', opacity: 0.8 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Accepted Pickup */}
      <AnimatePresence>
        {acceptedRequest && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-5 mb-6 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.85rem' }}>✅ Pickup Scheduled</p>
              </div>
              <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>{acceptedRequest.kitchen}</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                🍽️ {acceptedRequest.quantity} meals of {acceptedRequest.foodType}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/15 rounded-xl p-3">
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>Contact</p>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{acceptedRequest.contact}</p>
                </div>
                <div className="bg-white/15 rounded-xl p-3">
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>Pickup Window</p>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{acceptedRequest.pickupWindow}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center gap-2 transition-all border border-white/20"
                  style={{ fontWeight: 600, fontSize: '0.85rem' }}
                >
                  <Phone className="w-4 h-4" /> Call Kitchen
                </button>
                <button className="flex-1 py-3 bg-white text-green-700 rounded-xl flex items-center justify-center gap-2 hover:bg-green-50 transition-all"
                  style={{ fontWeight: 700, fontSize: '0.85rem' }}
                >
                  <Navigation className="w-4 h-4" /> Get Directions
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
            📥 New Requests ({pendingRequests.length})
          </h2>
          {declinedIds.length > 0 && (
            <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{declinedIds.length} declined</span>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-8 h-8 text-gray-300" />
            </div>
            <h3 style={{ color: '#d1d5db', fontWeight: 700 }}>No Pending Requests</h3>
            <p style={{ color: '#e5e7eb', fontSize: '0.85rem', marginTop: '0.5rem' }}>All requests have been handled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                {/* Urgency Banner */}
                {req.urgency === 'high' && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1.5 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-white" />
                    <p style={{ color: 'white', fontSize: '0.72rem', fontWeight: 700 }}>🔥 URGENT — Pickup within 2 hours</p>
                  </div>
                )}

                <div className="p-5">
                  {/* Kitchen Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center border border-blue-100">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 style={{ color: '#111827', fontWeight: 700 }}>{req.kitchen}</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '1px' }}>{req.address}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span style={{ color: '#6b7280', fontSize: '0.72rem', fontWeight: 600 }}>{req.rating}</span>
                        </div>
                      </div>
                    </div>
                    <span style={{ color: '#d1d5db', fontSize: '0.72rem' }}>{req.postedAt}</span>
                  </div>

                  {/* Food Details */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { icon: Package, label: 'Food', value: req.foodType, color: 'bg-green-50 text-green-600' },
                      { icon: Package, label: 'Quantity', value: `${req.quantity} meals`, color: 'bg-purple-50 text-purple-600' },
                      { icon: MapPin, label: 'Distance', value: req.distance, color: 'bg-blue-50 text-blue-600' },
                    ].map((d, j) => (
                      <div key={j} className={`${d.color} rounded-xl p-2.5 text-center`}>
                        <d.icon className="w-4 h-4 mx-auto mb-1 opacity-70" />
                        <p style={{ fontSize: '0.68rem', opacity: 0.7 }}>{d.label}</p>
                        <p style={{ fontWeight: 700, fontSize: '0.8rem' }}>{d.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Pickup Window */}
                  <div className="flex items-center gap-2 p-2.5 bg-orange-50 rounded-xl border border-orange-100 mb-4">
                    <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <p style={{ color: '#ea580c', fontSize: '0.82rem', fontWeight: 600 }}>
                      ⏰ Pickup within: {req.pickupWindow}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAccept(req.id)}
                      disabled={accepting === req.id || !!acceptedId}
                      className="py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-sm hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ fontWeight: 700 }}
                    >
                      {accepting === req.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Accept
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDecline(req.id)}
                      className="py-3.5 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                      style={{ fontWeight: 700 }}
                    >
                      <XCircle className="w-4 h-4" /> Decline
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

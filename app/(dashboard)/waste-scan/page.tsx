"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  Camera, Upload, Zap, Leaf, Recycle, AlertTriangle,
  CheckCircle, MapPin, Truck, ArrowRight, RotateCcw, Package
} from 'lucide-react';
import { toast } from 'sonner';

const wasteTypes = [
  {
    type: 'Organic Waste (Food Scraps)',
    emoji: '🌿',
    action: 'Send to Compost Facility',
    actionColor: 'bg-green-600',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    impact: 'Reduces methane emissions by 60%',
    facilities: [
      { name: 'Green Compost Center', distance: '2 km', available: true },
      { name: 'City Bio-Waste Plant', distance: '4.5 km', available: true },
    ],
  },
  {
    type: 'Recyclable Packaging',
    emoji: '♻️',
    action: 'Send to Recycling Facility',
    actionColor: 'bg-blue-600',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    impact: 'Saves 70% energy vs new production',
    facilities: [
      { name: 'EcoRecycle Hub', distance: '1.8 km', available: true },
      { name: 'Municipal Recycling', distance: '3 km', available: false },
    ],
  },
  {
    type: 'Mixed Kitchen Waste',
    emoji: '🗑️',
    action: 'Segregate & Process',
    actionColor: 'bg-orange-600',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    impact: 'Proper sorting prevents landfill overflow',
    facilities: [
      { name: 'PCMC Waste Facility', distance: '3.2 km', available: true },
      { name: 'Local Collector', distance: '0.8 km', available: true },
    ],
  },
];

const mockImages = [
  { label: 'Food Scraps', emoji: '🥬', result: 0 },
  { label: 'Packaging', emoji: '📦', result: 1 },
  { label: 'Mixed Waste', emoji: '🗑️', result: 2 },
];

export default function WasteScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [result, setResult] = useState<typeof wasteTypes[0] | null>(null);
  const [modelScores, setModelScores] = useState<Array<{ label: string; score: number }>>([]);
  const [requestSent, setRequestSent] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  const mapApiWasteTypeToResultIndex = (wasteType: string) => {
    if (wasteType === 'ORGANIC') return 0;
    if (wasteType === 'PLASTIC') return 1;
    return 2;
  };

  const simulateScan = async (resultIndex = 0) => {
    setScanning(true);
    setResult(null);
    setModelScores([]);
    await new Promise(r => setTimeout(r, 2000));
    setResult(wasteTypes[resultIndex]);
    setScanning(false);
    toast.success('🔍 Waste type identified!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setScannedImage(url);

    setScanning(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/waste-scan', {
        method: 'POST',
        body: formData,
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || 'Failed to classify waste image');
      }

      const wasteType = body?.item?.wasteType as string | undefined;
      const confidence = body?.item?.confidence as number | undefined;
      const labels = Array.isArray(body?.item?.labels) ? body.item.labels : [];
      const resultIndex = mapApiWasteTypeToResultIndex(wasteType || 'MIXED');
      setResult(wasteTypes[resultIndex]);
      setModelScores(
        labels
          .map((entry: any) => ({
            label: String(entry?.description ?? 'Unknown'),
            score: typeof entry?.score === 'number' ? entry.score : 0,
          }))
          .sort((a, b) => b.score - a.score)
      );

      if (typeof confidence === 'number') {
        toast.success(`Waste identified (${Math.round(confidence * 100)}% confidence)`);
      } else {
        toast.success('Waste type identified!');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to classify image';
      toast.error(message);
      setScannedImage(null);
      setResult(null);
      setModelScores([]);
    } finally {
      setScanning(false);
    }
  };

  const handleRequestPickup = async () => {
    if (!selectedFacility) {
      toast.error('Please select a facility');
      return;
    }
    await new Promise(r => setTimeout(r, 800));
    setRequestSent(true);
    toast.success('♻️ Pickup request sent to recycler!');
  };

  const reset = () => {
    setScannedImage(null);
    setResult(null);
    setModelScores([]);
    setRequestSent(false);
    setSelectedFacility('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Camera className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 style={{ color: '#111827', fontWeight: 800 }}>Scan Waste</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>AI-powered waste detection & routing</p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!result && !scanning && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Upload Zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className="bg-white rounded-2xl border-2 border-dashed border-orange-300 p-10 mb-5 text-center cursor-pointer hover:bg-orange-50/50 hover:border-orange-400 transition-all group"
            >
              <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-all group-hover:scale-110">
                <Upload className="w-10 h-10 text-orange-500" />
              </div>
              <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '0.5rem' }}>Upload Waste Image</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Drag & drop or click to upload a photo of your waste
              </p>
              <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                Choose File
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span style={{ color: '#9ca3af', fontSize: '0.82rem', fontWeight: 600 }}>OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Camera Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setScannedImage('camera');
                simulateScan(0);
              }}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-amber-700 transition-all flex items-center justify-center gap-3 mb-5"
              style={{ fontWeight: 700, fontSize: '1rem' }}
            >
              <Camera className="w-6 h-6" /> Use Camera
            </motion.button>

            {/* Demo Samples */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p style={{ color: '#6b7280', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem' }}>
                🧪 Try with a demo sample:
              </p>
              <div className="grid grid-cols-3 gap-3">
                {mockImages.map((img) => (
                  <button
                    key={img.label}
                    onClick={() => {
                      setScannedImage('demo');
                      simulateScan(img.result);
                    }}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-center group"
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{img.emoji}</div>
                    <p style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>{img.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {scanning && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center"
          >
            <div className="w-24 h-24 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
              <Camera className="w-12 h-12 text-orange-500" />
              <div className="absolute inset-0 border-4 border-orange-200 border-t-orange-500 rounded-2xl animate-spin" />
              <div className="absolute -inset-2 border-2 border-orange-100 border-t-orange-300 rounded-2xl animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <h2 style={{ color: '#111827', fontWeight: 700, marginBottom: '0.5rem' }}>🔍 Scanning Waste...</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1.5rem' }}>AI is identifying waste type and composition</p>
            <div className="space-y-2 text-left max-w-xs mx-auto">
              {['Analyzing image quality...', 'Detecting waste category...', 'Checking disposal options...', 'Finding nearby facilities...'].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                  <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{step}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {result && !scanning && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Detection Result */}
            <div className={`${result.bg} ${result.border} border-2 rounded-2xl p-5 mb-5`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-white/50">
                  <span style={{ fontSize: '2rem' }}>{result.emoji}</span>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🤖 Waste Detection
                  </p>
                  <h2 style={{ fontWeight: 800, color: '#111827', fontSize: '1.1rem' }}>{result.type}</h2>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-white/70 rounded-xl border border-white/50 mb-3">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p style={{ color: '#374151', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✔ Suggested Action: <span className={result.color}>{result.action}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-white/50 rounded-xl">
                <Leaf className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p style={{ color: '#6b7280', fontSize: '0.78rem' }}>{result.impact}</p>
              </div>
            </div>

            {modelScores.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
                <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem' }}>
                  <Zap className="w-4 h-4 inline mr-1.5 text-amber-500" /> Model Confidence
                </h3>
                <div className="space-y-3">
                  {modelScores.map((item) => {
                    const percentage = Math.max(0, Math.min(100, Math.round(item.score * 100)));
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <p style={{ color: '#374151', fontSize: '0.82rem', fontWeight: 600 }}>{item.label}</p>
                          <p style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 700 }}>{percentage}%</p>
                        </div>
                        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nearby Facilities */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
              <h3 style={{ color: '#111827', fontWeight: 700, marginBottom: '1rem' }}>
                <MapPin className="w-4 h-4 inline mr-1.5 text-red-500" /> Nearby Options
              </h3>
              <div className="space-y-3">
                {result.facilities.map((facility) => (
                  <button
                    key={facility.name}
                    onClick={() => setSelectedFacility(facility.name)}
                    disabled={!facility.available}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      !facility.available ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' :
                      selectedFacility === facility.name
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 bg-gray-50 hover:border-green-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedFacility === facility.name ? 'bg-green-500' : 'bg-gray-200'}`}>
                          {selectedFacility === facility.name
                            ? <CheckCircle className="w-5 h-5 text-white" />
                            : <Recycle className="w-5 h-5 text-gray-500" />
                          }
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{facility.name}</p>
                          <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>📍 {facility.distance} away</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg ${facility.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                        {facility.available ? '✓ Available' : 'Unavailable'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            {!requestSent ? (
              <>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-5">
                  <div className="flex gap-3">
                    <Package className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p style={{ color: '#374151', fontWeight: 600, fontSize: '0.85rem' }}>Local Collector Available</p>
                      <p style={{ color: '#9ca3af', fontSize: '0.78rem' }}>A nearby recycler can collect from your location within 3 hours.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRequestPickup}
                    className={`py-4 ${result.actionColor} text-white rounded-xl shadow-md flex items-center justify-center gap-2 hover:opacity-90 transition-all`}
                    style={{ fontWeight: 700, fontSize: '0.95rem' }}
                  >
                    <Truck className="w-5 h-5" /> Request Pickup
                  </motion.button>
                  <button
                    onClick={reset}
                    className="py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    style={{ fontWeight: 700 }}
                  >
                    <RotateCcw className="w-4 h-4" /> Scan Again
                  </button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-5 text-white text-center"
              >
                <CheckCircle className="w-10 h-10 mx-auto mb-3" />
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Pickup Requested! ♻️</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  {selectedFacility} will collect your waste shortly
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => router.push('/recycler')}
                    className="py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2"
                    style={{ fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    View Recycler <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="py-3 bg-white text-green-700 rounded-xl hover:bg-green-50 transition-all"
                    style={{ fontWeight: 700 }}
                  >
                    Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'motion/react';
import { Leaf, Brain, Heart, Recycle, ChefHat, Building2, Truck, ArrowRight, Sparkles, TrendingDown, Users } from 'lucide-react';
import { useApp, UserRole } from '@/app/context/AppContext';
import { toast } from 'sonner';

const roles = [
  {
    id: 'kitchen' as UserRole,
    label: 'Kitchen / Event',
    icon: ChefHat,
    description: 'Manage food prep & donations',
    color: 'from-green-500 to-emerald-600',
    border: 'border-green-400',
    bg: 'bg-green-50',
    text: 'text-green-700',
  },
  {
    id: 'ngo' as UserRole,
    label: 'NGO',
    icon: Building2,
    description: 'Collect & distribute food',
    color: 'from-blue-500 to-blue-600',
    border: 'border-blue-400',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  {
    id: 'recycler' as UserRole,
    label: 'Recycler',
    icon: Truck,
    description: 'Pickup & process waste',
    color: 'from-orange-500 to-amber-600',
    border: 'border-orange-400',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { setRole, setIsLoggedIn, setUserName, setOrgName } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('kitchen');
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const registerRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name || 'User',
            email,
            password,
            organizationName: org || 'Waste2Worth Organization',
            role: selectedRole,
          }),
        });

        if (!registerRes.ok) {
          const body = await registerRes.json().catch(() => ({}));
          throw new Error(body.error || 'Signup failed');
        }
      }

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        role: selectedRole,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      setRole(selectedRole);
      setIsLoggedIn(true);
      if (name) setUserName(name);
      if (org) setOrgName(org);

      toast.success(`Welcome! Logged in as ${roles.find(r => r.id === selectedRole)?.label}`);
      if (selectedRole === 'kitchen') router.push('/');
      else if (selectedRole === 'ngo') router.push('/ngo-dashboard');
      else if (selectedRole === 'recycler') router.push('/recycler');
      else router.push('/analytics');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to login';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-green-400/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 z-10"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>
              Waste2Worth AI
            </h1>
            <p style={{ color: '#86efac', fontSize: '0.85rem' }}>Turning Waste Into Worth</p>
          </div>
        </motion.div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="z-10"
        >
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span style={{ color: '#86efac', fontSize: '0.85rem' }}>AI-Powered Food Waste Management</span>
            </div>
            <h2 style={{ color: 'white', fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
              Smarter Food.<br />
              <span style={{ color: '#4ade80' }}>Zero Waste.</span><br />
              Real Impact.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '440px' }}>
              Use AI to predict food needs, reduce surplus, connect with NGOs, and turn waste into resources.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Brain, title: 'AI Predictions', desc: 'Smart meal forecasting', color: 'text-green-400', bg: 'bg-green-500/10' },
              { icon: Heart, title: 'NGO Connect', desc: 'Direct food donations', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: Recycle, title: 'Waste2Worth', desc: 'Turn scraps to value', color: 'text-orange-400', bg: 'bg-orange-500/10' },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="p-4 rounded-2xl border border-white/10 backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div className={`w-10 h-10 ${feat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <feat.icon className={`w-5 h-5 ${feat.color}`} />
                </div>
                <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{feat.title}</p>
                <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-8 z-10"
        >
          {[
            { icon: TrendingDown, value: '45%', label: 'Waste Reduced', color: 'text-green-400' },
            { icon: Users, value: '500+', label: 'Meals Saved', color: 'text-blue-400' },
            { icon: Leaf, value: '120kg', label: 'CO₂ Saved', color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p style={{ color: 'white', fontWeight: 700 }}>{stat.value}</p>
                <p style={{ color: '#64748b', fontSize: '0.78rem' }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h3 style={{ fontWeight: 800, color: '#111827' }}>Waste2Worth AI</h3>
          </div>

          <div className="mb-8">
            <h2 style={{ fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>
              {isSignup ? 'Create Account' : 'Welcome Back!'}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              {isSignup ? 'Join the zero-waste movement today' : 'Sign in to your Waste2Worth account'}
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label style={{ color: '#374151', fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '0.75rem' }}>
              I am a...
            </label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    selectedRole === r.id
                      ? `${r.border} ${r.bg} shadow-md`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <r.icon className={`w-5 h-5 mx-auto mb-1 ${selectedRole === r.id ? r.text : 'text-gray-400'}`} />
                  <p style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: selectedRole === r.id ? '#111827' : '#6b7280'
                  }}>{r.label}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Zohaib Arif"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                    style={{ fontSize: '0.95rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={org}
                    onChange={e => setOrg(e.target.value)}
                    placeholder="Green Mess Hall"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                    style={{ fontSize: '0.95rem' }}
                  />
                </div>
              </>
            )}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                Email / Phone
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                style={{ fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                style={{ fontSize: '0.95rem' }}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/40 hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-70"
              style={{ fontWeight: 700, fontSize: '1rem' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              {' '}
              <button
                onClick={() => setIsSignup(!isSignup)}
                style={{ color: '#16a34a', fontWeight: 600 }}
                className="hover:underline"
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Quick demo buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.75rem' }}>
              Quick demo access:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRole(r.id);
                    setRole(r.id);
                    setIsLoggedIn(true);
                    toast.info('Demo quick-switch updates UI role only. Use Sign In for real authenticated session.');
                    if (r.id === 'kitchen') router.push('/');
                    else if (r.id === 'ngo') router.push('/ngo-dashboard');
                    else if (r.id === 'recycler') router.push('/recycler');
                    else router.push('/analytics');
                  }}
                  className={`py-2 px-2 rounded-lg text-center transition-all hover:scale-105 ${r.bg} border ${r.border}`}
                >
                  <r.icon className={`w-4 h-4 mx-auto mb-0.5 ${r.text}`} />
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#374151' }}>{r.label}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

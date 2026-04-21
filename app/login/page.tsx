'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { LANGUAGES } from '@/lib/constants';
import { Loader2, AlertCircle } from 'lucide-react';
import { authService } from '@/lib/apiServices';

type AuthStep = 'phone' | 'password' | 'role' | 'profile';

export default function LoginPage() {
  const [step, setStep] = useState<AuthStep>('phone');
  const [isNewUser, setIsNewUser] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'farmer' | 'consumer'>('farmer');
  const [language, setLanguage] = useState('hi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!/^[6-9]\d{9}$/.test(phone)) {
        setError('Please enter a valid 10-digit Indian phone number');
        setLoading(false);
        return;
      }

      // Move to password step
      setStep('password');
    } catch (err: any) {
      setError('Unable to verify phone number');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login({ phone, password });
      
      // Get current user details
      const user = await authService.getCurrentUser();
      
      setAuth(user, response.access_token);
      localStorage.setItem('ks_token', response.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 401) {
        // User might not exist, treat as new user
        setIsNewUser(true);
        setStep('role');
      } else if (err.response?.status === 404) {
        setIsNewUser(true);
        setStep('role');
      } else {
        setError(err.response?.data?.detail || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (selectedRole: 'farmer' | 'consumer') => {
    setRole(selectedRole);
    setStep('profile');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name.trim()) {
        setError('Please enter your name');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      // Register user
      const registerResponse = await authService.register({
        phone,
        password,
        name,
        role,
        language_preference: language,
      });

      setAuth(
        {
          id: phone,
          phone,
          name,
          role,
          language: language,
        },
        registerResponse.access_token
      );
      localStorage.setItem('ks_token', registerResponse.access_token);

      // Redirect to onboarding for new users
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <div className="flex gap-2 flex-wrap justify-end">
            {LANGUAGES.slice(0, 4).map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-3 py-1 text-sm rounded-full font-medium transition ${
                  language === lang.code
                    ? 'bg-primary text-white'
                    : 'bg-muted text-foreground hover:bg-muted-foreground/20'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <span className="text-3xl">🌾</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">KisaanSathi</h1>
          <p className="text-lg text-primary font-medium">आपका खेत, आपका भविष्य</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Phone Step */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Enter Your Phone Number</h2>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
              <div className="flex items-center">
                <span className="text-lg text-muted-text mr-2">+91</span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                  maxLength={10}
                  autoFocus
                />
              </div>
              <p className="text-sm text-muted-text mt-2">We'll verify it with a password</p>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Continue
            </button>

            <p className="text-center text-sm text-muted-text">
              New to KisaanSathi? We'll create your account
            </p>
          </form>
        )}

        {/* Password Step */}
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Enter Your Password</h2>
              <p className="text-sm text-muted-text">+91 {phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-muted-text mt-2">At least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading || password.length < 6}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setPassword('');
                setError(null);
              }}
              className="w-full text-primary font-semibold py-2 hover:underline"
            >
              Use Different Phone Number
            </button>
          </form>
        )}

        {/* Role Selection Step */}
        {step === 'role' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Who are you?</h2>
            <p className="text-sm text-muted-text">Choose your role to get started</p>

            <div className="space-y-3">
              <button
                onClick={() => handleRoleSelect('farmer')}
                className={`w-full p-6 rounded-xl border-2 transition text-left ${
                  role === 'farmer'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-3xl mb-2">🌾</div>
                <h3 className="font-semibold text-foreground">Farmer</h3>
                <p className="text-sm text-muted-text mt-1">Grow, sell, and learn farming techniques</p>
              </button>

              <button
                onClick={() => handleRoleSelect('consumer')}
                className={`w-full p-6 rounded-xl border-2 transition text-left ${
                  role === 'consumer'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-3xl mb-2">🛍️</div>
                <h3 className="font-semibold text-foreground">Consumer</h3>
                <p className="text-sm text-muted-text mt-1">Buy fresh produce directly from farmers</p>
              </button>
            </div>

            <button
              onClick={() => {
                setStep('phone');
                setRole('farmer');
                setPassword('');
              }}
              className="w-full text-primary font-semibold py-2 hover:underline"
            >
              Use Different Phone Number
            </button>
          </div>
        )}

        {/* Profile Creation Step */}
        {step === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Create Your Profile</h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
              <p className="text-xs text-muted-text mt-2">At least 6 characters, secure your account</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Role: {role === 'farmer' ? '🌾 Farmer' : '🛍️ Consumer'}</span>
                <br />
                Phone: +91 {phone}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || password.length < 6}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('role');
                setName('');
              }}
              className="w-full text-primary font-semibold py-2 hover:underline"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

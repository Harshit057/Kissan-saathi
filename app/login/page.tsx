'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { LANGUAGES } from '@/lib/constants';
import { Loader2, AlertCircle, Globe, ChevronRight, LogIn, UserPlus } from 'lucide-react';
import { authService } from '@/lib/apiServices';

type AuthStep = 'welcome' | 'language' | 'auth-type' | 'phone' | 'password' | 'role' | 'profile';

// Language selector component
function LanguageGrid({ selectedLang, onSelect }: { selectedLang: string; onSelect: (code: string) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onSelect(lang.code)}
          className={`p-3 rounded-lg border-2 font-medium transition ${
            selectedLang === lang.code
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:border-primary/50 text-foreground'
          }`}
        >
          <div className="text-sm">{lang.name}</div>
          <div className="text-xs text-muted-text mt-1">{lang.nativeName}</div>
        </button>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [step, setStep] = useState<AuthStep>('welcome');
  const [isNewUser, setIsNewUser] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'farmer' | 'consumer'>('farmer');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  // Clear error on step change
  useEffect(() => {
    setError(null);
  }, [step]);

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
      if (err.response?.status === 401 || err.response?.status === 404) {
        // User might not exist, treat as new user
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="text-center space-y-8">
            {/* Logo Section */}
            <div className="space-y-4 pt-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-3xl shadow-lg">
                <span className="text-6xl">🌾</span>
              </div>
              <h1 className="text-5xl font-bold text-foreground">KisaanSathi</h1>
              <p className="text-xl text-primary font-medium">आपका खेत, आपका भविष्य</p>
              <p className="text-muted-text text-lg max-w-md mx-auto">
                Connect with farmers, discover fresh produce, and build a sustainable agricultural community
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => {
                  setIsNewUser(false);
                  setStep('phone');
                }}
                className="w-full bg-primary text-white py-4 px-6 rounded-xl font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-3 text-lg shadow-lg"
              >
                <LogIn className="w-5 h-5" />
                Login to Account
              </button>

              <button
                onClick={() => {
                  setIsNewUser(true);
                  setStep('language');
                }}
                className="w-full bg-white border-2 border-primary text-primary py-4 px-6 rounded-xl font-semibold hover:bg-primary/5 transition flex items-center justify-center gap-3 text-lg"
              >
                <UserPlus className="w-5 h-5" />
                Create New Account
              </button>
            </div>

            {/* Language Quick Access */}
            <div className="pt-8">
              <p className="text-sm text-muted-text mb-4">Select or change language below</p>
              <div className="flex flex-wrap justify-center gap-2">
                {LANGUAGES.slice(0, 6).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition border-2 ${
                      language === lang.code
                        ? 'border-primary bg-primary text-white'
                        : 'border-border text-foreground hover:border-primary/50'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
                <button
                  onClick={() => setStep('language')}
                  className="px-4 py-2 rounded-full text-sm font-medium transition border-2 border-border text-foreground hover:border-primary/50 flex items-center gap-1"
                >
                  <Globe className="w-4 h-4" />
                  More
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Language Selection Step */}
        {step === 'language' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">Select Your Language</h2>
                <p className="text-sm text-muted-text">Choose from 22 Indian languages</p>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <LanguageGrid selectedLang={language} onSelect={setLanguage} />
            </div>

            <button
              onClick={() => setStep('auth-type')}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setStep('welcome')}
              className="w-full text-primary font-semibold py-2 hover:underline"
            >
              Back
            </button>
          </div>
        )}

        {/* Auth Type Selection - for new users */}
        {step === 'auth-type' && isNewUser && (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">How would you like to continue?</h2>

            <div className="space-y-3">
              <button
                onClick={() => setStep('phone')}
                className="w-full p-6 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition text-left group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">Create New Account</h3>
                    <p className="text-sm text-muted-text mt-1">Sign up with phone and password</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition" />
                </div>
              </button>

              <button
                onClick={() => {
                  setIsNewUser(false);
                  setStep('phone');
                }}
                className="w-full p-6 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition text-left group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">Use Existing Account</h3>
                    <p className="text-sm text-muted-text mt-1">Already have an account? Login here</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition" />
                </div>
              </button>
            </div>

            <button onClick={() => setStep('welcome')} className="w-full text-primary font-semibold py-2 hover:underline">
              Back
            </button>
          </div>
        )}

        {/* Phone Step */}
        {step === 'phone' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {isNewUser ? 'Create Your Account' : 'Login to Your Account'}
              </h2>
              <p className="text-sm text-muted-text mt-2">Language: {LANGUAGES.find((l) => l.code === language)?.name}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handlePhoneSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                <div className="flex items-center bg-muted rounded-lg">
                  <span className="text-lg text-muted-text font-medium px-4">+91</span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-lg"
                    disabled={loading}
                    maxLength={10}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-text mt-2">10-digit Indian mobile number</p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Verifying...' : 'Continue'}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setStep('welcome')}
                className="text-primary font-semibold hover:underline text-sm"
              >
                Back to Welcome
              </button>
            </div>
          </div>
        )}

        {/* Password Step */}
        {step === 'password' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Enter Your Password</h2>
              <p className="text-sm text-muted-text mt-2">+91 {phone}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
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
                <p className="text-xs text-muted-text mt-2">Minimum 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading || password.length < 6}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <button
              onClick={() => {
                setPhone('');
                setPassword('');
                setStep('phone');
              }}
              className="w-full text-primary font-semibold py-2 hover:underline text-sm"
            >
              Use Different Phone Number
            </button>
          </div>
        )}

        {/* Role Selection Step */}
        {step === 'role' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Who are you?</h2>
            <p className="text-sm text-muted-text">Phone: +91 {phone}</p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => handleRoleSelect('farmer')}
                className={`w-full p-6 rounded-xl border-2 transition text-left group ${
                  role === 'farmer' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-4xl mb-2">🌾</div>
                    <h3 className="font-semibold text-foreground text-lg">I'm a Farmer</h3>
                    <p className="text-sm text-muted-text mt-1">Grow, sell, and learn farming techniques</p>
                  </div>
                  {role === 'farmer' && <ChevronRight className="w-5 h-5 text-primary" />}
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('consumer')}
                className={`w-full p-6 rounded-xl border-2 transition text-left group ${
                  role === 'consumer' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-4xl mb-2">🛍️</div>
                    <h3 className="font-semibold text-foreground text-lg">I'm a Consumer</h3>
                    <p className="text-sm text-muted-text mt-1">Buy fresh produce directly from farmers</p>
                  </div>
                  {role === 'consumer' && <ChevronRight className="w-5 h-5 text-primary" />}
                </div>
              </button>
            </div>

            <button
              onClick={() => {
                setStep('phone');
                setPhone('');
                setPassword('');
                setError(null);
              }}
              className="w-full text-primary font-semibold py-2 hover:underline text-sm"
            >
              Use Different Phone Number
            </button>
          </div>
        )}

        {/* Profile Creation Step */}
        {step === 'profile' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Create Your Profile</h2>
              <p className="text-sm text-muted-text mt-2">
                Role: {role === 'farmer' ? '🌾 Farmer' : '🛍️ Consumer'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
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
                <label className="block text-sm font-medium text-foreground mb-2">Password *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
                <p className="text-xs text-muted-text mt-2">Minimum 6 characters, keep it secure</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-2 text-sm">
                <div>
                  <span className="text-muted-text">Phone: </span>
                  <span className="font-semibold text-foreground">+91 {phone}</span>
                </div>
                <div>
                  <span className="text-muted-text">Role: </span>
                  <span className="font-semibold text-foreground">{role === 'farmer' ? '🌾 Farmer' : '🛍️ Consumer'}</span>
                </div>
                <div>
                  <span className="text-muted-text">Language: </span>
                  <span className="font-semibold text-foreground">{LANGUAGES.find((l) => l.code === language)?.name}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim() || password.length < 6}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <button
              onClick={() => {
                setName('');
                setStep('role');
              }}
              className="w-full text-primary font-semibold py-2 hover:underline text-sm"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

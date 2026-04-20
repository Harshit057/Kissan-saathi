'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { OtpInput } from '@/components/OtpInput';
import { LanguagePill } from '@/components/LanguagePill';
import { LANGUAGES } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('hi');
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!/^[6-9]\d{9}$/.test(phone)) {
        setError('कृपया एक मान्य 10-अंकीय भारतीय फोन नंबर दर्ज करें');
        setLoading(false);
        return;
      }

      await api.post('/auth/send-otp', { phone, language });
      setStep('otp');
      setCountdown(30);
      setOtp('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP भेजने में विफल। कृपया दोबारा कोशिश करें।');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!/^\d{6}$/.test(otp)) {
        setError('कृपया एक मान्य 6-अंकीय OTP दर्ज करें');
        setLoading(false);
        return;
      }

      const response = await api.post('/auth/verify-otp', { phone, otp, language });
      const { token, user, is_new_user } = response.data;

      setAuth(user, token);
      document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;

      if (is_new_user) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP सत्यापन विफल। कृपया दोबारा कोशिश करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <div className="flex gap-2">
            {LANGUAGES.slice(0, 3).map((lang) => (
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

        {/* Phone Step */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">अपना फोन नंबर दर्ज करें</h2>
            
            <div>
              <label className="block text-base font-semibold text-foreground mb-3">
                फोन नंबर
              </label>
              <div className="flex gap-0">
                <span className="flex items-center px-4 bg-muted border-2 border-r-0 border-border rounded-l-lg text-foreground font-bold text-lg">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="90000 00000"
                  className="flex-1 px-4 py-3 text-lg border-2 border-border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  maxLength={10}
                  autoComplete="tel"
                />
              </div>
              <p className="text-base text-muted-foreground mt-2">हम आपके नंबर को सत्यापित करने के लिए OTP भेजेंगे</p>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg text-base font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!phone || loading}
              className="w-full h-14 bg-primary hover:bg-secondary text-white font-bold text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  OTP भेज रहे हैं...
                </>
              ) : (
                'OTP भेजें'
              )}
            </button>

            <p className="text-center text-base text-muted-foreground">
              जारी रखने से, आप हमारी शर्तों और गोपनीयता नीति से सहमत हैं
            </p>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">अपना OTP दर्ज करें</h2>
              <p className="text-lg text-muted-foreground">
                हमने +91{phone.slice(-10)} पर एक 6-अंकीय कोड भेजा है
              </p>
            </div>

            <div>
              <label className="block text-base font-semibold text-foreground mb-4">
                एक समय का पासवर्ड
              </label>
              <OtpInput
                value={otp}
                onChange={setOtp}
                onComplete={() => setOtp(otp)} // Allow auto-submit on complete if needed
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg text-base font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={otp.length < 6 || loading}
              className="w-full h-14 bg-primary hover:bg-secondary text-white font-bold text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  सत्यापन...
                </>
              ) : (
                'सत्यापित करें & जारी रखें'
              )}
            </button>

            <div className="flex items-center gap-4 text-base">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError(null);
                  setCountdown(0);
                }}
                className="text-primary font-semibold hover:underline"
              >
                नंबर बदलें
              </button>
              <button
                type="button"
                onClick={() => {
                  setCountdown(30);
                  handlePhoneSubmit({ preventDefault: () => {} } as any);
                }}
                disabled={countdown > 0}
                className={`font-semibold ml-auto ${
                  countdown > 0
                    ? 'text-muted-foreground cursor-not-allowed'
                    : 'text-primary hover:underline'
                }`}
              >
                {countdown > 0 ? `${countdown}s में दोबारा भेजें` : 'OTP दोबारा भेजें'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { LANGUAGES, STATES, CROPS, DISTRICTS } from '@/lib/constants';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, setUser, token } = useAuthStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    language: user?.language || 'en',
    state: user?.state || '',
    district: user?.district || '',
    crops: user?.crops || [],
  });

  const districts = formData.state ? DISTRICTS[formData.state] || [] : [];

  const handleCropToggle = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter(c => c !== crop)
        : [...prev.crops, crop],
    }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (step === 2 && !formData.state) {
      setError('Please select your state');
      return;
    }
    if (step === 3 && !formData.district) {
      setError('Please select your district');
      return;
    }
    if (step === 4 && formData.crops.length === 0) {
      setError('Please select at least one crop');
      return;
    }

    setError(null);
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    setError(null);
  };

  const handleComplete = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await api.put('/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-text">Step {step} of 5</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Welcome! What&apos;s your name?</h2>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Step 2: Language */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Preferred Language</h2>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setFormData({ ...formData, language: lang.code })}
                    className={`p-3 rounded-lg border-2 transition-colors text-center ${
                      formData.language === lang.code
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="font-semibold text-sm">{lang.nativeName}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: State */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Select Your State</h2>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value, district: '' })}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Choose a state or UT</option>
                {STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          )}

          {/* Step 4: District */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Select Your District</h2>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Choose a district</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          )}

          {/* Step 5: Crops */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Which crops do you grow?</h2>
              <p className="text-sm text-muted-text">Select all that apply</p>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {CROPS.map(crop => (
                  <button
                    key={crop}
                    onClick={() => handleCropToggle(crop)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      formData.crops.includes(crop)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mt-4">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex-1 px-4 py-2 border border-border text-foreground font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Back
            </button>
            {step < 5 ? (
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Setting up...' : 'Get Started'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

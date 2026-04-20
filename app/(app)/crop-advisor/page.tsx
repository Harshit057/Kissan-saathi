'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { apiPost } from '@/lib/api';
import { STATES, DISTRICTS, CROPS } from '@/lib/constants';
import { Sparkles, Loader2 } from 'lucide-react';

interface CropRecommendation {
  crop_name: string;
  expected_yield: string;
  investment_required: string;
  profitability: string;
  season: string;
}

interface Recommendation {
  recommendations: CropRecommendation[];
  advice: string;
}

export default function CropAdvisorPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [formData, setFormData] = useState({
    state: user?.state || '',
    district: user?.district || '',
    season: 'kharif',
    soil_type: 'loamy',
    water_availability: 'adequate',
  });

  const handleGetRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiPost<Recommendation>('/crop-advisor/recommendations', formData);
      setRecommendations(data);
    } catch (err: any) {
      setError('सिफारिशें प्राप्त करने में विफल। कृपया दोबारा कोशिश करें।');
    } finally {
      setLoading(false);
    }
  };

  const districts = formData.state
    ? DISTRICTS[formData.state as keyof typeof DISTRICTS] || []
    : [];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles size={32} className="text-accent" />
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">फसल सलाहकार</h1>
      </div>

      <p className="text-lg text-muted-foreground mb-8">
        अपने खेत की जानकारी दें और सबसे अच्छी फसलों की सिफारिशें प्राप्त करें
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">आपकी जानकारी</h2>

          <form onSubmit={handleGetRecommendations} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg text-base">
                {error}
              </div>
            )}

            {/* State */}
            <div>
              <label className="block text-base font-semibold text-foreground mb-2">
                राज्य *
              </label>
              <select
                required
                value={formData.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    state: e.target.value,
                    district: '',
                  })
                }
                className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">चुनें...</option>
                {STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            {formData.state && (
              <div>
                <label className="block text-base font-semibold text-foreground mb-2">
                  जिला *
                </label>
                <select
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">चुनें...</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Season */}
            <div>
              <label className="block text-base font-semibold text-foreground mb-2">
                मौसम *
              </label>
              <select
                required
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="kharif">खरीफ (जून-अक्टूबर)</option>
                <option value="rabi">रबी (अक्टूबर-मार्च)</option>
                <option value="zaid">जायद (मार्च-जून)</option>
              </select>
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-base font-semibold text-foreground mb-2">
                मिट्टी का प्रकार *
              </label>
              <select
                required
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="loamy">दोमट</option>
                <option value="sandy">बलुई</option>
                <option value="clayey">चिकनी</option>
                <option value="silty">सिल्टी</option>
              </select>
            </div>

            {/* Water Availability */}
            <div>
              <label className="block text-base font-semibold text-foreground mb-2">
                पानी की उपलब्धता *
              </label>
              <select
                required
                value={formData.water_availability}
                onChange={(e) => setFormData({ ...formData, water_availability: e.target.value })}
                className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="adequate">पर्याप्त</option>
                <option value="limited">सीमित</option>
                <option value="minimal">न्यूनतम</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.state || !formData.district}
              className="w-full h-14 bg-primary hover:bg-secondary text-white font-bold text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  सिफारिशें प्राप्त करें...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  सिफारिशें प्राप्त करें
                </>
              )}
            </button>
          </form>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">अनुशंसित फसलें</h2>

          {recommendations ? (
            <div className="space-y-4">
              {recommendations.recommendations.map((crop, index) => (
                <div
                  key={index}
                  className="border-2 border-primary/20 rounded-lg p-4 hover:border-primary transition"
                >
                  <h3 className="text-xl font-bold text-primary mb-2">{crop.crop_name}</h3>
                  <div className="space-y-2 text-base">
                    <p>
                      <span className="font-semibold text-foreground">प्रत्याशित पैदावार:</span>{' '}
                      <span className="text-muted-foreground">{crop.expected_yield}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">निवेश आवश्यक:</span>{' '}
                      <span className="text-muted-foreground">{crop.investment_required}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">लाभप्रदता:</span>{' '}
                      <span className="text-accent font-bold">{crop.profitability}</span>
                    </p>
                  </div>
                </div>
              ))}

              {recommendations.advice && (
                <div className="mt-6 p-4 bg-accent/10 border-l-4 border-accent rounded-lg">
                  <h4 className="font-bold text-accent mb-2">विशेष सलाह</h4>
                  <p className="text-base text-foreground">{recommendations.advice}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg text-muted-foreground">
                अपनी जानकारी भरें और सिफारिशें प्राप्त करें
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { apiPost } from '@/lib/api';
import { CameraCapture } from '@/components/CameraCapture';
import { CROPS } from '@/lib/constants';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    crop_name: '',
    category: 'vegetable',
    quantity: '',
    quantity_unit: 'kg',
    price_per_unit: '',
    harvest_date: '',
    description: '',
    is_organic: false,
  });
  const [error, setError] = useState<string | null>(null);

  const handlePhotoCapture = (file: File, previewUrl: string) => {
    setPhotos([...photos, file]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formDataWithFiles = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataWithFiles.append(key, String(value));
      });
      photos.forEach((photo) => {
        formDataWithFiles.append('photos', photo);
      });

      await apiPost('/listings', formDataWithFiles);
      router.push('/listings');
    } catch (err: any) {
      setError(err.message || 'विफल रहा। कृपया दोबारा कोशिश करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-primary hover:underline mb-6 font-semibold"
      >
        <ArrowLeft size={20} />
        वापस
      </button>

      <h1 className="text-3xl font-bold text-foreground mb-6">नई लिस्टिंग बनाएं</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg text-base">
            {error}
          </div>
        )}

        {/* Crop Name */}
        <div>
          <label className="block text-base font-semibold text-foreground mb-2">
            फसल का नाम *
          </label>
          <select
            required
            value={formData.crop_name}
            onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
            className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">चुनें...</option>
            {CROPS.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-base font-semibold text-foreground mb-2">
            श्रेणी *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="vegetable">सब्जी</option>
            <option value="fruit">फल</option>
            <option value="grain">अनाज</option>
            <option value="pulses">दालें</option>
            <option value="other">अन्य</option>
          </select>
        </div>

        {/* Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-semibold text-foreground mb-2">
              मात्रा *
            </label>
            <input
              type="number"
              required
              min="0.1"
              step="0.1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-foreground mb-2">
              इकाई
            </label>
            <select
              value={formData.quantity_unit}
              onChange={(e) => setFormData({ ...formData, quantity_unit: e.target.value })}
              className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="kg">किलोग्राम (kg)</option>
              <option value="quintal">क्विंटल (q)</option>
              <option value="ton">टन (t)</option>
            </select>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-base font-semibold text-foreground mb-2">
            मूल्य प्रति इकाई (₹) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price_per_unit}
            onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
            className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="500"
          />
        </div>

        {/* Harvest Date */}
        <div>
          <label className="block text-base font-semibold text-foreground mb-2">
            कटाई की तारीख *
          </label>
          <input
            type="date"
            required
            value={formData.harvest_date}
            onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
            className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-base font-semibold text-foreground mb-2">
            विवरण
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={4}
            placeholder="आपकी फसल के बारे में अधिक जानकारी दें..."
          />
        </div>

        {/* Organic Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="organic"
            checked={formData.is_organic}
            onChange={(e) => setFormData({ ...formData, is_organic: e.target.checked })}
            className="w-5 h-5 text-primary cursor-pointer"
          />
          <label htmlFor="organic" className="text-base font-semibold text-foreground cursor-pointer">
            जैविक/ऑर्गेनिक
          </label>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-base font-semibold text-foreground mb-3">
            फोटो ({photos.length} अपलोड किए गए)
          </label>
          <CameraCapture onCapture={handlePhotoCapture} label="फोटो जोड़ें" />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.crop_name || !formData.quantity || !formData.price_per_unit}
          className="w-full h-14 bg-primary hover:bg-secondary text-white font-bold text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              बना रहे हैं...
            </>
          ) : (
            'लिस्टिंग बनाएं'
          )}
        </button>
      </form>
    </div>
  );
}

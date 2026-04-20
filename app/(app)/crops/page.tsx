'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { apiPost, apiDelete } from '@/lib/api';
import { CROPS } from '@/lib/constants';
import { CameraCapture } from '@/components/CameraCapture';
import { Plus, Edit2, Trash2, Zap, Calendar } from 'lucide-react';

interface Crop {
  id: string;
  name: string;
  variety: string;
  area: number;
  sowing_date: string;
  expected_harvest: string;
  status: 'planning' | 'growing' | 'harvested';
  notes: string;
  photo_url?: string;
}

interface DiseaseDetection {
  disease: string;
  confidence: number;
  treatment: string;
  prevention: string;
}

export default function CropsPage() {
  const { user } = useAuthStore();
  const [crops, setCrops] = useState<Crop[]>([
    {
      id: '1',
      name: 'गेहूँ',
      variety: 'WH 147',
      area: 2.5,
      sowing_date: '2024-10-15',
      expected_harvest: '2025-03-15',
      status: 'growing',
      notes: 'अगले हफ्ते सिंचाई निर्धारित है',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);
  const [selectedCropForDisease, setSelectedCropForDisease] = useState<string | null>(null);
  const [diseaseFile, setDiseaseFile] = useState<File | null>(null);
  const [diseaseResult, setDiseaseResult] = useState<DiseaseDetection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Crop>>({
    name: '',
    variety: '',
    area: 0,
    sowing_date: '',
    expected_harvest: '',
    status: 'planning',
    notes: '',
  });

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: '',
      variety: '',
      area: 0,
      sowing_date: '',
      expected_harvest: '',
      status: 'planning',
      notes: '',
    });
    setShowForm(true);
  };

  const handleEditClick = (crop: Crop) => {
    setEditingId(crop.id);
    setFormData(crop);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप इस फसल को हटाना सुनिश्चित हैं?')) return;
    setLoading(true);
    try {
      await apiDelete(`/crops/${id}`);
      setCrops(crops.filter((c) => c.id !== id));
    } catch (err: any) {
      setError('फसल हटाने में विफल');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (editingId) {
        await apiPost(`/crops/${editingId}`, formData);
        setCrops(crops.map((c) => (c.id === editingId ? { ...c, ...formData } as Crop : c)));
      } else {
        const newCrop = { ...formData, id: Date.now().toString() } as Crop;
        setCrops([...crops, newCrop]);
        await apiPost('/crops', formData);
      }
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'विफल');
    } finally {
      setLoading(false);
    }
  };

  const handleDiseaseDetection = async () => {
    if (!diseaseFile || !selectedCropForDisease) {
      setError('कृपया एक फसल चुनें और फोटो अपलोड करें');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', diseaseFile);
    formData.append('crop_id', selectedCropForDisease);

    try {
      const result = await apiPost<DiseaseDetection>('/crops/detect-disease', formData);
      setDiseaseResult(result);
    } catch (err: any) {
      setError('रोग पहचान में विफल। कृपया दोबारा कोशिश करें।');
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysUntilHarvest = (harvestDate: string) => {
    const today = new Date();
    const harvest = new Date(harvestDate);
    const days = Math.ceil((harvest.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">मेरी फसलें</h1>
          <p className="text-lg text-muted-foreground mt-1">{crops.length} फसलें ट्रैक करें</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 h-14 px-6 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition text-lg"
          >
            <Plus size={24} />
            नई फसल
          </button>
          <button
            onClick={() => {
              setShowDiseaseModal(true);
              setDiseaseResult(null);
            }}
            className="flex items-center gap-2 h-14 px-6 bg-accent hover:bg-accent/90 text-white font-bold rounded-lg transition text-lg"
          >
            <Zap size={24} />
            रोग जाँचें
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 text-base">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {editingId ? 'फसल संपादित करें' : 'नई फसल जोड़ें'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-base font-semibold text-foreground mb-2">
                  फसल का नाम *
                </label>
                <select
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

              <div>
                <label className="block text-base font-semibold text-foreground mb-2">
                  किस्म
                </label>
                <input
                  type="text"
                  value={formData.variety || ''}
                  onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                  className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="उदाहरण: WH 147"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-base font-semibold text-foreground mb-2">
                  क्षेत्र (हेक्टेयर) *
                </label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.1"
                  value={formData.area || ''}
                  onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-foreground mb-2">
                  बुवाई की तारीख *
                </label>
                <input
                  type="date"
                  required
                  value={formData.sowing_date || ''}
                  onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
                  className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-foreground mb-2">
                  कटाई की अपेक्षित तारीख *
                </label>
                <input
                  type="date"
                  required
                  value={formData.expected_harvest || ''}
                  onChange={(e) => setFormData({ ...formData, expected_harvest: e.target.value })}
                  className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-semibold text-foreground mb-2">
                स्थिति
              </label>
              <select
                value={formData.status || 'planning'}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="planning">योजना बना रहे हैं</option>
                <option value="growing">बढ़ रहा है</option>
                <option value="harvested">कटाई की गई</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-semibold text-foreground mb-2">
                नोट्स
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                placeholder="कोई विशेष जानकारी..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.sowing_date || !formData.expected_harvest}
                className="flex-1 h-14 bg-primary hover:bg-secondary text-white font-bold text-lg rounded-lg disabled:opacity-50 transition"
              >
                {editingId ? 'अपडेट करें' : 'जोड़ें'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 h-14 bg-gray-200 hover:bg-gray-300 text-foreground font-bold text-lg rounded-lg transition"
              >
                रद्द करें
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Disease Detection Modal */}
      {showDiseaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 rounded-lg">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-foreground mb-4">रोग की पहचान करें</h2>

            {!diseaseResult ? (
              <>
                <div className="mb-4">
                  <label className="block text-base font-semibold text-foreground mb-2">
                    फसल चुनें *
                  </label>
                  <select
                    value={selectedCropForDisease || ''}
                    onChange={(e) => setSelectedCropForDisease(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">चुनें...</option>
                    {crops.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.name}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="block text-base font-semibold text-foreground mb-3">
                  रोगी पत्ती की तस्वीर *
                </label>
                <CameraCapture
                  onCapture={(file) => setDiseaseFile(file)}
                  label="फोटो जोड़ें"
                />

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleDiseaseDetection}
                    disabled={loading || !diseaseFile || !selectedCropForDisease}
                    className="flex-1 h-14 bg-accent hover:bg-accent/90 text-white font-bold rounded-lg disabled:opacity-50 transition"
                  >
                    {loading ? 'विश्लेषण...' : 'विश्लेषण करें'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDiseaseModal(false);
                      setDiseaseFile(null);
                      setSelectedCropForDisease(null);
                    }}
                    className="flex-1 h-14 bg-gray-200 hover:bg-gray-300 text-foreground font-bold rounded-lg transition"
                  >
                    बंद करें
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <h3 className="font-bold text-lg text-yellow-900">{diseaseResult.disease}</h3>
                    <p className="text-base text-yellow-800 mt-1">
                      विश्वास: {(diseaseResult.confidence * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                    <h4 className="font-bold text-foreground mb-2">इलाज:</h4>
                    <p className="text-base text-foreground">{diseaseResult.treatment}</p>
                  </div>

                  <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                    <h4 className="font-bold text-foreground mb-2">रोकथाम:</h4>
                    <p className="text-base text-foreground">{diseaseResult.prevention}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowDiseaseModal(false);
                    setDiseaseResult(null);
                    setDiseaseFile(null);
                    setSelectedCropForDisease(null);
                  }}
                  className="w-full h-14 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition mt-4"
                >
                  बंद करें
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Crops Grid */}
      <div className="grid gap-6">
        {crops.map((crop) => {
          const daysUntilHarvest = calculateDaysUntilHarvest(crop.expected_harvest);
          const harvestPercentage = Math.min(
            100,
            ((new Date(crop.sowing_date).getTime() - new Date().getTime()) /
              (new Date(crop.expected_harvest).getTime() - new Date(crop.sowing_date).getTime())) *
              100
          );

          return (
            <div
              key={crop.id}
              className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{crop.name}</h3>
                  <p className="text-lg text-muted-foreground">
                    {crop.variety && `किस्म: ${crop.variety}`} • क्षेत्र: {crop.area} हे.
                  </p>
                  <p className="text-base text-muted-foreground mt-1">{crop.notes}</p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-4 py-2 rounded-full text-base font-bold mb-2 bg-primary/20 text-primary">
                    {crop.status === 'planning'
                      ? 'योजना'
                      : crop.status === 'growing'
                        ? 'बढ़ रहा है'
                        : 'कटाई'}
                  </div>
                </div>
              </div>

              {crop.status !== 'harvested' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-base font-semibold text-foreground">
                      <Calendar size={18} />
                      कटाई में {daysUntilHarvest} दिन बाकी
                    </span>
                    <span className="text-sm text-muted-foreground">{harvestPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${harvestPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleEditClick(crop)}
                  className="flex items-center gap-2 px-4 py-3 bg-accent/20 hover:bg-accent/30 text-accent font-bold rounded-lg transition text-base"
                >
                  <Edit2 size={20} />
                  संपादित करें
                </button>

                <button
                  onClick={() => {
                    setSelectedCropForDisease(crop.id);
                    setShowDiseaseModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold rounded-lg transition text-base"
                >
                  <Zap size={20} />
                  रोग जाँचें
                </button>

                <button
                  onClick={() => handleDelete(crop.id)}
                  className="flex items-center gap-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition text-base ml-auto"
                >
                  <Trash2 size={20} />
                  हटाएं
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

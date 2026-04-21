'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useFarmerStore } from '@/store/farmer';
import { Plus, Edit2, Trash2, AlertCircle, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { farmerService } from '@/lib/apiServices';

interface CropFormData {
  crop_name: string;
  variety: string;
  quantity_kg: number;
  price_per_kg: number;
  sowing_date?: string;
  harvest_date?: string;
  is_organic: boolean;
  description?: string;
}

export default function CropsPage() {
  const { user } = useAuthStore();
  const { crops, isLoading, fetchCrops, createCrop, updateCrop, markCropReady, markCropSold } = useFarmerStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState<CropFormData>({
    crop_name: '',
    variety: '',
    quantity_kg: 0,
    price_per_kg: 0,
    is_organic: false,
  });

  // Fetch crops on mount
  useEffect(() => {
    if (user?.id) {
      fetchCrops(user.id);
    }
  }, [user?.id, fetchCrops]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      crop_name: '',
      variety: '',
      quantity_kg: 0,
      price_per_kg: 0,
      is_organic: false,
    });
    setShowForm(true);
  };

  const handleEditClick = (crop: any) => {
    setEditingId(crop.id);
    setFormData({
      crop_name: crop.crop_name,
      variety: crop.variety,
      quantity_kg: crop.quantity_kg,
      price_per_kg: crop.price_per_kg,
      sowing_date: crop.sowing_date,
      harvest_date: crop.harvest_date,
      is_organic: crop.is_organic,
      description: crop.description,
    });
    setShowForm(true);
  };

  const handleDeleteCrop = async (cropId: string) => {
    if (!confirm('Are you sure you want to delete this crop?')) return;

    setSubmitLoading(true);
    try {
      await farmerService.deleteCrop(cropId);
      if (user?.id) {
        await fetchCrops(user.id);
      }
      setSuccess('Crop deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete crop');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleMarkReady = async (cropId: string) => {
    setSubmitLoading(true);
    try {
      await markCropReady(cropId);
      setSuccess('Crop marked as ready! Now listed on the marketplace.');
    } catch (err: any) {
      setError(err.message || 'Failed to mark crop ready');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleMarkSold = async (cropId: string) => {
    setSubmitLoading(true);
    try {
      await markCropSold(cropId);
      setSuccess('Crop marked as sold');
    } catch (err: any) {
      setError(err.message || 'Failed to mark crop sold');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.crop_name || !formData.variety || formData.quantity_kg <= 0 || formData.price_per_kg <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingId) {
        await updateCrop(editingId, formData);
        setSuccess('Crop updated successfully');
      } else {
        await createCrop(user?.id || '', formData);
        setSuccess('Crop added successfully');
      }
      setShowForm(false);
      setFormData({
        crop_name: '',
        variety: '',
        quantity_kg: 0,
        price_per_kg: 0,
        is_organic: false,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save crop');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredCrops = filterStatus === 'all' 
    ? crops 
    : crops.filter(crop => crop.status === filterStatus);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Crops</h1>
          <p className="text-muted-text">Manage your crop inventory and marketplace listings</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Crop
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'planning', 'growing', 'ready', 'sold'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === status
                ? 'bg-primary text-white'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingId ? 'Edit Crop' : 'Add New Crop'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Crop Name *
                </label>
                <input
                  type="text"
                  value={formData.crop_name}
                  onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                  placeholder="e.g., Wheat"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Variety *
                </label>
                <input
                  type="text"
                  value={formData.variety}
                  onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                  placeholder="e.g., WH 147"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Quantity (kg) *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity_kg}
                    onChange={(e) => setFormData({ ...formData, quantity_kg: parseFloat(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Price (₹/kg) *
                  </label>
                  <input
                    type="number"
                    value={formData.price_per_kg}
                    onChange={(e) => setFormData({ ...formData, price_per_kg: parseFloat(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Sowing Date
                  </label>
                  <input
                    type="date"
                    value={formData.sowing_date || ''}
                    onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    value={formData.harvest_date || ''}
                    onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_organic}
                  onChange={(e) => setFormData({ ...formData, is_organic: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-foreground">Organic Crop</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any notes or details about this crop"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update' : 'Add'} Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crops List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-text">Loading your crops...</span>
        </div>
      ) : filteredCrops.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-muted-text mb-4">No crops found</p>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Your First Crop
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrops.map((crop) => (
            <div key={crop.id} className="bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Status Badge */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-foreground text-lg">{crop.crop_name}</h3>
                  <p className="text-xs text-muted-text">{crop.variety}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                  crop.status === 'ready' ? 'bg-green-100 text-green-800' :
                  crop.status === 'growing' ? 'bg-blue-100 text-blue-800' :
                  crop.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
                </span>
              </div>

              {/* Info Grid */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-text">Quantity:</span>
                  <span className="font-medium">{crop.quantity_kg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text">Price:</span>
                  <span className="font-medium">₹{crop.price_per_kg}/kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-text">Total Value:</span>
                  <span className="font-medium">₹{(crop.quantity_kg * crop.price_per_kg).toFixed(0)}</span>
                </div>
                {crop.harvest_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-text">Harvest:</span>
                    <span className="font-medium">{new Date(crop.harvest_date).toLocaleDateString()}</span>
                  </div>
                )}
                {crop.is_organic && (
                  <div className="inline-block bg-green-50 text-green-700 text-xs px-2 py-1 rounded font-medium">
                    🌿 Organic
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {crop.status === 'growing' && (
                  <button
                    onClick={() => handleMarkReady(crop.id)}
                    disabled={submitLoading}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Mark Ready
                  </button>
                )}

                {crop.status === 'ready' && (
                  <button
                    onClick={() => handleMarkSold(crop.id)}
                    disabled={submitLoading}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Mark Sold
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(crop)}
                    className="flex-1 py-2 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCrop(crop.id)}
                    disabled={submitLoading}
                    className="flex-1 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>

                <Link href={`/crops/${crop.id}`}>
                  <button className="w-full py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

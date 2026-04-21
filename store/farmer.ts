/**
 * Farmer Service/Store
 * Manages farmer profile and crop data
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { farmerService, FarmerResponse, CropListingResponse } from '@/lib/apiServices';

interface FarmerState {
  farmer: FarmerResponse | null;
  crops: CropListingResponse[];
  isLoading: boolean;
  error: string | null;
  
  // Setters
  setFarmer: (farmer: FarmerResponse) => void;
  setCrops: (crops: CropListingResponse[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearFarmer: () => void;
  
  // Async actions
  fetchFarmer: (farmerId: string) => Promise<void>;
  fetchCrops: (farmerId: string) => Promise<void>;
  createCrop: (farmerId: string, cropData: any) => Promise<CropListingResponse>;
  updateCrop: (cropId: string, cropData: any) => Promise<CropListingResponse>;
  deleteCrop: (cropId: string) => Promise<void>;
  markCropReady: (cropId: string) => Promise<void>;
  markCropSold: (cropId: string) => Promise<void>;
}

export const useFarmerStore = create<FarmerState>()(
  persist(
    (set, get) => ({
      farmer: null,
      crops: [],
      isLoading: false,
      error: null,

      setFarmer: (farmer) => set({ farmer }),
      setCrops: (crops) => set({ crops }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearFarmer: () => set({ farmer: null, crops: [], error: null }),

      fetchFarmer: async (farmerId) => {
        set({ isLoading: true, error: null });
        try {
          const farmer = await farmerService.getProfile(farmerId);
          set({ farmer, error: null });
        } catch (error: any) {
          const errorMsg = error.response?.data?.detail || 'Failed to fetch farmer profile';
          set({ error: errorMsg });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchCrops: async (farmerId) => {
        set({ isLoading: true, error: null });
        try {
          const crops = await farmerService.getFarmerCrops(farmerId);
          set({ crops, error: null });
        } catch (error: any) {
          const errorMsg = error.response?.data?.detail || 'Failed to fetch crops';
          set({ error: errorMsg });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      createCrop: async (farmerId, cropData) => {
        set({ isLoading: true, error: null });
        try {
          const crop = await farmerService.createCrop(farmerId, cropData);
          set((state) => ({ crops: [...state.crops, crop], error: null }));
          return crop;
        } catch (error: any) {
          const errorMsg = error.response?.data?.detail || 'Failed to create crop';
          set({ error: errorMsg });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateCrop: async (cropId, cropData) => {
        set({ isLoading: true, error: null });
        try {
          const updated = await farmerService.updateCrop(cropId, cropData);
          set((state) => ({
            crops: state.crops.map((c) => (c.id === cropId ? updated : c)),
            error: null,
          }));
          return updated;
        } catch (error: any) {
          const errorMsg = error.response?.data?.detail || 'Failed to update crop';
          set({ error: errorMsg });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      markCropReady: async (cropId) => {
        set({ isLoading: true, error: null });
        try {
          await farmerService.markCropReady(cropId);
          set((state) => ({
            crops: state.crops.map((c) =>
              c.id === cropId ? { ...c, status: 'ready' as const } : c
            ),
            error: null,
          }));
        } catch (error: any) {
          const errorMsg = error.response?.data?.detail || 'Failed to mark crop as ready';
          set({ error: errorMsg });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      markCropSold: async (cropId) => {
        set({ isLoading: true, error: null });
        try {
          await farmerService.markCropSold(cropId);
          set((state) => ({
            crops: state.crops.map((c) =>
              c.id === cropId ? { ...c, status: 'sold' as const } : c
            ),
            error: null,
          }));
        } catch (error: any) {
          const errorMsg = error.response?.data?.detail || 'Failed to mark crop as sold';
          set({ error: errorMsg });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteCrop: async (cropId) => {
        set({ isLoading: true, error: null });
        try {
          await farmerService.deleteCrop(cropId);
          set((state) => ({
            crops: state.crops.filter((c) => c.id !== cropId),
            error: null,
          }));
        } catch (error: any) {
          const errorMsg = error.response?.data?.detail || 'Failed to delete crop';
          set({ error: errorMsg });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'farmer-store',
      version: 1,
      partialize: (state) => ({
        farmer: state.farmer,
        crops: state.crops,
      }),
    }
  )
);

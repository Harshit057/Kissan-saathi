/**
 * Marketplace Service/Store
 * Manages consumer marketplace data
 */

import { create } from 'zustand';
import { marketplaceService, MarketplaceListingResponse, OrderResponse } from '@/lib/apiServices';

interface MarketplaceState {
  listings: MarketplaceListingResponse[];
  nearbyFarmers: MarketplaceListingResponse[];
  orders: OrderResponse[];
  isLoading: boolean;
  error: string | null;

  // Setters
  setListings: (listings: MarketplaceListingResponse[]) => void;
  setNearbyFarmers: (farmers: MarketplaceListingResponse[]) => void;
  setOrders: (orders: OrderResponse[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async actions
  searchNearbyFarmers: (
    latitude: number,
    longitude: number,
    radiusKm?: number,
    category?: string
  ) => Promise<void>;
  getListings: (params?: any) => Promise<void>;
  searchListings: (query: string, location?: { lat: number; lng: number }) => Promise<void>;
  placeOrder: (cropListingId: string, quantityKg: number, paymentMethod: string) => Promise<OrderResponse>;
  getOrders: () => Promise<void>;
}

export const useMarketplaceStore = create<MarketplaceState>()((set, get) => ({
  listings: [],
  nearbyFarmers: [],
  orders: [],
  isLoading: false,
  error: null,

  setListings: (listings) => set({ listings }),
  setNearbyFarmers: (nearbyFarmers) => set({ nearbyFarmers }),
  setOrders: (orders) => set({ orders }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  searchNearbyFarmers: async (latitude, longitude, radiusKm = 100, category) => {
    set({ isLoading: true, error: null });
    try {
      const farmers = await marketplaceService.getNearbyFarmers({
        latitude,
        longitude,
        radius_km: radiusKm,
        category,
        sort_by: 'distance',
      });
      set({ nearbyFarmers: farmers, error: null });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to search nearby farmers';
      set({ error: errorMsg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getListings: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const listings = await marketplaceService.getListings(params);
      set({ listings, error: null });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch listings';
      set({ error: errorMsg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  searchListings: async (query, location) => {
    set({ isLoading: true, error: null });
    try {
      const results = await marketplaceService.searchListings(query, {
        latitude: location?.lat,
        longitude: location?.lng,
      });
      set({ listings: results, error: null });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to search listings';
      set({ error: errorMsg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  placeOrder: async (cropListingId, quantityKg, paymentMethod) => {
    set({ isLoading: true, error: null });
    try {
      const order = await marketplaceService.createOrder({
        crop_listing_id: cropListingId,
        quantity_kg: quantityKg,
        payment_method: paymentMethod as any,
      });
      set((state) => ({
        orders: [...state.orders, order],
        error: null,
      }));
      return order;
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to create order';
      set({ error: errorMsg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      // This endpoint might not exist yet, so we'll fetch from user's orders
      // For now, this is a placeholder
      set({ error: null });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch orders';
      set({ error: errorMsg });
    } finally {
      set({ isLoading: false });
    }
  },
}));

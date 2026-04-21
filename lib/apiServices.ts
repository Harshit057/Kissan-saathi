/**
 * API Service Functions for KisanSaathi & आपनGaon Backend
 * This file contains all HTTP requests to the FastAPI backend
 */

import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './api';

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================

export interface RegisterRequest {
  phone: string;
  email?: string;
  password: string;
  name: string;
  role: 'farmer' | 'consumer';
  language_preference?: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: string;
  phone: string;
  email?: string;
  name: string;
  role: string;
  language_preference: string;
  is_verified: boolean;
  created_at: string;
}

export const authService = {
  register: (data: RegisterRequest) =>
    apiPost<TokenResponse>('/auth/register', data),

  login: (data: LoginRequest) =>
    apiPost<TokenResponse>('/auth/login', data),

  refreshToken: (refreshToken: string) =>
    apiPost<TokenResponse>('/auth/refresh-token', { refresh_token: refreshToken }),

  verifyOTP: (phone: string, otp: string) =>
    apiPost<TokenResponse>('/auth/verify-otp', { phone, otp }),

  getCurrentUser: () =>
    apiGet<UserResponse>('/auth/me'),
};

// ============================================================================
// FARMER SERVICES
// ============================================================================

export interface FarmerCreateRequest {
  user_id?: string;
  state: string;
  district: string;
  village: string;
  latitude: number;
  longitude: number;
  land_size_hectares: number;
  soil_type: string;
  crops_grown?: string[];
  is_organic_certified?: boolean;
  certifying_body?: string;
}

export interface FarmerResponse {
  id: string;
  user_id: string;
  state: string;
  district: string;
  village: string;
  land_size_hectares: number;
  soil_type: string;
  is_organic_certified: boolean;
  profile_photo_url?: string;
  rating: number;
  total_reviews: number;
  created_at: string;
}

export interface CropListingRequest {
  crop_name: string;
  variety: string;
  quantity_kg: number;
  price_per_kg: number;
  sowing_date?: string;
  harvest_date?: string;
  is_organic?: boolean;
  description?: string;
  images?: string[];
}

export interface CropListingResponse extends CropListingRequest {
  id: string;
  farmer_id: string;
  status: 'planning' | 'growing' | 'ready' | 'sold' | 'failed';
  aapangaon_listed: boolean;
  aapangaon_listing_id?: string;
  created_at: string;
  updated_at: string;
}

export const farmerService = {
  createProfile: (data: FarmerCreateRequest) =>
    apiPost<FarmerResponse>('/farmers/profile', data),

  getProfile: (farmerId: string) =>
    apiGet<FarmerResponse>(`/farmers/profile/${farmerId}`),

  updateProfile: (farmerId: string, data: Partial<FarmerCreateRequest>) =>
    apiPut<FarmerResponse>(`/farmers/profile/${farmerId}`, data),

  createCrop: (farmerId: string, data: CropListingRequest) =>
    apiPost<CropListingResponse>(`/farmers/crops`, { ...data, farmer_id: farmerId }),

  getCrop: (cropId: string) =>
    apiGet<CropListingResponse>(`/farmers/crops/${cropId}`),

  getFarmerCrops: (farmerId: string, status?: string) =>
    apiGet<CropListingResponse[]>(`/farmers/crops`, { farmer_id: farmerId, status }),

  markCropReady: (cropId: string, pricePerKg?: number, listOnAapangaon?: boolean) =>
    apiPost(`/farmers/crops/${cropId}/ready`, { price_per_kg: pricePerKg, list_on_aapangaon: listOnAapangaon }),

  markCropSold: (cropId: string) =>
    apiPost(`/farmers/crops/${cropId}/sold`, {}),

  updateCrop: (cropId: string, data: Partial<CropListingRequest>) =>
    apiPut<CropListingResponse>(`/farmers/crops/${cropId}`, data),

  deleteCrop: (cropId: string) =>
    apiDelete(`/farmers/crops/${cropId}`),
};

// ============================================================================
// MARKETPLACE SERVICES (आपनGaon)
// ============================================================================

export interface ConsumerCreateRequest {
  user_id?: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  address: string;
  preferred_categories?: string[];
}

export interface ConsumerResponse extends ConsumerCreateRequest {
  id: string;
  user_id: string;
  created_at: string;
}

export interface NearbyFarmersRequest {
  latitude: number;
  longitude: number;
  radius_km?: number;
  category?: string;
  limit?: number;
  sort_by?: 'distance' | 'rating' | 'price';
}

export interface MarketplaceListingResponse {
  id: string;
  crop_name: string;
  variety: string;
  quantity_kg: number;
  price_per_kg: number;
  is_organic: boolean;
  distance_km: number;
  farmer_id: string;
  farmer_name: string;
  farmer_village: string;
  farmer_state: string;
  farmer_rating: number;
  aapangaon_listing_id: string;
  created_at: string;
}

export interface OrderCreateRequest {
  crop_listing_id: string;
  quantity_kg: number;
  payment_method: 'upi' | 'card' | 'cod';
  delivery_address?: string;
}

export interface OrderResponse {
  id: string;
  consumer_id: string;
  farmer_id: string;
  crop_listing_id: string;
  quantity_kg: number;
  price_per_kg: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewCreateRequest {
  order_id: string;
  rating: number;
  review_text?: string;
}

export interface ReviewResponse {
  id: string;
  order_id: string;
  consumer_id: string;
  farmer_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
}

export const marketplaceService = {
  createConsumerProfile: (data: ConsumerCreateRequest) =>
    apiPost<ConsumerResponse>('/marketplace/consumers/profile', data),

  getConsumerProfile: (consumerId: string) =>
    apiGet<ConsumerResponse>(`/marketplace/consumers/profile/${consumerId}`),

  getNearbyFarmers: (params: NearbyFarmersRequest) =>
    apiGet<MarketplaceListingResponse[]>('/marketplace/nearby-farmers', params),

  getListings: (params?: { category?: string; is_organic?: boolean; min_price?: number; max_price?: number; limit?: number; offset?: number }) =>
    apiGet<MarketplaceListingResponse[]>('/marketplace/listings', params),

  searchListings: (query: string, params?: { latitude?: number; longitude?: number }) =>
    apiGet<MarketplaceListingResponse[]>('/marketplace/search', { q: query, ...params }),

  createOrder: (data: OrderCreateRequest) =>
    apiPost<OrderResponse>('/marketplace/orders', data),

  getOrder: (orderId: string) =>
    apiGet<OrderResponse>(`/marketplace/orders/${orderId}`),

  confirmPayment: (orderId: string, razorapayOrderId: string, razorpayPaymentId: string, signature: string) =>
    apiPost(`/marketplace/orders/${orderId}/confirm-payment`, { razorpay_order_id: razorapayOrderId, razorpay_payment_id: razorpayPaymentId, signature }),

  createReview: (data: ReviewCreateRequest) =>
    apiPost<ReviewResponse>('/marketplace/reviews', data),

  getFarmerReviews: (farmerId: string, limit?: number, offset?: number) =>
    apiGet<ReviewResponse[]>(`/marketplace/farmers/${farmerId}/reviews`, { limit, offset }),
};

// ============================================================================
// GOVERNMENT SCHEMES SERVICES
// ============================================================================

export interface SchemeResponse {
  id: string;
  name: string;
  ministry: string;
  description: string;
  benefit_amount?: number;
  applicable_states?: string[];
  eligibility_criteria?: Record<string, any>;
  application_url?: string;
  helpline_number?: string;
  source?: string;
  is_active: boolean;
  created_at: string;
}

export interface SchemeEligibilityResponse {
  scheme_id: string;
  is_eligible: boolean | null;
  reason?: string;
  eligibility_checked_at: string;
}

export const schemeService = {
  discoverSchemes: (farmerId: string) =>
    apiGet<SchemeResponse[]>('/schemes/discover', { farmer_id: farmerId }),

  checkEligibility: (farmerId: string, schemeId: string) =>
    apiPost<SchemeEligibilityResponse>('/schemes/check-eligibility', { farmer_id: farmerId, scheme_id: schemeId }),

  getFarmerSchemes: (farmerId: string) =>
    apiGet<(SchemeResponse & { eligibility: SchemeEligibilityResponse })[]>(`/schemes/farmer-schemes/${farmerId}`),

  applyScheme: (farmerId: string, schemeId: string) =>
    apiPost(`/schemes/apply/${farmerId}/${schemeId}`, {}),
};

// ============================================================================
// MARKET DATA SERVICES
// ============================================================================

export interface MandiPriceResponse {
  crop_name: string;
  variety?: string;
  market_name: string;
  market_city: string;
  state: string;
  price_per_kg: number;
  min_price?: number;
  max_price?: number;
  quantity_arrived_tonnes?: number;
  updated_at: string;
}

export interface PriceTrendResponse {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CropAdvisoryRequest {
  crop_name?: string;
  state: string;
  district: string;
  season: 'kharif' | 'rabi' | 'summer';
  soil_type?: string;
  land_size_hectares?: number;
}

export interface CropAdvisoryResponse {
  crop_name: string;
  recommended_varieties: string[];
  sowing_window: { start_month: number; end_month: number };
  water_requirement_mm: number;
  suitable_soil_types: string[];
  irrigation_schedule_days: number;
  expected_yield_tonnes_per_hectare: number;
  pest_management_tips: string[];
  production_estimate?: number;
}

export const marketService = {
  getMandiPrices: (params?: { crop_name?: string; state?: string; market_name?: string }) =>
    apiGet<MandiPriceResponse[]>('/market/mandi-prices', params),

  getPriceTrend: (cropName: string, days?: number) =>
    apiGet<PriceTrendResponse[]>('/market/price-trend', { crop_name: cropName, days }),

  getCropAdvisory: (data: CropAdvisoryRequest) =>
    apiPost<CropAdvisoryResponse>('/market/crop-advisory', data),

  getSeasonalCrops: (season: string, state?: string) =>
    apiGet<string[]>('/market/seasonal-crops', { season, state }),

  getMarketDemand: (cropName: string) =>
    apiGet('/market/demand/' + cropName),
};

// ============================================================================
// AI ASSISTANT SERVICES
// ============================================================================

export interface ChatRequest {
  user_id?: string;
  message: string;
  language?: string;
  session_id?: string;
  is_voice?: boolean;
  voice_file_url?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  language?: string;
  timestamp: string;
}

export interface ChatResponse {
  message: string;
  language: string;
  session_id: string;
  context_chunks: string[];
  suggestions: string[];
}

export interface ConversationHistory {
  session_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export const aiService = {
  chat: (data: ChatRequest) =>
    apiPost<ChatResponse>('/ai/chat', data),

  getChatHistory: (sessionId: string) =>
    apiGet<ConversationHistory>(`/ai/chat-history/${sessionId}`),

  voiceChat: (data: { user_id: string; language: string; voice_file_url: string }) =>
    apiPost<ChatResponse>('/ai/voice-chat', data),

  getSuggestions: (topic?: string) =>
    apiGet<string[]>('/ai/suggestions', { topic }),
};

// ============================================================================
// NOTIFICATION SERVICES
// ============================================================================

export interface NotificationPreferenceRequest {
  enable_sms?: boolean;
  enable_push?: boolean;
  enable_email?: boolean;
  crop_alerts?: boolean;
  scheme_alerts?: boolean;
  market_alerts?: boolean;
  order_alerts?: boolean;
}

export const notificationService = {
  updatePreferences: (userId: string, data: NotificationPreferenceRequest) =>
    apiPut(`/notifications/preferences/${userId}`, data),

  getPreferences: (userId: string) =>
    apiGet(`/notifications/preferences/${userId}`),
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthService = {
  check: () =>
    apiGet('/health'),
};


export type AppRole = 'owner' | 'customer' | 'admin' | 'professional';

export type OwnerView = 'overview' | 'agenda' | 'settings' | 'setup' | 'team' | 'inventory' | 'financial' | 'marketing';
export type ProfessionalView = 'agenda' | 'commissions' | 'profile';
export type CustomerView = 'onboarding' | 'login' | 'signup_choice' | 'signup' | 'forgot_password' | 'auth_register' | 'register_selection' | 'discovery' | 'portal' | 'booking' | 'loyalty' | 'history' | 'favorites' | 'profile' | 'auth_reset' | 'auth_feedback';
export type AdminView = 'dashboard' | 'salons' | 'users' | 'settings' | 'promocodes';

export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: string;
  clientName: string;
  service: string;
  professional: string;
  price: number;
  status: 'confirmed' | 'pending' | 'blocked' | 'free' | 'in_progress' | 'completed' | 'cancelled';
  type?: 'lunch' | 'break';
  user_id?: string;
  service_id?: string;
  professional_id?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  category: string;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  image: string;
  performance: number;
  revenue: string;
  commission_service: number;
  commission_product: number;
  status: 'active' | 'vacation';
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  cost: number;
  image: string;
  stock: number;
  category: string;
  status: 'normal' | 'low' | 'critical';
}

export interface Establishment {
  id: string;
  name: string;
  slug?: string;
  cover_url?: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  description?: string;
  owner_id?: string;
  // Admin Fields
  status: 'active' | 'blocked' | 'pending';
  trial_ends_at?: string;
  subscription_plan: 'free' | 'pro' | 'enterprise';
  category?: string;
}

export enum BookingStep {
  Service = 1,
  Professional = 2,
  DateTime = 3,
  AddOns = 4,
  Summary = 5
}

export interface Feedback {
  id: string;
  user_id: string;
  type: 'bug' | 'feature' | 'support' | 'other';
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  target_audience: 'all' | 'owners' | 'customers';
  expires_at?: string;
  created_at: string;
}

export interface PlatformPayment {
  id: string;
  establishment_id: string;
  amount: number;
  plan_type: 'pro' | 'enterprise';
  status: 'paid' | 'pending' | 'failed';
  payment_date: string;
}


export interface Profile {
  id: string;
  name: string;
  email?: string; // Joined from auth.users usually
  role: AppRole;
  status: 'active' | 'blocked';
  created_at?: string;
}

export interface SystemSetting {
  key: string;
  value: any;
  updated_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  days_granted: number;
  active: boolean;
  created_at: string;
}

export interface LoyaltyCard {
  id: string;
  user_id: string;
  establishment_id: string;
  stamps: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyReward {
  id: string;
  establishment_id: string;
  title: string;
  description: string;
  cost: number;
  active: boolean;
  created_at: string;
}

export interface LoyaltyRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  redeemed_at: string;
}

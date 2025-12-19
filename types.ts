
export type AppRole = 'owner' | 'customer' | 'admin' | 'professional';

export type OwnerView = 'overview' | 'agenda' | 'settings' | 'setup' | 'team' | 'inventory' | 'financial' | 'marketing';
export type ProfessionalView = 'agenda' | 'commissions' | 'profile';
export type CustomerView = 'onboarding' | 'login' | 'signup_choice' | 'signup' | 'forgot_password' | 'auth_register' | 'register_selection' | 'discovery' | 'portal' | 'booking' | 'loyalty' | 'history' | 'favorites' | 'profile' | 'auth_reset' | 'auth_feedback';
export type AdminView = 'dashboard' | 'salons' | 'users' | 'settings';

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

export enum BookingStep {
  Service = 1,
  Professional = 2,
  DateTime = 3,
  AddOns = 4,
  Summary = 5
}

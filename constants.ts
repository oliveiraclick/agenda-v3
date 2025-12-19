
import { Appointment, Service, Professional, Product } from './types';

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', time: '08:00', duration: '', clientName: '', service: '', professional: '', price: 0, status: 'free' },
  { id: '2', time: '09:00', duration: '45min', clientName: 'Maria Silva', service: 'Corte e Hidratação', professional: 'Ana', price: 120, status: 'confirmed' },
  { id: '3', time: '10:00', duration: '', clientName: '', service: '', professional: '', price: 0, status: 'free' },
  { id: '4', time: '12:00', duration: '1h30', clientName: 'Almoço', service: '', professional: '', price: 0, status: 'blocked', type: 'lunch' },
  { id: '5', time: '13:30', duration: '60min', clientName: 'João Souza', service: 'Barba e Cabelo', professional: 'Carlos', price: 80, status: 'pending' },
  { id: '6', time: '14:30', duration: '', clientName: '', service: '', professional: '', price: 0, status: 'free' },
];

export const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Corte Degradê', description: 'Corte na tesoura e máquina, acabamento na navalha.', duration: '45 min', price: 50, category: 'Cabelo' },
  { id: 's2', name: 'Barba Terapia', description: 'Toalha quente, massagem facial e hidratação.', duration: '30 min', price: 35, category: 'Barba' },
  { id: 's3', name: 'Combo Elite', description: 'Cabelo, barba e sobrancelha com desconto.', duration: '90 min', price: 95, category: 'Combos' },
];

// Added missing properties: commission_service, commission_product, and status to satisfy Professional interface
export const MOCK_PROFESSIONALS: Professional[] = [
  { id: 'p1', name: 'João', role: 'Barbeiro Master', image: 'https://picsum.photos/seed/p1/200', performance: 85, revenue: '1.8k', commission_service: 40, commission_product: 10, status: 'active' },
  { id: 'p2', name: 'Marcos', role: 'Especialista em Fade', image: 'https://picsum.photos/seed/p2/200', performance: 65, revenue: '1.2k', commission_service: 35, commission_product: 10, status: 'active' },
  { id: 'p3', name: 'Ana', role: 'Visagista', image: 'https://picsum.photos/seed/p3/200', performance: 50, revenue: '950', commission_service: 45, commission_product: 15, status: 'active' },
];

// Added missing properties: cost, stock, category, and status to satisfy Product interface
export const MOCK_PRODUCTS: Product[] = [
  { id: 'pr1', name: 'Pomada Matte', brand: 'Alta Fixação', price: 45, cost: 22, image: 'https://picsum.photos/seed/pr1/200', stock: 15, category: 'Finalizadores', status: 'normal' },
  { id: 'pr2', name: 'Óleo de Barba', brand: 'Essência Wood', price: 30, cost: 14, image: 'https://picsum.photos/seed/pr2/200', stock: 8, category: 'Barba', status: 'normal' },
  { id: 'pr3', name: 'Shampoo Fresh', brand: 'Vintage Club', price: 28, cost: 12, image: 'https://picsum.photos/seed/pr3/200', stock: 3, category: 'Higiene', status: 'low' },
];

export const DAYS_OF_WEEK = [
  { short: 'SEG', day: 23 },
  { short: 'TER', day: 24, active: true },
  { short: 'QUA', day: 25 },
  { short: 'QUI', day: 26 },
  { short: 'SEX', day: 27 },
  { short: 'SAB', day: 28 },
];

export const TIME_SLOTS = ['09:00', '10:30', '11:00', '14:00', '15:30', '16:00', '17:00', '18:00'];

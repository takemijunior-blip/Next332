export type ServiceCategory =
  | 'cabelo'
  | 'coloracao'
  | 'trancas'
  | 'penteados'
  | 'maquiagem'
  | 'manicure'
  | 'pedicure'
  | 'alongamento_unhas'
  | 'sobrancelhas'
  | 'cilios'
  | 'limpeza_facial'
  | 'massagem'
  | 'spa'
  | 'estetica_corporal';

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  duration: number; // in minutes
  description: string;
  rating: number;
  image: string;
}

export interface Specialist {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  specialties: ServiceCategory[];
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  specialistId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CONCLUÍDO' | 'CANCELADO';
  createdAt: string;
  pointsGranted: number;
  aiStyleImage?: string;
  aiStyleCategory?: string;
  aiStyleName?: string;
  aiStyleDesc?: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Cosméticos' | 'Capilar' | 'Maquiagem' | 'Perfumes' | 'Acessórios';
  price: number;
  rating: number;
  description: string;
  image: string;
  stock: number;
  pointsGranted: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  instructor: string;
  date: string; // YYYY-MM-DD
  time: string;
  category: 'Workshop' | 'Curso de Automaquiagem' | 'Palestra Motivacional' | 'Congresso de Empreendedoras' | 'Encontro Comunitário';
  pointsGranted: number;
  attendeesCount: number;
  image: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  title: string;
  category: 'Beleza' | 'Moda' | 'Autoestima' | 'Empreendedorismo' | 'Saúde' | 'Motivação';
  content: string;
  likes: number;
  hasLiked?: boolean;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  image?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  age: string;
  avatar: string;
  points: number;
  role: 'admin' | 'client' | 'salon';
  favoriteProducts: string[]; // Product IDs
  rsvpEvents: string[]; // Event IDs
  redeemedRewards: string[]; // Reward IDs
  isDarkTheme?: boolean;
  whatsapp?: string;
  location?: string;
  email?: string;
  isBanned?: boolean;
  businessHours?: string;
  language?: 'pt' | 'en' | 'fr' | 'ar' | 'zu';
  theme?: 'rose' | 'purple' | 'blue' | 'dark';
}

export interface LoyaltyReward {
  id: string;
  title: string;
  cost: number;
  description: string;
  type: 'desconto' | 'servico' | 'produto' | 'vip';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'agendamento' | 'promocao' | 'loja' | 'comunidade' | 'sistema';
  createdAt: string;
  read: boolean;
}

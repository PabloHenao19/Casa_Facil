// Tipos de usuario
export type UserRole = 'arrendador' | 'arrendatario' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: Date;
}

// Tipos de propiedad
export interface Property {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  title: string;
  description: string;
  price: number;
  location: {
    city: string;
    neighborhood: string;
    address: string;
  };
  propertyType: 'apartamento' | 'casa' | 'habitacion' | 'local';
  bedrooms: number;
  bathrooms: number;
  area: number; // en m²
  features: string[]; // ej: ["WiFi", "Parqueadero", "Piscina"]
  images: string[];
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de búsqueda
export interface SearchFilters {
  city?: string;
  priceMin?: number;
  priceMax?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
}

// Tipos de chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Tipos de estadísticas (para admin)
export interface Stats {
  totalUsers: number;
  totalProperties: number;
  totalSearches: number;
  activeProperties: number;
}

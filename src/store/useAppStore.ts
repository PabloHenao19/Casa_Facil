import { create } from 'zustand';
import { User, Property, ChatMessage } from '@/types';

interface AppState {
  // Estado de usuario
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Estado de propiedades
  properties: Property[];
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  
  // Estado de chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  
  // Estado de UI
  isChatOpen: boolean;
  toggleChat: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Usuario
  user: null,
  setUser: (user) => set({ user }),
  
  // Propiedades
  properties: [],
  setProperties: (properties) => set({ properties }),
  addProperty: (property) => set((state) => ({ 
    properties: [...state.properties, property] 
  })),
  updateProperty: (id, updatedProperty) => set((state) => ({
    properties: state.properties.map((p) => 
      p.id === id ? { ...p, ...updatedProperty } : p
    )
  })),
  deleteProperty: (id) => set((state) => ({
    properties: state.properties.filter((p) => p.id !== id)
  })),
  
  // Chat
  chatMessages: [],
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message]
  })),
  clearChat: () => set({ chatMessages: [] }),
  
  // UI
  isChatOpen: false,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));

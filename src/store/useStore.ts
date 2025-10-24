// src/store/useStore.ts
import { create } from 'zustand';
import { User, Property, ChatMessage } from '@/types';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Properties state
  properties: Property[];
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  
  // Chat state
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  
  // UI state
  isChatOpen: boolean;
  toggleChat: () => void;
}

export const useStore = create<AppState>((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),
  
  // Properties
  properties: [],
  setProperties: (properties) => set({ properties }),
  addProperty: (property) => set((state) => ({ 
    properties: [...state.properties, property] 
  })),
  updateProperty: (id, updatedProperty) => set((state) => ({
    properties: state.properties.map((p) => 
      p.id === id ? { ...p, ...updatedProperty } : p
    ),
  })),
  deleteProperty: (id) => set((state) => ({
    properties: state.properties.filter((p) => p.id !== id),
  })),
  
  // Chat
  chatMessages: [],
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message],
  })),
  clearChat: () => set({ chatMessages: [] }),
  
  // UI
  isChatOpen: false,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
}));

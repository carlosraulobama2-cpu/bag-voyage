import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  isVerified: boolean;
  avatarUrl?: string;
}

interface AppState {
  isOfflineMode: boolean;
  user: UserProfile | null;
  setOfflineMode: (offline: boolean) => void;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isOfflineMode: false,
      user: null,
      setOfflineMode: (offline) => set({ isOfflineMode: offline }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'bag-voyage-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

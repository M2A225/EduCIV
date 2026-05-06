import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

interface SyncStore {
  queue: any[];
  addToQueue: (operation: any) => void;
  sync: () => Promise<void>;
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      queue: [],
      addToQueue: (operation) => set((state) => ({ queue: [...state.queue, operation] })),
      sync: async () => {
        const { queue } = get();
        if (queue.length === 0) return;

        try {
          await api.post('/sync', { operations: queue });
          set({ queue: [] }); // Clear queue on success
        } catch (error) {
          console.error('Sync failed', error);
        }
      },
    }),
    { name: 'sync-storage' }
  )
);

// Auto-sync on online
window.addEventListener('online', () => {
  useSyncStore.getState().sync();
});

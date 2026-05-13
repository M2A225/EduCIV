import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

interface SyncStore {
  queue: any[];
  isSyncing: boolean;
  addToQueue: (operation: any) => void;
  sync: () => Promise<void>;
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,
      addToQueue: (operation) => set((state) => ({ queue: [...state.queue, { ...operation, timestamp: Date.now() }] })),
      sync: async () => {
        const { queue, isSyncing } = get();
        if (queue.length === 0 || isSyncing) return;

        set({ isSyncing: true });
        try {
          await api.post('/sync/push', { operations: queue });
          set({ queue: [], isSyncing: false });
        } catch (error) {
          console.error('Sync failed', error);
          set({ isSyncing: false });
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

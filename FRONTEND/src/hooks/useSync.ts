import { useMutation, useQuery } from '@tanstack/react-query';
import { syncService } from '../services/sync';
import { create } from 'zustand';

interface SyncState {
  isSyncing: boolean;
  lastSync: string | null;
  queue: number;
  setSyncing: (syncing: boolean) => void;
  setLastSync: (date: string) => void;
  setQueue: (count: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  lastSync: null,
  queue: 0,
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSync: (lastSync) => set({ lastSync }),
  setQueue: (queue) => set({ queue }),
}));

export const useSyncPush = () => {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => syncService.pushData(data)
  });
};

export const useSyncPull = () => {
  return useQuery({
    queryKey: ['latest-sync'],
    queryFn: () => syncService.pullData().then(res => {
      const body = res.data as Record<string, unknown>;
      return (body?.data ?? body) as Record<string, unknown>;
    })
  });
};

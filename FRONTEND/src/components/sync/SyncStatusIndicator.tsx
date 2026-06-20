import { useSyncStore } from '../../hooks/useSync';
import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const SyncStatusIndicator = () => {
  const { queue, isSyncing } = useSyncStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-error text-white px-4 py-2.5 rounded-xl shadow-3 text-sm font-medium animate-slide-up">
        <WifiOff className="w-4 h-4" />
        Hors-ligne
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-info text-white px-4 py-2.5 rounded-xl shadow-3 text-sm font-medium animate-slide-up">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Synchronisation...
      </div>
    );
  }

  if (queue > 0) {
    return (
      <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-warning text-white px-4 py-2.5 rounded-xl shadow-3 text-sm font-medium animate-slide-up">
        <Wifi className="w-4 h-4" />
        {queue} opération{queue > 1 ? 's' : ''} en attente
      </div>
    );
  }

  return null;
};

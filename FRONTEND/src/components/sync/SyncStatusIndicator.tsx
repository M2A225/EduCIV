import { useSyncStore } from '../../hooks/useSync';
import { useEffect, useState } from 'react';

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

  if (isSyncing) return <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded shadow">Synchronisation en cours...</div>;
  if (!isOnline) return <div className="fixed bottom-4 right-4 bg-yellow-500 text-white p-2 rounded shadow">Mode Hors-ligne ({queue.length} ops en attente)</div>;
  if (queue.length > 0) return <div className="fixed bottom-4 right-4 bg-green-500 text-white p-2 rounded shadow">Prêt à synchroniser ({queue.length} ops)</div>;
  
  return null;
};

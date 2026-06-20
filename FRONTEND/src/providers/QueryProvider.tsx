import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast } from 'sonner';
import { indexedDBStorage } from '@/lib/indexeddb-storage';

const FIVE_MINUTES = 1000 * 60 * 5;
const ONE_MINUTE = 1000 * 60;
const THIRTY_SECONDS = 1000 * 30;
const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: FIVE_MINUTES,
      gcTime: TWENTY_FOUR_HOURS,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: Error) => {
        const msg = error?.response?.data?.error?.message || error?.message || 'Une erreur est survenue';
        toast.error(msg);
      },
    },
  },
});

queryClient.setQueryDefaults(['users'], { staleTime: FIVE_MINUTES });
queryClient.setQueryDefaults(['students'], { staleTime: FIVE_MINUTES });
queryClient.setQueryDefaults(['teachers'], { staleTime: FIVE_MINUTES });
queryClient.setQueryDefaults(['classes'], { staleTime: FIVE_MINUTES });
queryClient.setQueryDefaults(['subjects'], { staleTime: FIVE_MINUTES });
queryClient.setQueryDefaults(['schools'], { staleTime: FIVE_MINUTES });
queryClient.setQueryDefaults(['school-years'], { staleTime: TWENTY_FOUR_HOURS });
queryClient.setQueryDefaults(['periods'], { staleTime: TWENTY_FOUR_HOURS });
queryClient.setQueryDefaults(['timetables'], { staleTime: FIVE_MINUTES });
queryClient.setQueryDefaults(['attendance-sessions'], { staleTime: ONE_MINUTE });
queryClient.setQueryDefaults(['payments'], { staleTime: ONE_MINUTE });
queryClient.setQueryDefaults(['payment-plans'], { staleTime: FIVE_MINUTES });
queryClient.setQueryDefaults(['audit-logs'], { staleTime: THIRTY_SECONDS });
queryClient.setQueryDefaults(['notes-pending'], { staleTime: THIRTY_SECONDS });
queryClient.setQueryDefaults(['teacher-subjects'], { staleTime: FIVE_MINUTES });
queryClient.setQueryDefaults(['my-assignments'], { staleTime: FIVE_MINUTES });
queryClient.setQueryDefaults(['incidents'], { staleTime: ONE_MINUTE });
queryClient.setQueryDefaults(['latest-sync'], { staleTime: THIRTY_SECONDS });

const persister = createAsyncStoragePersister({
  storage: indexedDBStorage,
});

export const QueryProvider = ({ children }: { children: React.ReactNode }) => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{ persister }}
  >
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </PersistQueryClientProvider>
);

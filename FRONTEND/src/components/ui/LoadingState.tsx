// no React import needed
import { Skeleton } from './Feedback';

interface LoadingStateProps {
  type?: 'card' | 'list' | 'text';
  count?: number;
}

export function LoadingState({ type = 'text', count = 3 }: LoadingStateProps) {
  if (type === 'card') {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-2">
        {[...Array(count)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return <Skeleton className="h-4 w-full" />;
}

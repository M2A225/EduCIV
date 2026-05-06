export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export const LoadingSpinner = () => (
  <div className="flex justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
  </div>
);

export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-50 text-red-800 p-4 rounded border border-red-200">
    {message}
  </div>
);

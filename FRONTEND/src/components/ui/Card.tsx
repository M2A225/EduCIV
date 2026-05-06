export const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white p-4 rounded shadow-sm border border-gray-100 ${className}`}>
    {children}
  </div>
);

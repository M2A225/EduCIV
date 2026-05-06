import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 font-bold text-xl text-indigo-700">EduCIV</div>
        <nav className="flex-1 px-4 space-y-2">
          {/* Navigation links will go here */}
          <div className="text-sm font-medium text-gray-500">Menu</div>
          <a href="/dashboard" className="block p-2 rounded hover:bg-indigo-50">Dashboard</a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="font-semibold text-lg text-gray-800">EduCIV Panel</h2>
          <div className="text-sm text-gray-600">Profil</div>
        </header>
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

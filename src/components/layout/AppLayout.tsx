import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, AlertTriangle, Lightbulb, Plus } from 'lucide-react';
import { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Ana Sayfa' },
    { path: '/observations', icon: ClipboardList, label: 'Gözlemler' },
    { path: '/new', icon: Plus, label: 'Yeni', special: true },
    { path: '/problems', icon: AlertTriangle, label: 'Problemler' },
    { path: '/opportunities', icon: Lightbulb, label: 'Fırsatlar' },
    { path: '/end-of-day', icon: Home, label: 'Gün Sonu', isDesktopOnly: true },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 overflow-hidden">
      {/* Header for Mobile / Desktop */}
      <header className="bg-blue-900 text-white shadow-md z-10 hidden md:flex items-center px-6 py-4">
        <h1 className="text-xl font-bold">Zabıta Saha Gözlem</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Desktop */}
        <aside className="w-64 bg-white shadow-md hidden md:flex flex-col z-10">
          <div className="p-4 border-b border-gray-100">
            <Link to="/new" className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors">
              <Plus size={20} />
              Yeni Denetim
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.filter(i => !i.special).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative scroll-smooth">
          {children}
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-end justify-between px-2 pb-safe pt-1 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.special) {
            return (
              <div key="new-btn" className="flex-1 flex justify-center pb-2">
                <Link
                  to={item.path}
                  className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg -mt-6 ring-4 ring-gray-100 active:scale-95 transition-transform"
                >
                  <item.icon size={28} />
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center justify-center py-2 text-xs h-16 active:bg-gray-50"
            >
              <item.icon
                size={24}
                className={`mb-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
              />
              <span className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

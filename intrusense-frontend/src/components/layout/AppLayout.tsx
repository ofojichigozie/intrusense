import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Settings, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/readings', label: 'Readings', icon: <ClipboardList size={18} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-6 py-5">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="text-white">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
        </svg>
      </div>
      <span className="font-semibold text-slate-100 tracking-wide">IntruSense</span>
    </div>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-2 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { admin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-60 bg-slate-900 border-r border-slate-800 z-20">
        <Brand />
        <NavItems />
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
              {admin?.username?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <span className="text-sm text-slate-300 truncate">{admin?.username ?? 'Admin'}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 bg-slate-900 border-b border-slate-800">
        <Brand />
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800 z-50 flex flex-col md:hidden">
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800">
              <Brand />
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <NavItems onNavigate={() => setDrawerOpen(false)} />
            <div className="px-4 py-4 border-t border-slate-800">
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                  {admin?.username?.[0]?.toUpperCase() ?? 'A'}
                </div>
                <span className="text-sm text-slate-300 truncate">
                  {admin?.username ?? 'Admin'}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setDrawerOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 min-h-screen">
        <div className="p-4 md:p-8 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

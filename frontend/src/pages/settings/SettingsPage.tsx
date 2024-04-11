import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

const tabs = [
  { name: 'Domains', href: '/settings' },
  { name: 'Notifications', href: '/settings/notifications' },
];

export default function SettingsPage() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <div className="border-b border-white/[0.06]">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.href}
              className={cn(
                'py-3 px-1 border-b-2 text-sm font-medium transition-colors',
                location.pathname === tab.href
                  ? 'border-indigo-400 text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300',
              )}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}

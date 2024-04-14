import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06] px-6 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-4">
          <a
            href="/user-guide.html"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-500 hover:text-gray-300 hover:bg-white/[0.08] rounded-lg transition-all duration-200"
            title="User Guide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </a>
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-gray-500 hover:text-gray-300 hover:bg-white/[0.08] rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-surface-800" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-300">{user?.full_name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-300 hover:bg-white/[0.08] px-2 py-1 rounded-md transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

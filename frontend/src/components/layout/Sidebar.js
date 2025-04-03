import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuth();

    const menuItems = [
        { path: '/dashboard', icon: '🏠', label: 'Home' },
        { path: '/listings', icon: '📋', label: 'Listings' },
        { path: '/saved', icon: '⭐', label: 'Saved' },
        { path: '/recommended', icon: '📊', label: 'Recommended' },
        { path: '/search', icon: '🔍', label: 'Search' },
        { path: '/notifications', icon: '🔔', label: 'Notifications' },
        { path: '/settings', icon: '⚙️', label: 'Settings' }
    ];

    return (
        <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0">
            <div className="p-6">
                <h1 className="text-xl font-semibold text-gray-800">Real Estate</h1>
            </div>

            <nav className="mt-6">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-6 py-3 text-sm ${location.pathname === item.path
                                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            {user?.role === 'seller' && (
                <div className="absolute bottom-8 left-0 right-0 px-6">
                    <Link
                        to="/listings/new"
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        List a Property
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Sidebar; 
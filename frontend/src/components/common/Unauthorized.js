import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Unauthorized = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleRedirect = () => {
        if (!user) {
            navigate('/login');
        } else {
            switch (user.role) {
                case 'admin':
                    navigate('/admin');
                    break;
                case 'agent':
                    navigate('/agent');
                    break;
                case 'seller':
                    navigate('/seller');
                    break;
                case 'buyer':
                    navigate('/buyer');
                    break;
                default:
                    navigate('/');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Access Denied
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        You don't have permission to access this page.
                    </p>
                </div>
                <div>
                    <button
                        onClick={handleRedirect}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized; 
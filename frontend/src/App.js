import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EmailVerification from './components/auth/EmailVerification';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminDashboard from './components/admin/AdminDashboard';
import AgentDashboard from './components/agent/AgentDashboard';
import SellerDashboard from './components/seller/SellerDashboard';
import BuyerDashboard from './components/buyer/BuyerDashboard';
import Unauthorized from './components/common/Unauthorized';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email/:token" element={<EmailVerification />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Protected Routes */}
                    <Route
                        path="/admin/*"
                        element={
                            <PrivateRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/agent/*"
                        element={
                            <PrivateRoute allowedRoles={['agent']}>
                                <AgentDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/seller/*"
                        element={
                            <PrivateRoute allowedRoles={['seller']}>
                                <SellerDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/buyer/*"
                        element={
                            <PrivateRoute allowedRoles={['buyer']}>
                                <BuyerDashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* Default Route */}
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <div className="min-h-screen flex items-center justify-center">
                                    <h1 className="text-2xl font-bold">Welcome to Find Homes</h1>
                                </div>
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;

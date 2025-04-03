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
import PropertyForm from './components/property/PropertyForm';
import PropertyList from './components/property/PropertyList';
import LeadDetails from './components/leads/LeadDetails';
import MarketingDashboard from './components/marketing/MarketingDashboard';

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
                            <PrivateRoute role="admin">
                                <AdminDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/agent/*"
                        element={
                            <PrivateRoute role="agent">
                                <AgentDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/seller/*"
                        element={
                            <PrivateRoute role="seller">
                                <SellerDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/buyer/*"
                        element={
                            <PrivateRoute role="buyer">
                                <BuyerDashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* Marketing & Analytics Routes */}
                    <Route
                        path="/marketing"
                        element={
                            <PrivateRoute roles={['agent', 'seller']}>
                                <MarketingDashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* Property Routes */}
                    <Route
                        path="/listings"
                        element={<PropertyList />}
                    />
                    <Route
                        path="/listings/new"
                        element={
                            <PrivateRoute roles={['agent', 'seller']}>
                                <PropertyForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/listings/:id/edit"
                        element={
                            <PrivateRoute roles={['agent', 'seller']}>
                                <PropertyForm />
                            </PrivateRoute>
                        }
                    />

                    {/* Lead Management Routes */}
                    <Route
                        path="/leads/:id"
                        element={
                            <PrivateRoute roles={['agent', 'seller']}>
                                <LeadDetails />
                            </PrivateRoute>
                        }
                    />

                    {/* Redirect to appropriate dashboard based on role */}
                    <Route
                        path="/"
                        element={
                            <PrivateRoute roles={['admin', 'agent', 'seller', 'buyer']}>
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

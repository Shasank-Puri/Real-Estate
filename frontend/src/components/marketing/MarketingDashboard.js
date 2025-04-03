import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const MarketingDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analytics, setAnalytics] = useState({
        propertyAnalytics: [],
        overallStats: {},
        leadStats: {}
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [marketingRes, leadStatsRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/api/marketing/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/marketing/leads/statistics`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setAnalytics({
                propertyAnalytics: marketingRes.data.propertyAnalytics,
                overallStats: marketingRes.data.overallStats,
                leadStats: leadStatsRes.data
            });
            setError('');
        } catch (err) {
            setError('Error fetching dashboard data');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const viewsChartData = {
        labels: analytics.propertyAnalytics.map(p => p.title),
        datasets: [
            {
                label: 'Property Views',
                data: analytics.propertyAnalytics.map(p => p.total_views),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Inquiries',
                data: analytics.propertyAnalytics.map(p => p.total_inquiries),
                borderColor: 'rgb(53, 162, 235)',
                tension: 0.1
            }
        ]
    };

    const leadStatusData = {
        labels: ['New', 'Contacted', 'Interested', 'Closed', 'Lost'],
        datasets: [
            {
                data: [
                    analytics.leadStats.new_leads,
                    analytics.leadStats.contacted_leads,
                    analytics.leadStats.interested_leads,
                    analytics.leadStats.closed_leads,
                    analytics.leadStats.lost_leads
                ],
                backgroundColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(16, 185, 129)',
                    'rgb(239, 68, 68)'
                ]
            }
        ]
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Marketing Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Track your property performance and lead management
                </p>
            </div>

            {error && (
                <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {analytics.overallStats.total_properties}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {analytics.overallStats.total_views}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Total Inquiries</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {analytics.overallStats.total_inquiries}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {analytics.overallStats.avg_conversion_rate.toFixed(1)}%
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Property Performance</h3>
                    <div className="h-80">
                        <Line
                            data={viewsChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top'
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Status Distribution</h3>
                    <div className="h-80">
                        <Doughnut
                            data={leadStatusData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'right'
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Property Analytics Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Property Analytics</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inquiries</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leads</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversion Rate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {analytics.propertyAnalytics.map((property) => (
                                <tr key={property.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{property.title}</div>
                                        <div className="text-sm text-gray-500">{property.property_type}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {property.total_views}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {property.total_inquiries}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {property.total_leads}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {property.conversion_rate.toFixed(1)}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link
                                            to={`/listings/${property.id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MarketingDashboard; 
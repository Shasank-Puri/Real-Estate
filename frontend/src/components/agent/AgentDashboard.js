import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import axios from 'axios';

const AgentDashboard = () => {
    const [metrics, setMetrics] = useState({
        totalListings: 0,
        activeListings: 0,
        inquiriesReceived: 0,
        offersReceived: 0,
        totalLeads: 0,
        activeLeads: 0
    });

    const [listings, setListings] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [leads, setLeads] = useState([]);
    const [analytics, setAnalytics] = useState({
        propertyViews: { count: 0, trend: 0 },
        inquiries: { count: 0, trend: 0 },
        conversions: { count: 0, trend: 0 }
    });

    const propertyTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'residential', label: 'Residential' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'rental', label: 'Rental' }
    ];

    const propertyStatus = [
        { value: 'all', label: 'All Status' },
        { value: 'for_sale', label: 'For Sale' },
        { value: 'for_rent', label: 'For Rent' },
        { value: 'pending', label: 'Pending' },
        { value: 'sold', label: 'Sold' }
    ];

    useEffect(() => {
        fetchDashboardData();
    }, [selectedCategory, selectedStatus]);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [metricsRes, listingsRes, leadsRes, analyticsRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/api/agent/metrics`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/agent/listings`, {
                    params: {
                        category: selectedCategory !== 'all' ? selectedCategory : undefined,
                        status: selectedStatus !== 'all' ? selectedStatus : undefined
                    },
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/agent/leads`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/agent/analytics`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setMetrics(metricsRes.data);
            setListings(listingsRes.data);
            setLeads(leadsRes.data);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleShareOnSocial = async (listingId, platform) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/listings/${listingId}/share`,
                { platform },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Show success message
        } catch (error) {
            console.error('Error sharing listing:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />

            <div className="ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Agent Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage properties, track performance, and handle leads
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Property Analytics</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.totalListings}</p>
                        <div className="mt-2 flex items-center text-sm">
                            <span className={`text-${analytics.propertyViews.trend > 0 ? 'green' : 'red'}-600`}>
                                {analytics.propertyViews.trend > 0 ? '↑' : '↓'} {Math.abs(analytics.propertyViews.trend)}%
                            </span>
                            <span className="ml-2 text-gray-500">vs last month</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Lead Conversion</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{analytics.conversions.count}%</p>
                        <div className="mt-2 flex items-center text-sm">
                            <span className={`text-${analytics.conversions.trend > 0 ? 'green' : 'red'}-600`}>
                                {analytics.conversions.trend > 0 ? '↑' : '↓'} {Math.abs(analytics.conversions.trend)}%
                            </span>
                            <span className="ml-2 text-gray-500">conversion rate</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Active Leads</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.activeLeads}</p>
                        <p className="mt-2 text-sm text-gray-500">
                            {metrics.totalLeads} total leads
                        </p>
                    </div>
                </div>

                {/* Property Management Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Property Listings</h2>
                        <Link
                            to="/listings/new"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            Add New Listing
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 mb-4">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            {propertyTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            {propertyStatus.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Listings Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inquiries</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {listings.map((listing) => (
                                    <tr key={listing.id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img
                                                        className="h-10 w-10 rounded-md object-cover"
                                                        src={listing.thumbnail}
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                                                    <div className="text-sm text-gray-500">{listing.location}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded">
                                                {listing.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${listing.status === 'for_sale' ? 'bg-green-100 text-green-800' :
                                                    listing.status === 'for_rent' ? 'bg-blue-100 text-blue-800' :
                                                        listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {listing.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {listing.views}
                                            {listing.viewsTrend > 0 && (
                                                <span className="ml-1 text-green-600">↑{listing.viewsTrend}%</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {listing.inquiries}
                                            {listing.inquiriesTrend > 0 && (
                                                <span className="ml-1 text-green-600">↑{listing.inquiriesTrend}%</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-3">
                                                <Link
                                                    to={`/listings/${listing.id}/edit`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleShareOnSocial(listing.id, 'facebook')}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Share
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Lead Management */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Lead Management</h2>
                        <Link
                            to="/leads"
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            View All Leads
                        </Link>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leads.map((lead) => (
                                    <tr key={lead.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{lead.email}</div>
                                            <div className="text-sm text-gray-500">{lead.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{lead.propertyInterest}</div>
                                            <div className="text-sm text-gray-500">{lead.budget}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${lead.status === 'hot' ? 'bg-red-100 text-red-800' :
                                                    lead.status === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {lead.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(lead.lastContact).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                to={`/leads/${lead.id}`}
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
        </div>
    );
};

export default AgentDashboard; 
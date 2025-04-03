import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import axios from 'axios';

const SellerDashboard = () => {
    const [metrics, setMetrics] = useState({
        totalListings: 0,
        activeListings: 0,
        inquiriesReceived: 0,
        offersReceived: 0
    });

    const [listings, setListings] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [recentInquiries, setRecentInquiries] = useState([]);
    const [performanceData, setPerformanceData] = useState({
        listingViews: { count: 0, trend: 0 },
        inquiries: { count: 0, trend: 0 }
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
            const [metricsRes, listingsRes, inquiriesRes, performanceRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/api/seller/metrics`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/seller/listings`, {
                    params: {
                        category: selectedCategory !== 'all' ? selectedCategory : undefined,
                        status: selectedStatus !== 'all' ? selectedStatus : undefined
                    },
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/seller/inquiries/recent`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/seller/performance`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setMetrics(metricsRes.data);
            setListings(listingsRes.data);
            setRecentInquiries(inquiriesRes.data);
            setPerformanceData(performanceRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />

            <div className="ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Seller Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your property listings, view inquiries, and track performance
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Total Listings</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.totalListings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Active Listings</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.activeListings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Inquiries Received</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.inquiriesReceived}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Offers Received</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.offersReceived}</p>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${listing.price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {listing.views}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                to={`/listings/${listing.id}/edit`}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => {/* Handle delete */ }}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Inquiries */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Recent Inquiries</h2>
                        <Link
                            to="/inquiries"
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            View All
                        </Link>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inquirer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentInquiries.map((inquiry) => (
                                    <tr key={inquiry.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(inquiry.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{inquiry.property}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{inquiry.inquirer}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{inquiry.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Performance Summary */}
                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-medium text-gray-500">Listing Views</h3>
                                <span className={`text-sm font-medium ${performanceData.listingViews.trend > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {performanceData.listingViews.trend > 0 ? '+' : ''}
                                    {performanceData.listingViews.trend}%
                                </span>
                            </div>
                            <p className="text-3xl font-semibold text-gray-900">
                                {performanceData.listingViews.count}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">Last 30 Days</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-medium text-gray-500">Inquiries</h3>
                                <span className={`text-sm font-medium ${performanceData.inquiries.trend > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {performanceData.inquiries.trend > 0 ? '+' : ''}
                                    {performanceData.inquiries.trend}%
                                </span>
                            </div>
                            <p className="text-3xl font-semibold text-gray-900">
                                {performanceData.inquiries.count}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">Last 30 Days</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard; 
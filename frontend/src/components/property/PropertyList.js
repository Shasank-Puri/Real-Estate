import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        sortBy: 'newest'
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

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'price_low', label: 'Price: Low to High' }
    ];

    useEffect(() => {
        fetchProperties();
    }, [filters]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/properties`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: filters
                }
            );
            setProperties(response.data);
            setError('');
        } catch (err) {
            setError('Error fetching properties');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
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
            {/* Filters */}
            <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        {propertyTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        {propertyStatus.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <div key={property.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {property.images && property.images[0] && (
                            <img
                                src={property.images[0]}
                                alt={property.title}
                                className="w-full h-48 object-cover"
                            />
                        )}
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                    {property.title}
                                </h3>
                                <span className="px-2 py-1 text-xs font-medium rounded-full"
                                    style={{
                                        backgroundColor:
                                            property.status === 'for_sale' ? '#EFF6FF' :
                                                property.status === 'for_rent' ? '#F0FDF4' :
                                                    property.status === 'pending' ? '#FEF3C7' :
                                                        property.status === 'sold' ? '#FEE2E2' : '#F3F4F6',
                                        color:
                                            property.status === 'for_sale' ? '#1D4ED8' :
                                                property.status === 'for_rent' ? '#15803D' :
                                                    property.status === 'pending' ? '#B45309' :
                                                        property.status === 'sold' ? '#B91C1C' : '#374151'
                                    }}
                                >
                                    {propertyStatus.find(s => s.value === property.status)?.label}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{property.location}</p>
                            <p className="text-lg font-semibold text-gray-900 mb-4">
                                ${property.price.toLocaleString()}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <span className="mr-4">{property.bedrooms} beds</span>
                                <span className="mr-4">{property.bathrooms} baths</span>
                                <span>{property.area_sqft.toLocaleString()} sq ft</span>
                            </div>
                            <Link
                                to={`/listings/${property.id}`}
                                className="block w-full text-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {properties.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No properties found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default PropertyList; 
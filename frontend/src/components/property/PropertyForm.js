import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const PropertyForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [property, setProperty] = useState({
        title: '',
        description: '',
        price: '',
        type: 'residential',
        status: 'for_sale',
        location: '',
        address: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        yearBuilt: '',
        amenities: [],
        features: []
    });

    const [media, setMedia] = useState({
        images: [],
        videos: []
    });

    const [socialShare, setSocialShare] = useState({
        facebook: false,
        twitter: false,
        instagram: false
    });

    const propertyTypes = [
        { value: 'residential', label: 'Residential' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'rental', label: 'Rental' }
    ];

    const propertyStatus = [
        { value: 'for_sale', label: 'For Sale' },
        { value: 'for_rent', label: 'For Rent' },
        { value: 'pending', label: 'Pending' },
        { value: 'sold', label: 'Sold' }
    ];

    const amenitiesList = [
        'Swimming Pool',
        'Garden',
        'Garage',
        'Security System',
        'Central AC',
        'Heating',
        'Laundry',
        'Parking',
        'Gym',
        'Storage'
    ];

    const featuresList = [
        'Ocean View',
        'Mountain View',
        'City View',
        'Waterfront',
        'Pet Friendly',
        'Furnished',
        'New Construction',
        'Recently Renovated'
    ];

    useEffect(() => {
        if (isEditing) {
            fetchPropertyDetails();
        }
    }, [id]);

    const fetchPropertyDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/properties/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProperty(response.data);
            setMedia({
                images: response.data.images || [],
                videos: response.data.videos || []
            });
        } catch (error) {
            setError('Error fetching property details');
            console.error('Error:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProperty(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAmenityToggle = (amenity) => {
        setProperty(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleFeatureToggle = (feature) => {
        setProperty(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }));
    };

    const handleMediaUpload = async (e) => {
        const files = Array.from(e.target.files);
        const formData = new FormData();
        files.forEach(file => {
            formData.append('media', file);
        });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/properties/upload-media`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            const mediaType = e.target.name;
            setMedia(prev => ({
                ...prev,
                [mediaType]: [...prev[mediaType], ...response.data.urls]
            }));
        } catch (error) {
            setError('Error uploading media');
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const propertyData = {
                ...property,
                media: {
                    images: media.images,
                    videos: media.videos
                },
                socialShare
            };

            const response = await axios({
                method: isEditing ? 'put' : 'post',
                url: `${process.env.REACT_APP_API_URL}/api/properties${isEditing ? `/${id}` : ''}`,
                data: propertyData,
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/dashboard');
        } catch (error) {
            setError('Error saving property');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-semibold text-gray-900 mb-8">
                {isEditing ? 'Edit Property' : 'Add New Property'}
            </h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={property.title}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price</label>
                            <input
                                type="number"
                                name="price"
                                value={property.price}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={property.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                name="type"
                                value={property.type}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                {propertyTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="status"
                                value={property.status}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                {propertyStatus.map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">Location</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={property.address}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                </div>

                {/* Details */}
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">Property Details</h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                            <input
                                type="number"
                                name="bedrooms"
                                value={property.bedrooms}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                            <input
                                type="number"
                                name="bathrooms"
                                value={property.bathrooms}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Area (sq ft)</label>
                            <input
                                type="number"
                                name="area"
                                value={property.area}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Year Built</label>
                            <input
                                type="number"
                                name="yearBuilt"
                                value={property.yearBuilt}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Amenities & Features */}
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">Amenities & Features</h2>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Amenities</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {amenitiesList.map(amenity => (
                                <label key={amenity} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={property.amenities.includes(amenity)}
                                        onChange={() => handleAmenityToggle(amenity)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Features</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {featuresList.map(feature => (
                                <label key={feature} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={property.features.includes(feature)}
                                        onChange={() => handleFeatureToggle(feature)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{feature}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Media Upload */}
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">Media</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Images</label>
                        <input
                            type="file"
                            name="images"
                            accept="image/*"
                            multiple
                            onChange={handleMediaUpload}
                            className="mt-1 block w-full"
                        />
                        {media.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-4 gap-4">
                                {media.images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={image}
                                            alt={`Property ${index + 1}`}
                                            className="h-24 w-24 object-cover rounded"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Videos</label>
                        <input
                            type="file"
                            name="videos"
                            accept="video/*"
                            multiple
                            onChange={handleMediaUpload}
                            className="mt-1 block w-full"
                        />
                        {media.videos.length > 0 && (
                            <div className="mt-4">
                                {media.videos.map((video, index) => (
                                    <video
                                        key={index}
                                        src={video}
                                        className="h-48 w-full object-cover rounded mb-4"
                                        controls
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Social Media Sharing */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Social Media Sharing</h2>

                    <div className="space-y-4">
                        {Object.entries(socialShare).map(([platform, enabled]) => (
                            <label key={platform} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={() => setSocialShare(prev => ({
                                        ...prev,
                                        [platform]: !prev[platform]
                                    }))}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    Share on {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'Saving...' : isEditing ? 'Update Property' : 'Create Property'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PropertyForm; 
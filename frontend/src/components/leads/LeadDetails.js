import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LeadDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lead, setLead] = useState(null);
    const [interactions, setInteractions] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [updatedLead, setUpdatedLead] = useState({
        name: '',
        email: '',
        phone: '',
        status: '',
        propertyInterest: '',
        budget: '',
        preferredLocation: '',
        requirements: '',
        source: ''
    });

    const statusOptions = [
        { value: 'new', label: 'New' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'proposal', label: 'Proposal Sent' },
        { value: 'negotiation', label: 'In Negotiation' },
        { value: 'closed', label: 'Closed' },
        { value: 'lost', label: 'Lost' }
    ];

    useEffect(() => {
        fetchLeadDetails();
    }, [id]);

    const fetchLeadDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const [leadRes, interactionsRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL}/api/leads/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${process.env.REACT_APP_API_URL}/api/leads/${id}/interactions`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setLead(leadRes.data);
            setUpdatedLead(leadRes.data);
            setInteractions(interactionsRes.data);
            setError('');
        } catch (err) {
            setError('Error fetching lead details');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLead = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${process.env.REACT_APP_API_URL}/api/leads/${id}`,
                updatedLead,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLead(updatedLead);
            setEditMode(false);
            setError('');
        } catch (err) {
            setError('Error updating lead');
            console.error('Error:', err);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/leads/${id}/interactions`,
                { note: newNote },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setInteractions([...interactions, response.data]);
            setNewNote('');
            setError('');
        } catch (err) {
            setError('Error adding note');
            console.error('Error:', err);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${process.env.REACT_APP_API_URL}/api/leads/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLead({ ...lead, status: newStatus });
            setUpdatedLead({ ...updatedLead, status: newStatus });
            setError('');
        } catch (err) {
            setError('Error updating status');
            console.error('Error:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Lead Details</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage and track lead information
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setEditMode(!editMode)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            {editMode ? 'Cancel Edit' : 'Edit Lead'}
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Back
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Lead Information */}
                    <div className="col-span-2 space-y-6">
                        {editMode ? (
                            <form onSubmit={handleUpdateLead} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
                                <h2 className="text-lg font-medium text-gray-900">Lead Information</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            value={updatedLead.name}
                                            onChange={(e) => setUpdatedLead({ ...updatedLead, name: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            value={updatedLead.email}
                                            onChange={(e) => setUpdatedLead({ ...updatedLead, email: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            type="tel"
                                            value={updatedLead.phone}
                                            onChange={(e) => setUpdatedLead({ ...updatedLead, phone: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Budget</label>
                                        <input
                                            type="text"
                                            value={updatedLead.budget}
                                            onChange={(e) => setUpdatedLead({ ...updatedLead, budget: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Property Interest</label>
                                        <input
                                            type="text"
                                            value={updatedLead.propertyInterest}
                                            onChange={(e) => setUpdatedLead({ ...updatedLead, propertyInterest: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Preferred Location</label>
                                        <input
                                            type="text"
                                            value={updatedLead.preferredLocation}
                                            onChange={(e) => setUpdatedLead({ ...updatedLead, preferredLocation: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Requirements</label>
                                    <textarea
                                        value={updatedLead.requirements}
                                        onChange={(e) => setUpdatedLead({ ...updatedLead, requirements: e.target.value })}
                                        rows={4}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-6">Lead Information</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Name</p>
                                        <p className="mt-1 text-sm text-gray-900">{lead.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p className="mt-1 text-sm text-gray-900">{lead.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Phone</p>
                                        <p className="mt-1 text-sm text-gray-900">{lead.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Budget</p>
                                        <p className="mt-1 text-sm text-gray-900">{lead.budget}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Property Interest</p>
                                        <p className="mt-1 text-sm text-gray-900">{lead.propertyInterest}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Preferred Location</p>
                                        <p className="mt-1 text-sm text-gray-900">{lead.preferredLocation}</p>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <p className="text-sm font-medium text-gray-500">Requirements</p>
                                    <p className="mt-1 text-sm text-gray-900">{lead.requirements}</p>
                                </div>
                            </div>
                        )}

                        {/* Interaction History */}
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-6">Interaction History</h2>
                            <div className="space-y-4">
                                {interactions.map((interaction) => (
                                    <div key={interaction.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                        <p className="text-sm text-gray-900">{interaction.note}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(interaction.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleAddNote} className="mt-6">
                                <label className="block text-sm font-medium text-gray-700">Add Note</label>
                                <div className="mt-1 flex space-x-3">
                                    <input
                                        type="text"
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your note..."
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        Add
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Lead Status and Actions */}
                    <div className="space-y-6">
                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-6">Lead Status</h2>
                            <div className="space-y-4">
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleStatusChange(option.value)}
                                        className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${lead.status === option.value
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-6">Quick Actions</h2>
                            <div className="space-y-4">
                                <button
                                    onClick={() => window.location.href = `mailto:${lead.email}`}
                                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Send Email
                                </button>
                                <button
                                    onClick={() => window.location.href = `tel:${lead.phone}`}
                                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Call Lead
                                </button>
                                <button
                                    onClick={() => {/* Handle schedule meeting */ }}
                                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Schedule Meeting
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadDetails; 
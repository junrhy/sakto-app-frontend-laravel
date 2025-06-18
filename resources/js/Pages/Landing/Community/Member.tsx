import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useState } from 'react';

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
    member: {
        id: number;
        name: string;
        email: string;
        contact_number: string | null;
        created_at: string;
    };
    challenges: any[];
    events: {
        id: number;
        title: string;
        description: string;
        start_date: string;
        end_date: string;
        location: string;
        max_participants: number;
        registration_deadline: string;
        is_public: boolean;
        category: string;
        image: string | null;
        status: 'draft' | 'published' | 'cancelled';
        client_identifier: string;
        created_at: string;
        updated_at: string;
        participants: any[];
    }[];
    pages: {
        id: number;
        title: string;
        slug: string;
        content: string;
        meta_description: string | null;
        meta_keywords: string | null;
        is_published: boolean;
        template: string | null;
        featured_image: string | null;
        client_identifier: string;
        created_at: string;
        updated_at: string;
    }[];
    contacts: {
        id: number;
        first_name: string;
        middle_name: string | null;
        last_name: string;
        email: string;
        call_number: string | null;
        sms_number: string | null;
        whatsapp: string | null;
        address: string | null;
        id_picture: string | null;
        client_identifier: string;
        created_at: string;
        updated_at: string;
    }[];
}

export default function Member({ auth, member, challenges, events, pages, contacts }: PageProps) {
    const [activeSection, setActiveSection] = useState('profile');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [searchResults, setSearchResults] = useState<typeof contacts>([]);
    const [isSearching, setIsSearching] = useState(false);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(sectionId);
        }
    };

    const searchContacts = () => {
        setIsSearching(true);
        const searchResults = contacts.filter(contact => {
            const matchFirstName = firstName.trim() === '' || 
                contact.first_name.toLowerCase().includes(firstName.toLowerCase().trim());
            const matchLastName = lastName.trim() === '' || 
                contact.last_name.toLowerCase().includes(lastName.toLowerCase().trim());
            return matchFirstName && matchLastName;
        });
        setSearchResults(searchResults);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`${member.name} - Sakto Community`} />

            {/* Profile Header */}
            <div id="profile" className="bg-gradient-to-r from-blue-600 to-blue-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-4xl font-bold text-white">{member.name}</h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Contact Information Sidebar */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Email</p>
                                    <p className="text-gray-900 font-medium">{member.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Contact Number</p>
                                    <p className="text-gray-900 font-medium">{member.contact_number || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-3">
                        {/* About Section */}
                        <div className="bg-white rounded-xl shadow-sm p-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                            <p className="text-gray-600">
                                Welcome to {member.name}'s page.
                            </p>
                        </div>

                        {/* Member Search Section */}
                        <div className="bg-white rounded-xl shadow-sm p-8 mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Search Member by Name</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Enter first name..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Enter last name..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <button 
                                    onClick={searchContacts}
                                    className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Search Member
                                </button>
                            </div>

                            {/* Search Results */}
                            {isSearching && (
                                <div className="mt-6">
                                    <h3 className="text-md font-medium text-gray-900 mb-3">Search Results</h3>
                                    {searchResults.length === 0 ? (
                                        <p className="text-gray-500">No members found matching your search criteria.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {searchResults.map(contact => (
                                                <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center">
                                                        {contact.id_picture && (
                                                            <img 
                                                                src={contact.id_picture} 
                                                                alt={`${contact.first_name} ${contact.last_name}`}
                                                                className="w-12 h-12 rounded-full object-cover mr-4"
                                                            />
                                                        )}
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                {contact.first_name} {contact.middle_name ? `${contact.middle_name} ` : ''}{contact.last_name}
                                                            </h4>
                                                            <p className="text-sm text-gray-500">{contact.email}</p>
                                                            {contact.call_number && (
                                                                <p className="text-sm text-gray-500">{contact.call_number}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Records Search Section */}
                        <div id="records" className="bg-white rounded-xl shadow-sm p-8 mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Records</h2>
                            
                            <div className="space-y-6">
                                {/* Lending Records Search */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 mb-3">Lending Records</h3>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <input
                                            type="text"
                                            placeholder="Enter Member ID to view lending records..."
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                                            View Records
                                        </button>
                                    </div>
                                </div>

                                {/* Healthcare Records Search */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 mb-3">Healthcare Records</h3>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <input
                                            type="text"
                                            placeholder="Enter Member ID to view healthcare records..."
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                                            View Records
                                        </button>
                                    </div>
                                </div>

                                {/* Mortuary Records Search */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 mb-3">Mortuary Records</h3>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <input
                                            type="text"
                                            placeholder="Enter Member ID to view mortuary records..."
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                                            View Records
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Community Digital Products Section */}
                        <div id="products" className="bg-white rounded-xl shadow-sm p-8 mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Community Digital Products</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Digital Product Card 1 */}
                                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Community App</h3>
                                        <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">Free</span>
                                    </div>
                                    <p className="text-gray-600 mb-4">Access community features, updates, and connect with members on the go.</p>
                                    <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                        Download
                                    </button>
                                </div>

                                {/* Digital Product Card 2 */}
                                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Member Portal</h3>
                                        <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">Premium</span>
                                    </div>
                                    <p className="text-gray-600 mb-4">Exclusive access to premium features and advanced community tools.</p>
                                    <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                        Subscribe
                                    </button>
                                </div>

                                {/* Digital Product Card 3 */}
                                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Resource Library</h3>
                                        <span className="px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-full">Member Only</span>
                                    </div>
                                    <p className="text-gray-600 mb-4">Access to community resources, guides, and educational materials.</p>
                                    <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                        Access
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Community Links Section */}
                        <div className="bg-white rounded-xl shadow-sm p-8 mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Community Links</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pages.length === 0 ? (
                                    <div className="col-span-2 text-center text-gray-500 py-8">No community pages found.</div>
                                ) : (
                                    pages.map((page) => (
                                        <a 
                                            key={page.id} 
                                            href={`/link/${page.slug}`} 
                                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{page.title}</h3>
                                                <p className="text-sm text-gray-500">{page.meta_description || 'View page details'}</p>
                                            </div>
                                            {page.featured_image && (
                                                <div className="ml-4 flex-shrink-0">
                                                    <img 
                                                        src={page.featured_image} 
                                                        alt={page.title} 
                                                        className="w-12 h-12 object-cover rounded-lg"
                                                    />
                                                </div>
                                            )}
                                        </a>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Community Challenges Section */}
                        <div id="challenges" className="bg-white rounded-xl shadow-sm p-8 mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Community Challenges</h2>
                            {challenges.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">No challenges found.</div>
                            ) : (
                                <div className="space-y-6">
                                    {challenges.map((challenge: any) => (
                                        <div key={challenge.id} className="border border-gray-200 rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-medium text-gray-900">{challenge.title}</h3>
                                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${challenge.status === 'active' ? 'text-green-700 bg-green-100' : challenge.status === 'upcoming' ? 'text-blue-700 bg-blue-100' : 'text-gray-700 bg-gray-100'}`}>{challenge.status?.charAt(0).toUpperCase() + challenge.status?.slice(1) || 'Unknown'}</span>
                                            </div>
                                            <p className="text-gray-600 mb-4">{challenge.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-sm text-gray-500">
                                                        <span className="font-medium text-gray-900">{challenge.participants?.length ?? 0}</span> participants
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        <span className="font-medium text-gray-900">{challenge.end_date ? `${Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left` : ''}</span>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                                    {challenge.status === 'active' ? 'Join Challenge' : 'Register Interest'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Community Events Section */}
                        <div id="events" className="bg-white rounded-xl shadow-sm p-8 mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Community Events</h2>
                            <div className="space-y-6">
                                {events.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">No events found.</div>
                                ) : (
                                    events.map((event) => (
                                        <div key={event.id} className="border border-gray-200 rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                                    event.status === 'published' ? 'text-green-700 bg-green-100' :
                                                    event.status === 'draft' ? 'text-blue-700 bg-blue-100' :
                                                    'text-gray-700 bg-gray-100'
                                                }`}>
                                                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>
                                                    {new Date(event.start_date).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })} • {new Date(event.start_date).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{event.location}</span>
                                            </div>
                                            <p className="text-gray-600 mb-4">{event.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-sm text-gray-500">
                                                        <span className="font-medium text-gray-900">{event.participants.length}</span> registered
                                                    </div>
                                                    {event.max_participants && (
                                                        <div className="text-sm text-gray-500">
                                                            <span className="font-medium text-gray-900">
                                                                {Math.max(0, event.max_participants - event.participants.length)}
                                                            </span> spots left
                                                        </div>
                                                    )}
                                                    {event.registration_deadline && (
                                                        <div className="text-sm text-gray-500">
                                                            <span className="font-medium text-gray-900">
                                                                {new Date(event.registration_deadline) > new Date() ? 
                                                                    `Registration ends ${new Date(event.registration_deadline).toLocaleDateString()}` :
                                                                    'Registration closed'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {event.status === 'published' && new Date(event.registration_deadline) > new Date() && (
                                                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                                        Register Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Community Access Section */}
                        <div className="bg-white rounded-xl shadow-sm p-8 mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Community Access</h2>
                            <div className="flex flex-col items-center space-y-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                                    >
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login', { project: 'community' })}
                                        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                                    >
                                        Log in to Community
                                    </Link>
                                )}
                                <p className="text-sm text-gray-500 text-center">
                                    Access exclusive community features and connect with other members
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-12">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center space-y-4">
                        <p className="text-center text-base text-gray-400">
                            &copy; {new Date().getFullYear()} Sakto Community Platform. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Mobile Navigation Menu */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="flex justify-around items-center h-16">
                    <button
                        onClick={() => scrollToSection('profile')}
                        className={`flex flex-col items-center justify-center w-full h-full ${
                            activeSection === 'profile' ? 'text-blue-600' : 'text-gray-600'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scrollToSection('records')}
                        className={`flex flex-col items-center justify-center w-full h-full ${
                            activeSection === 'records' ? 'text-blue-600' : 'text-gray-600'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scrollToSection('products')}
                        className={`flex flex-col items-center justify-center w-full h-full ${
                            activeSection === 'products' ? 'text-blue-600' : 'text-gray-600'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scrollToSection('events')}
                        className={`flex flex-col items-center justify-center w-full h-full ${
                            activeSection === 'events' ? 'text-blue-600' : 'text-gray-600'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scrollToSection('challenges')}
                        className={`flex flex-col items-center justify-center w-full h-full ${
                            activeSection === 'challenges' ? 'text-blue-600' : 'text-gray-600'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
} 
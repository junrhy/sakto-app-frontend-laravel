import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

interface PageProps {
    member: {
        id: number;
        name: string;
        email: string;
        contact_number: string | null;
        app_currency: {
            code: string;
            symbol: string;
        } | null;
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
    updates: {
        id: number;
        title: string;
        slug: string;
        content: string;
        excerpt: string | null;
        status: 'draft' | 'published';
        featured_image: string | null;
        author: string;
        client_identifier: string;
        created_at: string;
        updated_at: string;
    }[];
    products: {
        id: number;
        name: string;
        description: string;
        price: number | string;
        category: string;
        type: 'physical' | 'digital' | 'service' | 'subscription';
        sku: string | null;
        stock_quantity: number | null;
        weight: number | null;
        dimensions: string | null;
        file_url: string | null;
        thumbnail_url: string | null;
        status: 'draft' | 'published' | 'archived' | 'inactive';
        tags: string[] | null;
        metadata: any;
        client_identifier: string;
        created_at: string;
        updated_at: string;
    }[];
}

export default function Member({ member, challenges, events, pages, contacts, updates, products }: PageProps) {
    const [activeSection, setActiveSection] = useState('updates');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [visitorInfo, setVisitorInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Add the CSS classes at the top of the component
    const mobileMenuStyles = `
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        @media (max-width: 400px) {
            .max-xs-hidden {
                display: none;
            }
        }
    `;

    useEffect(() => {
        // Check if user is already authorized for today
        const checkAuthorization = () => {
            const authData = localStorage.getItem(`visitor_auth_${member.id}`);
            if (authData) {
                try {
                    const { isAuthorized: storedAuth, timestamp, memberId } = JSON.parse(authData);
                    const today = new Date().toDateString();
                    const storedDate = new Date(timestamp).toDateString();
                    
                    // Check if it's the same member and same day
                    if (storedAuth && memberId === member.id && storedDate === today) {
                        setIsAuthorized(true);
                        return;
                    }
                } catch (error) {
                    // If there's an error parsing the data, remove it
                    localStorage.removeItem(`visitor_auth_${member.id}`);
                }
            }
        };

        checkAuthorization();
    }, [member.id]);

    useEffect(() => {
        // Add the styles to the document head
        const styleElement = document.createElement('style');
        styleElement.innerHTML = mobileMenuStyles;
        document.head.appendChild(styleElement);

        // Cleanup on unmount
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    const handleVisitorSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Check if visitor is in contacts list
        const isInContacts = contacts.some(contact => 
            contact.email.toLowerCase() === visitorInfo.email.toLowerCase() ||
            (contact.call_number && contact.call_number === visitorInfo.phone)
        );

        if (isInContacts) {
            // Store authorization data in localStorage
            const authData = {
                isAuthorized: true,
                timestamp: new Date().toISOString(),
                memberId: member.id,
                visitorInfo: {
                    firstName: visitorInfo.firstName,
                    lastName: visitorInfo.lastName,
                    email: visitorInfo.email,
                    phone: visitorInfo.phone
                }
            };
            localStorage.setItem(`visitor_auth_${member.id}`, JSON.stringify(authData));
            
            setIsAuthorized(true);
        } else {
            setError('We could not find your information in our records. Please verify your details or contact the administrator for access.');
        }
        setIsSubmitting(false);
    };

    const handleLogout = () => {
        localStorage.removeItem(`visitor_auth_${member.id}`);
        setIsAuthorized(false);
        setVisitorInfo({
            firstName: '',
            lastName: '',
            email: '',
            phone: ''
        });
    };

    // Helper function to format price
    const formatPrice = (price: number | string): string => {
        const currency = member.app_currency?.symbol || '$';
        let formattedPrice: string;
        
        if (typeof price === 'number') {
            formattedPrice = price.toFixed(2);
        } else if (typeof price === 'string') {
            const numPrice = parseFloat(price);
            formattedPrice = isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
        } else {
            formattedPrice = '0.00';
        }
        
        return `${currency}${formattedPrice}`;
    };

    const menuItems = [
        { id: 'updates', label: 'Updates', icon: 'M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m10-4H7a2 2 0 00-2 2v0a2 2 0 002 2h10a2 2 0 002-2v0a2 2 0 00-2-2z' },
        { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'products', label: 'Marketplace', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { id: 'community', label: 'Resources', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
        { id: 'challenges', label: 'Challenges', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'updates':
                return (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Updates</h2>
                        <div className="space-y-6">
                            {updates.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">No updates found.</div>
                            ) : (
                                updates.map(update => (
                                    <div key={update.id} className="border border-gray-200 rounded-lg p-4 flex items-start gap-4">
                                        {update.featured_image ? (
                                            <img src={update.featured_image} alt={update.title} className="w-12 h-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-900">{update.title}</span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(update.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            {update.excerpt && (
                                                <p className="text-sm text-gray-600 mb-2">{update.excerpt}</p>
                                            )}
                                            <div className="text-xs text-gray-500 mb-2">
                                                By {update.author}
                                            </div>
                                            <div className="text-gray-700 text-sm line-clamp-3" 
                                                 dangerouslySetInnerHTML={{ 
                                                     __html: update.content.length > 200 
                                                         ? update.content.substring(0, 200) + '...' 
                                                         : update.content 
                                                 }} 
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h2>
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">First Name</p>
                                <p className="text-gray-900 font-medium">{(() => {
                                    const authData = localStorage.getItem(`visitor_auth_${member.id}`);
                                    if (authData) {
                                        try {
                                            const { visitorInfo } = JSON.parse(authData);
                                            return visitorInfo?.firstName || 'Not available';
                                        } catch (error) {
                                            return 'Not available';
                                        }
                                    }
                                    return 'Not available';
                                })()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Last Name</p>
                                <p className="text-gray-900 font-medium">{(() => {
                                    const authData = localStorage.getItem(`visitor_auth_${member.id}`);
                                    if (authData) {
                                        try {
                                            const { visitorInfo } = JSON.parse(authData);
                                            return visitorInfo?.lastName || 'Not available';
                                        } catch (error) {
                                            return 'Not available';
                                        }
                                    }
                                    return 'Not available';
                                })()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                                <p className="text-gray-900 font-medium">{(() => {
                                    const authData = localStorage.getItem(`visitor_auth_${member.id}`);
                                    if (authData) {
                                        try {
                                            const { visitorInfo } = JSON.parse(authData);
                                            return visitorInfo?.email || 'Not available';
                                        } catch (error) {
                                            return 'Not available';
                                        }
                                    }
                                    return 'Not available';
                                })()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                                <p className="text-gray-900 font-medium">{(() => {
                                    const authData = localStorage.getItem(`visitor_auth_${member.id}`);
                                    if (authData) {
                                        try {
                                            const { visitorInfo } = JSON.parse(authData);
                                            return visitorInfo?.phone || 'Not available';
                                        } catch (error) {
                                            return 'Not available';
                                        }
                                    }
                                    return 'Not available';
                                })()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Accessing</p>
                                <p className="text-gray-900 font-medium">{member.name}'s Page</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Session Started</p>
                                <p className="text-gray-900 font-medium">{(() => {
                                    const authData = localStorage.getItem(`visitor_auth_${member.id}`);
                                    if (authData) {
                                        try {
                                            const { timestamp } = JSON.parse(authData);
                                            return new Date(timestamp).toLocaleString();
                                        } catch (error) {
                                            return 'Not available';
                                        }
                                    }
                                    return 'Not available';
                                })()}</p>
                            </div>
                            <div className="pt-4 border-t border-gray-200">
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Go to {member.name} Portal
                                </Link>
                            </div>
                        </div>
                    </div>
                );

            case 'products':
                return (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Marketplace</h2>
                        {products.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">No products available at the moment.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <div key={product.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                        {product.thumbnail_url && (
                                            <div className="mb-4">
                                                <img 
                                                    src={product.thumbnail_url} 
                                                    alt={product.name} 
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{product.category}</span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                product.type === 'digital' ? 'text-blue-700 bg-blue-100' :
                                                product.type === 'service' ? 'text-purple-700 bg-purple-100' :
                                                product.type === 'subscription' ? 'text-orange-700 bg-orange-100' :
                                                'text-green-700 bg-green-100'
                                            }`}>
                                                {product.type}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
                                        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{product.description}</p>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xl font-bold text-gray-900">
                                                {formatPrice(product.price)}
                                            </span>
                                            {product.stock_quantity !== null && (
                                                <span className="text-sm text-gray-500">
                                                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'community':
                return (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pages.length === 0 ? (
                                <div className="col-span-2 text-center text-gray-500 py-8">No resources found.</div>
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
                );

            case 'challenges':
                return (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Challenges</h2>
                        {challenges.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">No challenges found.</div>
                        ) : (
                            <div className="space-y-6">
                                {challenges.map((challenge: any) => (
                                    <div key={challenge.id} className="border border-gray-200 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">{challenge.title}</h3>
                                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                                challenge.status === 'active' ? 'text-green-700 bg-green-100' : 
                                                challenge.status === 'upcoming' ? 'text-blue-700 bg-blue-100' : 
                                                'text-gray-700 bg-gray-100'
                                            }`}>
                                                {challenge.status?.charAt(0).toUpperCase() + challenge.status?.slice(1) || 'Unknown'}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-4">{challenge.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-sm text-gray-500">
                                                    <span className="font-medium text-gray-900">{challenge.participants?.length ?? 0}</span> participants
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    <span className="font-medium text-gray-900">
                                                        {challenge.end_date ? `${Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left` : ''}
                                                    </span>
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
                );

            case 'events':
                return (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Events</h2>
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
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Head>
                <title>{member?.name ? `${member.name} - Sakto App` : 'Member Profile - Sakto App'}</title>
                <meta name="description" content={member?.name ? `Profile page of ${member.name}` : 'Member Profile Page'} />
            </Head>
            
            <div className="min-h-screen bg-gray-50">
                {!isAuthorized ? (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="bg-white rounded-xl shadow-sm p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to {member.name}'s Page</h2>
                                <p className="text-gray-600">Please enter your information to access this page.</p>
                            </div>

                            <form onSubmit={handleVisitorSubmit} className="max-w-md mx-auto space-y-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        value={visitorInfo.firstName}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, firstName: e.target.value }))}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        value={visitorInfo.lastName}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, lastName: e.target.value }))}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={visitorInfo.email}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={visitorInfo.phone}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, phone: e.target.value }))}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-600 text-sm mt-2">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Verifying...' : 'Continue'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-screen">
                        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-800">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                                <div className="flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-xl font-bold text-blue-600">
                                                {member.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white whitespace-nowrap truncate hidden sm:block">
                                            {member.name}
                                        </h1>
                                    </div>
                                    <nav className="flex flex-row flex-wrap gap-1 sm:gap-2 overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
                                        {menuItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveSection(item.id)}
                                                className={`flex items-center px-2 sm:px-3 py-1 rounded-md transition-colors text-xs sm:text-sm font-medium whitespace-nowrap ${
                                                    activeSection === item.id
                                                        ? 'bg-white text-blue-600'
                                                        : 'bg-blue-700 text-white hover:bg-blue-600'
                                                }`}
                                                style={{ minWidth: 0 }}
                                            >
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                                </svg>
                                                <span className="ml-1 sm:ml-2 max-xs-hidden">{item.label}</span>
                                            </button>
                                        ))}
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center px-2 sm:px-3 py-1 rounded-md transition-colors text-xs sm:text-sm font-medium whitespace-nowrap bg-red-600 text-white hover:bg-red-700"
                                            title="Logout from this session"
                                        >
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span className="ml-1 sm:ml-2 max-xs-hidden">Logout</span>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden pt-16">
                            <div className="h-full overflow-y-auto">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    {renderContent()}
                                </div>

                                <footer className="mt-auto">
                                    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                                        <div className="flex flex-col items-center space-y-4">
                                            <p className="text-center text-sm text-gray-400">
                                                &copy; {new Date().getFullYear()} Sakto Community Platform. All rights reserved.
                                            </p>
                                        </div>
                                    </div>
                                </footer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
} 
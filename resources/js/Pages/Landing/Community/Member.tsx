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
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Updates</h2>
                        <div className="space-y-4">
                            {updates.length === 0 ? (
                                <div className="text-center text-gray-500 py-12">
                                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-lg font-medium">No updates found</p>
                                    <p className="text-sm">Check back later for new updates</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {updates.map(update => (
                                        <div key={update.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                            {/* Post Header */}
                                            <div className="p-4 pb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-semibold text-sm">
                                                            {update.author.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-gray-900 text-sm">{update.author}</h3>
                                                            {update.status === 'published' && (
                                                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span>
                                                                {new Date(update.created_at).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                {new Date(update.created_at).toLocaleTimeString('en-US', {
                                                                    hour: 'numeric',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                            {update.status === 'draft' && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-yellow-600 font-medium">Draft</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Post Content */}
                                            <div className="px-4 pb-3">
                                                <h4 className="font-semibold text-gray-900 mb-2 text-base">
                                                    {update.title}
                                                </h4>
                                                {update.excerpt && (
                                                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                                                        {update.excerpt}
                                                    </p>
                                                )}
                                                <div className="text-gray-700 text-sm leading-relaxed" 
                                                     dangerouslySetInnerHTML={{ 
                                                         __html: update.content.length > 300 
                                                             ? update.content.substring(0, 300) + '...' 
                                                             : update.content 
                                                     }} 
                                                />
                                                {update.content.length > 300 && (
                                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">
                                                        See more
                                                    </button>
                                                )}
                                            </div>

                                            {/* Post Image */}
                                            {update.featured_image && (
                                                <div className="px-4 pb-3">
                                                    <img 
                                                        src={update.featured_image} 
                                                        alt={update.title} 
                                                        className="w-full rounded-lg object-cover max-h-96"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Profile</h2>
                        <div className="max-w-2xl">
                            {/* Profile Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-2xl font-bold text-white">
                                            {(() => {
                                                const authData = localStorage.getItem(`visitor_auth_${member.id}`);
                                                if (authData) {
                                                    try {
                                                        const { visitorInfo } = JSON.parse(authData);
                                                        return visitorInfo?.firstName?.charAt(0).toUpperCase() || 'U';
                                                    } catch (error) {
                                                        return 'U';
                                                    }
                                                }
                                                return 'U';
                                            })()}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                            {(() => {
                                                const authData = localStorage.getItem(`visitor_auth_${member.id}`);
                                                if (authData) {
                                                    try {
                                                        const { visitorInfo } = JSON.parse(authData);
                                                        return `${visitorInfo?.firstName || 'User'} ${visitorInfo?.lastName || ''}`;
                                                    } catch (error) {
                                                        return 'User Profile';
                                                    }
                                                }
                                                return 'User Profile';
                                            })()}
                                        </h3>
                                        <p className="text-gray-600">Visitor Profile</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Active Session
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Personal Information
                                    </h4>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500 mb-1">First Name</p>
                                                    <p className="text-gray-900 font-medium">
                                                        {(() => {
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
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500 mb-1">Last Name</p>
                                                    <p className="text-gray-900 font-medium">
                                                        {(() => {
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
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Contact Information
                                    </h4>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                                                    <p className="text-gray-900 font-medium">
                                                        {(() => {
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
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                                                    <p className="text-gray-900 font-medium">
                                                        {(() => {
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
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Session Information */}
                            <div className="space-y-4 mb-8">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Session Information
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500 mb-1">Accessing</p>
                                                <p className="text-gray-900 font-medium">{member.name}'s Page</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500 mb-1">Session Started</p>
                                                <p className="text-gray-900 font-medium">
                                                    {(() => {
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
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-6 border-t border-gray-200">
                                <Link
                                    href={route('home')}
                                    className="hidden sm:inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg"
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
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Marketplace</h2>
                        {products.length === 0 ? (
                            <div className="text-center text-gray-500 py-12">
                                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <p className="text-lg font-medium">No products available</p>
                                <p className="text-sm">Check back later for new products</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <div key={product.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200">
                                        {/* Product Image */}
                                        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                                            {product.thumbnail_url ? (
                                                <img 
                                                    src={product.thumbnail_url} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>
                                            )}
                                            
                                            {/* Product Type Badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    product.type === 'digital' ? 'text-blue-700 bg-blue-100' :
                                                    product.type === 'service' ? 'text-purple-700 bg-purple-100' :
                                                    product.type === 'subscription' ? 'text-orange-700 bg-orange-100' :
                                                    'text-green-700 bg-green-100'
                                                }`}>
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        {product.type === 'digital' ? (
                                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                                        ) : product.type === 'service' ? (
                                                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                                        ) : product.type === 'subscription' ? (
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                        ) : (
                                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                                                        )}
                                                    </svg>
                                                    {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                                                </span>
                                            </div>

                                            {/* Stock Status */}
                                            {product.stock_quantity !== null && (
                                                <div className="absolute top-3 right-3">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        product.stock_quantity > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                                                    }`}>
                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            {product.stock_quantity > 0 ? (
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            ) : (
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            )}
                                                        </svg>
                                                        {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Content */}
                                        <div className="p-4">
                                            {/* Product Header */}
                                            <div className="mb-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        {product.category}
                                                    </span>
                                                    {product.status !== 'published' && (
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            product.status === 'draft' ? 'text-yellow-700 bg-yellow-100' :
                                                            product.status === 'archived' ? 'text-gray-700 bg-gray-100' :
                                                            'text-red-700 bg-red-100'
                                                        }`}>
                                                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 mb-2">
                                                    {product.name}
                                                </h3>
                                            </div>

                                            {/* Product Description */}
                                            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                                                {product.description}
                                            </p>

                                            {/* Product Details */}
                                            <div className="space-y-2 mb-4">
                                                {product.sku && (
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                        <span>SKU: {product.sku}</span>
                                                    </div>
                                                )}
                                                {product.weight && (
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                        </svg>
                                                        <span>{product.weight}g</span>
                                                    </div>
                                                )}
                                                {product.dimensions && (
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                                        </svg>
                                                        <span>{product.dimensions}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Tags */}
                                            {product.tags && product.tags.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {product.tags.slice(0, 3).map((tag, index) => (
                                                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                        {product.tags.length > 3 && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                                +{product.tags.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Product Price and Action */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-baseline">
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                    {product.type === 'subscription' && (
                                                        <span className="text-xs text-gray-500 ml-1">/month</span>
                                                    )}
                                                </div>
                                                <button className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                    product.stock_quantity === 0 || product.status !== 'published'
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                                }`}>
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                                    </svg>
                                                    {product.stock_quantity === 0 ? 'Out of Stock' : 
                                                     product.status !== 'published' ? 'Not Available' : 
                                                     product.type === 'digital' ? 'Download' :
                                                     product.type === 'service' ? 'Book Now' :
                                                     product.type === 'subscription' ? 'Subscribe' : 'Add to Cart'}
                                                </button>
                                            </div>
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
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Resources</h2>
                        {pages.length === 0 ? (
                            <div className="text-center text-gray-500 py-12">
                                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <p className="text-lg font-medium">No resources found</p>
                                <p className="text-sm">Check back later for new resources</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pages.map((page) => (
                                    <a 
                                        key={page.id} 
                                        href={`/link/${page.slug}`}
                                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 block"
                                    >
                                        {/* Resource Image */}
                                        {page.featured_image ? (
                                            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                                                <img 
                                                    src={page.featured_image} 
                                                    alt={page.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-200"></div>
                                                <div className="absolute top-3 right-3">
                                                    <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                <div className="text-white text-center">
                                                    <svg className="w-12 h-12 mx-auto mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <p className="text-sm font-medium">Resource</p>
                                                </div>
                                                <div className="absolute top-3 right-3">
                                                    <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Resource Content */}
                                        <div className="p-6">
                                            {/* Resource Header */}
                                            <div className="mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2 line-clamp-2">
                                                    {page.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        page.is_published ? 'text-green-700 bg-green-100' : 'text-yellow-700 bg-yellow-100'
                                                    }`}>
                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            {page.is_published ? (
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            ) : (
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                            )}
                                                        </svg>
                                                        {page.is_published ? 'Published' : 'Draft'}
                                                    </span>
                                                    {page.template && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-100">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                                            </svg>
                                                            Template
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Resource Description */}
                                            {page.meta_description && (
                                                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                                    {page.meta_description}
                                                </p>
                                            )}

                                            {/* Resource Meta */}
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>
                                                        {new Date(page.updated_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                                                    <span className="font-medium">View Resource</span>
                                                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'challenges':
                return (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Challenges</h2>
                        {challenges.length === 0 ? (
                            <div className="text-center text-gray-500 py-12">
                                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-lg font-medium">No challenges found</p>
                                <p className="text-sm">Check back later for new challenges</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {challenges.map((challenge: any) => (
                                    <div key={challenge.id} className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200">
                                        {/* Challenge Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-1">
                                                    {challenge.title}
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                        challenge.status === 'active' ? 'text-green-700 bg-green-100' : 
                                                        challenge.status === 'upcoming' ? 'text-blue-700 bg-blue-100' : 
                                                        'text-gray-700 bg-gray-100'
                                                    }`}>
                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            {challenge.status === 'active' ? (
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            ) : challenge.status === 'upcoming' ? (
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                            ) : (
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            )}
                                                        </svg>
                                                        {challenge.status?.charAt(0).toUpperCase() + challenge.status?.slice(1) || 'Unknown'}
                                                    </span>
                                                    {challenge.end_date && (
                                                        <div className="flex items-center text-xs text-gray-500">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Challenge Description */}
                                        <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                                            {challenge.description}
                                        </p>

                                        {/* Challenge Stats */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <span className="font-medium text-gray-900">{challenge.participants?.length ?? 0}</span>
                                                    <span className="ml-1">participants</span>
                                                </div>
                                                {challenge.prize && (
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                        </svg>
                                                        <span className="font-medium text-gray-900">{challenge.prize}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Challenge Progress Bar (if applicable) */}
                                        {challenge.end_date && (
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                                    <span>Progress</span>
                                                    <span>
                                                        {Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days remaining
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all duration-300 ${
                                                            challenge.status === 'active' ? 'bg-green-500' : 
                                                            challenge.status === 'upcoming' ? 'bg-blue-500' : 
                                                            'bg-gray-400'
                                                        }`}
                                                        style={{ 
                                                            width: `${Math.max(0, Math.min(100, 100 - (Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) / 30) * 100))}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        <div className="flex justify-end">
                                            <button className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                                challenge.status === 'active' 
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {challenge.status === 'active' ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    )}
                                                </svg>
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
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Events</h2>
                        <div className="space-y-6">
                            {events.length === 0 ? (
                                <div className="text-center text-gray-500 py-12">
                                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-lg font-medium">No events found</p>
                                    <p className="text-sm">Check back later for upcoming events</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {events.map((event) => (
                                        <div key={event.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200">
                                            {/* Event Image */}
                                            {event.image && (
                                                <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                                                    <img 
                                                        src={event.image} 
                                                        alt={event.title} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                                    <div className="absolute top-4 right-4">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                            event.status === 'published' ? 'text-green-700 bg-green-100' :
                                                            event.status === 'draft' ? 'text-blue-700 bg-blue-100' :
                                                            'text-gray-700 bg-gray-100'
                                                        }`}>
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                {event.status === 'published' ? (
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                ) : event.status === 'draft' ? (
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                ) : (
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                )}
                                                            </svg>
                                                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Event Content */}
                                            <div className="p-6">
                                                {/* Event Header */}
                                                <div className="mb-4">
                                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                                                        {event.title}
                                                    </h3>
                                                    {!event.image && (
                                                        <div className="flex justify-end">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                                event.status === 'published' ? 'text-green-700 bg-green-100' :
                                                                event.status === 'draft' ? 'text-blue-700 bg-blue-100' :
                                                                'text-gray-700 bg-gray-100'
                                                            }`}>
                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    {event.status === 'published' ? (
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    ) : event.status === 'draft' ? (
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                    ) : (
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                                    )}
                                                                </svg>
                                                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Event Details */}
                                                <div className="space-y-3 mb-6">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <div>
                                                            <span className="font-medium text-gray-900">
                                                                {new Date(event.start_date).toLocaleDateString('en-US', {
                                                                    weekday: 'long',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                            <span className="text-gray-500 ml-2">
                                                                at {new Date(event.start_date).toLocaleTimeString('en-US', {
                                                                    hour: 'numeric',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="font-medium text-gray-900">{event.location}</span>
                                                    </div>

                                                    {event.category && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <svg className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                            </svg>
                                                            <span className="font-medium text-gray-900">{event.category}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Event Description */}
                                                <p className="text-gray-700 text-sm leading-relaxed mb-6 line-clamp-3">
                                                    {event.description}
                                                </p>

                                                {/* Event Stats */}
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                            <span className="font-medium text-gray-900">{event.participants.length}</span>
                                                            <span className="ml-1">registered</span>
                                                        </div>
                                                        {event.max_participants && (
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <span className="font-medium text-gray-900">
                                                                    {Math.max(0, event.max_participants - event.participants.length)}
                                                                </span>
                                                                <span className="ml-1">spots left</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Registration Deadline Warning */}
                                                {event.registration_deadline && new Date(event.registration_deadline) > new Date() && (
                                                    <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                        <div className="flex items-center text-sm text-yellow-800">
                                                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>
                                                                Online registration closes on {new Date(event.registration_deadline).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Button */}
                                                <div className="flex justify-end">
                                                    {event.status === 'published' && new Date(event.registration_deadline) > new Date() ? (
                                                        <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-medium">
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                            Register Now
                                                        </button>
                                                    ) : event.status === 'published' ? (
                                                        <button className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium" disabled>
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Registration Closed
                                                        </button>
                                                    ) : (
                                                        <button className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium" disabled>
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Coming Soon
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
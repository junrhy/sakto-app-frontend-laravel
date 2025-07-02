import { Head, Link, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useState, useEffect } from 'react';
import UpdatesSection from './Components/UpdatesSection';
import ProfileSection from './Components/ProfileSection';
import EventsSection from './Components/EventsSection';
import PagesSection from './Components/PagesSection';
import ContactsSection from './Components/ContactsSection';
import ProductsSection from './Components/ProductsSection';
import ChallengesSection from './Components/ChallengesSection';
import { formatDateTimeForDisplay, formatTimeForDisplay } from './utils/dateUtils';

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
        identifier?: string;
    };
    challenges: any[];
    events: any[];
    pages: any[];
    contacts: any[];
    updates: any[];
    products: any[];
}

export default function MemberRefactored({ member, challenges, events, pages, contacts, updates, products }: PageProps) {
    // Get initial tab from URL
    const getInitialTab = () => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (tab) return tab;
        }
        return 'updates';
    };
    const [activeSection, setActiveSection] = useState(getInitialTab());
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [showVisitorForm, setShowVisitorForm] = useState(false);
    const [visitorInfo, setVisitorInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });

    // Authorization check
    useEffect(() => {
        const checkAuthorization = () => {
            const authData = localStorage.getItem(`visitor_auth_${member.id}`);
            if (authData) {
                try {
                    const { timestamp } = JSON.parse(authData);
                    const authTime = new Date(timestamp).getTime();
                    const currentTime = new Date().getTime();
                    const hoursDiff = (currentTime - authTime) / (1000 * 60 * 60);
                    
                    if (hoursDiff < 24) {
                        setIsAuthorized(true);
                        return;
                    }
                } catch (error) {
                    console.error('Error parsing auth data:', error);
                }
            }
            setIsAuthorized(false);
        };

        checkAuthorization();
    }, [member.id]);

    const handleVisitorSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const authData = {
            visitorInfo,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(`visitor_auth_${member.id}`, JSON.stringify(authData));
        setIsAuthorized(true);
        setShowVisitorForm(false);
    };

    const handleLogout = () => {
        localStorage.removeItem(`visitor_auth_${member.id}`);
        setIsAuthorized(false);
        setShowVisitorForm(true);
    };

    const handleMenuClick = (sectionId: string) => {
        setActiveSection(sectionId);
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            params.set('tab', sectionId);
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState({}, '', newUrl);
        }
    };

    // Listen for browser navigation (back/forward) to sync tab
    useEffect(() => {
        const onPopState = () => {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (tab && tab !== activeSection) {
                setActiveSection(tab);
            }
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [activeSection]);

    const formatPrice = (price: number | string): string => {
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        const symbol = member.app_currency?.symbol || '$';
        return `${symbol}${numericPrice.toFixed(2)}`;
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'updates':
                return <UpdatesSection updates={updates} />;
            case 'profile':
                return <ProfileSection member={member} />;
            case 'events':
                return <EventsSection events={events} formatPrice={formatPrice} />;
            case 'pages':
                return <PagesSection pages={pages} />;
            case 'contacts':
                return <ContactsSection contacts={contacts} />;
            case 'products':
                return <ProductsSection products={products} appCurrency={member.app_currency} />;
            case 'challenges':
                return <ChallengesSection challenges={challenges} />;
            default:
                return <UpdatesSection updates={updates} />;
        }
    };

    if (!isAuthorized) {
        return (
            <>
                <Head title={`${member.name}`} />
                <div className="min-h-screen bg-gray-50">
                    {/* Header */}
                    <div className="bg-indigo-600 shadow-sm border-b border-indigo-700">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                    <span className="ml-2 text-xl font-bold text-white">{member.name}'s Community</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visitor Form */}
                    <div className="max-w-md mx-auto mt-16 p-8">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to {member.name}'s Community</h2>
                                <p className="text-gray-600">Please provide your information to continue</p>
                            </div>

                            <form onSubmit={handleVisitorSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        required
                                        value={visitorInfo.firstName}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, firstName: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="Enter your first name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        required
                                        value={visitorInfo.lastName}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, lastName: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="Enter your last name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        value={visitorInfo.email}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="Enter your email address"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={visitorInfo.phone}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    Continue to Community
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`${member.name} - Community`} />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-indigo-600 shadow-sm border-b border-indigo-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                <span className="ml-2 text-xl font-bold text-white">{member.name}'s Community</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center px-4 py-2 border border-white text-white rounded-lg hover:bg-white hover:text-indigo-600 transition-colors text-sm font-medium"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex space-x-8 overflow-x-auto">
                            {[
                                { id: 'updates', label: 'Updates', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                                { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                                { id: 'events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                                { id: 'pages', label: 'Pages', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                                { id: 'contacts', label: 'Contacts', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                                { id: 'products', label: 'Marketplace', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                                { id: 'challenges', label: 'Challenges', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleMenuClick(item.id)}
                                    className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                        activeSection === item.id
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {renderContent()}
                </div>
            </div>
        </>
    );
} 
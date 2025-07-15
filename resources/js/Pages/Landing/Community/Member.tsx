import { Head, Link, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useState, useEffect } from 'react';
import UpdatesSection from './Components/UpdatesSection';
import ProfileSection from './Components/ProfileSection';
import MyRecordsSection from './Components/MyRecordsSection';
import EventsSection from './Components/EventsSection';
import PagesSection from './Components/PagesSection';
import ContactsSection from './Components/ContactsSection';
import ProductsSection from './Components/ProductsSection';
import ChallengesSection from './Components/ChallengesSection';
import WalletSection from './Components/WalletSection';
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
    orderHistory: any[];
    appUrl: string;
}

export default function Member({ member, challenges, events, pages, contacts, updates, products, orderHistory, appUrl }: PageProps) {
    // Get initial tab from URL
    const getInitialTab = () => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (tab) return tab;
        }
        return 'home';
    };
    const [activeSection, setActiveSection] = useState(getInitialTab());
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [showVisitorForm, setShowVisitorForm] = useState(false);
    const [showSignUpForm, setShowSignUpForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSignUpSubmitting, setIsSignUpSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [signUpError, setSignUpError] = useState('');
    const [signUpSuccess, setSignUpSuccess] = useState(false);
    const [visitorInfo, setVisitorInfo] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    const [signUpEmail, setSignUpEmail] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentVisitor, setCurrentVisitor] = useState<{
        firstName: string;
        middleName: string;
        lastName: string;
        email: string;
        phone: string;
        contactId: number;
    } | null>(null);



    // Authorization check
    useEffect(() => {
        const checkAuthorization = () => {
            const authData = localStorage.getItem(`visitor_auth_${member.id}`);
            if (authData) {
                try {
                    const parsedData = JSON.parse(authData);
                    const { isAuthorized: storedAuth, timestamp, memberId, visitorInfo } = parsedData;
                    const today = new Date().toDateString();
                    const storedDate = new Date(timestamp).toDateString();
                    
                    // Check if it's the same member and same day
                    if (storedAuth && memberId === member.id && storedDate === today) {
                        setIsAuthorized(true);
                        setCurrentVisitor(visitorInfo);
                        return;
                    }
                } catch (error) {
                    console.error('Error parsing auth data:', error);
                    // If there's an error parsing the data, remove it
                    localStorage.removeItem(`visitor_auth_${member.id}`);
                }
            }
            setIsAuthorized(false);
        };

        checkAuthorization();
    }, [member.id]);

    const handleVisitorSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Check if visitor is in contacts list - require BOTH email AND phone to match
        const matchingContact = Array.isArray(contacts) ? contacts.find(contact => {
            const emailMatch = contact.email && contact.email.toLowerCase() === visitorInfo.email.toLowerCase();
            const phoneMatch = contact.call_number && contact.call_number === visitorInfo.phone;
            return emailMatch && phoneMatch;
        }) : null;

        if (matchingContact) {
            // Store authorization data in localStorage
            const authData = {
                isAuthorized: true,
                timestamp: new Date().toISOString(),
                memberId: member.id,
                visitorInfo: {
                    firstName: visitorInfo.firstName,
                    middleName: visitorInfo.middleName,
                    lastName: visitorInfo.lastName,
                    email: visitorInfo.email,
                    phone: visitorInfo.phone,
                    contactId: matchingContact.id,
                    date_of_birth: matchingContact.date_of_birth,
                    gender: matchingContact.gender
                }
            };
            localStorage.setItem(`visitor_auth_${member.id}`, JSON.stringify(authData));
            
            setIsAuthorized(true);
            setCurrentVisitor(authData.visitorInfo);
        } else {
            setError('We could not find your information in our records. Please verify both your email and phone number are correct, or contact the administrator for access.');
        }
        setIsSubmitting(false);
    };

    const handleLogout = () => {
        localStorage.removeItem(`visitor_auth_${member.id}`);
        setIsAuthorized(false);
        setCurrentVisitor(null);
        setVisitorInfo({
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            phone: ''
        });
    };

    const handleSignUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSignUpSubmitting(true);
        setSignUpError('');
        setSignUpSuccess(false);

        try {
            const response = await fetch('/community/send-signup-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    email: signUpEmail,
                    member_id: member.id,
                    registration_url: `${appUrl}/contacts/self-registration?client_identifier=${member.identifier}`
                })
            });

            if (response.ok) {
                setSignUpSuccess(true);
                setSignUpEmail('');
            } else {
                const errorData = await response.json();
                setSignUpError(errorData.message || 'Failed to send signup link. Please try again.');
            }
        } catch (error) {
            setSignUpError('Network error. Please try again.');
        }

        setIsSignUpSubmitting(false);
    };

    const handleMenuClick = (sectionId: string) => {
        setActiveSection(sectionId);
        setIsMobileMenuOpen(false); // Close mobile menu when item is clicked
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
            case 'home':
                return <UpdatesSection updates={updates} />;
            case 'profile':
                return <ProfileSection member={member} />;
            case 'records':
                return <MyRecordsSection member={member} />;
            case 'events':
                return <EventsSection events={events} formatPrice={formatPrice} />;
            case 'pages':
                return <PagesSection pages={pages} />;
            case 'members':
                return <ContactsSection contacts={contacts} />;
            case 'products':
                return <ProductsSection products={products} appCurrency={member.app_currency} member={member} contactId={currentVisitor?.contactId} orderHistory={orderHistory} />;
            case 'challenges':
                return <ChallengesSection challenges={challenges} />;
            case 'wallet':
                return <WalletSection member={member} contactId={currentVisitor?.contactId} />;
            default:
                return <UpdatesSection updates={updates} />;
        }
    };

    if (!isAuthorized) {
        return (
            <>
                <Head title={`${member.name}`} />
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    {/* Visitor Form */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Welcome to {member.name}'s App</h2>
                                <p className="text-gray-600 dark:text-gray-400">Please enter your information to access this page.</p>
                            </div>

                            {!showSignUpForm ? (
                                <>
                                    <form onSubmit={handleVisitorSubmit} className="max-w-md mx-auto space-y-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        value={visitorInfo.firstName}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, firstName: e.target.value }))}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Middle Name
                                    </label>
                                    <input
                                        type="text"
                                        id="middleName"
                                        value={visitorInfo.middleName}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, middleName: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        value={visitorInfo.lastName}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, lastName: e.target.value }))}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={visitorInfo.email}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={visitorInfo.phone}
                                        onChange={(e) => setVisitorInfo(prev => ({ ...prev, phone: e.target.value }))}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-600 dark:text-red-400 text-sm mt-2">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Verifying...' : 'Continue'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSignUpForm(true)}
                                    className="mt-4 w-full px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </>
                            ) : (
                                <>
                                    {signUpSuccess ? (
                                        <div className="max-w-md mx-auto text-center">
                                            <div className="mb-4">
                                                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Check Your Email</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                                We've sent a registration link to your email address. Please check your inbox and click the link to complete your registration.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setShowSignUpForm(false);
                                                    setSignUpSuccess(false);
                                                }}
                                                className="w-full px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                                            >
                                                Back to Login
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-center mb-8">
                                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Sign Up</h2>
                                                <p className="text-gray-600 dark:text-gray-400">Enter your email to receive a registration link.</p>
                                            </div>

                                            <form onSubmit={handleSignUpSubmit} className="max-w-md mx-auto space-y-4">
                                                <div>
                                                    <label htmlFor="signUpEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Email Address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="signUpEmail"
                                                        value={signUpEmail}
                                                        onChange={(e) => setSignUpEmail(e.target.value)}
                                                        required
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
                                                    />
                                                </div>

                                                {signUpError && (
                                                    <div className="text-red-600 dark:text-red-400 text-sm mt-2">
                                                        {signUpError}
                                                    </div>
                                                )}

                                                <button
                                                    type="submit"
                                                    disabled={isSignUpSubmitting}
                                                    className="w-full px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSignUpSubmitting ? 'Sending...' : 'Send Registration Link'}
                                                </button>
                                            </form>

                                            <div className="mt-6 text-center">
                                                <button
                                                    onClick={() => setShowSignUpForm(false)}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm"
                                                >
                                                    Back to Login
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`${member.name} - Community`} />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-indigo-600 dark:bg-indigo-800 shadow-sm border-b border-indigo-700 dark:border-indigo-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0 flex-1">
                                {/* Mobile Menu Button */}
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="md:hidden p-2 rounded-md text-white hover:bg-white hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white mr-3"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {isMobileMenuOpen ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        )}
                                    </svg>
                                </button>

                                <div className="min-w-0 flex-1">
                                    <div className="text-lg sm:text-xl font-bold text-white truncate">{member.name}</div>
                                    {currentVisitor && (
                                        <div className="text-xs sm:text-sm text-indigo-200 dark:text-indigo-300 truncate">
                                            Welcome, {currentVisitor.firstName} {currentVisitor.middleName ? `${currentVisitor.middleName} ` : ''}{currentVisitor.lastName}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center ml-4 flex-shrink-0 space-x-3">
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center px-3 sm:px-4 py-2 border border-white dark:border-indigo-300 text-white dark:text-indigo-300 rounded-lg hover:bg-white hover:text-indigo-600 dark:hover:bg-indigo-700 dark:hover:text-white transition-colors text-sm font-medium"
                                >
                                    <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span className="hidden sm:inline">Logout</span>
                                    <span className="sm:hidden">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8">
                            {[
                                { id: 'home', label: 'Home', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                                { id: 'events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                                { id: 'pages', label: 'Resources', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                                { id: 'members', label: 'Members', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                                { id: 'products', label: 'Marketplace', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                                { id: 'challenges', label: 'Challenges', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                                { id: 'wallet', label: 'Wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                                { id: 'records', label: 'My Records', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                                { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleMenuClick(item.id)}
                                    className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                        activeSection === item.id
                                            ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-600 dark:hover:border-indigo-400'
                                    }`}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        {/* Mobile Navigation */}
                        <div className="md:hidden">
                            <div className="flex items-center justify-center py-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {[
                                        { id: 'home', label: 'Home' },
                                        { id: 'events', label: 'Events' },
                                        { id: 'pages', label: 'Resources' },
                                        { id: 'members', label: 'Members' },
                                        { id: 'products', label: 'Marketplace' },
                                        { id: 'challenges', label: 'Challenges' },
                                        { id: 'wallet', label: 'Wallet' },
                                        { id: 'records', label: 'My Records' },
                                        { id: 'profile', label: 'Profile' }
                                    ].find(item => item.id === activeSection)?.label || 'Home'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Mobile Sidebar */}
                <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <div className="flex flex-col h-full">
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                <div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{member.name}</div>
                                    {currentVisitor && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Welcome, {currentVisitor.firstName}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Sidebar Navigation */}
                        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                            {[
                                { id: 'home', label: 'Home', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                                { id: 'events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                                { id: 'pages', label: 'Resources', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                                { id: 'members', label: 'Members', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                                { id: 'products', label: 'Marketplace', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                                { id: 'challenges', label: 'Challenges', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                                { id: 'wallet', label: 'Wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                                { id: 'records', label: 'My Records', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                                { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleMenuClick(item.id)}
                                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                        activeSection === item.id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border-r-2 border-indigo-600 dark:border-indigo-400'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                                    }`}
                                >
                                    <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    <span className="truncate">{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        {/* Sidebar Footer */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
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
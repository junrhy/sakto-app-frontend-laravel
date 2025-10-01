import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import ChallengesSection from './Components/ChallengesSection';
import ContactsSection from './Components/ContactsSection';
import CoursesSection from './Components/CoursesSection';
import EventsSection from './Components/EventsSection';
import MyRecordsSection from './Components/MyRecordsSection';
import PagesSection from './Components/PagesSection';
import ProductsSection from './Components/ProductsSection';
import ProfileSection from './Components/ProfileSection';
import UpdatesSection from './Components/UpdatesSection';
import WalletSection from './Components/WalletSection';

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
    courses: any[];
    orderHistory: any[];
    appUrl: string;
}

export default function Member({
    member,
    challenges,
    events,
    pages,
    contacts,
    updates,
    products,
    courses,
    orderHistory,
    appUrl,
}: PageProps) {
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
        phone: '',
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
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Navigation groups for desktop
    const navigationGroups = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            items: [
                {
                    id: 'home',
                    label: 'Newsfeed',
                    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                },
                {
                    id: 'profile',
                    label: 'Profile',
                    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
                },
                {
                    id: 'records',
                    label: 'My Records',
                    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                },
            ],
        },
        {
            id: 'community',
            label: 'Community',
            items: [
                {
                    id: 'events',
                    label: 'Events',
                    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                },
                {
                    id: 'members',
                    label: 'Members',
                    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                },
                {
                    id: 'pages',
                    label: 'Resources',
                    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                },
            ],
        },
        {
            id: 'activities',
            label: 'Activities',
            items: [
                {
                    id: 'challenges',
                    label: 'Challenges',
                    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                },
                {
                    id: 'courses',
                    label: 'Courses',
                    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                },
            ],
        },
        {
            id: 'business',
            label: 'Business',
            items: [
                {
                    id: 'products',
                    label: 'Marketplace',
                    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
                },
                {
                    id: 'wallet',
                    label: 'Wallet',
                    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
                },
            ],
        },
    ];

    // Authorization check
    useEffect(() => {
        const checkAuthorization = () => {
            const authData = localStorage.getItem(`visitor_auth_${member.id}`);
            if (authData) {
                try {
                    const parsedData = JSON.parse(authData);
                    const {
                        isAuthorized: storedAuth,
                        timestamp,
                        memberId,
                        visitorInfo,
                    } = parsedData;
                    const today = new Date().toDateString();
                    const storedDate = new Date(timestamp).toDateString();

                    // Check if it's the same member and same day
                    if (
                        storedAuth &&
                        memberId === member.id &&
                        storedDate === today
                    ) {
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
        const matchingContact = Array.isArray(contacts)
            ? contacts.find((contact) => {
                  const emailMatch =
                      contact.email &&
                      contact.email.toLowerCase() ===
                          visitorInfo.email.toLowerCase();
                  const phoneMatch =
                      contact.call_number &&
                      contact.call_number === visitorInfo.phone;
                  return emailMatch && phoneMatch;
              })
            : null;

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
                    gender: matchingContact.gender,
                },
            };
            localStorage.setItem(
                `visitor_auth_${member.id}`,
                JSON.stringify(authData),
            );

            setIsAuthorized(true);
            setCurrentVisitor(authData.visitorInfo);
        } else {
            setError(
                'We could not find your information in our records. Please verify both your email and phone number are correct, or contact the administrator for access.',
            );
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
            phone: '',
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
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    email: signUpEmail,
                    member_id: member.id,
                    registration_url: `${appUrl}/contacts/self-registration?client_identifier=${member.identifier}`,
                }),
            });

            if (response.ok) {
                setSignUpSuccess(true);
                setSignUpEmail('');
            } else {
                const errorData = await response.json();
                setSignUpError(
                    errorData.message ||
                        'Failed to send signup link. Please try again.',
                );
            }
        } catch (error) {
            setSignUpError('Network error. Please try again.');
        }

        setIsSignUpSubmitting(false);
    };

    const handleMenuClick = (sectionId: string) => {
        setActiveSection(sectionId);
        setIsMobileMenuOpen(false); // Close mobile menu when item is clicked
        setOpenDropdown(null); // Close dropdown when item is clicked
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
        const numericPrice =
            typeof price === 'string' ? parseFloat(price) : price;
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
                return (
                    <EventsSection events={events} formatPrice={formatPrice} />
                );
            case 'pages':
                return <PagesSection pages={pages} />;
            case 'members':
                return <ContactsSection contacts={contacts} />;
            case 'products':
                return (
                    <ProductsSection
                        products={products}
                        appCurrency={member.app_currency}
                        member={member}
                        contactId={currentVisitor?.contactId}
                        orderHistory={orderHistory}
                    />
                );
            case 'challenges':
                return <ChallengesSection challenges={challenges} />;
            case 'courses':
                return (
                    <CoursesSection
                        member={member}
                        courses={courses}
                        contactId={currentVisitor?.contactId}
                    />
                );
            case 'wallet':
                return (
                    <WalletSection
                        member={member}
                        contactId={currentVisitor?.contactId}
                    />
                );
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
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
                            <div className="mb-8 text-center">
                                <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    Welcome to {member.name}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Please enter your information to access this
                                    app.
                                </p>
                            </div>

                            {!showSignUpForm ? (
                                <>
                                    <form
                                        onSubmit={handleVisitorSubmit}
                                        className="mx-auto max-w-md space-y-4"
                                    >
                                        <div>
                                            <label
                                                htmlFor="firstName"
                                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                value={visitorInfo.firstName}
                                                onChange={(e) =>
                                                    setVisitorInfo((prev) => ({
                                                        ...prev,
                                                        firstName:
                                                            e.target.value,
                                                    }))
                                                }
                                                required
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="middleName"
                                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Middle Name
                                            </label>
                                            <input
                                                type="text"
                                                id="middleName"
                                                value={visitorInfo.middleName}
                                                onChange={(e) =>
                                                    setVisitorInfo((prev) => ({
                                                        ...prev,
                                                        middleName:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="lastName"
                                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                value={visitorInfo.lastName}
                                                onChange={(e) =>
                                                    setVisitorInfo((prev) => ({
                                                        ...prev,
                                                        lastName:
                                                            e.target.value,
                                                    }))
                                                }
                                                required
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={visitorInfo.email}
                                                onChange={(e) =>
                                                    setVisitorInfo((prev) => ({
                                                        ...prev,
                                                        email: e.target.value,
                                                    }))
                                                }
                                                required
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="phone"
                                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Mobile Number
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                value={visitorInfo.phone}
                                                onChange={(e) =>
                                                    setVisitorInfo((prev) => ({
                                                        ...prev,
                                                        phone: e.target.value,
                                                    }))
                                                }
                                                required
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                            />
                                        </div>

                                        {error && (
                                            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                                        >
                                            {isSubmitting
                                                ? 'Verifying...'
                                                : 'Continue'}
                                        </button>
                                    </form>

                                    <div className="mt-6 text-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                    Or
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setShowSignUpForm(true)
                                            }
                                            className="mt-4 w-full rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {signUpSuccess ? (
                                        <div className="mx-auto max-w-md text-center">
                                            <div className="mb-4">
                                                <svg
                                                    className="mx-auto h-12 w-12 text-green-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                                                Check Your Email
                                            </h3>
                                            <p className="mb-6 text-gray-600 dark:text-gray-400">
                                                We've sent a registration link
                                                to your email address. Please
                                                check your inbox and click the
                                                link to complete your
                                                registration.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setShowSignUpForm(false);
                                                    setSignUpSuccess(false);
                                                }}
                                                className="w-full rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                                            >
                                                Back to Login
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mb-8 text-center">
                                                <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                                    Sign Up
                                                </h2>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    Enter your email to receive
                                                    a registration link.
                                                </p>
                                            </div>

                                            <form
                                                onSubmit={handleSignUpSubmit}
                                                className="mx-auto max-w-md space-y-4"
                                            >
                                                <div>
                                                    <label
                                                        htmlFor="signUpEmail"
                                                        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Email Address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="signUpEmail"
                                                        value={signUpEmail}
                                                        onChange={(e) =>
                                                            setSignUpEmail(
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                    />
                                                </div>

                                                {signUpError && (
                                                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                        {signUpError}
                                                    </div>
                                                )}

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        isSignUpSubmitting
                                                    }
                                                    className="w-full rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                                                >
                                                    {isSignUpSubmitting
                                                        ? 'Sending...'
                                                        : 'Send Registration Link'}
                                                </button>
                                            </form>

                                            <div className="mt-6 text-center">
                                                <button
                                                    onClick={() =>
                                                        setShowSignUpForm(false)
                                                    }
                                                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
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
                <div className="border-b border-indigo-700 bg-indigo-600 shadow-sm dark:border-indigo-600 dark:bg-indigo-800">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex min-w-0 flex-1 items-center">
                                {/* Mobile Menu Button */}
                                <button
                                    onClick={() =>
                                        setIsMobileMenuOpen(!isMobileMenuOpen)
                                    }
                                    className="mr-3 rounded-md p-2 text-white hover:bg-white hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        {isMobileMenuOpen ? (
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        ) : (
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 6h16M4 12h16M4 18h16"
                                            />
                                        )}
                                    </svg>
                                </button>

                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-lg font-bold text-white sm:text-xl">
                                        {member.name}
                                    </div>
                                    {currentVisitor && (
                                        <div className="truncate text-xs text-indigo-200 dark:text-indigo-300 sm:text-sm">
                                            Welcome, {currentVisitor.firstName}{' '}
                                            {currentVisitor.middleName
                                                ? `${currentVisitor.middleName} `
                                                : ''}
                                            {currentVisitor.lastName}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="ml-4 hidden flex-shrink-0 items-center space-x-3 md:flex">
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center rounded-lg border border-white px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-indigo-600 dark:border-indigo-300 dark:text-indigo-300 dark:hover:bg-indigo-700 dark:hover:text-white sm:px-4"
                                >
                                    <svg
                                        className="mr-1 h-4 w-4 sm:mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    <span className="hidden sm:inline">
                                        Logout
                                    </span>
                                    <span className="sm:hidden">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Desktop Navigation */}
                        <nav className="hidden space-x-8 md:flex">
                            {navigationGroups.map((group) => (
                                <div key={group.id} className="relative">
                                    <button
                                        onClick={() =>
                                            setOpenDropdown(
                                                openDropdown === group.id
                                                    ? null
                                                    : group.id,
                                            )
                                        }
                                        className={`flex items-center whitespace-nowrap border-b-2 px-3 py-4 text-sm font-medium transition-colors ${
                                            group.items.some(
                                                (item) =>
                                                    activeSection === item.id,
                                            )
                                                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                                : 'border-transparent text-gray-500 hover:border-indigo-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:border-indigo-400 dark:hover:text-indigo-400'
                                        }`}
                                    >
                                        {group.label}
                                        <svg
                                            className="ml-1 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>

                                    {openDropdown === group.id && (
                                        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                            <div className="py-2">
                                                {group.items.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() =>
                                                            handleMenuClick(
                                                                item.id,
                                                            )
                                                        }
                                                        className={`flex w-full items-center px-4 py-3 text-sm font-medium transition-colors ${
                                                            activeSection ===
                                                            item.id
                                                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                                                        }`}
                                                    >
                                                        <svg
                                                            className="mr-3 h-5 w-5 flex-shrink-0"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d={item.icon}
                                                            />
                                                        </svg>
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Mobile Navigation */}
                        <div className="md:hidden">
                            <div className="flex items-center justify-center py-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {[
                                        { id: 'home', label: 'Newsfeed' },
                                        { id: 'events', label: 'Events' },
                                        { id: 'pages', label: 'Resources' },
                                        { id: 'members', label: 'Members' },
                                        {
                                            id: 'products',
                                            label: 'Marketplace',
                                        },
                                        {
                                            id: 'challenges',
                                            label: 'Challenges',
                                        },
                                        { id: 'courses', label: 'Courses' },
                                        { id: 'wallet', label: 'Wallet' },
                                        { id: 'records', label: 'My Records' },
                                        { id: 'profile', label: 'Profile' },
                                    ].find((item) => item.id === activeSection)
                                        ?.label || 'Home'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Click outside to close dropdown */}
                {openDropdown && (
                    <div
                        className="fixed inset-0 z-40 md:hidden"
                        onClick={() => setOpenDropdown(null)}
                    />
                )}

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Mobile Sidebar */}
                <div
                    className={`fixed inset-y-0 left-0 z-50 w-full transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-gray-800 md:hidden ${
                        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex h-full flex-col">
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                            <div className="flex items-center">
                                <div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {member.name}
                                    </div>
                                    {currentVisitor && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Welcome, {currentVisitor.firstName}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-400"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Sidebar Navigation */}
                        <nav className="flex-1 overflow-y-auto px-4 py-6">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    {
                                        id: 'home',
                                        label: 'Newsfeed',
                                        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                                    },
                                    {
                                        id: 'events',
                                        label: 'Events',
                                        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                                    },
                                    {
                                        id: 'pages',
                                        label: 'Resources',
                                        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                                    },
                                    {
                                        id: 'members',
                                        label: 'Members',
                                        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                                    },
                                    {
                                        id: 'products',
                                        label: 'Marketplace',
                                        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
                                    },
                                    {
                                        id: 'challenges',
                                        label: 'Challenges',
                                        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                                    },
                                    {
                                        id: 'courses',
                                        label: 'Courses',
                                        icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                                    },
                                    {
                                        id: 'wallet',
                                        label: 'Wallet',
                                        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
                                    },
                                    {
                                        id: 'records',
                                        label: 'My Records',
                                        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                                    },
                                    {
                                        id: 'profile',
                                        label: 'Profile',
                                        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
                                    },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleMenuClick(item.id)}
                                        className={`flex flex-col items-center justify-center rounded-lg px-3 py-4 text-sm font-medium transition-colors ${
                                            activeSection === item.id
                                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                                        }`}
                                    >
                                        <svg
                                            className="mb-2 h-6 w-6 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d={item.icon}
                                            />
                                        </svg>
                                        <span className="text-center text-xs">
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </nav>

                        {/* Sidebar Footer */}
                        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                            <button
                                onClick={handleLogout}
                                className="mb-3 flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                                <svg
                                    className="mr-2 h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                                Logout
                            </button>
                            <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    © {new Date().getFullYear()} {member.name}.
                                    All rights reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {renderContent()}
                </div>
            </div>

            {/* Toast Notifications */}
            <Toaster position="top-right" richColors />
        </>
    );
}

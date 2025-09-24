import ApplicationLogo from '@/Components/ApplicationLogo';
import { ThemeProvider, useTheme } from '@/Components/ThemeProvider';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/Components/ui/accordion';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import {
    ArrowRightStartOnRectangleIcon,
    CreditCardIcon,
    HomeIcon,
    QuestionMarkCircleIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { Link as InertiaLink } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
// @ts-ignore

interface Props {
    auth: {
        user: {
            name: string;
            credits?: number;
            identifier?: string;
        };
        project: {
            enabledModules: string[];
            identifier: string;
        };
        modules: string[];
        teamMembers: Array<{
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        }>;
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        } | null;
    };
}

interface Subscription {
    plan: {
        name: string;
        unlimited_access: boolean;
        slug: string;
    };
    end_date: string;
}

const defaultFAQItems = [
    {
        question: 'How do I get started?',
        answer: "After logging in, you'll be taken to your home dashboard where you can see all available apps. Simply click on any app to start using it.",
    },
    {
        question: 'Is my data secure?',
        answer: 'Yes, we take security seriously. All data is encrypted and stored securely following industry best practices.',
    },
    {
        question: 'How can I change my account settings?',
        answer: "Click on your profile picture in the top right corner and select 'Settings' to manage your account preferences.",
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept major credit cards, E-Wallets, and bank transfers. Payment options may vary by region.',
    },
];

export default function Help({ auth }: Props) {
    const { theme, setTheme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFAQs, setFilteredFAQs] = useState(defaultFAQItems);
    const [credits, setCredits] = useState<number>(auth.user.credits ?? 0);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoadingSubscription, setIsLoadingSubscription] =
        useState<boolean>(true);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                if (auth.user.identifier) {
                    const response = await fetch(
                        `/credits/${auth.user.identifier}/balance`,
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setCredits(data.available_credit);
                    }
                }
            } catch (error) {
                // Silently ignore credit fetch errors
                setCredits(0);
            }
        };

        const fetchSubscription = async () => {
            try {
                if (auth.user.identifier) {
                    setIsLoadingSubscription(true);
                    const response = await fetch(
                        `/subscriptions/${auth.user.identifier}/active`,
                    );
                    if (response.ok) {
                        const data = await response.json();
                        if (data.active) {
                            setSubscription(data.subscription);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch subscription:', error);
            } finally {
                setIsLoadingSubscription(false);
            }
        };

        fetchCredits();
        fetchSubscription();
    }, [auth.user.identifier]);

    const formatNumber = (num: number | undefined | null) => {
        return num?.toLocaleString() ?? '0';
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        const filtered = defaultFAQItems.filter(
            (item) =>
                item.question.toLowerCase().includes(term.toLowerCase()) ||
                item.answer.toLowerCase().includes(term.toLowerCase()),
        );
        setFilteredFAQs(filtered);
    };

    return (
        <ThemeProvider>
            <div className="relative min-h-screen bg-gray-50 pb-16 dark:bg-gray-900">
                {/* Message for users without subscription */}
                {!isLoadingSubscription && !subscription && (
                    <div className="fixed left-0 right-0 top-0 z-20 bg-gradient-to-r from-blue-600 to-indigo-600 py-1 text-center text-sm text-white shadow-lg dark:from-blue-700 dark:to-indigo-700">
                        <span className="font-medium">
                            Subscribe to a plan to continue using all features!
                        </span>
                        <Button
                            variant="link"
                            size="sm"
                            className="ml-2 h-auto p-0 text-white underline hover:text-blue-100 dark:hover:text-blue-200"
                            onClick={() =>
                                (window.location.href = route(
                                    'subscriptions.index',
                                ))
                            }
                        >
                            View Plans
                        </Button>
                    </div>
                )}

                <div
                    className={`fixed ${!isLoadingSubscription && !subscription ? 'top-7' : 'top-0'} left-0 z-10 w-full border-b border-gray-200 bg-white/95 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/95 dark:shadow-black/20`}
                >
                    <div className="container mx-auto px-4 pt-4">
                        <div className="mb-4 flex flex-col items-center">
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="flex items-center">
                                    <ApplicationLogo className="h-10 w-auto fill-current text-gray-900 dark:text-white" />
                                    <div className="ml-2">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                                            {auth.user.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="hidden items-center sm:flex">
                                        <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    (window.location.href =
                                                        route(
                                                            'credits.spent-history',
                                                            {
                                                                clientIdentifier:
                                                                    auth.user
                                                                        .identifier,
                                                            },
                                                        ))
                                                }
                                                className="rounded-l-lg rounded-r-none border-r border-gray-200 px-3 py-1.5 text-gray-900 transition-colors duration-200 hover:bg-gray-200 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                                            >
                                                <span className="text-sm font-medium">
                                                    {formatNumber(credits)}{' '}
                                                    Credits
                                                </span>
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="flex items-center gap-1.5 rounded-l-none rounded-r-lg border-0 bg-gradient-to-r from-orange-400 to-orange-500 font-semibold text-white shadow-lg transition-all duration-200 [text-shadow:_0_1px_1px_rgba(0,0,0,0.2)] hover:from-orange-500 hover:to-orange-600 hover:shadow-xl dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700"
                                                onClick={() =>
                                                    (window.location.href =
                                                        route('credits.buy'))
                                                }
                                            >
                                                <CreditCardIcon className="h-4 w-4" />
                                                Buy
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Mobile Credits Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white hover:bg-white/10 hover:text-blue-100 sm:hidden"
                                        onClick={() =>
                                            (window.location.href =
                                                route('credits.buy'))
                                        }
                                    >
                                        <CreditCardIcon className="h-5 w-5" />
                                    </Button>
                                    <div className="relative inline-block">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="flex h-auto items-center gap-2 border-0 px-3 py-2 font-normal text-gray-900 no-underline transition-colors duration-200 hover:bg-white/10 hover:text-blue-900 hover:no-underline focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-white"
                                                >
                                                    <UserIcon className="h-5 w-5" />
                                                    <span>
                                                        {auth.selectedTeamMember
                                                            ?.full_name ||
                                                            auth.user.name}
                                                    </span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                alignOffset={0}
                                                sideOffset={8}
                                                className="z-50 w-56 border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:shadow-black/30"
                                                onCloseAutoFocus={(e) =>
                                                    e.preventDefault()
                                                }
                                                collisionPadding={16}
                                            >
                                                <DropdownMenuItem>
                                                    <HomeIcon className="mr-2 h-5 w-5" />
                                                    <InertiaLink
                                                        href={route('home')}
                                                        className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                                    >
                                                        Home
                                                    </InertiaLink>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem>
                                                    <QuestionMarkCircleIcon className="mr-2 h-5 w-5" />
                                                    <InertiaLink
                                                        href="/help"
                                                        className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                                    >
                                                        Help
                                                    </InertiaLink>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <ArrowRightStartOnRectangleIcon className="mr-2 h-5 w-5" />
                                                    <InertiaLink
                                                        href={route('logout')}
                                                        method="post"
                                                        as="button"
                                                        className="w-full text-left text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                                    >
                                                        Logout
                                                    </InertiaLink>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`w-full px-4 ${!isLoadingSubscription && !subscription ? 'pt-[120px]' : 'pt-[100px]'} md:pt-[100px] landscape:pt-[80px]`}
                >
                    <div className="py-8 md:py-12">
                        <div className="mx-auto max-w-4xl">
                            {/* Hero Section */}
                            <div className="mb-12 text-center">
                                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                                    <QuestionMarkCircleIcon className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-gray-900 text-transparent dark:from-white dark:to-gray-300 dark:text-white md:text-4xl">
                                    How can we help you?
                                </h1>
                                <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                                    Find answers to common questions and get the
                                    support you need
                                </p>
                            </div>

                            {/* Search Section */}
                            <div className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800/30 dark:from-blue-900/20 dark:to-indigo-900/20">
                                <div className="relative mx-auto max-w-2xl">
                                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                                    <Input
                                        placeholder="Search for answers..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            handleSearch(e.target.value)
                                        }
                                        className="w-full rounded-xl border-2 border-blue-200 bg-white py-4 pl-12 pr-4 text-lg text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-blue-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                                    />
                                </div>
                                {searchTerm && (
                                    <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Found {filteredFAQs.length} result
                                        {filteredFAQs.length !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>

                            {/* FAQ Section */}
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-2xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/95 dark:shadow-black/30">
                                <div className="p-6 md:p-8">
                                    <div className="mb-6 flex items-center">
                                        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                                            <svg
                                                className="h-4 w-4 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Frequently Asked Questions
                                        </h2>
                                    </div>

                                    <Accordion
                                        type="single"
                                        collapsible
                                        className="w-full space-y-3"
                                    >
                                        {filteredFAQs.map((item, index) => (
                                            <AccordionItem
                                                key={index}
                                                value={`item-${index}`}
                                                className="overflow-hidden rounded-xl border-2 border-gray-100 transition-all duration-300 hover:border-blue-200 hover:shadow-lg dark:border-gray-700 dark:hover:border-blue-700 dark:hover:shadow-blue-500/10"
                                            >
                                                <AccordionTrigger className="group rounded-xl px-6 py-4 text-left transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20">
                                                    <span className="font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                                        {item.question}
                                                    </span>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-6 pb-4">
                                                    <div className="rounded-lg border-l-4 border-blue-500 bg-gray-50 p-4 leading-relaxed text-gray-600 dark:border-blue-400 dark:bg-gray-700/50 dark:text-gray-300">
                                                        {item.answer}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>

                                    {filteredFAQs.length === 0 &&
                                        searchTerm && (
                                            <div className="py-12 text-center">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                                    <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                                                    No results found
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    Try adjusting your search
                                                    terms or browse our FAQ
                                                    categories
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* Contact Section */}
                            <div className="mt-8 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:border-purple-800/30 dark:from-purple-900/20 dark:to-pink-900/20 md:p-8">
                                <div className="mb-6 flex items-center">
                                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                                        <svg
                                            className="h-4 w-4 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Still need help?
                                    </h2>
                                </div>

                                <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-300">
                                    Our support team is here to help you 24/7.
                                    Don't hesitate to reach out if you need
                                    assistance.
                                </p>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="group rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-black/20">
                                        <div className="mb-3 flex items-center">
                                            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 transition-transform duration-200 group-hover:scale-110">
                                                <svg
                                                    className="h-5 w-5 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                Email Support
                                            </h3>
                                        </div>
                                        <a
                                            href="mailto:jrcrodua@gmail.com"
                                            className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            jrcrodua@gmail.com
                                        </a>
                                    </div>

                                    <div className="group rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-black/20">
                                        <div className="mb-3 flex items-center">
                                            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 transition-transform duration-200 group-hover:scale-110">
                                                <svg
                                                    className="h-5 w-5 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                Phone Support
                                            </h3>
                                        </div>
                                        <a
                                            href="tel:+639260049848"
                                            className="font-medium text-green-600 transition-colors duration-200 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                        >
                                            +639260049848
                                        </a>
                                    </div>

                                    <div className="group rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-black/20">
                                        <div className="mb-3 flex items-center">
                                            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 transition-transform duration-200 group-hover:scale-110">
                                                <svg
                                                    className="h-5 w-5 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                Live Chat
                                            </h3>
                                        </div>
                                        <span className="font-medium text-purple-600 dark:text-purple-400">
                                            Available 24/7
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}

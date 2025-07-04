import { Head, Link as InertiaLink } from '@inertiajs/react';
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/Components/ui/accordion";
import { Input } from "@/Components/ui/input";
import { Search } from "lucide-react";
import ApplicationLogo from '@/Components/ApplicationLogo';
import { ThemeProvider, useTheme } from "@/Components/ThemeProvider";
import { Button } from '@/Components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/Components/ui/dropdown-menu";
import { QuestionMarkCircleIcon, ArrowRightStartOnRectangleIcon, UserIcon, CreditCardIcon, SparklesIcon } from '@heroicons/react/24/outline';
// @ts-ignore
import { Sun, Moon, Monitor } from 'lucide-react';
import BottomNav from '@/Components/BottomNav';

interface Props {
    auth: {
        user: {
            name: string;
            credits?: number;
            identifier?: string;
        };
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
        question: "What is Sakto?",
        answer: "Sakto is a comprehensive business management platform that offers various applications to help you manage different aspects of your business efficiently."
    },
    {
        question: "How do I get started?",
        answer: "After logging in, you'll be taken to your home dashboard where you can see all available apps. Simply click on any app to start using it."
    },
    {
        question: "Is my data secure?",
        answer: "Yes, we take security seriously. All data is encrypted and stored securely following industry best practices."
    },
    {
        question: "How can I change my account settings?",
        answer: "Click on your profile picture in the top right corner and select 'Settings' to manage your account preferences."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept major credit cards, PayPal, and bank transfers. Payment options may vary by region."
    }
];

export default function Help({ auth }: Props) {
    const { theme, setTheme } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredFAQs, setFilteredFAQs] = useState(defaultFAQItems);
    const [credits, setCredits] = useState<number>(auth.user.credits ?? 0);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoadingSubscription, setIsLoadingSubscription] = useState<boolean>(true);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                if (auth.user.identifier) {
                    const response = await fetch(`/credits/${auth.user.identifier}/balance`);
                    if (response.ok) {
                        const data = await response.json();
                        setCredits(data.available_credit);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch credits:', error);
            }
        };

        const fetchSubscription = async () => {
            try {
                if (auth.user.identifier) {
                    setIsLoadingSubscription(true);
                    const response = await fetch(`/subscriptions/${auth.user.identifier}/active`);
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
        const filtered = defaultFAQItems.filter(item => 
            item.question.toLowerCase().includes(term.toLowerCase()) || 
            item.answer.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredFAQs(filtered);
    };
    
    return (
        <ThemeProvider>
            <div className="relative min-h-screen pb-16 bg-gray-50 dark:bg-gray-900">
                {/* Message for users without subscription */}
                {!isLoadingSubscription && !subscription && (
                    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 z-20 py-1 text-center text-white text-sm">
                        <div className="container mx-auto px-4 flex items-center justify-center flex-wrap gap-2">
                            <span className="font-medium">Upgrade to a subscription plan for premium access to all features!</span>
                            <Button 
                                variant="link" 
                                size="sm" 
                                className="text-white underline p-0 h-auto"
                                onClick={() => window.location.href = route('subscriptions.index')}
                            >
                                View Plans
                            </Button>
                        </div>
                    </div>
                )}
                
                <div className={`fixed ${!isLoadingSubscription && !subscription ? 'top-7' : 'top-0'} left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/80 z-10 shadow-sm`}>
                    <div className="container mx-auto px-4 pt-4">
                        <div className="flex flex-col items-center">
                            <div className="w-full flex justify-between items-center mb-6">
                                <div className="flex items-center">
                                    <ApplicationLogo className="h-10 w-auto fill-current text-gray-900 dark:text-white" />
                                    <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Sakto</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="hidden sm:flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.location.href = route('credits.spent-history', { clientIdentifier: auth.user.identifier })}
                                            className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                                        >
                                            <span className="text-sm font-medium">{formatNumber(credits)} Credits</span>
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1.5 font-semibold border-0 [text-shadow:_0_1px_1px_rgba(0,0,0,0.2)]"
                                            onClick={() => window.location.href = route('credits.buy')}
                                        >
                                            <CreditCardIcon className="w-4 h-4" />
                                            Buy Credits
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1.5 font-semibold border-0 [text-shadow:_0_1px_1px_rgba(0,0,0,0.2)]"
                                            onClick={() => window.location.href = route('subscriptions.index')}
                                        >
                                            <SparklesIcon className="w-4 h-4" />
                                            Subscriptions
                                        </Button>
                                    </div>
                                    {/* Mobile Credits Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="sm:hidden text-white hover:text-blue-100 hover:bg-white/10"
                                        onClick={() => window.location.href = route('credits.buy')}
                                    >
                                        <CreditCardIcon className="w-5 h-5" />
                                    </Button>
                                    <div className="relative inline-block">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    className="text-gray-900 dark:text-white hover:text-blue-900 hover:bg-white/10 transition-colors duration-200 flex items-center gap-2 px-3 py-2 h-auto font-normal border-0 no-underline hover:no-underline focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                                                >
                                                    <UserIcon className="w-5 h-5" />
                                                    <span>{auth.user.name}</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent 
                                                align="end" 
                                                alignOffset={0}
                                                sideOffset={8}
                                                className="w-56 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                                onCloseAutoFocus={(e) => e.preventDefault()}
                                                collisionPadding={16}
                                            >
                                                <DropdownMenuItem asChild>
                                                    <InertiaLink 
                                                        href={route('help')}
                                                        className="flex items-center text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                                                        <span>Help</span>
                                                    </InertiaLink>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" />
                                                    <InertiaLink 
                                                        href={route('logout')} 
                                                        method="post" 
                                                        as="button"
                                                        className="w-full text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
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

                <div className="max-w-7xl mx-auto pt-[100px]">
                    <div className="p-4 mb-16 rounded-lg">
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Frequently Asked Questions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 flex items-center">
                                    <Search className="mr-2 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search FAQs..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <Accordion type="single" collapsible className="w-full">
                                    {filteredFAQs.map((item, index) => (
                                        <AccordionItem key={index} value={`item-${index}`}>
                                            <AccordionTrigger>{item.question}</AccordionTrigger>
                                            <AccordionContent>{item.answer}</AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Need More Help?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>If you couldn't find the answer to your question in our FAQ, please don't hesitate to contact our support team:</p>
                                <ul className="list-disc list-inside mt-2">
                                    <li>Email: jrcrodua@gmail.com</li>
                                    <li>Phone: +639260049848</li>
                                    <li>Live Chat: Available 24/7 on our website</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <BottomNav />
            </div>
        </ThemeProvider>
    );
}

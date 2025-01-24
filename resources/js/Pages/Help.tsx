import { Head, Link as InertiaLink } from '@inertiajs/react';
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/Components/ui/accordion";
import { Input } from "@/Components/ui/input";
import { Search } from "lucide-react";
import ApplicationLogo from '@/Components/ApplicationLogo';
import { ThemeProvider, useTheme } from "@/Components/ThemeProvider";
import { Button } from '@/Components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/Components/ui/dropdown-menu";
import { QuestionMarkCircleIcon, ArrowRightStartOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline';
// @ts-ignore
import { Sun, Moon, Monitor } from 'lucide-react';
import BottomNav from '@/Components/BottomNav';

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
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
            <div className="relative min-h-screen pb-16 bg-white dark:bg-gray-900">
                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-10">
                    <div className="container mx-auto px-4 pt-4">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-full flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                    <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                                    <span className="ml-2 text-xl font-bold text-white">Sakto</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative inline-block">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    className="text-white hover:text-blue-100 hover:bg-white/10 transition-colors duration-200 flex items-center gap-2 px-3 py-2 h-auto font-normal border-0 no-underline hover:no-underline focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                                                >
                                                    <UserIcon className="w-5 h-5" />
                                                    <span>{auth.user.name}</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent 
                                                align="end" 
                                                alignOffset={0}
                                                sideOffset={8}
                                                className="w-56 z-50"
                                                onCloseAutoFocus={(e) => e.preventDefault()}
                                                collisionPadding={16}
                                            >
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger className="flex items-center">
                                                        {theme === 'dark' ? (
                                                            <Moon className="h-4 w-4 mr-2" />
                                                        ) : (
                                                            <Sun className="h-4 w-4 mr-2" />
                                                        )}
                                                        <span>Theme</span>
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem 
                                                            onClick={() => setTheme("light")}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Sun className="mr-2 h-4 w-4" />
                                                            <span>Light</span>
                                                            {theme === "light" && <span className="ml-auto">✓</span>}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => setTheme("dark")}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Moon className="mr-2 h-4 w-4" />
                                                            <span>Dark</span>
                                                            {theme === "dark" && <span className="ml-auto">✓</span>}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => setTheme("system")}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <Monitor className="mr-2 h-4 w-4" />
                                                            <span>System</span>
                                                            {theme === "system" && <span className="ml-auto">✓</span>}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                <DropdownMenuItem asChild>
                                                    <InertiaLink 
                                                        href={route('help')}
                                                        className="flex items-center"
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
                                                        className="w-full text-left"
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

                <div className="max-w-7xl mx-auto pt-32">
                    <div className="p-4 mb-16 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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

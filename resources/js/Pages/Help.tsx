import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link as InertiaLink } from '@inertiajs/react';
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/Components/ui/accordion";
import { Input } from "@/Components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import ApplicationLogo from '@/Components/ApplicationLogo';

interface FAQItem {
    question: string;
    answer: string;
}

interface Props {
    faqItems: FAQItem[];
}

export default function Help({ faqItems }: Props) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredFAQs, setFilteredFAQs] = useState(faqItems);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        const filtered = faqItems.filter(item => 
            item.question.toLowerCase().includes(term.toLowerCase()) || 
            item.answer.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredFAQs(filtered);
    };
    
    return (
        <div className="relative min-h-screen pb-16">
            <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-black via-gray-900 to-black z-10">
                <div className="container mx-auto px-4 pt-4">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-full flex justify-between items-center mb-2">
                            <div className="flex items-center">
                                <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                                <span className="ml-2 text-xl font-bold text-white">Sakto</span>
                                <InertiaLink 
                                    href="/home" 
                                    className="ml-4 text-white hover:text-blue-100 transition-colors duration-200"
                                >
                                    <ArrowLeft className="h-4 w-4 inline mr-1" />
                                    Back to Home
                                </InertiaLink>
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
                            <li>Email: support@sakto.app</li>
                            <li>Live Chat: Available 24/7 on our website</li>
                        </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

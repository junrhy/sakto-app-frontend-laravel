import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/Components/ui/accordion";
import { Input } from "@/Components/ui/input";
import { Search } from "lucide-react";
import BottomNav from '@/Components/BottomNav';

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
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Help
                </h2>
            }
        >
            <Head title="Help" />

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
            
            <BottomNav />
        </AuthenticatedLayout>
    );
}

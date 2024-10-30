import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/Components/ui/accordion";
import { Input } from "@/Components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/Components/ui/button";

interface FAQItem {
    question: string;
    answer: string;
  }
  
const faqItems: FAQItem[] = [
    {
      question: "How do I add a new product to the inventory?",
      answer: "To add a new product, go to the Inventory page, click on the 'Add New Product' button, fill in the product details in the form that appears, and click 'Add Product'."
    },
    {
      question: "How can I process a refund?",
      answer: "To process a refund, go to the POS page, look up the original transaction, click on the 'Refund' button, select the items to be refunded, and confirm the refund amount."
    },
    {
      question: "How do I generate a sales report?",
      answer: "To generate a sales report, navigate to the Reports section, select the date range for your report, choose the type of report you want (e.g., daily sales, product performance), and click 'Generate Report'."
    },
    {
      question: "How can I update the price of a product?",
      answer: "To update a product's price, go to the Inventory page, find the product you want to update, click the 'Edit' button, change the price in the form that appears, and click 'Update Product'."
    },
    {
      question: "How do I set up a new user account?",
      answer: "To set up a new user account, go to the Settings page, click on 'User Management', then 'Add New User'. Fill in the new user's details, assign their role and permissions, and click 'Create User'."
    },
    {
      question: "How can I view the order history for a specific customer?",
      answer: "To view a customer's order history, go to the Customers page, search for the specific customer, click on their name to open their profile, and scroll down to the 'Order History' section."
    },
    {
      question: "How do I apply a discount to a sale?",
      answer: "During a sale in the POS system, you can apply a discount by clicking the 'Apply Discount' button, choosing either a percentage or fixed amount discount, entering the discount value, and confirming the application to the current sale."
    },
    {
      question: "How can I track my inventory levels?",
      answer: "Inventory levels are automatically tracked in the Inventory page. You can set up low stock alerts in the Settings to receive notifications when products fall below a certain quantity."
    }
];

export default function Help() {
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

            <div className="py-0">
                <div className="">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800 border-2">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
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
                                    <li>Email: support@posandinventory.com</li>
                                    <li>Phone: 1-800-123-4567</li>
                                    <li>Live Chat: Available 24/7 on our website</li>
                                </ul>
                                </CardContent>
                            </Card>
                            
                            {/* Add this class to all buttons */}
                            <Button className="bg-gray-700 hover:bg-gray-600 text-white">
                                Sample Help Button
                            </Button>
                            {/* Add more content and buttons as needed */}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

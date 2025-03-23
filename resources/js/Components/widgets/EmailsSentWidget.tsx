import { Card, CardContent } from "@/Components/ui/card";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Mail, Send, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Progress } from "@/Components/ui/progress";

interface SentEmail {
    id: number;
    to: string;
    subject: string;
    date: string;
    status: 'sent' | 'delivered' | 'pending' | 'failed';
}

export function EmailsSentWidget() {
    // This would typically come from your API
    const sentEmails: SentEmail[] = [
        {
            id: 1,
            to: "john@example.com",
            subject: "Project Update",
            date: "10:30 AM",
            status: 'delivered'
        },
        {
            id: 2,
            to: "jane@example.com",
            subject: "Meeting Tomorrow",
            date: "9:15 AM",
            status: 'sent'
        },
        {
            id: 3,
            to: "team@example.com",
            subject: "Weekly Report",
            date: "Yesterday",
            status: 'pending'
        },
        {
            id: 4,
            to: "client@example.com",
            subject: "Proposal Review",
            date: "Yesterday",
            status: 'failed'
        }
    ];

    // Calculate statistics
    const total = sentEmails.length;
    const delivered = sentEmails.filter(email => email.status === 'delivered').length;
    const pending = sentEmails.filter(email => email.status === 'pending').length;
    const failed = sentEmails.filter(email => email.status === 'failed').length;
    const deliveryRate = (delivered / total) * 100;

    const getStatusIcon = (status: SentEmail['status']) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'sent':
                return <Send className="h-4 w-4 text-blue-500" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'failed':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Sent Emails</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Delivery Rate:</span>
                    <span className="text-sm font-medium">{deliveryRate.toFixed(1)}%</span>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Delivered</span>
                            </div>
                            <span className="text-sm font-medium">{delivered}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">Pending</span>
                            </div>
                            <span className="text-sm font-medium">{pending}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Send className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">Sent</span>
                            </div>
                            <span className="text-sm font-medium">{sentEmails.filter(email => email.status === 'sent').length}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-sm">Failed</span>
                            </div>
                            <span className="text-sm font-medium">{failed}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delivery Rate Progress */}
            <div className="mb-6">
                <Progress value={deliveryRate} className="h-2" />
            </div>

            {/* Recent Sent Emails */}
            <ScrollArea className="h-[calc(100%-20rem)]">
                <div className="space-y-4">
                    {sentEmails.map((email) => (
                        <Card key={email.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        {getStatusIcon(email.status)}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium truncate">{email.to}</span>
                                            <span className="text-sm text-gray-500">{email.date}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mt-2">{email.subject}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
} 
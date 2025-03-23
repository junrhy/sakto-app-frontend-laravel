import { Card, CardContent } from "@/Components/ui/card";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { MessageSquare, CheckCircle2, XCircle, CreditCard, TrendingUp, Clock } from "lucide-react";
import { Progress } from "@/Components/ui/progress";

interface SmsMessage {
    id: string;
    to: string;
    message: string;
    status: 'sent' | 'delivered' | 'failed';
    sent_at: string;
    delivered_at?: string;
    error_message?: string;
}

interface SmsOverview {
    total_sent: number;
    delivered: number;
    failed: number;
    balance: number;
    delivery_rate: number;
    recent_messages: SmsMessage[];
}

export function SmsStatsWidget() {
    // This would typically come from your API
    const overview: SmsOverview = {
        total_sent: 150,
        delivered: 145,
        failed: 5,
        balance: 1000,
        delivery_rate: 96.67,
        recent_messages: [
            {
                id: "1",
                to: "+639123456789",
                message: "Your verification code is: 123456",
                status: "delivered",
                sent_at: "2024-03-20T10:30:00",
                delivered_at: "2024-03-20T10:30:05"
            },
            {
                id: "2",
                to: "+639987654321",
                message: "Your appointment is confirmed for tomorrow",
                status: "sent",
                sent_at: "2024-03-20T10:25:00"
            },
            {
                id: "3",
                to: "+639111222333",
                message: "Payment received. Thank you!",
                status: "failed",
                sent_at: "2024-03-20T10:20:00",
                error_message: "Invalid phone number"
            }
        ]
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">SMS Overview</h3>
                <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-500">Balance:</span>
                    <span className="text-sm font-medium">₱{overview.balance.toLocaleString()}</span>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">Total Sent</span>
                            </div>
                            <span className="text-sm font-medium">{overview.total_sent}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Delivered</span>
                            </div>
                            <span className="text-sm font-medium">{overview.delivered}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-sm">Failed</span>
                            </div>
                            <span className="text-sm font-medium">{overview.failed}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-orange-500" />
                                <span className="text-sm">Delivery Rate</span>
                            </div>
                            <span className="text-sm font-medium">{overview.delivery_rate}%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delivery Rate Progress */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Delivery Rate</span>
                    <span className="text-sm text-gray-500">{overview.delivery_rate}%</span>
                </div>
                <Progress value={overview.delivery_rate} className="h-2" />
            </div>

            {/* Recent Messages */}
            <ScrollArea className="h-[calc(100%-20rem)]">
                <div className="space-y-4">
                    {overview.recent_messages.map((message) => (
                        <Card key={message.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <MessageSquare className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium truncate">
                                                {message.to}
                                            </span>
                                            <span className={`text-sm px-2 py-1 rounded-full ${
                                                message.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                message.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mt-2">
                                            {message.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Clock className="h-3 w-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">
                                                {new Date(message.sent_at).toLocaleString()}
                                            </span>
                                            {message.delivered_at && (
                                                <>
                                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                    <span className="text-xs text-green-500">
                                                        Delivered: {new Date(message.delivered_at).toLocaleString()}
                                                    </span>
                                                </>
                                            )}
                                            {message.error_message && (
                                                <span className="text-xs text-red-500">
                                                    {message.error_message}
                                                </span>
                                            )}
                                        </div>
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
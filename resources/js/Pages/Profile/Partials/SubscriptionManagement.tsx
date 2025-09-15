import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Receipt } from 'lucide-react';
import UpdateSubscriptionForm from './UpdateSubscriptionForm';
import IndividualAppSubscriptions from './IndividualAppSubscriptions';

interface SubscriptionManagementProps {
    userIdentifier: string;
}

export default function SubscriptionManagement({ userIdentifier }: SubscriptionManagementProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Subscription Management
                    </CardTitle>
                    <CardDescription>
                        Manage your subscription plans and billing information.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UpdateSubscriptionForm 
                        userIdentifier={userIdentifier}
                        className="w-full" 
                        hideHeader={true}
                    />
                </CardContent>
            </Card>

            {/* Individual App Subscriptions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        Individual App Subscriptions
                    </CardTitle>
                    <CardDescription>
                        Manage your individual app purchases and subscriptions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <IndividualAppSubscriptions />
                </CardContent>
            </Card>
        </div>
    );
}

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Receipt } from 'lucide-react';
import MonthlyBillingView from './MonthlyBillingView';

export default function BillingHistory() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Billing History
                    </CardTitle>
                    <CardDescription>
                        View your app purchases and subscription billing
                        history.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MonthlyBillingView />
                </CardContent>
            </Card>
        </div>
    );
}

import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Coins, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';

interface App {
    id?: number;
    identifier?: string;
    title: string;
    credits: number;
    pricingType: 'free' | 'one-time' | 'subscription';
    description: string;
    icon?: JSX.Element;
    route?: string;
    bgColor?: string;
    visible?: boolean;
    rating?: number;
    categories?: string[];
    comingSoon?: boolean;
    includedInPlans?: string[];
    order?: number;
    isActive?: boolean;
    isInSubscription?: boolean;
    isUserAdded?: boolean;
    isAvailable?: boolean;
    paymentStatus?: string;
    billingType?: string;
    nextBillingDate?: string;
    cancelledAt?: string;
}

interface MultiAppPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedApps: App[];
    onConfirm: (paymentMethod: string, autoRenew: boolean) => void;
    isLoading?: boolean;
    userCredits?: number;
    onRemoveApp?: (app: App) => void;
}

export default function MultiAppPaymentModal({
    isOpen,
    onClose,
    selectedApps,
    onConfirm,
    isLoading = false,
    userCredits = 0,
    onRemoveApp,
}: MultiAppPaymentModalProps) {
    const [paymentMethod] = useState<string>('credits');
    const [autoRenew, setAutoRenew] = useState<boolean>(true);

    if (!selectedApps || selectedApps.length === 0) return null;

    const handleConfirm = () => {
        onConfirm(paymentMethod, autoRenew);
    };

    const formatCredits = (credits: number) => {
        return `${new Intl.NumberFormat('en-US').format(credits)} credits`;
    };

    const getPricingDescription = (pricingType: string) => {
        switch (pricingType) {
            case 'one-time':
                return 'One-time payment';
            case 'subscription':
                return 'Monthly subscription';
            default:
                return 'Free';
        }
    };

    // Calculate totals
    const freeApps = selectedApps.filter(
        (app) => app.pricingType === 'free' || app.credits === 0,
    );
    const paidApps = selectedApps.filter(
        (app) => app.pricingType !== 'free' && app.credits > 0,
    );
    const totalAmount = paidApps.reduce((sum, app) => sum + app.credits, 0);
    const hasSubscription = paidApps.some(
        (app) => app.pricingType === 'subscription',
    );

    const handleRemoveApp = (app: App) => {
        if (onRemoveApp) {
            onRemoveApp(app);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Checkout ({selectedApps.length} app
                        {selectedApps.length !== 1 ? 's' : ''})
                    </DialogTitle>
                    <DialogDescription>
                        Review your selected apps and complete your purchase
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Selected Apps List */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">
                            Selected Apps
                        </Label>
                        <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border p-3">
                            {selectedApps.map((app, index) => (
                                <div
                                    key={app.identifier || index}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                                >
                                    <div className="flex flex-1 items-center gap-3">
                                        {app.icon && (
                                            <div className="flex h-8 w-8 items-center justify-center text-lg">
                                                {app.icon}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {app.title}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {getPricingDescription(
                                                    app.pricingType,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {app.credits > 0 ? (
                                            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                {formatCredits(app.credits)}
                                            </span>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="bg-green-100 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                            >
                                                Free
                                            </Badge>
                                        )}
                                        {onRemoveApp && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleRemoveApp(app)
                                                }
                                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Credits Summary */}
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <div className="space-y-2">
                            {freeApps.length > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>Free apps ({freeApps.length})</span>
                                    <span className="text-green-600 dark:text-green-400">
                                        Free
                                    </span>
                                </div>
                            )}
                            {paidApps.length > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>Paid apps ({paidApps.length})</span>
                                    <span>{formatCredits(totalAmount)}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span className="text-lg text-orange-600 dark:text-orange-400">
                                        {formatCredits(totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">
                            Payment Method
                        </Label>
                        <div className="flex items-center space-x-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                            <Coins className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <div className="flex-1">
                                <p className="font-medium text-blue-900 dark:text-blue-100">
                                    Credits Payment
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Pay using your account credits
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Available: {userCredits.toLocaleString()}{' '}
                                    credits
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Auto-renewal for subscriptions */}
                    {hasSubscription && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="auto-renew"
                                checked={autoRenew}
                                onCheckedChange={(checked) =>
                                    setAutoRenew(checked as boolean)
                                }
                            />
                            <Label htmlFor="auto-renew" className="text-sm">
                                Auto-renew monthly subscriptions
                            </Label>
                        </div>
                    )}

                    {/* Payment Terms */}
                    <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <p>
                            • Credits will be deducted immediately upon
                            confirmation
                        </p>
                        <p>
                            • Make sure you have sufficient credits in your
                            account
                        </p>
                        {hasSubscription && (
                            <p>
                                • Subscriptions will renew automatically each
                                month
                            </p>
                        )}
                        <p>• You can cancel your subscriptions at any time</p>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={
                            isLoading ||
                            (paidApps.length > 0 && userCredits < totalAmount)
                        }
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        {isLoading
                            ? 'Processing...'
                            : `Pay ${formatCredits(totalAmount)}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

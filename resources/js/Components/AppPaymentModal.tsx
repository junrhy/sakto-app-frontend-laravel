import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Checkbox } from '@/Components/ui/checkbox';
import { Coins } from 'lucide-react';

interface App {
    id?: number;
    identifier?: string;
    title: string;
    price: number;
    pricingType: 'free' | 'one-time' | 'subscription';
    description: string;
}

interface AppPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    app: App | null;
    onConfirm: (paymentMethod: string, autoRenew: boolean) => void;
    isLoading?: boolean;
    userCredits?: number;
}

export default function AppPaymentModal({ isOpen, onClose, app, onConfirm, isLoading = false, userCredits = 0 }: AppPaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<string>('credits');
    const [autoRenew, setAutoRenew] = useState<boolean>(true);

    if (!app) return null;

    const handleConfirm = () => {
        onConfirm(paymentMethod, autoRenew);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    const getPricingDescription = () => {
        switch (app.pricingType) {
            case 'one-time':
                return 'One-time payment';
            case 'subscription':
                return 'Monthly subscription';
            default:
                return 'Free';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Purchase {app.title}</DialogTitle>
                    <DialogDescription>
                        {app.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Pricing Information */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">{app.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{getPricingDescription()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {formatPrice(app.price)}
                                </p>
                                {app.pricingType === 'subscription' && (
                                    <p className="text-xs text-gray-500">per month</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Payment Method</Label>
                        <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <Coins className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <div className="flex-1">
                                <p className="font-medium text-blue-900 dark:text-blue-100">Credits Payment</p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">Pay using your account credits</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Available: {userCredits.toLocaleString()} credits
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Auto-renewal for subscriptions */}
                    {app.pricingType === 'subscription' && (
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="auto-renew" 
                                checked={autoRenew} 
                                onCheckedChange={(checked) => setAutoRenew(checked as boolean)}
                            />
                            <Label htmlFor="auto-renew" className="text-sm">
                                Auto-renew monthly subscription
                            </Label>
                        </div>
                    )}

                    {/* Payment Terms */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <p>• Credits will be deducted immediately upon confirmation</p>
                        <p>• Make sure you have sufficient credits in your account</p>
                        {app.pricingType === 'subscription' && (
                            <p>• Subscription will renew automatically each month</p>
                        )}
                        <p>• You can cancel your subscription at any time</p>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirm} 
                        disabled={isLoading}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        {isLoading ? 'Processing...' : `Pay ${formatPrice(app.price)} with Credits`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import React from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { toast } from 'sonner';

interface Contribution {
    id: string;
    member_id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number: string;
    created_at?: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contribution: Contribution | null;
    appCurrency: {
        code: string;
        symbol: string;
    };
    onContributionUpdated: (contribution: Contribution) => void;
}

export default function EditContributionDialog({ open, onOpenChange, contribution, appCurrency, onContributionUpdated }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        amount: '',
        payment_date: '',
        payment_method: '',
        reference_number: '',
    });

    // Reset form when contribution changes
    React.useEffect(() => {
        if (contribution) {
            setData({
                amount: contribution.amount.toString(),
                payment_date: contribution.payment_date,
                payment_method: contribution.payment_method,
                reference_number: contribution.reference_number,
            });
        }
    }, [contribution]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('mortuary.contributions.update', { 
            memberId: contribution?.member_id, 
            contributionId: contribution?.id 
        }), {
            onSuccess: () => {
                toast.success('Contribution updated successfully');
                onOpenChange(false);
                reset();
            },
            onError: () => {
                toast.error('Failed to update contribution');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Contribution</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            placeholder={`Enter amount in ${appCurrency.code}`}
                        />
                        {errors.amount && (
                            <p className="text-sm text-red-500">{errors.amount}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="payment_date">Payment Date</Label>
                        <Input
                            id="payment_date"
                            type="date"
                            value={data.payment_date}
                            onChange={(e) => setData('payment_date', e.target.value)}
                        />
                        {errors.payment_date && (
                            <p className="text-sm text-red-500">{errors.payment_date}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="payment_method">Payment Method</Label>
                        <Select
                            value={data.payment_method}
                            onValueChange={(value) => setData('payment_method', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="credit_card">Credit Card</SelectItem>
                                <SelectItem value="debit_card">Debit Card</SelectItem>
                                <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.payment_method && (
                            <p className="text-sm text-red-500">{errors.payment_method}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="reference_number">Reference Number</Label>
                        <Input
                            id="reference_number"
                            value={data.reference_number}
                            onChange={(e) => setData('reference_number', e.target.value)}
                            placeholder="Enter reference number"
                        />
                        {errors.reference_number && (
                            <p className="text-sm text-red-500">{errors.reference_number}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Update Contribution
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 
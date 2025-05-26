import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

interface Member {
    id: string;
    name: string;
}

interface Contribution {
    id: string;
    member_id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    members: Member[];
    appCurrency: {
        code: string;
        symbol: string;
    };
    onContributionAdded: (contribution: Contribution) => void;
}

export default function AddContributionDialog({ open, onOpenChange, members, appCurrency, onContributionAdded }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        member_id: '',
        amount: '',
        payment_date: '',
        payment_method: '',
        reference_number: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('health-insurance.contributions.store', { memberId: data.member_id }), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Record Contribution</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="member_id">Member</Label>
                        <Select
                            value={data.member_id}
                            onValueChange={(value) => setData('member_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                            <SelectContent>
                                {members.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {member.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.member_id && (
                            <p className="text-sm text-red-500">{errors.member_id}</p>
                        )}
                    </div>

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
                                <SelectItem value="check">Check</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
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
                            type="text"
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
                            Record Contribution
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 
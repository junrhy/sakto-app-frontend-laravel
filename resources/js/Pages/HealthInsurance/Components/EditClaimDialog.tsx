import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';

interface Member {
    id: string;
    name: string;
}

interface Claim {
    id: string;
    member_id: string;
    claim_type: string;
    amount: number | string;
    date_of_service: string;
    hospital_name: string;
    diagnosis: string;
    status: string;
}

interface Props {
    claim: Claim;
    members: Member[];
    appCurrency: {
        code: string;
        symbol: string;
    };
    onClose: () => void;
}

export default function EditClaimDialog({ claim, members, appCurrency, onClose }: Props) {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const { data, setData, put, processing, errors } = useForm({
        member_id: claim.member_id,
        claim_type: claim.claim_type,
        amount: claim.amount,
        date_of_service: claim.date_of_service,
        hospital_name: claim.hospital_name,
        diagnosis: claim.diagnosis,
        status: claim.status,
    });

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!data.claim_type) {
            errors.claim_type = 'Claim type is required';
        }

        if (!data.amount || Number(data.amount) <= 0) {
            errors.amount = 'Amount must be greater than 0';
        }

        if (!data.date_of_service) {
            errors.date_of_service = 'Date of service is required';
        }

        if (!data.hospital_name.trim()) {
            errors.hospital_name = 'Hospital name is required';
        }

        if (!data.diagnosis.trim()) {
            errors.diagnosis = 'Diagnosis is required';
        }

        if (!data.status) {
            errors.status = 'Status is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Format data before submitting
        const formData = {
            claim_type: data.claim_type,
            amount: parseFloat(data.amount.toString()),
            date_of_service: data.date_of_service.split('T')[0],
            hospital_name: data.hospital_name,
            diagnosis: data.diagnosis,
            status: data.status
        };

        console.log('Submitting form data:', formData);

        put(`/health-insurance/claims/${claim.member_id}/${claim.id}`, {
            data: formData,
            onSuccess: () => {
                toast.success('Claim updated successfully');
                onClose();
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error('Failed to update claim');
            },
        });
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Claim</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="member_id">Member</Label>
                        <Input
                            id="member_id"
                            value={members.find(m => m.id === claim.member_id)?.name || ''}
                            readOnly
                        />
                    </div>

                    <div>
                        <Label htmlFor="claim_type">Claim Type</Label>
                        <Select
                            value={data.claim_type}
                            onValueChange={(value) => {
                                setData('claim_type', value);
                                setValidationErrors(prev => ({ ...prev, claim_type: '' }));
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select claim type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hospitalization">Hospitalization</SelectItem>
                                <SelectItem value="outpatient">Outpatient</SelectItem>
                                <SelectItem value="dental">Dental</SelectItem>
                                <SelectItem value="optical">Optical</SelectItem>
                            </SelectContent>
                        </Select>
                        {(errors.claim_type || validationErrors.claim_type) && (
                            <p className="text-sm text-red-500">{errors.claim_type || validationErrors.claim_type}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="amount">Amount {appCurrency.code}</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => {
                                setData('amount', e.target.value);
                                setValidationErrors(prev => ({ ...prev, amount: '' }));
                            }}
                        />
                        {(errors.amount || validationErrors.amount) && (
                            <p className="text-sm text-red-500">{errors.amount || validationErrors.amount}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="date_of_service">Date of Service</Label>
                        <Input
                            id="date_of_service"
                            type="date"
                            value={data.date_of_service}
                            onChange={(e) => {
                                setData('date_of_service', e.target.value);
                                setValidationErrors(prev => ({ ...prev, date_of_service: '' }));
                            }}
                        />
                        {(errors.date_of_service || validationErrors.date_of_service) && (
                            <p className="text-sm text-red-500">{errors.date_of_service || validationErrors.date_of_service}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="hospital_name">Hospital Name</Label>
                        <Input
                            id="hospital_name"
                            value={data.hospital_name}
                            onChange={(e) => {
                                setData('hospital_name', e.target.value);
                                setValidationErrors(prev => ({ ...prev, hospital_name: '' }));
                            }}
                        />
                        {(errors.hospital_name || validationErrors.hospital_name) && (
                            <p className="text-sm text-red-500">{errors.hospital_name || validationErrors.hospital_name}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="diagnosis">Diagnosis</Label>
                        <Textarea
                            id="diagnosis"
                            value={data.diagnosis}
                            onChange={(e) => {
                                setData('diagnosis', e.target.value);
                                setValidationErrors(prev => ({ ...prev, diagnosis: '' }));
                            }}
                        />
                        {(errors.diagnosis || validationErrors.diagnosis) && (
                            <p className="text-sm text-red-500">{errors.diagnosis || validationErrors.diagnosis}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={data.status}
                            onValueChange={(value) => {
                                setData('status', value);
                                setValidationErrors(prev => ({ ...prev, status: '' }));
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                        {(errors.status || validationErrors.status) && (
                            <p className="text-sm text-red-500">{errors.status || validationErrors.status}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 
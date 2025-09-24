import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Member {
    id: string;
    name: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onClaimSubmitted: (claim: any) => void;
    members: Member[];
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function SubmitClaimDialog({
    isOpen,
    onClose,
    onClaimSubmitted,
    members,
    appCurrency,
}: Props) {
    const [formData, setFormData] = useState({
        member_id: '',
        claim_type: '',
        amount: '',
        date_of_death: '',
        deceased_name: '',
        relationship_to_member: '',
        cause_of_death: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (!formData.member_id) return;
        router.post(`/mortuary/claims/${formData.member_id}`, formData, {
            onSuccess: () => {
                setFormData({
                    member_id: '',
                    claim_type: '',
                    amount: '',
                    date_of_death: '',
                    deceased_name: '',
                    relationship_to_member: '',
                    cause_of_death: '',
                });
                onClose();
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="mx-4 max-w-[95vw] sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Submit Claim</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="member_id">Member</Label>
                        <Select
                            value={formData.member_id}
                            onValueChange={(value) =>
                                handleInputChange('member_id', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                            <SelectContent>
                                {members.map((member) => (
                                    <SelectItem
                                        key={member.id}
                                        value={member.id}
                                    >
                                        {member.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="claim_type">Claim Type</Label>
                        <Select
                            value={formData.claim_type}
                            onValueChange={(value) =>
                                handleInputChange('claim_type', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select claim type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="funeral_service">
                                    Funeral Service
                                </SelectItem>
                                <SelectItem value="burial_plot">
                                    Burial Plot
                                </SelectItem>
                                <SelectItem value="transportation">
                                    Transportation
                                </SelectItem>
                                <SelectItem value="memorial_service">
                                    Memorial Service
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="amount">
                            Amount ({appCurrency.symbol})
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.amount}
                            onChange={(e) =>
                                handleInputChange('amount', e.target.value)
                            }
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="date_of_death">Date of Death</Label>
                        <Input
                            id="date_of_death"
                            type="date"
                            value={formData.date_of_death}
                            onChange={(e) =>
                                handleInputChange(
                                    'date_of_death',
                                    e.target.value,
                                )
                            }
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="deceased_name">Deceased Name</Label>
                        <Input
                            id="deceased_name"
                            value={formData.deceased_name}
                            onChange={(e) =>
                                handleInputChange(
                                    'deceased_name',
                                    e.target.value,
                                )
                            }
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="relationship_to_member">
                            Relationship to Member
                        </Label>
                        <Input
                            id="relationship_to_member"
                            value={formData.relationship_to_member}
                            onChange={(e) =>
                                handleInputChange(
                                    'relationship_to_member',
                                    e.target.value,
                                )
                            }
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="cause_of_death">
                            Cause of Death (Optional)
                        </Label>
                        <Textarea
                            id="cause_of_death"
                            value={formData.cause_of_death}
                            onChange={(e) =>
                                handleInputChange(
                                    'cause_of_death',
                                    e.target.value,
                                )
                            }
                        />
                    </div>
                    <div className="flex flex-col justify-end gap-2 pt-4 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

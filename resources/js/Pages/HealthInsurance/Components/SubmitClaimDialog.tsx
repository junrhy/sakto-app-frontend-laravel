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
import { Textarea } from '@/Components/ui/textarea';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';

interface Member {
    id: string;
    name: string;
}

interface Claim {
    id: string;
    member_id: string;
    claim_type: string;
    amount: number;
    date_of_service: string;
    hospital_name: string;
    diagnosis: string;
    status: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    members: Member[];
    appCurrency: {
        code: string;
        symbol: string;
    };
    onClaimSubmitted: (claim: Claim) => void;
}

export default function SubmitClaimDialog({ open, onOpenChange, members, appCurrency, onClaimSubmitted }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        member_id: '',
        claim_type: '',
        amount: '',
        date_of_service: '',
        hospital_name: '',
        diagnosis: '',
    });

    const [searchQuery, setSearchQuery] = useState('');
    const filteredMembers = members.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [openMemberPopover, setOpenMemberPopover] = useState(false);
    const selectedMember = members.find((member) => member.id === data.member_id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('health-insurance.claims.store', { memberId: data.member_id }), {
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
                    <DialogTitle>Submit Claim</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="member_id">Member</Label>
                        <Popover open={openMemberPopover} onOpenChange={setOpenMemberPopover}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openMemberPopover}
                                    className="w-full justify-between"
                                    onClick={() => setOpenMemberPopover((open) => !open)}
                                >
                                    {selectedMember ? selectedMember.name : 'Select member'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent 
                                className="p-0 w-[var(--radix-popover-trigger-width)] z-50"
                                sideOffset={4}
                            >
                                <div className="p-2">
                                    <Input
                                        placeholder="Search member..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                        }}
                                        className="mb-2"
                                    />
                                    <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                                        {filteredMembers.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground">No members found</div>
                                        ) : (
                                            filteredMembers.map((member) => (
                                                <div
                                                    key={member.id}
                                                    onClick={() => {
                                                        setData('member_id', member.id);
                                                        setOpenMemberPopover(false);
                                                        setSearchQuery(''); // Clear search after selection
                                                    }}
                                                    className="p-2 hover:bg-accent cursor-pointer rounded-sm"
                                                >
                                                    {member.name}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        {errors.member_id && (
                            <p className="text-sm text-red-500">{errors.member_id}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="claim_type">Claim Type</Label>
                        <Select
                            value={data.claim_type}
                            onValueChange={(value) => setData('claim_type', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select claim type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hospitalization">Hospitalization</SelectItem>
                                <SelectItem value="outpatient">Outpatient</SelectItem>
                                <SelectItem value="dental">Dental</SelectItem>
                                <SelectItem value="optical">Optical</SelectItem>
                                <SelectItem value="prescription">Prescription</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.claim_type && (
                            <p className="text-sm text-red-500">{errors.claim_type}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            placeholder={`Enter amount`}
                        />
                        {errors.amount && (
                            <p className="text-sm text-red-500">{errors.amount}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="date_of_service">Date of Service</Label>
                        <Input
                            id="date_of_service"
                            type="date"
                            value={data.date_of_service}
                            onChange={(e) => setData('date_of_service', e.target.value)}
                        />
                        {errors.date_of_service && (
                            <p className="text-sm text-red-500">{errors.date_of_service}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="hospital_name">Hospital/Clinic Name</Label>
                        <Input
                            id="hospital_name"
                            type="text"
                            value={data.hospital_name}
                            onChange={(e) => setData('hospital_name', e.target.value)}
                            placeholder="Enter hospital or clinic name"
                        />
                        {errors.hospital_name && (
                            <p className="text-sm text-red-500">{errors.hospital_name}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="diagnosis">Diagnosis</Label>
                        <Textarea
                            id="diagnosis"
                            value={data.diagnosis}
                            onChange={(e) => setData('diagnosis', e.target.value)}
                            placeholder="Enter diagnosis details"
                        />
                        {errors.diagnosis && (
                            <p className="text-sm text-red-500">{errors.diagnosis}</p>
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
                            Submit Claim
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 
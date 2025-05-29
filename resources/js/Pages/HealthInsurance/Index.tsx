import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import MembersList from './Components/MembersList';
import ContributionsList from './Components/ContributionsList';
import ClaimsList from './Components/ClaimsList';
import MissingContributionsList from './Components/MissingContributionsList';
import UpcomingContributionsList from './Components/UpcomingContributionsList';
import { Button } from '@/Components/ui/button';
import { Plus } from 'lucide-react';
import AddMemberDialog from './Components/AddMemberDialog';
import AddContributionDialog from './Components/AddContributionDialog';
import SubmitClaimDialog from './Components/SubmitClaimDialog';
import EditMemberDialog from './Components/EditMemberDialog';

interface Member {
    id: string;
    name: string;
    date_of_birth: string;
    gender: string;
    contact_number: string;
    address: string;
    membership_start_date: string;
    contribution_amount: number;
    contribution_frequency: string;
    status: string;
}

interface Contribution {
    id: string;
    member_id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number: string;
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

interface Props extends PageProps {
    initialMembers: Member[];
    initialContributions: Contribution[];
    initialClaims: Claim[];
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function HealthInsurance({ auth, initialMembers, initialContributions, initialClaims, appCurrency }: Props) {
    const { url } = usePage();
    const [members, setMembers] = useState<Member[]>(initialMembers);
    const [contributions, setContributions] = useState<Contribution[]>(initialContributions);
    const [claims, setClaims] = useState<Claim[]>(initialClaims);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);
    const [isSubmitClaimOpen, setIsSubmitClaimOpen] = useState(false);
    const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('tab') || 'members';
    });

    const handleTabChange = (value: string) => {
        if (value !== activeTab) {
            setActiveTab(value);
            router.get(
                window.location.pathname,
                { tab: value },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }
    };

    const handleAddMember = (newMember: Member) => {
        setMembers([...members, newMember]);
    };

    const handleAddContribution = (newContribution: Contribution) => {
        setContributions([...contributions, newContribution]);
    };

    const handleSubmitClaim = (newClaim: Claim) => {
        setClaims([...claims, newClaim]);
    };

    const handleMemberSelect = (member: Member) => {
        setSelectedMember(member);
        setIsEditMemberOpen(true);
    };

    const handleMemberUpdate = (updatedMember: Member) => {
        setMembers(members.map(member => 
            member.id === updatedMember.id ? updatedMember : member
        ));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Health Insurance</h2>}
        >
            <Head title="Health Insurance" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <CardTitle>Health Insurance Management</CardTitle>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                <Button onClick={() => setIsAddMemberOpen(true)} className="flex-1 sm:flex-none">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Member
                                </Button>
                                <Button onClick={() => setIsAddContributionOpen(true)} className="flex-1 sm:flex-none">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Record Contribution
                                </Button>
                                <Button onClick={() => setIsSubmitClaimOpen(true)} className="flex-1 sm:flex-none">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Submit Claim
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs 
                                value={activeTab} 
                                onValueChange={handleTabChange}
                                className="w-full"
                            >
                                <div className="overflow-x-auto">
                                    <TabsList className="w-full sm:w-auto">
                                        <TabsTrigger value="members">Members</TabsTrigger>
                                        <TabsTrigger value="contributions">Contributions</TabsTrigger>
                                        <TabsTrigger value="claims">Claims</TabsTrigger>
                                        <TabsTrigger value="missing">Missing Contributions</TabsTrigger>
                                        <TabsTrigger value="upcoming">Upcoming Contributions</TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="members">
                                    <MembersList 
                                        members={members} 
                                        onMemberSelect={handleMemberSelect}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>
                                <TabsContent value="contributions">
                                    <ContributionsList 
                                        contributions={contributions}
                                        members={members}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>
                                <TabsContent value="claims">
                                    <ClaimsList 
                                        claims={claims}
                                        members={members}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>
                                <TabsContent value="missing">
                                    <MissingContributionsList 
                                        members={members}
                                        contributions={contributions}
                                        appCurrency={appCurrency}
                                        onContributionAdded={handleAddContribution}
                                    />
                                </TabsContent>
                                <TabsContent value="upcoming">
                                    <UpcomingContributionsList 
                                        members={members}
                                        contributions={contributions}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AddMemberDialog
                open={isAddMemberOpen}
                onOpenChange={setIsAddMemberOpen}
                onMemberAdded={handleAddMember}
            />

            <AddContributionDialog
                open={isAddContributionOpen}
                onOpenChange={setIsAddContributionOpen}
                members={members}
                appCurrency={appCurrency}
                onContributionAdded={handleAddContribution}
            />

            <SubmitClaimDialog
                open={isSubmitClaimOpen}
                onOpenChange={setIsSubmitClaimOpen}
                members={members}
                appCurrency={appCurrency}
                onClaimSubmitted={handleSubmitClaim}
            />

            <EditMemberDialog
                open={isEditMemberOpen}
                onOpenChange={setIsEditMemberOpen}
                member={selectedMember}
                onMemberUpdated={handleMemberUpdate}
            />
        </AuthenticatedLayout>
    );
} 
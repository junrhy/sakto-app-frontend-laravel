import { User, Project } from '@/types/index';
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
import GroupContributionsList from './Components/GroupContributionsList';
import { Button } from '@/Components/ui/button';
import { Plus } from 'lucide-react';
import AddMemberDialog from './Components/AddMemberDialog';
import AddContributionDialog from './Components/AddContributionDialog';
import BulkContributionDialog from './Components/BulkContributionDialog';
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
    group: string;
    total_contribution: number;
    total_claims_amount: number;
    net_balance: number;
    contributions: Contribution[];
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
    date_of_death: string;
    deceased_name: string;
    relationship_to_member: string;
    cause_of_death: string;
    status: string;
}

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
    };
    initialMembers: (Member & {
        contributions: Contribution[];
    })[];
    initialContributions: Contribution[];
    initialClaims: Claim[];
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function Mortuary({ auth, initialMembers, initialContributions, initialClaims, appCurrency }: Props) {
    const { url } = usePage();
    const [members, setMembers] = useState<Member[]>(initialMembers.map(member => ({
        ...member,
        total_contribution: member.contributions.reduce((sum, contribution) => sum + Number(contribution.amount), 0),
        total_claims_amount: initialClaims
            .filter(claim => claim.member_id === member.id)
            .reduce((sum, claim) => sum + Number(claim.amount), 0),
        net_balance: member.contributions.reduce((sum, contribution) => sum + Number(contribution.amount), 0) -
            initialClaims
                .filter(claim => claim.member_id === member.id)
                .reduce((sum, claim) => sum + Number(claim.amount), 0)
    })));
    const [contributions, setContributions] = useState<Contribution[]>(initialContributions);
    const [claims, setClaims] = useState<Claim[]>(initialClaims);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);
    const [isBulkContributionOpen, setIsBulkContributionOpen] = useState(false);
    const [isSubmitClaimOpen, setIsSubmitClaimOpen] = useState(false);
    const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<(Member & { contributions: Contribution[] }) | null>(null);
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

    const handleAddMember = (newMember: Member & { contributions: Contribution[] }) => {
        setMembers([...members, {
            ...newMember,
            total_contribution: newMember.contributions.reduce((sum, contribution) => sum + Number(contribution.amount), 0),
            total_claims_amount: initialClaims
                .filter(claim => claim.member_id === newMember.id)
                .reduce((sum, claim) => sum + Number(claim.amount), 0),
            net_balance: newMember.contributions.reduce((sum, contribution) => sum + Number(contribution.amount), 0) -
                initialClaims
                    .filter(claim => claim.member_id === newMember.id)
                    .reduce((sum, claim) => sum + Number(claim.amount), 0)
        }]);
    };

    const handleAddContribution = (newContribution: Contribution) => {
        setContributions([...contributions, newContribution]);
        // Update the member's total contribution
        setMembers(members.map(member => {
            if (member.id === newContribution.member_id) {
                return {
                    ...member,
                    total_contribution: member.total_contribution + Number(newContribution.amount)
                };
            }
            return member;
        }));
    };

    const handleBulkContributionsAdded = (newContributions: Contribution[]) => {
        setContributions([...contributions, ...newContributions]);
        // Update each member's total contribution
        setMembers(members.map(member => {
            const memberContributions = newContributions.filter(c => c.member_id === member.id);
            if (memberContributions.length > 0) {
                const totalAdded = memberContributions.reduce((sum, c) => sum + Number(c.amount), 0);
                return {
                    ...member,
                    total_contribution: member.total_contribution + totalAdded
                };
            }
            return member;
        }));
    };

    const handleSubmitClaim = (newClaim: Claim) => {
        setClaims([...claims, newClaim]);
        // Update the member's total claims amount and net balance
        setMembers(members.map(member => {
            if (member.id === newClaim.member_id) {
                const newTotalClaimsAmount = member.total_claims_amount + Number(newClaim.amount);
                return {
                    ...member,
                    total_claims_amount: newTotalClaimsAmount,
                    net_balance: member.total_contribution - newTotalClaimsAmount
                };
            }
            return member;
        }));
    };

    const handleMemberSelect = (member: Member) => {
        setSelectedMember(member);
        setIsEditMemberOpen(true);
    };

    const handleMemberUpdate = (updatedMember: Member & { contributions: Contribution[] }) => {
        setMembers(members.map(member => 
            member.id === updatedMember.id ? {
                ...updatedMember,
                total_contribution: updatedMember.contributions.reduce((sum, contribution) => sum + Number(contribution.amount), 0)
            } : member
        ));
    };

    return (
        <AuthenticatedLayout
            auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Mortuary</h2>}
        >
            <Head title="Mortuary" />

            <div className="py-6">
                <div className="max-w-[90rem] mx-auto sm:px-6 lg:px-8">
                    <Card className="shadow-lg border-0 dark:bg-gray-900 dark:border-gray-700">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50 border-b dark:border-gray-700">
                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mortuary Management</CardTitle>
                            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                                <Button 
                                    onClick={() => setIsAddMemberOpen(true)} 
                                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Member
                                </Button>
                                <Button 
                                    onClick={() => setIsAddContributionOpen(true)} 
                                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Single Contribution
                                </Button>
                                <Button 
                                    onClick={() => setIsBulkContributionOpen(true)} 
                                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Bulk Contributions
                                </Button>
                                <Button 
                                    onClick={() => setIsSubmitClaimOpen(true)} 
                                    className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Submit Claim
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                                <div className="overflow-x-auto">
                                    <TabsList className="grid w-full grid-cols-6 min-w-[600px] bg-gray-100 dark:bg-gray-800">
                                        <TabsTrigger value="members" className="text-xs sm:text-sm">Members</TabsTrigger>
                                        <TabsTrigger value="contributions" className="text-xs sm:text-sm">Contributions</TabsTrigger>
                                        <TabsTrigger value="claims" className="text-xs sm:text-sm">Claims</TabsTrigger>
                                        <TabsTrigger value="missing" className="text-xs sm:text-sm">Missing</TabsTrigger>
                                        <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming</TabsTrigger>
                                        <TabsTrigger value="groups" className="text-xs sm:text-sm">Groups</TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="members" className="p-3 sm:p-6">
                                    <MembersList 
                                        members={members} 
                                        onMemberSelect={handleMemberSelect}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>

                                <TabsContent value="contributions" className="p-3 sm:p-6">
                                    <ContributionsList 
                                        contributions={contributions}
                                        members={members}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>

                                <TabsContent value="claims" className="p-3 sm:p-6">
                                    <ClaimsList 
                                        claims={claims}
                                        members={members}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>

                                <TabsContent value="missing" className="p-3 sm:p-6">
                                    <MissingContributionsList 
                                        members={members}
                                        contributions={contributions}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>

                                <TabsContent value="upcoming" className="p-3 sm:p-6">
                                    <UpcomingContributionsList 
                                        members={members}
                                        contributions={contributions}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>

                                <TabsContent value="groups" className="p-3 sm:p-6">
                                    <GroupContributionsList 
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

            {/* Dialogs */}
            <AddMemberDialog 
                isOpen={isAddMemberOpen}
                onClose={() => setIsAddMemberOpen(false)}
                onMemberAdded={handleAddMember}
                appCurrency={appCurrency}
            />

            <AddContributionDialog 
                isOpen={isAddContributionOpen}
                onClose={() => setIsAddContributionOpen(false)}
                onContributionAdded={handleAddContribution}
                members={members}
                appCurrency={appCurrency}
            />

            <BulkContributionDialog
                open={isBulkContributionOpen}
                onOpenChange={setIsBulkContributionOpen}
                members={members}
                appCurrency={appCurrency}
                onContributionsAdded={handleBulkContributionsAdded}
            />

            <SubmitClaimDialog 
                isOpen={isSubmitClaimOpen}
                onClose={() => setIsSubmitClaimOpen(false)}
                onClaimSubmitted={handleSubmitClaim}
                members={members}
                appCurrency={appCurrency}
            />

            {selectedMember && (
                <EditMemberDialog 
                    isOpen={isEditMemberOpen}
                    onClose={() => setIsEditMemberOpen(false)}
                    onMemberUpdated={handleMemberUpdate}
                    member={selectedMember}
                    appCurrency={appCurrency}
                />
            )}
        </AuthenticatedLayout>
    );
} 
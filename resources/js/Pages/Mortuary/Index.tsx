import { User, Project } from '@/types/index';
import { useState, useEffect, useMemo } from 'react';
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
    created_at?: string;
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
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
    initialMembers: (Member & {
        contributions: (Omit<Contribution, 'created_at'> & { created_at?: string })[];
    })[];
    initialContributions: (Omit<Contribution, 'created_at'> & { created_at?: string })[];
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
        contributions: member.contributions.map(contribution => ({
            ...contribution,
            created_at: contribution.created_at || new Date().toISOString()
        })),
        total_contribution: member.contributions.reduce((sum, contribution) => sum + Number(contribution.amount), 0),
        total_claims_amount: initialClaims
            .filter(claim => claim.member_id === member.id)
            .reduce((sum, claim) => sum + Number(claim.amount), 0),
        net_balance: member.contributions.reduce((sum, contribution) => sum + Number(contribution.amount), 0) -
            initialClaims
                .filter(claim => claim.member_id === member.id)
                .reduce((sum, claim) => sum + Number(claim.amount), 0)
    })));
    const [contributions, setContributions] = useState<Contribution[]>(initialContributions.map(contribution => ({
        ...contribution,
        created_at: contribution.created_at || new Date().toISOString()
    })));
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

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager') || auth.selectedTeamMember.roles.includes('user');
        }
        return auth.user.is_admin || false;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager');
        }
        return auth.user.is_admin || false;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

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

    const handleAddContribution = (newContribution: Omit<Contribution, 'created_at'>) => {
        const contributionWithTimestamp: Contribution = {
            ...newContribution,
            created_at: new Date().toISOString()
        };
        setContributions([...contributions, contributionWithTimestamp]);
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

    const handleBulkContributionsAdded = (newContributions: Omit<Contribution, 'created_at'>[]) => {
        const contributionsWithTimestamp: Contribution[] = newContributions.map(contribution => ({
            ...contribution,
            created_at: new Date().toISOString()
        }));
        setContributions([...contributions, ...contributionsWithTimestamp]);
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

    const handleMemberSelect = (member: Member & { contributions: Contribution[] }) => {
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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Mortuary Management</h2>}
        >
            <Head title="Mortuary" />

            <div className="py-0">
                <div className="w-full mx-auto sm:px-6 lg:px-0">
                    <Card className="shadow-xl border-0 dark:bg-gray-950 dark:border-gray-800 bg-white">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">Records</CardTitle>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                {activeTab === 'members' && (
                                    <Button 
                                        onClick={() => setIsAddMemberOpen(true)} 
                                        size="sm"
                                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md text-sm px-3 py-1.5"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                                        Add Member
                                    </Button>
                                )}
                                {activeTab === 'contributions' && (
                                    <>
                                        <Button 
                                            onClick={() => {
                                                console.log('Button clicked, setting isAddContributionOpen to true');
                                                setIsAddContributionOpen(true);
                                            }} 
                                            size="sm"
                                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md text-sm px-3 py-1.5"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                                            Single Contribution
                                        </Button>
                                        <Button 
                                            onClick={() => setIsBulkContributionOpen(true)} 
                                            size="sm"
                                            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md text-sm px-3 py-1.5"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                                            Bulk Contributions
                                        </Button>
                                    </>
                                )}
                                {activeTab === 'claims' && (
                                    <Button 
                                        onClick={() => setIsSubmitClaimOpen(true)} 
                                        size="sm"
                                        className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md text-sm px-3 py-1.5"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                                        Submit Claim
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 dark:bg-gray-950">
                            <Tabs 
                                value={activeTab} 
                                onValueChange={handleTabChange}
                                className="w-full"
                            >
                                <div className="overflow-x-auto mb-6">
                                    <TabsList className="w-full sm:w-auto bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <TabsTrigger 
                                            value="members" 
                                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg dark:data-[state=active]:shadow-gray-900/50 data-[state=active]:text-gray-900 dark:text-gray-100 dark:text-gray-300 dark:data-[state=active]:text-gray-50 transition-all duration-200 rounded-lg"
                                        >
                                            Members
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="contributions" 
                                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg dark:data-[state=active]:shadow-gray-900/50 data-[state=active]:text-gray-900 dark:text-gray-100 dark:text-gray-300 dark:data-[state=active]:text-gray-50 transition-all duration-200 rounded-lg"
                                        >
                                            Contributions
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="claims" 
                                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg dark:data-[state=active]:shadow-gray-900/50 data-[state=active]:text-gray-900 dark:text-gray-100 dark:text-gray-300 dark:data-[state=active]:text-gray-50 transition-all duration-200 rounded-lg"
                                        >
                                            Claims
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="missing" 
                                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg dark:data-[state=active]:shadow-gray-900/50 data-[state=active]:text-gray-900 dark:text-gray-100 dark:text-gray-300 dark:data-[state=active]:text-gray-50 transition-all duration-200 rounded-lg"
                                        >
                                            Missing Contributions
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="upcoming" 
                                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg dark:data-[state=active]:shadow-gray-900/50 data-[state=active]:text-gray-900 dark:text-gray-100 dark:text-gray-300 dark:data-[state=active]:text-gray-50 transition-all duration-200 rounded-lg"
                                        >
                                            Upcoming Contributions
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="group-contributions" 
                                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg dark:data-[state=active]:shadow-gray-900/50 data-[state=active]:text-gray-900 dark:text-gray-100 dark:text-gray-300 dark:data-[state=active]:text-gray-50 transition-all duration-200 rounded-lg"
                                        >
                                            Group Contributions
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="members">
                                    <MembersList 
                                        members={members} 
                                        onMemberSelect={handleMemberSelect}
                                        onMemberUpdate={handleMemberUpdate}
                                        onAddMember={() => setIsAddMemberOpen(true)}
                                        canEdit={canEdit}
                                        canDelete={canDelete}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>
                                <TabsContent value="contributions">
                                    <ContributionsList 
                                        contributions={contributions}
                                        members={members}
                                        onContributionAdd={handleAddContribution}
                                        onBulkContributionsAdded={handleBulkContributionsAdded}
                                        canEdit={canEdit}
                                        canDelete={canDelete}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>
                                <TabsContent value="claims">
                                    <ClaimsList 
                                        claims={claims}
                                        members={members}
                                        onClaimSubmit={handleSubmitClaim}
                                        canEdit={canEdit}
                                        canDelete={canDelete}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>
                                <TabsContent value="missing">
                                    <MissingContributionsList 
                                        members={members}
                                        contributions={contributions}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>
                                <TabsContent value="upcoming">
                                    <UpcomingContributionsList 
                                        members={members}
                                        contributions={contributions}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>
                                <TabsContent value="group-contributions">
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

            <AddMemberDialog
                open={isAddMemberOpen}
                onOpenChange={setIsAddMemberOpen}
                onMemberAdded={handleAddMember}
                appCurrency={appCurrency}
            />

            <AddContributionDialog
                open={isAddContributionOpen}
                onOpenChange={setIsAddContributionOpen}
                members={members}
                appCurrency={appCurrency}
                onContributionAdded={handleAddContribution}
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
                members={members}
                appCurrency={appCurrency}
                onClaimSubmitted={handleSubmitClaim}
            />

            {selectedMember && (
                <EditMemberDialog
                    isOpen={isEditMemberOpen}
                    onClose={() => setIsEditMemberOpen(false)}
                    member={selectedMember}
                    onMemberUpdated={handleMemberUpdate}
                    appCurrency={appCurrency}
                />
            )}
        </AuthenticatedLayout>
    );
} 
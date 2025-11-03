import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Project, User } from '@/types/index';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import AddContributionDialog from './Components/AddContributionDialog';
import AddMemberDialog from './Components/AddMemberDialog';
import BulkContributionDialog from './Components/BulkContributionDialog';
import ClaimsList from './Components/ClaimsList';
import ContributionsList from './Components/ContributionsList';
import EditMemberDialog from './Components/EditMemberDialog';
import GroupContributionsList from './Components/GroupContributionsList';
import MembersList from './Components/MembersList';
import MissingContributionsList from './Components/MissingContributionsList';
import SubmitClaimDialog from './Components/SubmitClaimDialog';
import UpcomingContributionsList from './Components/UpcomingContributionsList';

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
        contributions: (Omit<Contribution, 'created_at'> & {
            created_at?: string;
        })[];
    })[];
    initialContributions: (Omit<Contribution, 'created_at'> & {
        created_at?: string;
    })[];
    initialClaims: Claim[];
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function Mortuary({
    auth,
    initialMembers,
    initialContributions,
    initialClaims,
    appCurrency,
}: Props) {
    const { url } = usePage();
    const [members, setMembers] = useState<Member[]>(
        initialMembers.map((member) => ({
            ...member,
            contributions: member.contributions.map((contribution) => ({
                ...contribution,
                created_at: contribution.created_at || new Date().toISOString(),
            })),
            total_contribution: member.contributions.reduce(
                (sum, contribution) => sum + Number(contribution.amount),
                0,
            ),
            total_claims_amount: initialClaims
                .filter((claim) => claim.member_id === member.id)
                .reduce((sum, claim) => sum + Number(claim.amount), 0),
            net_balance:
                member.contributions.reduce(
                    (sum, contribution) => sum + Number(contribution.amount),
                    0,
                ) -
                initialClaims
                    .filter((claim) => claim.member_id === member.id)
                    .reduce((sum, claim) => sum + Number(claim.amount), 0),
        })),
    );
    const [contributions, setContributions] = useState<Contribution[]>(
        initialContributions.map((contribution) => ({
            ...contribution,
            created_at: contribution.created_at || new Date().toISOString(),
        })),
    );
    const [claims, setClaims] = useState<Claim[]>(initialClaims);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);
    const [isBulkContributionOpen, setIsBulkContributionOpen] = useState(false);
    const [isSubmitClaimOpen, setIsSubmitClaimOpen] = useState(false);
    const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<
        (Member & { contributions: Contribution[] }) | null
    >(null);
    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('tab') || 'members';
    });

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - check their roles
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - only admin or manager can delete
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    const handleTabChange = (value: string) => {
        if (value !== activeTab) {
            setActiveTab(value);
            router.get(
                window.location.pathname,
                { tab: value },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }
    };

    const handleAddMember = (
        newMember: Member & { contributions: Contribution[] },
    ) => {
        setMembers([
            ...members,
            {
                ...newMember,
                total_contribution: newMember.contributions.reduce(
                    (sum, contribution) => sum + Number(contribution.amount),
                    0,
                ),
                total_claims_amount: initialClaims
                    .filter((claim) => claim.member_id === newMember.id)
                    .reduce((sum, claim) => sum + Number(claim.amount), 0),
                net_balance:
                    newMember.contributions.reduce(
                        (sum, contribution) =>
                            sum + Number(contribution.amount),
                        0,
                    ) -
                    initialClaims
                        .filter((claim) => claim.member_id === newMember.id)
                        .reduce((sum, claim) => sum + Number(claim.amount), 0),
            },
        ]);
    };

    const handleAddContribution = (
        newContribution: Omit<Contribution, 'created_at'>,
    ) => {
        const contributionWithTimestamp: Contribution = {
            ...newContribution,
            created_at: new Date().toISOString(),
        };
        setContributions([...contributions, contributionWithTimestamp]);
        // Update the member's total contribution
        setMembers(
            members.map((member) => {
                if (member.id === newContribution.member_id) {
                    return {
                        ...member,
                        total_contribution:
                            member.total_contribution +
                            Number(newContribution.amount),
                    };
                }
                return member;
            }),
        );
    };

    const handleBulkContributionsAdded = (
        newContributions: Omit<Contribution, 'created_at'>[],
    ) => {
        const contributionsWithTimestamp: Contribution[] = newContributions.map(
            (contribution) => ({
                ...contribution,
                created_at: new Date().toISOString(),
            }),
        );
        setContributions([...contributions, ...contributionsWithTimestamp]);
        // Update each member's total contribution
        setMembers(
            members.map((member) => {
                const memberContributions = newContributions.filter(
                    (c) => c.member_id === member.id,
                );
                if (memberContributions.length > 0) {
                    const totalAdded = memberContributions.reduce(
                        (sum, c) => sum + Number(c.amount),
                        0,
                    );
                    return {
                        ...member,
                        total_contribution:
                            member.total_contribution + totalAdded,
                    };
                }
                return member;
            }),
        );
    };

    const handleSubmitClaim = (newClaim: Claim) => {
        setClaims([...claims, newClaim]);
        // Update the member's total claims amount and net balance
        setMembers(
            members.map((member) => {
                if (member.id === newClaim.member_id) {
                    const newTotalClaimsAmount =
                        member.total_claims_amount + Number(newClaim.amount);
                    return {
                        ...member,
                        total_claims_amount: newTotalClaimsAmount,
                        net_balance:
                            member.total_contribution - newTotalClaimsAmount,
                    };
                }
                return member;
            }),
        );
    };

    const handleMemberSelect = (
        member: Member & { contributions: Contribution[] },
    ) => {
        setSelectedMember(member);
        setIsEditMemberOpen(true);
    };

    const handleMemberUpdate = (
        updatedMember: Member & { contributions: Contribution[] },
    ) => {
        setMembers(
            members.map((member) =>
                member.id === updatedMember.id
                    ? {
                          ...updatedMember,
                          total_contribution:
                              updatedMember.contributions.reduce(
                                  (sum, contribution) =>
                                      sum + Number(contribution.amount),
                                  0,
                              ),
                      }
                    : member,
            ),
        );
    };

    return (
        <AuthenticatedLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Mortuary Management
                </h2>
            }
        >
            <Head title="Mortuary" />

            <div className="py-0">
                <div className="mx-auto w-full sm:px-6 lg:px-0">
                    <Card className="border-0 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
                        <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:border-gray-800 dark:from-gray-900 dark:to-gray-800/50 sm:flex-row sm:items-center">
                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                                Records
                            </CardTitle>
                            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                                {activeTab === 'members' && (
                                    <Button
                                        onClick={() => setIsAddMemberOpen(true)}
                                        size="sm"
                                        className="flex-1 bg-blue-600 px-3 py-1.5 text-sm shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 sm:flex-none"
                                    >
                                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                                        Add Member
                                    </Button>
                                )}
                                {activeTab === 'contributions' && (
                                    <>
                                        <Button
                                            onClick={() => {
                                                console.log(
                                                    'Button clicked, setting isAddContributionOpen to true',
                                                );
                                                setIsAddContributionOpen(true);
                                            }}
                                            size="sm"
                                            className="flex-1 bg-green-600 px-3 py-1.5 text-sm shadow-sm transition-all duration-200 hover:bg-green-700 hover:shadow-md dark:bg-green-600 dark:text-white dark:hover:bg-green-700 sm:flex-none"
                                        >
                                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                                            Single Contribution
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                setIsBulkContributionOpen(true)
                                            }
                                            size="sm"
                                            className="flex-1 bg-emerald-600 px-3 py-1.5 text-sm shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700 sm:flex-none"
                                        >
                                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                                            Bulk Contributions
                                        </Button>
                                    </>
                                )}
                                {activeTab === 'claims' && (
                                    <Button
                                        onClick={() =>
                                            setIsSubmitClaimOpen(true)
                                        }
                                        size="sm"
                                        className="flex-1 bg-purple-600 px-3 py-1.5 text-sm shadow-sm transition-all duration-200 hover:bg-purple-700 hover:shadow-md dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700 sm:flex-none"
                                    >
                                        <Plus className="mr-1.5 h-3.5 w-3.5" />
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
                                {/* Mobile Dropdown */}
                                <div className="mb-6 md:hidden">
                                    <Select
                                        value={activeTab}
                                        onValueChange={handleTabChange}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue>
                                                {activeTab === 'members' &&
                                                    'Members'}
                                                {activeTab ===
                                                    'contributions' &&
                                                    'Contributions'}
                                                {activeTab === 'claims' &&
                                                    'Claims'}
                                                {activeTab === 'missing' &&
                                                    'Missing Contributions'}
                                                {activeTab === 'upcoming' &&
                                                    'Upcoming Contributions'}
                                                {activeTab ===
                                                    'group-contributions' &&
                                                    'Group Contributions'}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="members">
                                                Members
                                            </SelectItem>
                                            <SelectItem value="contributions">
                                                Contributions
                                            </SelectItem>
                                            <SelectItem value="claims">
                                                Claims
                                            </SelectItem>
                                            <SelectItem value="missing">
                                                Missing Contributions
                                            </SelectItem>
                                            <SelectItem value="upcoming">
                                                Upcoming Contributions
                                            </SelectItem>
                                            <SelectItem value="group-contributions">
                                                Group Contributions
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Desktop Tabs */}
                                <div className="mb-6 hidden overflow-x-auto md:block">
                                    <TabsList className="w-full rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-900 sm:w-auto">
                                        <TabsTrigger
                                            value="members"
                                            className="rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg dark:text-gray-100 dark:text-gray-300 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-50 dark:data-[state=active]:shadow-gray-900/50"
                                        >
                                            Members
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="contributions"
                                            className="rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg dark:text-gray-100 dark:text-gray-300 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-50 dark:data-[state=active]:shadow-gray-900/50"
                                        >
                                            Contributions
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="claims"
                                            className="rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg dark:text-gray-100 dark:text-gray-300 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-50 dark:data-[state=active]:shadow-gray-900/50"
                                        >
                                            Claims
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="missing"
                                            className="rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg dark:text-gray-100 dark:text-gray-300 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-50 dark:data-[state=active]:shadow-gray-900/50"
                                        >
                                            Missing Contributions
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="upcoming"
                                            className="rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg dark:text-gray-100 dark:text-gray-300 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-50 dark:data-[state=active]:shadow-gray-900/50"
                                        >
                                            Upcoming Contributions
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="group-contributions"
                                            className="rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg dark:text-gray-100 dark:text-gray-300 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-50 dark:data-[state=active]:shadow-gray-900/50"
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
                                        onAddMember={() =>
                                            setIsAddMemberOpen(true)
                                        }
                                        canEdit={canEdit}
                                        canDelete={canDelete}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>
                                <TabsContent value="contributions">
                                    <ContributionsList
                                        contributions={contributions}
                                        members={members}
                                        onContributionAdd={
                                            handleAddContribution
                                        }
                                        onBulkContributionsAdded={
                                            handleBulkContributionsAdded
                                        }
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

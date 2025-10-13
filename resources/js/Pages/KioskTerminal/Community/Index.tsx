import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ContributionSuccess from './Components/ContributionSuccess';
import EventCheckIn from './Components/EventCheckIn';
import HealthInsurance from './Components/HealthInsurance';
import KioskSidebar from './Components/KioskSidebar';
import Mortuary from './Components/Mortuary';

interface Event {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    max_participants: number;
    current_participants?: number;
    status: string;
}

interface Participant {
    id: string;
    name: string;
    email: string;
    phone: string;
    checked_in: boolean;
    checked_in_at?: string;
    payment_status?: string;
}

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
}

interface Contribution {
    member_id: string;
    amount: number;
    selected: boolean;
}

interface KioskData {
    auth: {
        user: any;
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
    events: Event[];
    healthInsuranceMembers: Member[];
    mortuaryMembers: Member[];
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function KioskTerminal({
    auth,
    events: initialEvents,
    healthInsuranceMembers: initialHealthMembers,
    mortuaryMembers: initialMortuaryMembers,
    appCurrency,
}: KioskData) {
    const canEdit = React.useMemo(() => {
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

    const canDelete = React.useMemo(() => {
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

    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [healthInsuranceMembers, setHealthInsuranceMembers] =
        useState<Member[]>(initialHealthMembers);
    const [mortuaryMembers, setMortuaryMembers] = useState<Member[]>(
        initialMortuaryMembers,
    );

    // Event check-in state - moved to EventCheckIn component

    // Contribution state
    const [contributionData, setContributionData] = useState({
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: '',
        reference_number: '',
        bulk_amount: '',
    });
    const [memberContributions, setMemberContributions] = useState<
        Contribution[]
    >([]);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [filterGroup, setFilterGroup] = useState<string>('all');
    const [selectAll, setSelectAll] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState({
        current: 0,
        total: 0,
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    // Filtered data - moved to individual components

    const currentMembers =
        activeTab === 'health_insurance'
            ? healthInsuranceMembers
            : mortuaryMembers;
    const filteredMembers = currentMembers.filter((member) => {
        const matchesSearch =
            member.name
                .toLowerCase()
                .includes(memberSearchQuery.toLowerCase()) ||
            member.contact_number.includes(memberSearchQuery);
        const matchesGroup =
            filterGroup === 'all' || member.group === filterGroup;
        return matchesSearch && matchesGroup;
    });

    const groups = [
        'all',
        ...Array.from(
            new Set(currentMembers.map((m) => m.group).filter(Boolean)),
        ),
    ];

    // Initialize member contributions when tab changes
    useEffect(() => {
        const initialContributions = currentMembers.map((member) => ({
            member_id: member.id,
            amount: member.contribution_amount || 0,
            selected: false,
        }));
        setMemberContributions(initialContributions);
        setContributionData((prev) => ({
            ...prev,
            bulk_amount: '',
        }));
        setSelectAll(false);
    }, [activeTab, currentMembers]);

    // Event functions moved to EventCheckIn component

    // Handle bulk amount change for contributions
    const handleBulkAmountChange = (amount: string) => {
        const numAmount = Number(amount) || 0;
        setContributionData((prev) => ({ ...prev, bulk_amount: amount }));

        setMemberContributions((prev) =>
            prev.map((member) => {
                if (!member.selected) return member;

                // Find the corresponding member data to get contribution_amount
                const memberData = currentMembers.find(
                    (m) => m.id === member.member_id,
                );
                const minAmount = memberData?.contribution_amount || 0;

                // Use the higher of the bulk amount or minimum contribution amount
                const finalAmount = Math.max(numAmount, minAmount);

                return {
                    ...member,
                    amount: finalAmount,
                };
            }),
        );
    };

    // Handle member selection for contributions
    const handleMemberSelection = (memberId: string, selected: boolean) => {
        setMemberContributions((prev) =>
            prev.map((member) => {
                if (member.member_id !== memberId) return member;

                const isSelected = selected;
                let newAmount = member.amount;

                if (isSelected && contributionData.bulk_amount) {
                    // Find the corresponding member data to get contribution_amount
                    const memberData = currentMembers.find(
                        (m) => m.id === memberId,
                    );
                    const minAmount = memberData?.contribution_amount || 0;
                    const bulkAmount =
                        Number(contributionData.bulk_amount) || 0;

                    // Use the higher of the bulk amount or minimum contribution amount
                    newAmount = Math.max(bulkAmount, minAmount);
                }

                return {
                    ...member,
                    selected: isSelected,
                    amount: newAmount,
                };
            }),
        );
    };

    // Handle select all for contributions
    const handleSelectAll = (selected: boolean) => {
        setSelectAll(selected);
        const allMemberIds = filteredMembers.map((m) => m.id);

        setMemberContributions((prev) =>
            prev.map((member) => {
                if (!allMemberIds.includes(member.member_id)) return member;

                let newAmount = member.amount;

                if (selected && contributionData.bulk_amount) {
                    // Find the corresponding member data to get contribution_amount
                    const memberData = currentMembers.find(
                        (m) => m.id === member.member_id,
                    );
                    const minAmount = memberData?.contribution_amount || 0;
                    const bulkAmount =
                        Number(contributionData.bulk_amount) || 0;

                    // Use the higher of the bulk amount or minimum contribution amount
                    newAmount = Math.max(bulkAmount, minAmount);
                }

                return {
                    ...member,
                    selected: selected,
                    amount: newAmount,
                };
            }),
        );
    };

    // Handle individual member amount change
    const handleMemberAmountChange = (memberId: string, amount: string) => {
        const member = currentMembers.find((m) => m.id === memberId);
        const numAmount = Number(amount) || 0;

        // If amount is less than premium, set it to premium amount
        const finalAmount =
            member && numAmount < member.contribution_amount
                ? member.contribution_amount
                : numAmount;

        setMemberContributions((prev) =>
            prev.map((member) => ({
                ...member,
                amount:
                    member.member_id === memberId ? finalAmount : member.amount,
            })),
        );
    };

    // Submit contributions
    const submitContributions = async () => {
        if (!canEdit) {
            toast.error('You do not have permission to submit contributions.');
            return;
        }

        if (memberContributions.length === 0) {
            toast.error(
                'Please select at least one member to submit contributions.',
            );
            return;
        }

        const selectedContributions = memberContributions.filter(
            (contribution) => contribution.selected,
        );
        if (selectedContributions.length === 0) {
            toast.error(
                'Please select at least one member to submit contributions.',
            );
            return;
        }

        setProcessing(true);
        setProcessingProgress({
            current: 0,
            total: selectedContributions.length,
        });

        try {
            const results = [];
            let successCount = 0;
            let errorCount = 0;

            for (let i = 0; i < selectedContributions.length; i++) {
                const contribution = selectedContributions[i];
                setProcessingProgress({
                    current: i + 1,
                    total: selectedContributions.length,
                });

                try {
                    const response = await fetch(
                        route('kiosk.community.contributions.store'),
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN':
                                    document
                                        .querySelector(
                                            'meta[name="csrf-token"]',
                                        )
                                        ?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({
                                member_id: contribution.member_id,
                                amount: contribution.amount,
                                type:
                                    activeTab === 'health_insurance'
                                        ? 'health_insurance'
                                        : 'mortuary',
                                ...contributionData,
                            }),
                        },
                    );

                    const result = await response.json();

                    if (response.ok) {
                        successCount++;
                        results.push({
                            success: true,
                            member_id: contribution.member_id,
                            data: result,
                        });
                    } else {
                        errorCount++;
                        results.push({
                            success: false,
                            member_id: contribution.member_id,
                            error:
                                result.message ||
                                'Failed to submit contribution',
                        });
                    }
                } catch (error) {
                    errorCount++;
                    results.push({
                        success: false,
                        member_id: contribution.member_id,
                        error: 'Network error',
                    });
                }
            }

            setProcessing(false);
            setProcessingProgress({ current: 0, total: 0 });

            if (successCount > 0) {
                toast.success(
                    `Successfully submitted ${successCount} contribution(s)`,
                );
                if (errorCount > 0) {
                    toast.error(
                        `${errorCount} contribution(s) failed to submit`,
                    );
                }
                setShowSuccess(true);
                setSuccessData({
                    type:
                        activeTab === 'health_insurance'
                            ? 'Health Insurance'
                            : 'Mortuary',
                    totalAmount: selectedContributions.reduce(
                        (sum, c) => sum + c.amount,
                        0,
                    ),
                    memberCount: successCount,
                    currency: appCurrency,
                });
            } else {
                toast.error('Failed to submit any contributions');
            }
        } catch (error) {
            setProcessing(false);
            setProcessingProgress({ current: 0, total: 0 });
            console.error('Error submitting contributions:', error);
            toast.error('Failed to submit contributions');
        }
    };

    // Reset form
    const resetForm = () => {
        setContributionData({
            payment_date: format(new Date(), 'yyyy-MM-dd'),
            payment_method: '',
            reference_number: '',
            bulk_amount: '',
        });
        setMemberContributions((prev) =>
            prev.map((member) => ({
                ...member,
                selected: false,
                amount: member.amount,
            })),
        );
        setSelectAll(false);
        setShowSuccess(false);
        setSuccessData(null);
    };

    // Handle new submission
    const handleNewSubmission = () => {
        resetForm();
    };

    // Handle back to kiosk
    const handleBackToKiosk = () => {
        setShowSuccess(false);
        setSuccessData(null);
    };

    // Show success page if submission was successful
    if (showSuccess && successData) {
        return (
            <ContributionSuccess
                type={activeTab as 'health_insurance' | 'mortuary'}
                successData={{
                    total: successData.total,
                    successful: successData.successful,
                    failed: successData.failed,
                    message: `Successfully recorded ${successData.successful} ${activeTab === 'health_insurance' ? 'healthcare' : 'mortuary'} contributions`,
                }}
                onBack={handleBackToKiosk}
            />
        );
    }

    return (
        <>
            <Head title="Community Kiosk Terminal">
                <style>{`
                    .kiosk-light-mode {
                        --background: 0 0% 100% !important;
                        --foreground: 222.2 84% 4.9% !important;
                        --card: 0 0% 100% !important;
                        --card-foreground: 222.2 84% 4.9% !important;
                        --popover: 0 0% 100% !important;
                        --popover-foreground: 222.2 84% 4.9% !important;
                        --primary: 222.2 47.4% 11.2% !important;
                        --primary-foreground: 210 40% 98% !important;
                        --secondary: 210 40% 96.1% !important;
                        --secondary-foreground: 222.2 47.4% 11.2% !important;
                        --muted: 210 40% 96.1% !important;
                        --muted-foreground: 215.4 16.3% 46.9% !important;
                        --accent: 210 40% 96.1% !important;
                        --accent-foreground: 222.2 47.4% 11.2% !important;
                        --destructive: 0 84.2% 60.2% !important;
                        --destructive-foreground: 210 40% 98% !important;
                        --border: 214.3 31.8% 91.4% !important;
                        --input: 214.3 31.8% 91.4% !important;
                        --ring: 222.2 84% 4.9% !important;
                        --radius: 0.5rem !important;
                    }
                    .kiosk-light-mode * {
                        color-scheme: light !important;
                    }
                    .kiosk-light-mode [data-radix-collection-item] {
                        color: #111827 !important;
                    }

                `}</style>
            </Head>

            {/* Force light mode for kiosk terminal */}
            <div className="kiosk-light-mode light">
                <div className="flex h-screen bg-gray-50">
                    {/* Sidebar */}
                    <KioskSidebar
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        auth={auth}
                    />

                    {/* Main Content */}
                    <div className="flex flex-1 flex-col overflow-hidden">
                        {/* Content Area */}
                        <div className="flex-1 overflow-auto p-6">
                            {/* Event Check-in Content */}
                            {activeTab === 'events' && (
                                <EventCheckIn auth={auth} events={events} />
                            )}

                            {/* Health Insurance Content */}
                            {activeTab === 'health_insurance' && (
                                <HealthInsurance
                                    auth={auth}
                                    members={healthInsuranceMembers}
                                    contributionData={contributionData}
                                    setContributionData={setContributionData}
                                    memberContributions={memberContributions}
                                    setMemberContributions={
                                        setMemberContributions
                                    }
                                    memberSearchQuery={memberSearchQuery}
                                    setMemberSearchQuery={setMemberSearchQuery}
                                    filterGroup={filterGroup}
                                    setFilterGroup={setFilterGroup}
                                    selectAll={selectAll}
                                    setSelectAll={setSelectAll}
                                    groups={groups}
                                    filteredMembers={filteredMembers}
                                    processing={processing}
                                    processingProgress={processingProgress}
                                    appCurrency={appCurrency}
                                    onSubmit={submitContributions}
                                    onBulkAmountChange={handleBulkAmountChange}
                                    onMemberSelection={handleMemberSelection}
                                    onSelectAll={handleSelectAll}
                                    onMemberAmountChange={
                                        handleMemberAmountChange
                                    }
                                />
                            )}

                            {/* Mortuary Content */}
                            {activeTab === 'mortuary' && (
                                <Mortuary
                                    auth={auth}
                                    members={mortuaryMembers}
                                    contributionData={contributionData}
                                    setContributionData={setContributionData}
                                    memberContributions={memberContributions}
                                    setMemberContributions={
                                        setMemberContributions
                                    }
                                    memberSearchQuery={memberSearchQuery}
                                    setMemberSearchQuery={setMemberSearchQuery}
                                    filterGroup={filterGroup}
                                    setFilterGroup={setFilterGroup}
                                    selectAll={selectAll}
                                    setSelectAll={setSelectAll}
                                    groups={groups}
                                    filteredMembers={filteredMembers}
                                    processing={processing}
                                    processingProgress={processingProgress}
                                    appCurrency={appCurrency}
                                    onSubmit={submitContributions}
                                    onBulkAmountChange={handleBulkAmountChange}
                                    onMemberSelection={handleMemberSelection}
                                    onSelectAll={handleSelectAll}
                                    onMemberAmountChange={
                                        handleMemberAmountChange
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

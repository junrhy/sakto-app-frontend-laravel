import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { format } from 'date-fns';
import {
    Calendar,
    Users,
    DollarSign,
    Search,
    CheckCircle,
    XCircle,
    RefreshCw,
    UserCheck,
    CreditCard,
    FileText
} from 'lucide-react';
import KioskSidebar from './Components/KioskSidebar';
import EventCheckIn from './Components/EventCheckIn';
import HealthInsurance from './Components/HealthInsurance';
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
    events: Event[];
    healthInsuranceMembers: Member[];
    mortuaryMembers: Member[];
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function KioskTerminal({ 
    events: initialEvents, 
    healthInsuranceMembers: initialHealthMembers, 
    mortuaryMembers: initialMortuaryMembers, 
    appCurrency 
}: KioskData) {
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [healthInsuranceMembers, setHealthInsuranceMembers] = useState<Member[]>(initialHealthMembers);
    const [mortuaryMembers, setMortuaryMembers] = useState<Member[]>(initialMortuaryMembers);
    
    // Event check-in state - moved to EventCheckIn component
    
    // Contribution state
    const [contributionData, setContributionData] = useState({
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: '',
        reference_number: '',
        bulk_amount: '',
    });
    const [memberContributions, setMemberContributions] = useState<Contribution[]>([]);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [filterGroup, setFilterGroup] = useState<string>('all');
    const [selectAll, setSelectAll] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });

    // Filtered data - moved to individual components

    const currentMembers = activeTab === 'health_insurance' ? healthInsuranceMembers : mortuaryMembers;
    const filteredMembers = currentMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                            member.contact_number.includes(memberSearchQuery);
        const matchesGroup = filterGroup === 'all' || member.group === filterGroup;
        return matchesSearch && matchesGroup;
    });

    const groups = ['all', ...Array.from(new Set(currentMembers.map(m => m.group).filter(Boolean)))];

    // Initialize member contributions when tab changes
    useEffect(() => {
        const initialContributions = currentMembers.map(member => ({
            member_id: member.id,
            amount: member.contribution_amount || 0,
            selected: false
        }));
        setMemberContributions(initialContributions);
        setContributionData(prev => ({
            ...prev,
            bulk_amount: '',
        }));
        setSelectAll(false);
    }, [activeTab, currentMembers]);

    // Event functions moved to EventCheckIn component

    // Handle bulk amount change for contributions
    const handleBulkAmountChange = (amount: string) => {
        const numAmount = Number(amount) || 0;
        setContributionData(prev => ({ ...prev, bulk_amount: amount }));
        
        setMemberContributions(prev => prev.map(member => ({
            ...member,
            amount: member.selected ? numAmount : member.amount
        })));
    };

    // Handle member selection for contributions
    const handleMemberSelection = (memberId: string, selected: boolean) => {
        setMemberContributions(prev => prev.map(member => ({
            ...member,
            selected: member.member_id === memberId ? selected : member.selected,
            amount: member.member_id === memberId && selected && contributionData.bulk_amount ? 
                Number(contributionData.bulk_amount) : member.amount
        })));
    };

    // Handle select all for contributions
    const handleSelectAll = (selected: boolean) => {
        setSelectAll(selected);
        const allMemberIds = filteredMembers.map(m => m.id);
        
        setMemberContributions(prev => prev.map(member => ({
            ...member,
            selected: allMemberIds.includes(member.member_id) ? selected : member.selected,
            amount: allMemberIds.includes(member.member_id) && selected && contributionData.bulk_amount ? 
                Number(contributionData.bulk_amount) : member.amount
        })));
    };

    // Handle individual member amount change
    const handleMemberAmountChange = (memberId: string, amount: string) => {
        setMemberContributions(prev => prev.map(member => ({
            ...member,
            amount: member.member_id === memberId ? Number(amount) || 0 : member.amount
        })));
    };

    // Submit contributions
    const submitContributions = async () => {
        const selectedContributions = memberContributions
            .filter(member => member.selected && member.amount > 0)
            .map(member => ({
                member_id: member.member_id,
                amount: member.amount,
                payment_date: contributionData.payment_date,
                payment_method: contributionData.payment_method,
                reference_number: contributionData.reference_number
            }));

        if (selectedContributions.length === 0) {
            toast.error('Please select at least one member and enter an amount');
            return;
        }

        if (!contributionData.payment_method) {
            toast.error('Please select a payment method');
            return;
        }

        setProcessing(true);
        setProcessingProgress({ current: 0, total: selectedContributions.length });

        try {
            const routeName = activeTab === 'health_insurance' 
                ? 'kiosk.health-insurance.contributions' 
                : 'kiosk.mortuary.contributions';

            const response = await fetch(route(routeName), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ contributions: selectedContributions })
            });

            const result = await response.json();

            if (response.ok || response.status === 207) {
                if (result.success) {
                    toast.success(result.message);
                } else {
                    toast.warning(result.message);
                }
                
                // Reset form
                setContributionData({
                    payment_date: format(new Date(), 'yyyy-MM-dd'),
                    payment_method: '',
                    reference_number: '',
                    bulk_amount: '',
                });
                setMemberContributions(prev => prev.map(member => ({
                    ...member,
                    selected: false,
                    amount: member.amount
                })));
                setSelectAll(false);
            } else {
                toast.error(result.message || 'Failed to submit contributions');
            }
        } catch (error) {
            console.error('Error submitting contributions:', error);
            toast.error('Failed to submit contributions');
        } finally {
            setProcessing(false);
            setProcessingProgress({ current: 0, total: 0 });
        }
    };

    // Refresh data
    const refreshData = async () => {
        try {
            const response = await fetch(route('kiosk.data'));
            if (response.ok) {
                const data = await response.json();
                setEvents(data.events);
                setHealthInsuranceMembers(data.healthInsuranceMembers);
                setMortuaryMembers(data.mortuaryMembers);
                toast.success('Data refreshed successfully');
            } else {
                toast.error('Failed to refresh data');
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
            toast.error('Failed to refresh data');
        }
    };

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
                    .kiosk-light-mode button {
                        color: #111827 !important;
                    }
                    .kiosk-light-mode .button {
                        color: #111827 !important;
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
                    <KioskSidebar activeTab={activeTab} onTabChange={setActiveTab} />
                    
                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Header with Refresh Button */}
                        <div className="bg-white border-b-2 border-gray-200 p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {activeTab === 'events' && 'Event Check-in'}
                                        {activeTab === 'health_insurance' && 'Health Insurance Contributions'}
                                        {activeTab === 'mortuary' && 'Mortuary Contributions'}
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        {activeTab === 'events' && 'Select an event and check-in participants'}
                                        {activeTab === 'health_insurance' && 'Submit contributions for health insurance members'}
                                        {activeTab === 'mortuary' && 'Submit contributions for mortuary members'}
                                    </p>
                                </div>
                                <Button 
                                    onClick={refreshData} 
                                    variant="outline" 
                                    size="lg"
                                    className="!text-gray-900 !border-gray-300 hover:!bg-gray-100 px-6 py-3 text-lg"
                                >
                                    <RefreshCw className="w-6 h-6 mr-3" />
                                    Refresh Data
                                </Button>
                            </div>
                        </div>

                                                {/* Content Area */}
                        <div className="flex-1 overflow-auto p-6">
                            {/* Event Check-in Content */}
                            {activeTab === 'events' && (
                                <EventCheckIn events={events} />
                            )}

                            {/* Health Insurance Content */}
                            {activeTab === 'health_insurance' && (
                                <HealthInsurance
                                    members={healthInsuranceMembers}
                                    contributionData={contributionData}
                                    setContributionData={setContributionData}
                                    memberContributions={memberContributions}
                                    setMemberContributions={setMemberContributions}
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
                                    onMemberAmountChange={handleMemberAmountChange}
                                />
                            )}

                            {/* Mortuary Content */}
                            {activeTab === 'mortuary' && (
                                <Mortuary
                                    members={mortuaryMembers}
                                    contributionData={contributionData}
                                    setContributionData={setContributionData}
                                    memberContributions={memberContributions}
                                    setMemberContributions={setMemberContributions}
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
                                    onMemberAmountChange={handleMemberAmountChange}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

 
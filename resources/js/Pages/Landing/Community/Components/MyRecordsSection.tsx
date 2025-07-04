import { formatDateTimeForDisplay } from '../utils/dateUtils';
import { useState } from 'react';

interface Member {
    id: number;
    name: string;
    email: string;
    contact_number: string | null;
    app_currency: {
        code: string;
        symbol: string;
    } | null;
    created_at: string;
    identifier?: string;
}

interface MyRecordsSectionProps {
    member: Member;
}

interface LendingRecord {
    id: number;
    borrower_name: string;
    amount: string;
    interest_rate: string;
    start_date: string;
    end_date: string;
    interest_type: string;
    frequency: string;
    installment_frequency: string | null;
    installment_amount: string | null;
    status: string;
    total_interest: string;
    total_balance: string;
    paid_amount: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
}

interface HealthcareContribution {
    id: number;
    member_id: number;
    amount: string;
    payment_date: string;
    payment_method: string;
    reference_number: string | null;
    created_at: string;
    updated_at: string;
}

interface HealthcareClaim {
    id: number;
    member_id: number;
    claim_type: string;
    amount: string;
    date_of_service: string;
    hospital_name: string;
    diagnosis: string;
    status: string;
    remarks: string | null;
    created_at: string;
    updated_at: string;
}

interface HealthcareRecord {
    id: number;
    client_identifier: string;
    name: string;
    date_of_birth: string;
    gender: string;
    contact_number: string;
    address: string;
    membership_start_date: string;
    contribution_amount: string;
    contribution_frequency: string;
    status: string;
    group: string | null;
    created_at: string;
    updated_at: string;
    contributions: HealthcareContribution[];
    claims: HealthcareClaim[];
}

interface MortuaryContribution {
    id: number;
    member_id: number;
    amount: string;
    payment_date: string;
    payment_method: string;
    reference_number: string | null;
    created_at: string;
    updated_at: string;
}

interface MortuaryClaim {
    id: number;
    member_id: number;
    claim_type: string;
    amount: string;
    date_of_death: string;
    deceased_name: string;
    relationship_to_member: string;
    cause_of_death: string | null;
    status: string;
    remarks: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface MortuaryRecord {
    id: number;
    client_identifier: string;
    name: string;
    date_of_birth: string;
    gender: string;
    contact_number: string;
    address: string;
    membership_start_date: string;
    contribution_amount: string;
    contribution_frequency: string;
    status: string;
    group: string | null;
    created_at: string;
    updated_at: string;
    contributions: MortuaryContribution[];
    claims: MortuaryClaim[];
}

export default function MyRecordsSection({ member }: MyRecordsSectionProps) {
    const [lendingRecords, setLendingRecords] = useState<LendingRecord[]>([]);
    const [healthcareRecords, setHealthcareRecords] = useState<HealthcareRecord[]>([]);
    const [mortuaryRecords, setMortuaryRecords] = useState<MortuaryRecord[]>([]);
    const [isLoadingLending, setIsLoadingLending] = useState(false);
    const [isLoadingHealthcare, setIsLoadingHealthcare] = useState(false);
    const [isLoadingMortuary, setIsLoadingMortuary] = useState(false);
    const [lendingError, setLendingError] = useState('');
    const [healthcareError, setHealthcareError] = useState('');
    const [mortuaryError, setMortuaryError] = useState('');

    const getVisitorInfo = () => {
        const authData = localStorage.getItem(`visitor_auth_${member.id}`);
        if (authData) {
            try {
                const { visitorInfo } = JSON.parse(authData);
                return visitorInfo;
            } catch (error) {
                return null;
            }
        }
        return null;
    };

    const searchLendingRecords = async () => {
        const visitorInfo = getVisitorInfo();
        if (!visitorInfo) return;

        setIsLoadingLending(true);
        setLendingError('');

        try {
            const borrowerName = `${visitorInfo.firstName} ${visitorInfo.middleName ? `${visitorInfo.middleName} ` : ''}${visitorInfo.lastName}`.trim();
            const response = await fetch(`/m/${member.id}/search-lending?borrower_name=${encodeURIComponent(borrowerName)}`);
            
            if (response.ok) {
                const data = await response.json();
                setLendingRecords(data.data.loans || []);
            } else {
                const errorData = await response.json();
                setLendingError(errorData.error || 'Failed to search lending records');
            }
        } catch (error) {
            setLendingError('Network error occurred while searching lending records');
        } finally {
            setIsLoadingLending(false);
        }
    };

    const searchHealthcareRecords = async () => {
        const visitorInfo = getVisitorInfo();
        if (!visitorInfo) return;

        setIsLoadingHealthcare(true);
        setHealthcareError('');

        try {
            const searchParams = new URLSearchParams({
                name: `${visitorInfo.firstName} ${visitorInfo.middleName ? `${visitorInfo.middleName} ` : ''}${visitorInfo.lastName}`.trim(),
                email: visitorInfo.email
            });

            const response = await fetch(`/m/${member.id}/search-healthcare?${searchParams.toString()}`);
            
            if (response.ok) {
                const data = await response.json();
                setHealthcareRecords(data.data.members || []);
            } else {
                const errorData = await response.json();
                setHealthcareError(errorData.error || 'Failed to search healthcare records');
            }
        } catch (error) {
            setHealthcareError('Network error occurred while searching healthcare records');
        } finally {
            setIsLoadingHealthcare(false);
        }
    };

    const searchMortuaryRecords = async () => {
        const visitorInfo = getVisitorInfo();
        if (!visitorInfo) return;

        setIsLoadingMortuary(true);
        setMortuaryError('');

        try {
            const searchParams = new URLSearchParams({
                name: `${visitorInfo.firstName} ${visitorInfo.middleName ? `${visitorInfo.middleName} ` : ''}${visitorInfo.lastName}`.trim(),
                email: visitorInfo.email
            });

            const response = await fetch(`/m/${member.id}/search-mortuary?${searchParams.toString()}`);
            
            if (response.ok) {
                const data = await response.json();
                setMortuaryRecords(data.data.members || []);
            } else {
                const errorData = await response.json();
                setMortuaryError(errorData.error || 'Failed to search mortuary records');
            }
        } catch (error) {
            setMortuaryError('Network error occurred while searching mortuary records');
        } finally {
            setIsLoadingMortuary(false);
        }
    };

    const formatPrice = (price: number | string): string => {
        const symbol = member.app_currency?.symbol || '$';
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        
        // Check if the price is a valid number
        if (isNaN(numericPrice)) {
            return `${symbol}0.00`;
        }
        
        return `${symbol}${numericPrice.toFixed(2)}`;
    };

    const formatDate = (dateString: string): string => {
        return formatDateTimeForDisplay(dateString, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">My Records</h2>
            <div className="full-width">
                {/* Lending Records Section */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-green-500 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            Lending
                        </h4>
                        <button
                            onClick={searchLendingRecords}
                            disabled={isLoadingLending}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoadingLending ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Show
                                </>
                            )}
                        </button>
                    </div>

                    {lendingError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm text-red-600 dark:text-red-400">{lendingError}</p>
                        </div>
                    )}

                    {lendingRecords.length > 0 && (
                        <div className="space-y-4">
                            {lendingRecords.map((record) => (
                                <div key={record.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    {/* Loan Header */}
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {record.borrower_name}
                                                </h5>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    Loan ID: {record.id} • {record.status} • {record.interest_type} interest
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {formatPrice(record.amount)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Original Amount
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Loan Details */}
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 mb-1">Loan Terms</p>
                                                <p className="text-gray-900 dark:text-gray-100 mb-1">
                                                    <span className="font-medium">Interest Rate:</span> {record.interest_rate}%
                                                </p>
                                                <p className="text-gray-900 dark:text-gray-100 mb-1">
                                                    <span className="font-medium">Frequency:</span> {record.frequency}
                                                </p>
                                                <p className="text-gray-900 dark:text-gray-100 mb-1">
                                                    <span className="font-medium">Start Date:</span> {formatDate(record.start_date)}
                                                </p>
                                                <p className="text-gray-900 dark:text-gray-100">
                                                    <span className="font-medium">End Date:</span> {formatDate(record.end_date)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 mb-1">Payment Details</p>
                                                {record.installment_frequency && (
                                                    <p className="text-gray-900 dark:text-gray-100 mb-1">
                                                        <span className="font-medium">Installment:</span> {record.installment_frequency}
                                                    </p>
                                                )}
                                                {record.installment_amount && (
                                                    <p className="text-gray-900 dark:text-gray-100 mb-1">
                                                        <span className="font-medium">Installment Amount:</span> {formatPrice(record.installment_amount)}
                                                    </p>
                                                )}
                                                <p className="text-gray-900 dark:text-gray-100 mb-1">
                                                    <span className="font-medium">Total Interest:</span> {formatPrice(record.total_interest)}
                                                </p>
                                                <p className="text-gray-900 dark:text-gray-100">
                                                    <span className="font-medium">Created:</span> {formatDate(record.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial Summary */}
                                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Total Balance</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {formatPrice(record.total_balance)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Amount Paid</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {formatPrice(record.paid_amount)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Remaining Balance</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {formatPrice(parseFloat(record.total_balance) - parseFloat(record.paid_amount))}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Payment Progress</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {((parseFloat(record.paid_amount) / parseFloat(record.total_balance)) * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            record.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            record.status === 'paid' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                            {record.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Healthcare Records Section */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Healthcare
                        </h4>
                        <button
                            onClick={searchHealthcareRecords}
                            disabled={isLoadingHealthcare}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoadingHealthcare ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Show
                                </>
                            )}
                        </button>
                    </div>

                    {healthcareError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm text-red-600 dark:text-red-400">{healthcareError}</p>
                        </div>
                    )}

                    {healthcareRecords.length > 0 && (
                        <div className="space-y-4">
                            {healthcareRecords.map((record) => (
                                <div key={record.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    {/* Member Header */}
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {record.name}
                                                </h5>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    Member ID: {record.id} • {record.status} • {record.group || 'No Group'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {formatPrice(record.contribution_amount)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {record.contribution_frequency}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Member Details */}
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 mb-1">Personal Information</p>
                                                <p className="text-gray-900 dark:text-gray-100 mb-1">
                                                    <span className="font-medium">Gender:</span> {record.gender}
                                                </p>
                                                <p className="text-gray-900 dark:text-gray-100 mb-1">
                                                    <span className="font-medium">Date of Birth:</span> {formatDate(record.date_of_birth)}
                                                </p>
                                                <p className="text-gray-900 dark:text-gray-100 mb-1">
                                                    <span className="font-medium">Contact:</span> {record.contact_number}
                                                </p>
                                                <p className="text-gray-900 dark:text-gray-100">
                                                    <span className="font-medium">Member Since:</span> {formatDate(record.membership_start_date)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 mb-1">Address</p>
                                                <p className="text-gray-900 dark:text-gray-100 text-sm whitespace-pre-line">
                                                    {record.address}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contributions */}
                                    {record.contributions && record.contributions.length > 0 && (
                                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                            <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                                Contributions ({record.contributions.length})
                                            </h6>
                                            <div className="space-y-2">
                                                {record.contributions.map((contribution) => (
                                                    <div key={contribution.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {formatPrice(contribution.amount)}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {contribution.payment_method} • {formatDate(contribution.payment_date)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            {contribution.reference_number && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Ref: {contribution.reference_number}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Claims */}
                                    {record.claims && record.claims.length > 0 && (
                                        <div className="px-4 py-3">
                                            <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Claims ({record.claims.length})
                                            </h6>
                                            <div className="space-y-3">
                                                {record.claims.map((claim) => (
                                                    <div key={claim.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border-l-4 border-blue-500">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                                                                    {claim.claim_type} Claim
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {formatDate(claim.date_of_service)} • {claim.hospital_name}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {formatPrice(claim.amount)}
                                                                </p>
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                    claim.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                                    claim.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                }`}>
                                                                    {claim.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                <span className="font-medium">Diagnosis:</span> {claim.diagnosis}
                                                            </p>
                                                            {claim.remarks && (
                                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                    <span className="font-medium">Remarks:</span> {claim.remarks}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Summary */}
                                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Total Contributions</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {formatPrice(record.contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0))}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Total Claims</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {formatPrice(record.claims.reduce((sum, c) => sum + parseFloat(c.amount), 0))}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Pending Claims</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {record.claims.filter(c => c.status === 'pending').length}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Approved Claims</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {record.claims.filter(c => c.status === 'approved').length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mortuary Records Section */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                            </svg>
                            Mortuary
                        </h4>
                        <button
                            onClick={searchMortuaryRecords}
                            disabled={isLoadingMortuary}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoadingMortuary ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Show
                                </>
                            )}
                        </button>
                    </div>

                    {mortuaryError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm text-red-600 dark:text-red-400">{mortuaryError}</p>
                        </div>
                    )}

                    {mortuaryRecords.length > 0 && (
                        <div className="space-y-4">
                            {mortuaryRecords.map((record) => (
                                <div key={record.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    {/* Member Header */}
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {record.name}
                                                </h5>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    Member ID: {record.id} • {record.status} • {record.group || 'No Group'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {formatPrice(record.contribution_amount)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {record.contribution_frequency}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Member Details */}
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 mb-1">Personal Information</p>
                                                <p className="text-gray-900 dark:text-gray-100 mb-1">
                                                    <span className="font-medium">Gender:</span> {record.gender}
                                                </p>
                                                <p className="text-gray-900 dark:text-gray-100 mb-1">
                                                    <span className="font-medium">Date of Birth:</span> {formatDate(record.date_of_birth)}
                                                </p>
                                                <p className="text-gray-900 dark:text-gray-100 mb-1">
                                                    <span className="font-medium">Contact:</span> {record.contact_number}
                                                </p>
                                                <p className="text-gray-900 dark:text-gray-100">
                                                    <span className="font-medium">Member Since:</span> {formatDate(record.membership_start_date)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 mb-1">Address</p>
                                                <p className="text-gray-900 dark:text-gray-100 text-sm whitespace-pre-line">
                                                    {record.address}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contributions */}
                                    {record.contributions && record.contributions.length > 0 && (
                                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                            <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                                Contributions ({record.contributions.length})
                                            </h6>
                                            <div className="space-y-2">
                                                {record.contributions.map((contribution) => (
                                                    <div key={contribution.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {formatPrice(contribution.amount)}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {contribution.payment_method} • {formatDate(contribution.payment_date)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            {contribution.reference_number && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Ref: {contribution.reference_number}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Claims */}
                                    {record.claims && record.claims.length > 0 && (
                                        <div className="px-4 py-3">
                                            <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Claims ({record.claims.length})
                                            </h6>
                                            <div className="space-y-3">
                                                {record.claims.map((claim) => (
                                                    <div key={claim.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border-l-4 border-gray-500">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                                                                    {claim.claim_type} Claim
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {formatDate(claim.date_of_death)} • {claim.deceased_name}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {formatPrice(claim.amount)}
                                                                </p>
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                    claim.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                                    claim.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                }`}>
                                                                    {claim.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                <span className="font-medium">Relationship:</span> {claim.relationship_to_member}
                                                            </p>
                                                            {claim.cause_of_death && (
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                    <span className="font-medium">Cause of Death:</span> {claim.cause_of_death}
                                                                </p>
                                                            )}
                                                            {claim.remarks && (
                                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                    <span className="font-medium">Remarks:</span> {claim.remarks}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                claim.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                                            }`}>
                                                                {claim.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Summary */}
                                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Total Contributions</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {formatPrice(record.contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0))}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Total Claims</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {formatPrice(record.claims.reduce((sum, c) => sum + parseFloat(c.amount), 0))}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Pending Claims</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {record.claims.filter(c => c.status === 'pending').length}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400">Active Claims</p>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {record.claims.filter(c => c.is_active).length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 
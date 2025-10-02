import { Badge } from '@/Components/ui/badge';
import { CardContent } from '@/Components/ui/card';
import { Calendar, Mail, Phone, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RecentPatient {
    id: number;
    name: string;
    email: string;
    phone: string;
    created_at: string;
    status: string;
    is_vip: boolean;
    vip_tier?: string;
}

export function ClinicRecentPatientsWidget() {
    const [patients, setPatients] = useState<RecentPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRecentPatients();
    }, []);

    const fetchRecentPatients = async () => {
        try {
            setLoading(true);
            const response = await fetch('/clinic/recent-patients?limit=5');

            if (!response.ok) {
                throw new Error('Failed to fetch recent patients');
            }

            const data = await response.json();
            setPatients(data.patients || []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load recent patients',
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    const getVipTierColor = (tier?: string) => {
        switch (tier) {
            case 'gold':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'platinum':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'diamond':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    if (loading) {
        return (
            <CardContent className="p-6">
                <div className="flex h-32 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
            </CardContent>
        );
    }

    if (error) {
        return (
            <CardContent className="p-6">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <span className="text-sm">{error}</span>
                </div>
            </CardContent>
        );
    }

    if (patients.length === 0) {
        return (
            <CardContent className="p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    No recent patients found
                </div>
            </CardContent>
        );
    }

    return (
        <CardContent className="p-6">
            <div className="space-y-4">
                {patients.map((patient) => (
                    <div
                        key={patient.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {patient.name}
                                    </p>
                                    {patient.is_vip && (
                                        <Badge
                                            className={getVipTierColor(
                                                patient.vip_tier,
                                            )}
                                        >
                                            {patient.vip_tier || 'VIP'}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {patient.phone}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {patient.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="h-3 w-3" />
                                {formatDate(patient.created_at)}
                            </div>
                            <Badge className={getStatusColor(patient.status)}>
                                {patient.status}
                            </Badge>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    );
}

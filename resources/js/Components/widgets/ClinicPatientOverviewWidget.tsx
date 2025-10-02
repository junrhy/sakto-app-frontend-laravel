import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Users, UserPlus, Crown, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageProps } from '@/types';

interface PatientStats {
    total_patients: number;
    new_patients_this_month: number;
    vip_patients: number;
    patients_with_outstanding_bills: number;
}

export function ClinicPatientOverviewWidget() {
    const [stats, setStats] = useState<PatientStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPatientStats();
    }, []);

    const fetchPatientStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/clinic/patient-stats');
            
            if (!response.ok) {
                throw new Error('Failed to fetch patient stats');
            }
            
            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load patient statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <CardContent className="p-6">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </CardContent>
        );
    }

    if (error) {
        return (
            <CardContent className="p-6">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                </div>
            </CardContent>
        );
    }

    if (!stats) {
        return (
            <CardContent className="p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    No patient data available
                </div>
            </CardContent>
        );
    }

    return (
        <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Patients</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {(stats?.total_patients || 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">New This Month</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {(stats?.new_patients_this_month || 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">VIP Patients</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {(stats?.vip_patients || 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding Bills</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {(stats?.patients_with_outstanding_bills || 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </CardContent>
    );
}

import type { FamilyMember } from '@/types/genealogy';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface GenealogyStatsWidgetProps {
    className?: string;
}

export default function GenealogyStatsWidget({
    className = '',
}: GenealogyStatsWidgetProps) {
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGenealogyStats = async () => {
            try {
                const response = await axios.get('/genealogy/widget-stats');
                setFamilyMembers(response.data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch genealogy stats:', err);
                setError('Failed to load genealogy statistics');
            } finally {
                setIsLoading(false);
            }
        };

        fetchGenealogyStats();
        // Refresh every 5 minutes
        const interval = setInterval(fetchGenealogyStats, 300000);

        return () => clearInterval(interval);
    }, []);

    const calculateAge = (
        birthDate: string,
        deathDate?: string | null,
    ): number => {
        const birth = new Date(birthDate);
        const end = deathDate ? new Date(deathDate) : new Date();
        let age = end.getFullYear() - birth.getFullYear();
        const monthDiff = end.getMonth() - birth.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && end.getDate() < birth.getDate())
        ) {
            age--;
        }
        return age;
    };

    const getTreeLevels = (): number => {
        const getLevel = (
            member: FamilyMember,
            visited = new Set<number>(),
        ): number => {
            if (visited.has(member.id)) return 0;
            visited.add(member.id);

            const parentRelationships = member.relationships.filter(
                (rel) => rel.relationship_type === 'parent',
            );

            if (parentRelationships.length === 0) return 1;

            return (
                1 +
                Math.max(
                    ...parentRelationships.map((rel) => {
                        const parent = familyMembers.find(
                            (m) => m.id === rel.to_member_id,
                        );
                        return parent ? getLevel(parent, visited) : 0;
                    }),
                )
            );
        };

        return Math.max(...familyMembers.map((member) => getLevel(member)));
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    };

    const generateCSV = (members: FamilyMember[]): string => {
        const headers = ['Full Name', 'Gender', 'Birth Date', 'Age'];
        const sortedMembers = [...members].sort(
            (a, b) =>
                a.first_name.localeCompare(b.first_name) ||
                a.last_name.localeCompare(b.last_name),
        );
        const csvContent = sortedMembers.map((member) => {
            const fullName = member.death_date
                ? `"${member.first_name} ${member.last_name} (deceased on ${formatDate(member.death_date)})"`
                : `"${member.first_name} ${member.last_name}"`;

            return [
                fullName,
                member.gender,
                formatDate(member.birth_date),
                calculateAge(member.birth_date, member.death_date).toString(),
            ].join(',');
        });

        return [headers.join(','), ...csvContent].join('\n');
    };

    const downloadCSV = (data: string, filename: string) => {
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const stats = [
        {
            label: 'Total Members',
            value: familyMembers.length,
            bgColor: 'bg-gray-50 dark:bg-gray-700',
            textColor: 'text-gray-900 dark:text-gray-200',
        },
        {
            label: 'Levels',
            value: getTreeLevels(),
            bgColor: 'bg-gray-50 dark:bg-gray-700',
            textColor: 'text-gray-900 dark:text-gray-200',
        },
        {
            label: 'Male Members',
            value: familyMembers.filter((member) => member.gender === 'male')
                .length,
            bgColor: 'bg-blue-50 dark:bg-gray-700',
            textColor: 'text-blue-700 dark:text-blue-300',
        },
        {
            label: 'Female Members',
            value: familyMembers.filter((member) => member.gender === 'female')
                .length,
            bgColor: 'bg-pink-50 dark:bg-gray-700',
            textColor: 'text-pink-700 dark:text-pink-300',
        },
        {
            label: 'Living Members',
            value: familyMembers.filter((member) => !member.death_date).length,
            bgColor: 'bg-emerald-50 dark:bg-gray-700',
            textColor: 'text-emerald-700 dark:text-emerald-300',
        },
        {
            label: 'Deceased Members',
            value: familyMembers.filter((member) => !!member.death_date).length,
            bgColor: 'bg-gray-50 dark:bg-gray-700',
            textColor: 'text-gray-700 dark:text-gray-300',
        },
        {
            label: 'No Photo',
            value: familyMembers.filter((member) => !member.photo).length,
            bgColor: 'bg-yellow-50 dark:bg-gray-700',
            textColor: 'text-yellow-700 dark:text-yellow-300',
        },
        {
            label: 'Under 18',
            value: familyMembers.filter(
                (member) =>
                    calculateAge(member.birth_date, member.death_date) < 18,
            ).length,
            bgColor: 'bg-purple-50 dark:bg-gray-700',
            textColor: 'text-purple-700 dark:text-purple-300',
        },
        {
            label: 'Adults With Children',
            value: familyMembers.filter(
                (member) =>
                    calculateAge(member.birth_date, member.death_date) >= 18 &&
                    member.relationships.some(
                        (rel) =>
                            rel.relationship_type === 'child' &&
                            rel.from_member_id === member.id,
                    ),
            ).length,
            bgColor: 'bg-indigo-50 dark:bg-gray-700',
            textColor: 'text-indigo-700 dark:text-indigo-300',
        },
        {
            label: 'Adults Without Children',
            value: familyMembers.filter(
                (member) =>
                    calculateAge(member.birth_date, member.death_date) >= 18 &&
                    !member.relationships.some(
                        (rel) =>
                            rel.relationship_type === 'child' &&
                            rel.from_member_id === member.id,
                    ),
            ).length,
            bgColor: 'bg-orange-50 dark:bg-gray-700',
            textColor: 'text-orange-700 dark:text-orange-300',
        },
    ];

    const getFilteredMembers = (stat: (typeof stats)[0]) => {
        switch (stat.label) {
            case 'Total Members':
                return familyMembers;
            case 'Male Members':
                return familyMembers.filter(
                    (member) => member.gender === 'male',
                );
            case 'Female Members':
                return familyMembers.filter(
                    (member) => member.gender === 'female',
                );
            case 'Living Members':
                return familyMembers.filter((member) => !member.death_date);
            case 'Deceased Members':
                return familyMembers.filter((member) => !!member.death_date);
            case 'No Photo':
                return familyMembers.filter((member) => !member.photo);
            case 'Under 18':
                return familyMembers.filter(
                    (member) =>
                        calculateAge(member.birth_date, member.death_date) < 18,
                );
            case 'Adults With Children':
                return familyMembers.filter(
                    (member) =>
                        calculateAge(member.birth_date, member.death_date) >=
                            18 &&
                        member.relationships.some(
                            (rel) =>
                                rel.relationship_type === 'child' &&
                                rel.from_member_id === member.id,
                        ),
                );
            case 'Adults Without Children':
                return familyMembers.filter(
                    (member) =>
                        calculateAge(member.birth_date, member.death_date) >=
                            18 &&
                        !member.relationships.some(
                            (rel) =>
                                rel.relationship_type === 'child' &&
                                rel.from_member_id === member.id,
                        ),
                );
            default:
                return [];
        }
    };

    return (
        <div
            className={`rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 ${className}`}
        >
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-200">
                Family Statistics
            </h3>
            {isLoading ? (
                <div className="flex h-48 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
                </div>
            ) : error ? (
                <div className="py-4 text-center text-red-500">{error}</div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={`rounded-lg p-4 ${stat.bgColor}`}
                        >
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {stat.label}
                            </div>
                            <div
                                className={`mt-1 text-2xl font-bold ${stat.textColor}`}
                            >
                                {stat.value}
                            </div>
                            {stat.label !== 'Levels' && (
                                <button
                                    onClick={() => {
                                        const filteredMembers =
                                            getFilteredMembers(stat);
                                        const csv =
                                            generateCSV(filteredMembers);
                                        downloadCSV(
                                            csv,
                                            `${stat.label.toLowerCase().replace(/\s+/g, '_')}_members.csv`,
                                        );
                                    }}
                                    className="mt-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                                >
                                    Download CSV
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import type { FamilyMember } from '@/types/family-tree';
import axios from 'axios';

interface FamilyTreeStatsWidgetProps {
    isDarkMode?: boolean;
    className?: string;
}

export default function FamilyTreeStatsWidget({
    isDarkMode = false,
    className = ''
}: FamilyTreeStatsWidgetProps) {
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFamilyStats = async () => {
            try {
                const response = await axios.get('/family-tree/widget-stats');
                setFamilyMembers(response.data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch family tree stats:', err);
                setError('Failed to load family statistics');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFamilyStats();
        // Refresh every 5 minutes
        const interval = setInterval(fetchFamilyStats, 300000);

        return () => clearInterval(interval);
    }, []);

    const calculateAge = (birthDate: string, deathDate?: string | null): number => {
        const birth = new Date(birthDate);
        const end = deathDate ? new Date(deathDate) : new Date();
        let age = end.getFullYear() - birth.getFullYear();
        const monthDiff = end.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const getTreeLevels = (): number => {
        const getLevel = (member: FamilyMember, visited = new Set<number>()): number => {
            if (visited.has(member.id)) return 0;
            visited.add(member.id);
            
            const parentRelationships = member.relationships.filter(
                rel => rel.relationship_type === 'parent'
            );
            
            if (parentRelationships.length === 0) return 1;
            
            return 1 + Math.max(...parentRelationships.map(rel => {
                const parent = familyMembers.find(m => m.id === rel.to_member_id);
                return parent ? getLevel(parent, visited) : 0;
            }));
        };

        return Math.max(...familyMembers.map(member => getLevel(member)));
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
        const sortedMembers = [...members].sort((a, b) => 
            a.first_name.localeCompare(b.first_name) || 
            a.last_name.localeCompare(b.last_name)
        );
        const csvContent = sortedMembers.map(member => {
            const fullName = member.death_date 
                ? `"${member.first_name} ${member.last_name} (deceased on ${formatDate(member.death_date)})"`
                : `"${member.first_name} ${member.last_name}"`;
            
            return [
                fullName,
                member.gender,
                formatDate(member.birth_date),
                calculateAge(member.birth_date, member.death_date).toString()
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
            bgColor: isDarkMode ? 'bg-gray-700' : 'bg-gray-50',
            textColor: isDarkMode ? 'text-gray-200' : 'text-gray-900'
        },
        {
            label: 'Levels',
            value: getTreeLevels(),
            bgColor: isDarkMode ? 'bg-gray-700' : 'bg-gray-50',
            textColor: isDarkMode ? 'text-gray-200' : 'text-gray-900'
        },
        {
            label: 'Male Members',
            value: familyMembers.filter(member => member.gender === 'male').length,
            bgColor: isDarkMode ? 'bg-gray-700' : 'bg-blue-50',
            textColor: isDarkMode ? 'text-blue-300' : 'text-blue-700'
        },
        {
            label: 'Female Members',
            value: familyMembers.filter(member => member.gender === 'female').length,
            bgColor: isDarkMode ? 'bg-gray-700' : 'bg-pink-50',
            textColor: isDarkMode ? 'text-pink-300' : 'text-pink-700'
        },
        {
            label: 'Living Members',
            value: familyMembers.filter(member => !member.death_date).length,
            bgColor: isDarkMode ? 'bg-gray-700' : 'bg-emerald-50',
            textColor: isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
        },
        {
            label: 'Deceased Members',
            value: familyMembers.filter(member => !!member.death_date).length,
            bgColor: isDarkMode ? 'bg-gray-700' : 'bg-gray-50',
            textColor: isDarkMode ? 'text-gray-300' : 'text-gray-700'
        },
        {
            label: 'No Photo',
            value: familyMembers.filter(member => !member.photo).length,
            bgColor: isDarkMode ? 'bg-gray-700' : 'bg-yellow-50',
            textColor: isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
        },
        {
            label: 'Under 18',
            value: familyMembers.filter(member => 
                calculateAge(member.birth_date, member.death_date) < 18
            ).length,
            bgColor: isDarkMode ? 'bg-gray-700' : 'bg-purple-50',
            textColor: isDarkMode ? 'text-purple-300' : 'text-purple-700'
        },
        {
            label: 'Adults With Children',
            value: familyMembers.filter(member => 
                calculateAge(member.birth_date, member.death_date) >= 18 &&
                member.relationships.some(rel => rel.relationship_type === 'child' && rel.from_member_id === member.id)
            ).length,
            bgColor: isDarkMode ? 'bg-gray-700' : 'bg-indigo-50',
            textColor: isDarkMode ? 'text-indigo-300' : 'text-indigo-700'
        },
        {
            label: 'Adults Without Children',
            value: familyMembers.filter(member => 
                calculateAge(member.birth_date, member.death_date) >= 18 &&
                !member.relationships.some(rel => rel.relationship_type === 'child' && rel.from_member_id === member.id)
            ).length,
            bgColor: isDarkMode ? 'bg-gray-700' : 'bg-orange-50',
            textColor: isDarkMode ? 'text-orange-300' : 'text-orange-700'
        }
    ];

    const getFilteredMembers = (stat: typeof stats[0]) => {
        switch (stat.label) {
            case 'Total Members':
                return familyMembers;
            case 'Male Members':
                return familyMembers.filter(member => member.gender === 'male');
            case 'Female Members':
                return familyMembers.filter(member => member.gender === 'female');
            case 'Living Members':
                return familyMembers.filter(member => !member.death_date);
            case 'Deceased Members':
                return familyMembers.filter(member => !!member.death_date);
            case 'No Photo':
                return familyMembers.filter(member => !member.photo);
            case 'Under 18':
                return familyMembers.filter(member => 
                    calculateAge(member.birth_date, member.death_date) < 18
                );
            case 'Adults With Children':
                return familyMembers.filter(member => 
                    calculateAge(member.birth_date, member.death_date) >= 18 &&
                    member.relationships.some(rel => rel.relationship_type === 'child' && rel.from_member_id === member.id)
                );
            case 'Adults Without Children':
                return familyMembers.filter(member => 
                    calculateAge(member.birth_date, member.death_date) >= 18 &&
                    !member.relationships.some(rel => rel.relationship_type === 'child' && rel.from_member_id === member.id)
                );
            default:
                return [];
        }
    };

    return (
        <div className={`p-6 bg-white rounded-lg shadow-sm ${className}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                Family Statistics
            </h3>
            {isLoading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 py-4">
                    {error}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {stats.map((stat, index) => (
                        <div key={index} className={`p-4 rounded-lg ${stat.bgColor}`}>
                            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {stat.label}
                            </div>
                            <div className={`text-2xl font-bold mt-1 ${stat.textColor}`}>
                                {stat.value}
                            </div>
                            {stat.label !== 'Levels' && (
                                <button
                                    onClick={() => {
                                        const filteredMembers = getFilteredMembers(stat);
                                        const csv = generateCSV(filteredMembers);
                                        downloadCSV(csv, `${stat.label.toLowerCase().replace(/\s+/g, '_')}_members.csv`);
                                    }}
                                    className={`mt-2 text-sm px-3 py-1 rounded-md 
                                        ${isDarkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 
                                        'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
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
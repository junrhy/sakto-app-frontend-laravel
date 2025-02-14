import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import type { FamilyMember, FamilyTreeProps, FamilyRelationship } from '@/types/family-tree';
import { FaMoon, FaSun, FaSearch, FaHome } from 'react-icons/fa';

export default function FamilyMemberFullView({ familyMembers }: FamilyTreeProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

    const filteredMembers = familyMembers.filter((member: FamilyMember) => 
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRelationshipLabel = (type: 'parent' | 'child' | 'spouse' | 'sibling'): string => {
        const labels: Record<string, string> = {
            parent: 'Parent of',
            child: 'Child of',
            spouse: 'Spouse of',
            sibling: 'Sibling of'
        };
        return labels[type];
    };

    const calculateAge = (birthDate: string, deathDate: string | null | undefined): number => {
        const birth = new Date(birthDate);
        const end = deathDate ? new Date(deathDate) : new Date();
        let age = end.getFullYear() - birth.getFullYear();
        const monthDiff = end.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const getMemberById = (id: number): FamilyMember | undefined => {
        return familyMembers.find((member: FamilyMember) => member.id === id);
    };

    return (
        <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <Head title="Family Members - Full View" />

            {/* Header */}
            <div className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <a
                                href="/"
                                className={`p-2 rounded-lg transition-colors ${
                                    isDarkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                <FaHome />
                            </a>
                            <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Family Members Directory
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`} />
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    className={`pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`p-2 rounded-lg transition-colors ${
                                    isDarkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                {isDarkMode ? <FaSun /> : <FaMoon />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pt-20 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMembers.map((member: FamilyMember) => (
                        <div
                            key={member.id}
                            className={`rounded-lg shadow-lg overflow-hidden transition-all duration-200 cursor-pointer ${
                                selectedMember?.id === member.id
                                    ? isDarkMode 
                                        ? 'bg-blue-900/30 ring-2 ring-blue-500'
                                        : 'bg-blue-50 ring-2 ring-blue-300'
                                    : isDarkMode
                                        ? 'bg-gray-800 hover:bg-gray-700'
                                        : 'bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                        >
                            {/* Member Photo */}
                            <div className={`aspect-square w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                {member.photo ? (
                                    <img
                                        src={member.photo}
                                        alt={`${member.first_name} ${member.last_name}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className={`text-4xl font-semibold ${
                                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                        }`}>
                                            {member.first_name[0]}
                                            {member.last_name[0]}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Member Info */}
                            <div className="p-4">
                                <h3 className={`text-lg font-semibold mb-2 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {member.first_name} {member.last_name}
                                </h3>
                                <div className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <p>
                                        <span className="font-medium">Birth Date:</span>{' '}
                                        {new Date(member.birth_date).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <span className="font-medium">Age:</span>{' '}
                                        {calculateAge(member.birth_date, member.death_date)} years
                                    </p>
                                    {member.death_date && (
                                        <p>
                                            <span className="font-medium">Death Date:</span>{' '}
                                            {new Date(member.death_date).toLocaleDateString()}
                                        </p>
                                    )}
                                    <p>
                                        <span className="font-medium">Gender:</span>{' '}
                                        {member.gender.charAt(0).toUpperCase() + member.gender.slice(1)}
                                    </p>
                                </div>

                                {/* Expanded Content */}
                                {selectedMember?.id === member.id && (
                                    <div className={`mt-4 pt-4 border-t ${
                                        isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-600'
                                    }`}>
                                        {member.notes && (
                                            <div className="mb-4">
                                                <h4 className={`font-medium mb-2 ${
                                                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                                }`}>Notes</h4>
                                                <p className="text-sm">{member.notes}</p>
                                            </div>
                                        )}
                                        <div>
                                            <h4 className={`font-medium mb-2 ${
                                                isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                            }`}>Relationships</h4>
                                            <ul className="space-y-1 text-sm">
                                                {member.relationships.map((rel: FamilyRelationship) => {
                                                    const relatedMember = getMemberById(rel.to_member_id);
                                                    return relatedMember ? (
                                                        <li key={rel.id}>
                                                            {getRelationshipLabel(rel.relationship_type)}:{' '}
                                                            {relatedMember.first_name} {relatedMember.last_name}
                                                        </li>
                                                    ) : null;
                                                })}
                                                {member.relationships.length === 0 && (
                                                    <li className="italic">No relationships defined</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredMembers.length === 0 && (
                    <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No family members found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
} 
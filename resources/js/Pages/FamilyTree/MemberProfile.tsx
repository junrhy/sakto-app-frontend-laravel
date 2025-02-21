import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import type { FamilyMember, FamilyRelationship } from '@/types/family-tree';
import { FaMoon, FaSun, FaMars, FaVenus } from 'react-icons/fa';

interface MemberProfileProps {
    member: FamilyMember;
    clientIdentifier: string;
}

export default function MemberProfile({ member, clientIdentifier }: MemberProfileProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);

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

    return (
        <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <Head title={`${member.first_name} ${member.last_name} - Profile`} />

            {/* Header */}
            <div className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Family Member Profile
                        </h1>
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

            {/* Main Content */}
            <div className="container mx-auto px-4 pt-20 pb-8">
                <div className={`max-w-4xl mx-auto rounded-lg shadow-lg overflow-hidden ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    {/* Member Photo */}
                    <div className="relative">
                        <div className={`aspect-[3/1] ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            {member.photo ? (
                                <img
                                    src={member.photo}
                                    alt={`${member.first_name} ${member.last_name}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className={`text-6xl font-semibold ${
                                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                        {member.first_name[0]}
                                        {member.last_name[0]}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {/* Profile Picture Overlay */}
                        <div className="absolute -bottom-16 left-8">
                            <div className={`w-32 h-32 rounded-full border-4 ${
                                isDarkMode ? 'border-gray-800 bg-gray-700' : 'border-white bg-gray-200'
                            }`}>
                                {member.photo ? (
                                    <img
                                        src={member.photo}
                                        alt={`${member.first_name} ${member.last_name}`}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full flex items-center justify-center">
                                        <span className={`text-3xl font-semibold ${
                                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                        }`}>
                                            {member.first_name[0]}
                                            {member.last_name[0]}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Member Info */}
                    <div className="pt-20 px-8 pb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {member.first_name} {member.last_name}
                            </h2>
                            {member.gender === 'male' ? (
                                <FaMars className="text-blue-500 text-xl" />
                            ) : (
                                <FaVenus className="text-pink-500 text-xl" />
                            )}
                        </div>

                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                            {/* Basic Information */}
                            <div>
                                <h3 className={`text-lg font-semibold mb-4 ${
                                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                }`}>
                                    Basic Information
                                </h3>
                                <div className="space-y-3">
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
                            </div>

                            {/* Relationships */}
                            {member.relationships && member.relationships.length > 0 && (
                                <div>
                                    <h3 className={`text-lg font-semibold mb-4 ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                    }`}>
                                        Relationships
                                    </h3>
                                    <div className="space-y-3">
                                        {member.relationships.map((rel) => (
                                            <div key={rel.id} className="flex items-center gap-2">
                                                <span className="font-medium capitalize">{rel.relationship_type} of:</span>
                                                {rel.to_member && (
                                                    <span>
                                                        {rel.to_member.first_name} {rel.to_member.last_name}
                                                        {rel.to_member.birth_date && (
                                                            <span className="text-sm text-gray-500">
                                                                {' '}
                                                                ({new Date(rel.to_member.birth_date).getFullYear()})
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Related To */}
                            {member.related_to && member.related_to.length > 0 && (
                                <div>
                                    <h3 className={`text-lg font-semibold mb-4 ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                    }`}>
                                        Related To
                                    </h3>
                                    <div className="space-y-3">
                                        {member.related_to.map((rel) => (
                                            <div key={rel.id} className="flex items-center gap-2">
                                                <span className="font-medium capitalize">{rel.relationship_type}:</span>
                                                {rel.from_member && (
                                                    <span>
                                                        {rel.from_member.first_name} {rel.from_member.last_name}
                                                        {rel.from_member.birth_date && (
                                                            <span className="text-sm text-gray-500">
                                                                {' '}
                                                                ({new Date(rel.from_member.birth_date).getFullYear()})
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {member.notes && (
                                <div className="md:col-span-2">
                                    <h3 className={`text-lg font-semibold mb-4 ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                    }`}>
                                        Notes
                                    </h3>
                                    <p className="whitespace-pre-line">{member.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
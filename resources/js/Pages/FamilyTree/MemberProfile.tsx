import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import type { FamilyMember, FamilyRelationship } from '@/types/family-tree';
import { FaMoon, FaSun, FaMars, FaVenus, FaUserCircle, FaChevronLeft } from 'react-icons/fa';

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
        <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <Head title={`${member.first_name} ${member.last_name} - Profile`} />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className={`max-w-4xl mx-auto rounded-xl shadow-xl overflow-hidden ${
                    isDarkMode ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white'
                }`}>
                    {/* Member Photo Banner */}
                    <div className="relative">
                        <div className={`h-48 md:h-64 ${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className={`p-2 rounded-full transition-colors ${
                                        isDarkMode 
                                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                            : 'bg-white/80 hover:bg-white text-gray-700'
                                    }`}
                                >
                                    {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
                                </button>
                            </div>
                            {member.photo && (
                                <img
                                    src={member.photo}
                                    alt={`${member.first_name} ${member.last_name}`}
                                    className="w-full h-full object-cover opacity-50"
                                />
                            )}
                        </div>
                        
                        {/* Profile Picture Overlay */}
                        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                            <div className={`w-32 h-32 rounded-full border-4 shadow-lg ${
                                isDarkMode ? 'border-gray-800 bg-gray-700' : 'border-white bg-gray-100'
                            }`}>
                                {member.photo ? (
                                    <img
                                        src={member.photo}
                                        alt={`${member.first_name} ${member.last_name}`}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full flex items-center justify-center">
                                        <FaUserCircle className={`w-20 h-20 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Member Info */}
                    <div className="pt-20 px-6 md:px-8 pb-8">
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {member.first_name} {member.last_name}
                                </h2>
                                {member.gender === 'male' ? (
                                    <FaMars className="text-blue-500 text-2xl" />
                                ) : (
                                    <FaVenus className="text-pink-500 text-2xl" />
                                )}
                            </div>
                            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {calculateAge(member.birth_date, member.death_date)} years old
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Basic Information Card */}
                            <div className={`p-6 rounded-xl ${
                                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                            }`}>
                                <h3 className={`text-lg font-semibold mb-4 ${
                                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                }`}>
                                    Basic Information
                                </h3>
                                <div className="space-y-4">
                                    <div className={`flex items-center justify-between ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                        <span className="font-medium">Birth Date</span>
                                        <span>{new Date(member.birth_date).toLocaleDateString()}</span>
                                    </div>
                                    {member.death_date && (
                                        <div className={`flex items-center justify-between ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}>
                                            <span className="font-medium">Death Date</span>
                                            <span>{new Date(member.death_date).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    <div className={`flex items-center justify-between ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                        <span className="font-medium">Gender</span>
                                        <span className="flex items-center gap-2">
                                            {member.gender.charAt(0).toUpperCase() + member.gender.slice(1)}
                                            {member.gender === 'male' ? (
                                                <FaMars className="text-blue-500" />
                                            ) : (
                                                <FaVenus className="text-pink-500" />
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Family Relationships Card */}
                            {member.relationships && member.relationships.length > 0 && (
                                <div className={`p-6 rounded-xl md:col-span-2 ${
                                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                                }`}>
                                    <h3 className={`text-lg font-semibold mb-4 ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                    }`}>
                                        Family Relationships
                                    </h3>
                                    <div className="space-y-4">
                                        {member.relationships.map((rel) => (
                                            <div key={rel.id} className={`flex items-center justify-between ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                            }`}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium capitalize">{rel.relationship_type} of:</span>
                                                </div>
                                                {rel.to_member && (
                                                    <span className="flex items-center gap-2">
                                                        {rel.to_member.first_name} {rel.to_member.last_name}
                                                        {rel.to_member.birth_date && (
                                                            <span className={`text-sm ${
                                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                            }`}>
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

                            {/* Notes Card */}
                            {member.notes && (
                                <div className={`p-6 rounded-xl md:col-span-2 ${
                                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                                }`}>
                                    <h3 className={`text-lg font-semibold mb-4 ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                    }`}>
                                        Notes
                                    </h3>
                                    <p className={`whitespace-pre-line ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                        {member.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
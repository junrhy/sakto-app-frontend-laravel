import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { FamilyMember, FamilyTreeProps, RelationshipType, FamilyRelationship } from '@/types/family-tree';
import { FaUserPlus, FaFileExport, FaFileImport, FaSearch, FaExpandAlt, FaCompressAlt, FaSun, FaMoon, FaCamera } from 'react-icons/fa';
import FamilyTreeVisualization from '@/Components/FamilyTreeVisualization';

export default function Index({ auth, familyMembers }: FamilyTreeProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMember, setNewMember] = useState({
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: 'male',
        notes: '',
        photo: null as File | null,
        relationships: [] as { type: RelationshipType; member_id: number }[]
    });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const filteredMembers = familyMembers.filter((member: FamilyMember) => 
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRelationshipLabel = (type: RelationshipType): string => {
        const labels: Record<RelationshipType, string> = {
            parent: 'Parent of',
            child: 'Child of',
            spouse: 'Spouse of',
            sibling: 'Sibling of'
        };
        return labels[type];
    };

    const getMemberById = (id: number): FamilyMember | undefined => {
        return familyMembers.find((member: FamilyMember) => member.id === id);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewMember(prev => ({ ...prev, photo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddMember = () => {
        // TODO: Implement add member functionality
        console.log('Adding new member:', newMember);
        setIsAddModalOpen(false);
        resetNewMember();
    };

    const resetNewMember = () => {
        setNewMember({
            first_name: '',
            last_name: '',
            birth_date: '',
            gender: 'male',
            notes: '',
            photo: null,
            relationships: []
        });
        setPhotoPreview(null);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Family Tree</h2>}
        >
            <Head title="Family Tree" />

            <div className={`transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
                <div className="w-full px-2 sm:px-4 md:px-6">
                    {/* Toolbar */}
                    <div className={`overflow-hidden shadow-sm sm:rounded-lg mb-4 sm:mb-6 transition-colors duration-200 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                                <button
                                    className="flex-1 sm:flex-none inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 justify-center"
                                    onClick={() => setIsAddModalOpen(true)}
                                >
                                    <FaUserPlus className="mr-2" />
                                    Add Member
                                </button>
                                <button
                                    className="flex-1 sm:flex-none inline-flex items-center px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200 justify-center"
                                    onClick={() => {/* TODO: Export functionality */}}
                                >
                                    <FaFileExport className="mr-2" />
                                    Export
                                </button>
                                <button
                                    className="flex-1 sm:flex-none inline-flex items-center px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200 justify-center"
                                    onClick={() => {/* TODO: Import modal */}}
                                >
                                    <FaFileImport className="mr-2" />
                                    Import
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`} />
                                    <input
                                        type="text"
                                        placeholder="Search members..."
                                        className={`w-full sm:w-auto pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        }`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className={`inline-flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                                            isDarkMode 
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                        onClick={toggleDarkMode}
                                    >
                                        {isDarkMode ? <FaSun /> : <FaMoon />}
                                    </button>
                                    <button
                                        className={`inline-flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                                            isDarkMode 
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                        onClick={toggleFullscreen}
                                    >
                                        {isFullscreen ? <FaCompressAlt /> : <FaExpandAlt />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content area */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                        {/* Family tree visualization */}
                        <div className={`lg:col-span-3 overflow-hidden shadow-sm sm:rounded-lg transition-colors duration-200 order-2 lg:order-1 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                            <div className="p-3 sm:p-4 md:p-6">
                                <h3 className={`text-lg font-semibold mb-4 ${
                                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                }`}>
                                    Family Tree Visualization
                                </h3>
                                <div className={`relative h-[400px] sm:h-[500px] md:h-[600px] rounded-lg transition-colors duration-200 flex items-center justify-center ${
                                    isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
                                }`}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FamilyTreeVisualization 
                                            familyMembers={familyMembers}
                                            onNodeClick={setSelectedMember}
                                            isDarkMode={isDarkMode}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Member list and details */}
                        <div className={`overflow-hidden shadow-sm sm:rounded-lg transition-colors duration-200 order-1 lg:order-2 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}>
                            <div className="p-6">
                                <h3 className={`text-lg font-semibold mb-4 ${
                                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                }`}>
                                    Family Members
                                </h3>
                                <div className="space-y-4">
                                    {filteredMembers.map((member: FamilyMember) => (
                                        <div
                                            key={member.id}
                                            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                                                selectedMember?.id === member.id
                                                    ? isDarkMode 
                                                        ? 'bg-blue-900/30 border-2 border-blue-700'
                                                        : 'bg-blue-50 border-2 border-blue-200'
                                                    : isDarkMode
                                                        ? 'bg-gray-700 hover:bg-gray-600'
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                            onClick={() => setSelectedMember(member)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                    isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                                                }`}>
                                                    {member.photo ? (
                                                        <img
                                                            src={member.photo}
                                                            alt={`${member.first_name} ${member.last_name}`}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className={`text-xl ${
                                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                        }`}>
                                                            {member.first_name[0]}
                                                            {member.last_name[0]}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className={`font-medium ${
                                                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                                    }`}>
                                                        {member.first_name} {member.last_name}
                                                    </h4>
                                                    <p className={`text-sm ${
                                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                    }`}>
                                                        Born: {new Date(member.birth_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {selectedMember?.id === member.id && (
                                                <div className="mt-4 space-y-2">
                                                    <p className={`text-sm ${
                                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                    }`}>
                                                        {member.notes}
                                                    </p>
                                                    <div className="mt-2">
                                                        <h5 className={`text-sm font-medium mb-1 ${
                                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                                        }`}>
                                                            Relationships:
                                                        </h5>
                                                        <ul className={`text-sm space-y-1 ${
                                                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                        }`}>
                                                            {member.relationships.map((rel: FamilyRelationship) => {
                                                                const relatedMember = getMemberById(rel.to_member_id);
                                                                return (
                                                                    <li key={rel.id}>
                                                                        {getRelationshipLabel(rel.relationship_type)}:{' '}
                                                                        {relatedMember
                                                                            ? `${relatedMember.first_name} ${relatedMember.last_name}`
                                                                            : 'Unknown Member'}
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                    <div className="flex gap-2 mt-4">
                                                        <button
                                                            className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                                                                isDarkMode
                                                                    ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-900/70'
                                                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                            }`}
                                                            onClick={() => {/* TODO: Edit member */}}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                                                                isDarkMode
                                                                    ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                            }`}
                                                            onClick={() => {/* TODO: Delete member */}}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`w-full max-w-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl`}>
                        <div className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                    Add Family Member
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        resetNewMember();
                                    }}
                                    className={`text-gray-400 hover:text-gray-500 transition-colors`}
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Photo Upload */}
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <div className={`w-32 h-32 rounded-full flex items-center justify-center overflow-hidden ${
                                            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                        }`}>
                                            {photoPreview ? (
                                                <img
                                                    src={photoPreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <FaCamera className={`w-8 h-8 ${
                                                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                                }`} />
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newMember.first_name}
                                            onChange={(e) => setNewMember(prev => ({ ...prev, first_name: e.target.value }))}
                                            className={`w-full px-3 py-2 rounded-md border ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newMember.last_name}
                                            onChange={(e) => setNewMember(prev => ({ ...prev, last_name: e.target.value }))}
                                            className={`w-full px-3 py-2 rounded-md border ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Birth Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newMember.birth_date}
                                            onChange={(e) => setNewMember(prev => ({ ...prev, birth_date: e.target.value }))}
                                            className={`w-full px-3 py-2 rounded-md border ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Gender
                                        </label>
                                        <select
                                            value={newMember.gender}
                                            onChange={(e) => setNewMember(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' }))}
                                            className={`w-full px-3 py-2 rounded-md border ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Notes
                                    </label>
                                    <textarea
                                        value={newMember.notes}
                                        onChange={(e) => setNewMember(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={3}
                                        className={`w-full px-3 py-2 rounded-md border ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    />
                                </div>

                                {/* Relationships */}
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Relationships
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <select
                                            className={`flex-1 px-3 py-2 rounded-md border ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <option value="">Select a member...</option>
                                            {familyMembers.map(member => (
                                                <option key={member.id} value={member.id}>
                                                    {member.first_name} {member.last_name}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            className={`w-40 px-3 py-2 rounded-md border ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <option value="parent">Parent</option>
                                            <option value="child">Child</option>
                                            <option value="spouse">Spouse</option>
                                            <option value="sibling">Sibling</option>
                                        </select>
                                        <button
                                            className={`px-4 py-2 rounded-md ${
                                                isDarkMode
                                                    ? 'bg-blue-600 hover:bg-blue-700'
                                                    : 'bg-blue-500 hover:bg-blue-600'
                                            } text-white transition-colors`}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        onClick={() => {
                                            setIsAddModalOpen(false);
                                            resetNewMember();
                                        }}
                                        className={`px-4 py-2 rounded-md ${
                                            isDarkMode
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        } transition-colors`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddMember}
                                        className={`px-4 py-2 rounded-md ${
                                            isDarkMode
                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                : 'bg-blue-500 hover:bg-blue-600'
                                        } text-white transition-colors`}
                                    >
                                        Add Member
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
} 
import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import type { FamilyMember, FamilyRelationship } from '@/types/family-tree';
import { FaMoon, FaSun, FaMars, FaVenus, FaUserCircle, FaChevronLeft, FaEllipsisV, FaHeart, FaComment, FaShare, FaMapMarkerAlt, FaBirthdayCake, FaUserFriends, FaCamera, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { X } from "lucide-react";

interface MemberProfileProps {
    member: FamilyMember;
    clientIdentifier: string;
}

// Update the RelatedMemberInfo type to include photo and match FamilyMember interface
interface RelatedMemberInfo {
    id: number;
    first_name: string;
    last_name: string;
    photo?: string | null;
    birth_date?: string;
    death_date?: string | null;
    gender?: 'male' | 'female' | 'other';
    notes?: string;
}

interface EditFormData {
    first_name: string;
    last_name: string;
    birth_date: string;
    death_date: string;
    gender: 'male' | 'female' | 'other';
    notes: string;
    photo: File | string | null;
}

export default function MemberProfile({ member, clientIdentifier }: MemberProfileProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [allMembers, setAllMembers] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<EditFormData>({
        first_name: member.first_name,
        last_name: member.last_name,
        birth_date: member.birth_date,
        death_date: member.death_date || '',
        gender: member.gender,
        notes: member.notes || '',
        photo: member.photo || null,
    });
    const [photoPreview, setPhotoPreview] = useState<string | null>(member.photo);
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayCount, setDisplayCount] = useState(15);

    useEffect(() => {
        const fetchAllMembers = async () => {
            try {
                const response = await axios.get(`/family-tree/${clientIdentifier}/all-members`);
                const members = response.data;
                
                // Filter out members that are already shown in Family Connections
                const connectedMemberIds = new Set(
                    member.relationships?.map(rel => rel.to_member?.id) || []
                );
                
                // Sort remaining members alphabetically by first name
                const sortedMembers = members
                    .filter((m: FamilyMember) => 
                        // Exclude self and connected members
                        m.id !== member.id && !connectedMemberIds.has(m.id)
                    )
                    .sort((a: FamilyMember, b: FamilyMember) => 
                        a.first_name.localeCompare(b.first_name)
                    );

                setAllMembers(sortedMembers);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch members:', error);
                setLoading(false);
            }
        };

        fetchAllMembers();
    }, [member, clientIdentifier]);

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

    // Helper function to get relationship type
    const getRelationshipType = (memberId: number): string => {
        const relationship = member.relationships?.find(rel => rel.to_member?.id === memberId);
        if (!relationship?.relationship_type) return '';
        return relationship.relationship_type.charAt(0).toUpperCase() + relationship.relationship_type.slice(1);
    };

    // Helper function to render member photo
    const renderMemberPhoto = (memberData: FamilyMember | RelatedMemberInfo | null | undefined) => {
        if (!memberData || !memberData.photo) return (
            <div className="w-full h-full flex items-center justify-center">
                <FaUserCircle className="w-full h-full text-gray-400" />
            </div>
        );

        return (
            <img
                src={memberData.photo}
                alt={`${memberData.first_name} ${memberData.last_name}`}
                className="w-full h-full rounded-full object-cover"
            />
        );
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditFormData(prev => ({ ...prev, photo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const errors: {[key: string]: string} = {};
        
        if (!editFormData.first_name.trim()) {
            errors.first_name = 'First name is required';
        }
        
        if (!editFormData.last_name.trim()) {
            errors.last_name = 'Last name is required';
        }
        
        if (!editFormData.birth_date) {
            errors.birth_date = 'Birth date is required';
        } else if (new Date(editFormData.birth_date) > new Date()) {
            errors.birth_date = 'Birth date cannot be in the future';
        }
        
        if (editFormData.death_date) {
            if (new Date(editFormData.death_date) > new Date()) {
                errors.death_date = 'Death date cannot be in the future';
            }
            if (new Date(editFormData.death_date) < new Date(editFormData.birth_date)) {
                errors.death_date = 'Death date must be after birth date';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitEdit = async () => {
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            const formData = new FormData();
            formData.append('member_id', member.id.toString());
            formData.append('first_name', editFormData.first_name);
            formData.append('last_name', editFormData.last_name);
            formData.append('birth_date', editFormData.birth_date);
            formData.append('death_date', editFormData.death_date);
            formData.append('gender', editFormData.gender);
            formData.append('notes', editFormData.notes);
            
            if (editFormData.photo instanceof File) {
                formData.append('photo', editFormData.photo);
            }
            
            // Send edit request to user's email instead of saving directly
            await axios.post(`/family-tree/${clientIdentifier}/request-edit`, formData);
            
            alert('Edit request has been sent to the account owner for approval.');
            setIsEditModalOpen(false);
            
        } catch (error) {
            console.error('Error sending edit request:', error);
            alert('Failed to send edit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update error state handling
    const clearFieldError = (field: string) => {
        setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    // Filter members based on search query
    const filteredMembers = allMembers.filter(familyMember => {
        const fullName = `${familyMember.first_name} ${familyMember.last_name}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    return (
        <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <Head title={`${member.first_name} ${member.last_name} - Profile`} />

            {/* Cover Photo Section */}
            <div className="relative h-[300px] w-full overflow-hidden">
                <div className={`absolute inset-0 ${
                    isDarkMode 
                        ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900' 
                        : 'bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500'
                }`}>
                    {/* Family Tree Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <pattern id="family-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="currentColor"/>
                                <circle cx="10" cy="10" r="3" fill="currentColor"/>
                            </pattern>
                            <rect x="0" y="0" width="100" height="100" fill="url(#family-pattern)"/>
                        </svg>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 opacity-20">
                            <FaUserFriends className="w-full h-full text-white" />
                        </div>
                    </div>
                </div>
                
                {/* Dark Mode Toggle */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-3 rounded-full transition-all shadow-lg ${
                            isDarkMode 
                                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                                : 'bg-white hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                        {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 -mt-[100px] relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Card */}
                    <div className={`rounded-xl shadow-xl overflow-hidden mb-6 ${
                        isDarkMode ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white'
                    }`}>
                        <div className="p-6">
                            {/* Profile Picture and Basic Info */}
                            <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
                                <div className={`w-32 h-32 rounded-full border-4 shadow-lg flex-shrink-0 ${
                                    isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-white bg-white'
                                }`}>
                                    {renderMemberPhoto(member)}
                                </div>

                                <div className="flex-1">
                                    <div className="text-center md:text-left">
                                        <h1 className={`text-3xl font-bold break-words mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {member.first_name} {member.last_name}
                                        </h1>
                                        
                                        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                            <span className={`text-sm font-medium ${
                                                member.gender === 'male' 
                                                    ? 'text-blue-500' 
                                                    : 'text-pink-500'
                                            }`}>
                                                {member.gender === 'male' ? 'Male' : 'Female'}
                                            </span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        className={`p-1 hover:bg-transparent ${
                                                            isDarkMode 
                                                                ? 'text-gray-400 hover:text-gray-300' 
                                                                : 'text-gray-500 hover:text-gray-700'
                                                        }`}
                                                    >
                                                        <FaEllipsisV className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent 
                                                    align="end" 
                                                    alignOffset={0}
                                                    className="w-48"
                                                >
                                                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                                                        Request Profile Edit
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        
                                        <div className={`flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}>
                                            <div className="flex items-center gap-1">
                                                <FaBirthdayCake className="w-4 h-4" />
                                                <span>{new Date(member.birth_date).toLocaleDateString()} ({calculateAge(member.birth_date, member.death_date)} years)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaUserFriends className="w-4 h-4" />
                                                <span>{member.relationships?.length || 0} Family Connections</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline/Feed Section */}
                    <div className="space-y-6">
                        {/* Family Relationships Card */}
                        {member.relationships && member.relationships.length > 0 && (
                            <div className={`rounded-xl shadow-lg overflow-hidden ${
                                isDarkMode ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white'
                            }`}>
                                <div className="p-6">
                                    <h3 className={`text-xl font-semibold mb-6 ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                    }`}>
                                        Family Connections
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {member.relationships
                                            .filter(rel => {
                                                // For parent-child relationships, only show if:
                                                // 1. It's not a parent-child relationship, OR
                                                // 2. It's a parent-child relationship and this is the first occurrence
                                                if (rel.relationship_type !== 'parent' && rel.relationship_type !== 'child') {
                                                    return true;
                                                }
                                                
                                                // Find if there's a matching reverse relationship
                                                const reverseRelation = member.relationships.find(r => 
                                                    r.to_member?.id === rel.to_member?.id && 
                                                    ((r.relationship_type === 'parent' && rel.relationship_type === 'child') ||
                                                     (r.relationship_type === 'child' && rel.relationship_type === 'parent'))
                                                );
                                                
                                                // Only show if this is the first occurrence
                                                return !reverseRelation || rel.id < reverseRelation.id;
                                            })
                                            .map((rel) => (
                                            <div 
                                                key={rel.id} 
                                                className={`rounded-xl transition-all duration-200 ${
                                                    isDarkMode 
                                                        ? 'bg-gray-700/50 hover:bg-gray-700/70' 
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                }`}
                                            >
                                                <div className="p-3">
                                                    <div className="flex flex-col items-center text-center">
                                                        <div className={`w-24 h-24 rounded-full overflow-hidden mb-3 border-4 ${
                                                            isDarkMode ? 'border-gray-600' : 'border-white'
                                                        }`}>
                                                            {renderMemberPhoto(rel.to_member)}
                                                        </div>
                                                        
                                                        <div className="space-y-1.5">
                                                            {rel.to_member && (
                                                                <Link
                                                                    href={`/family-tree/${clientIdentifier}/member/${rel.to_member.id}`}
                                                                    className={`text-base font-semibold hover:underline block ${
                                                                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                                                    }`}
                                                                >
                                                                    {rel.to_member.first_name} {rel.to_member.last_name}
                                                                </Link>
                                                            )}
                                                            <div className={`inline-block px-3 py-0.5 rounded-full text-sm ${
                                                                isDarkMode 
                                                                    ? 'bg-gray-600 text-gray-300' 
                                                                    : 'bg-gray-200 text-gray-700'
                                                            }`}>
                                                                {rel.relationship_type === 'child' ? 'Parent' : 
                                                                 rel.relationship_type === 'parent' ? 'Child' :
                                                                 rel.relationship_type.charAt(0).toUpperCase() + rel.relationship_type.slice(1)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* All Members Card */}
                        <div className={`rounded-xl shadow-lg overflow-hidden ${
                            isDarkMode ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white'
                        }`}>
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <h3 className={`text-lg font-semibold ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                    }`}>
                                        All Family Members
                                    </h3>
                                    <div className="relative w-full sm:w-64">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaSearch className={`w-4 h-4 ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`} />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search family members..."
                                            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                </div>
                                {loading ? (
                                    <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Loading members...
                                    </div>
                                ) : filteredMembers.length === 0 ? (
                                    <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {searchQuery ? 'No members found matching your search.' : 'No family members available.'}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {filteredMembers.slice(0, displayCount).map((familyMember) => (
                                                <div 
                                                    key={familyMember.id}
                                                    className={`p-4 rounded-lg transition-colors ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700/30'
                                                            : 'bg-gray-50/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                            isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                                                        }`}>
                                                            {renderMemberPhoto(familyMember)}
                                                        </div>
                                                        <div>
                                                            <Link
                                                                href={`/family-tree/${clientIdentifier}/member/${familyMember.id}`}
                                                                className={`font-medium hover:underline ${
                                                                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                                                }`}
                                                            >
                                                                {familyMember.first_name} {familyMember.last_name}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {filteredMembers.length > displayCount && (
                                            <div className="flex justify-center mt-6">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setDisplayCount(prev => prev + 15)}
                                                    className="w-full sm:w-auto"
                                                >
                                                    Show More Members
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes Card */}
                        {member.notes && (
                            <div className={`rounded-xl shadow-lg overflow-hidden ${
                                isDarkMode ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white'
                            }`}>
                                <div className="p-6">
                                    <h3 className={`text-lg font-semibold mb-4 ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                    }`}>
                                        About
                                    </h3>
                                    <p className={`whitespace-pre-line ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                        {member.notes}
                                    </p>
                                    
                                    {/* Social-like interaction buttons */}
                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button className={`p-2 rounded-full transition-colors ${
                                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                        }`}>
                                            <FaHeart className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                                        </button>
                                        <button className={`p-2 rounded-full transition-colors ${
                                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                        }`}>
                                            <FaShare className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-2xl max-h-screen sm:max-h-[95vh] overflow-hidden flex flex-col">
                    <DialogHeader className="sm:block hidden">
                        <DialogTitle>Request Profile Edit</DialogTitle>
                    </DialogHeader>

                    <div className="sm:hidden flex items-center justify-center relative border-b dark:border-gray-800 -mt-2 pb-2">
                        <h2 className="text-lg font-semibold">Request Profile Edit</h2>
                    </div>

                    {/* Scrollable Container */}
                    <div className="overflow-y-auto flex-1 -mr-6 pr-6">
                        <div className="mt-4">
                            {/* Photo Upload */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className={`w-32 h-32 rounded-full flex items-center justify-center overflow-hidden ${
                                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                    }`}>
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                alt="Profile Preview"
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

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.first_name}
                                            onChange={(e) => {
                                                setEditFormData(prev => ({ ...prev, first_name: e.target.value }));
                                                clearFieldError('first_name');
                                            }}
                                            className={`w-full px-3 py-2 rounded-md border ${
                                                formErrors.first_name 
                                                    ? 'border-red-500' 
                                                    : isDarkMode 
                                                        ? 'border-gray-600' 
                                                        : 'border-gray-300'
                                            } ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 text-gray-200' 
                                                    : 'bg-white text-gray-900'
                                            }`}
                                        />
                                        {formErrors.first_name && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.first_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.last_name}
                                            onChange={(e) => {
                                                setEditFormData(prev => ({ ...prev, last_name: e.target.value }));
                                                clearFieldError('last_name');
                                            }}
                                            className={`w-full px-3 py-2 rounded-md border ${
                                                formErrors.last_name 
                                                    ? 'border-red-500' 
                                                    : isDarkMode 
                                                        ? 'border-gray-600' 
                                                        : 'border-gray-300'
                                            } ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 text-gray-200' 
                                                    : 'bg-white text-gray-900'
                                            }`}
                                        />
                                        {formErrors.last_name && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.last_name}</p>
                                        )}
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
                                            value={editFormData.birth_date}
                                            onChange={(e) => {
                                                setEditFormData(prev => ({ ...prev, birth_date: e.target.value }));
                                                clearFieldError('birth_date');
                                            }}
                                            className={`w-full px-3 py-2 rounded-md border ${
                                                formErrors.birth_date 
                                                    ? 'border-red-500' 
                                                    : isDarkMode 
                                                        ? 'border-gray-600' 
                                                        : 'border-gray-300'
                                            } ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 text-gray-200' 
                                                    : 'bg-white text-gray-900'
                                            }`}
                                        />
                                        {formErrors.birth_date && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.birth_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Death Date (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            value={editFormData.death_date}
                                            onChange={(e) => {
                                                setEditFormData(prev => ({ ...prev, death_date: e.target.value }));
                                                clearFieldError('death_date');
                                            }}
                                            min={editFormData.birth_date}
                                            className={`w-full px-3 py-2 rounded-md border ${
                                                formErrors.death_date 
                                                    ? 'border-red-500' 
                                                    : isDarkMode 
                                                        ? 'border-gray-600' 
                                                        : 'border-gray-300'
                                            } ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 text-gray-200' 
                                                    : 'bg-white text-gray-900'
                                            }`}
                                        />
                                        {formErrors.death_date && (
                                            <p className="mt-1 text-sm text-red-500">{formErrors.death_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Gender
                                    </label>
                                    <select
                                        value={editFormData.gender}
                                        onChange={(e) => setEditFormData(prev => ({ 
                                            ...prev, 
                                            gender: e.target.value as 'male' | 'female' | 'other' 
                                        }))}
                                        className={`w-full px-3 py-2 rounded-md border ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Notes
                                    </label>
                                    <textarea
                                        value={editFormData.notes}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={3}
                                        className={`w-full px-3 py-2 rounded-md border ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Always visible */}
                    <div className="mt-6 border-t dark:border-gray-800 pt-4">
                        <div className="flex flex-col sm:flex-row-reverse gap-2 sm:gap-4">
                            <Button
                                onClick={handleSubmitEdit}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto"
                            >
                                {isSubmitting ? 'Sending Request...' : 'Send Edit Request'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 
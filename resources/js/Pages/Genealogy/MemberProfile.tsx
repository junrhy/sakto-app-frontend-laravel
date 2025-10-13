import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import type { FamilyMember } from '@/types/genealogy';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FaBirthdayCake,
    FaCamera,
    FaEllipsisV,
    FaHeart,
    FaMapMarkerAlt,
    FaMoon,
    FaSearch,
    FaShare,
    FaSun,
    FaUserCircle,
    FaUserFriends,
} from 'react-icons/fa';

interface MemberProfileProps {
    member: FamilyMember;
    clientIdentifier: string;
    auth: {
        user: any;
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
}

interface OrganizationInfo {
    family_name: string;
    email: string;
    contact_number: string;
    website: string;
    address: string;
    banner: string;
    logo: string;
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

export default function MemberProfile({
    member,
    clientIdentifier,
    auth,
}: MemberProfileProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [allMembers, setAllMembers] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [organizationInfo, setOrganizationInfo] =
        useState<OrganizationInfo | null>(null);
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
    const [photoPreview, setPhotoPreview] = useState<string | null>(
        member.photo,
    );
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayCount, setDisplayCount] = useState(15);

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - check their roles
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    useEffect(() => {
        const fetchAllMembers = async () => {
            try {
                const response = await axios.get(
                    `/genealogy/${clientIdentifier}/all-members`,
                );
                const members = response.data;

                // Filter out members that are already shown in Family Connections
                const connectedMemberIds = new Set(
                    member.relationships?.map((rel) => rel.to_member?.id) || [],
                );

                // Sort remaining members alphabetically by first name
                const sortedMembers = members
                    .filter(
                        (m: FamilyMember) =>
                            // Exclude self and connected members
                            m.id !== member.id && !connectedMemberIds.has(m.id),
                    )
                    .sort((a: FamilyMember, b: FamilyMember) =>
                        a.first_name.localeCompare(b.first_name),
                    );

                setAllMembers(sortedMembers);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch members:', error);
                setLoading(false);
            }
        };

        const fetchSettings = async () => {
            try {
                const response = await axios.get(
                    `/genealogy/${clientIdentifier}/settings`,
                );
                setOrganizationInfo(response.data.organization_info);
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        };

        fetchAllMembers();
        fetchSettings();
    }, [member, clientIdentifier]);

    const calculateAge = (
        birthDate: string,
        deathDate: string | null | undefined,
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

    // Helper function to render member photo
    const renderMemberPhoto = (
        memberData: FamilyMember | RelatedMemberInfo | null | undefined,
    ) => {
        if (!memberData || !memberData.photo)
            return (
                <div className="flex h-full w-full items-center justify-center overflow-hidden">
                    <FaUserCircle className="h-full w-full text-gray-400" />
                </div>
            );

        return (
            <div className="h-full w-full overflow-hidden">
                <img
                    src={memberData.photo}
                    alt={`${memberData.first_name} ${memberData.last_name}`}
                    className="h-full w-full object-cover"
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'cover',
                        display: 'block',
                    }}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/default-profile.png'; // Fallback to default image
                        const parent = target.parentElement;
                        if (parent) {
                            parent.innerHTML =
                                '<div class="w-full h-full flex items-center justify-center"><svg class="w-full h-full text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>';
                        }
                    }}
                />
            </div>
        );
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditFormData((prev) => ({ ...prev, photo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

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
            if (
                new Date(editFormData.death_date) <
                new Date(editFormData.birth_date)
            ) {
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
            await axios.post(
                `/genealogy/${clientIdentifier}/request-edit`,
                formData,
            );

            alert(
                'Edit request has been sent to the account owner for approval.',
            );
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
        setFormErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    // Filter members based on search query
    const filteredMembers = allMembers.filter((familyMember) => {
        const fullName =
            `${familyMember.first_name} ${familyMember.last_name}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    return (
        <div
            className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
        >
            <Head
                title={`${member.first_name} ${member.last_name} - ${organizationInfo?.family_name || 'Family Tree'}`}
            />

            {/* Cover Photo Section */}
            <div className="relative h-[300px] w-full overflow-hidden">
                {organizationInfo?.banner ? (
                    <div className="absolute inset-0">
                        <img
                            src={organizationInfo.banner}
                            alt="Family Banner"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = '/default-banner.jpg';
                            }}
                        />
                        {/* Dark overlay for better text visibility */}
                        <div className="absolute inset-0 bg-black/30" />
                    </div>
                ) : (
                    <div
                        className={`absolute inset-0 ${
                            isDarkMode
                                ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900'
                                : 'bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500'
                        }`}
                    >
                        {/* Family Tree Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10">
                            <svg
                                className="h-full w-full"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                            >
                                <pattern
                                    id="family-pattern"
                                    x="0"
                                    y="0"
                                    width="20"
                                    height="20"
                                    patternUnits="userSpaceOnUse"
                                >
                                    <path
                                        d="M10 0 L20 10 L10 20 L0 10 Z"
                                        fill="currentColor"
                                    />
                                    <circle
                                        cx="10"
                                        cy="10"
                                        r="3"
                                        fill="currentColor"
                                    />
                                </pattern>
                                <rect
                                    x="0"
                                    y="0"
                                    width="100"
                                    height="100"
                                    fill="url(#family-pattern)"
                                />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Dark Mode Toggle */}
                <div className="absolute right-4 top-4 z-10">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`rounded-full p-3 shadow-lg transition-all ${
                            isDarkMode
                                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {isDarkMode ? (
                            <FaSun className="h-5 w-5" />
                        ) : (
                            <FaMoon className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="container relative z-10 mx-auto -mt-[100px] px-4">
                <div className="mx-auto max-w-4xl">
                    {/* Family Name Section */}
                    {organizationInfo?.family_name && (
                        <div className="mb-8">
                            <div
                                className={`relative rounded-lg px-6 py-4 backdrop-blur-sm ${
                                    isDarkMode
                                        ? 'bg-gray-900/50 text-white'
                                        : 'bg-white/80 text-gray-900'
                                } shadow-lg`}
                            >
                                <div className="flex items-center justify-center gap-4">
                                    {organizationInfo.logo && (
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 shadow-lg">
                                            <img
                                                src={organizationInfo.logo}
                                                alt="Family Logo"
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    const target =
                                                        e.target as HTMLImageElement;
                                                    target.onerror = null;
                                                    target.src =
                                                        '/default-logo.png';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <h1 className="text-4xl font-bold tracking-wide">
                                        {organizationInfo.family_name}
                                    </h1>
                                </div>
                                <div
                                    className={`absolute inset-0 rounded-lg border ${
                                        isDarkMode
                                            ? 'border-gray-700/50'
                                            : 'border-gray-200/50'
                                    }`}
                                />
                            </div>
                        </div>
                    )}

                    {/* Profile Card */}
                    <div
                        className={`mb-6 overflow-hidden rounded-xl shadow-xl ${
                            isDarkMode
                                ? 'bg-gray-800 ring-1 ring-gray-700'
                                : 'bg-white'
                        }`}
                    >
                        <div className="p-6">
                            {/* Profile Picture and Basic Info */}
                            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                                <div
                                    className={`h-32 w-32 flex-shrink-0 rounded-full border-4 shadow-lg ${
                                        isDarkMode
                                            ? 'border-gray-700 bg-gray-700'
                                            : 'border-white bg-white'
                                    }`}
                                >
                                    {renderMemberPhoto(member)}
                                </div>

                                <div className="flex-1">
                                    <div className="text-center md:text-left">
                                        <h1
                                            className={`mb-3 break-words text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                        >
                                            {member.first_name}{' '}
                                            {member.last_name}
                                        </h1>

                                        <div className="mb-4 flex items-center justify-center gap-3 md:justify-start">
                                            <span
                                                className={`text-sm font-medium ${
                                                    member.gender === 'male'
                                                        ? 'text-blue-500'
                                                        : 'text-pink-500'
                                                }`}
                                            >
                                                {member.gender === 'male'
                                                    ? 'Male'
                                                    : 'Female'}
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
                                                        <FaEllipsisV className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    alignOffset={0}
                                                    className="w-48"
                                                >
                                                    {canEdit && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setIsEditModalOpen(
                                                                    true,
                                                                )
                                                            }
                                                        >
                                                            Request Profile Edit
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div
                                            className={`flex flex-wrap items-center justify-center gap-4 text-sm md:justify-start ${
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : 'text-gray-600'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1">
                                                <FaBirthdayCake className="h-4 w-4" />
                                                <span>
                                                    {new Date(
                                                        member.birth_date,
                                                    ).toLocaleDateString()}{' '}
                                                    (
                                                    {calculateAge(
                                                        member.birth_date,
                                                        member.death_date,
                                                    )}{' '}
                                                    years)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaUserFriends className="h-4 w-4" />
                                                <span>
                                                    {member.relationships
                                                        ?.length || 0}{' '}
                                                    Family Connections
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Organization Info Card */}
                    {organizationInfo && (
                        <div
                            className={`mb-6 overflow-hidden rounded-xl shadow-lg ${
                                isDarkMode
                                    ? 'bg-gray-800 ring-1 ring-gray-700'
                                    : 'bg-white'
                            }`}
                        >
                            <div className="p-6">
                                <h3
                                    className={`mb-4 text-lg font-semibold ${
                                        isDarkMode
                                            ? 'text-gray-200'
                                            : 'text-gray-700'
                                    }`}
                                >
                                    Family Information
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {organizationInfo.email && (
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-sm ${
                                                    isDarkMode
                                                        ? 'text-gray-400'
                                                        : 'text-gray-600'
                                                }`}
                                            >
                                                Email:
                                            </span>
                                            <span
                                                className={`text-sm ${
                                                    isDarkMode
                                                        ? 'text-gray-200'
                                                        : 'text-gray-800'
                                                }`}
                                            >
                                                {organizationInfo.email}
                                            </span>
                                        </div>
                                    )}
                                    {organizationInfo.contact_number && (
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-sm ${
                                                    isDarkMode
                                                        ? 'text-gray-400'
                                                        : 'text-gray-600'
                                                }`}
                                            >
                                                Contact:
                                            </span>
                                            <span
                                                className={`text-sm ${
                                                    isDarkMode
                                                        ? 'text-gray-200'
                                                        : 'text-gray-800'
                                                }`}
                                            >
                                                {
                                                    organizationInfo.contact_number
                                                }
                                            </span>
                                        </div>
                                    )}
                                    {organizationInfo.website && (
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-sm ${
                                                    isDarkMode
                                                        ? 'text-gray-400'
                                                        : 'text-gray-600'
                                                }`}
                                            >
                                                Website:
                                            </span>
                                            <a
                                                href={organizationInfo.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`text-sm hover:underline ${
                                                    isDarkMode
                                                        ? 'text-blue-400'
                                                        : 'text-blue-600'
                                                }`}
                                            >
                                                {organizationInfo.website}
                                            </a>
                                        </div>
                                    )}
                                    {organizationInfo.address && (
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt
                                                className={`h-4 w-4 ${
                                                    isDarkMode
                                                        ? 'text-gray-400'
                                                        : 'text-gray-600'
                                                }`}
                                            />
                                            <span
                                                className={`text-sm ${
                                                    isDarkMode
                                                        ? 'text-gray-200'
                                                        : 'text-gray-800'
                                                }`}
                                            >
                                                {organizationInfo.address}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeline/Feed Section */}
                    <div className="space-y-6">
                        {/* Family Relationships Card */}
                        {member.relationships &&
                            member.relationships.length > 0 && (
                                <div
                                    className={`overflow-hidden rounded-xl shadow-lg ${
                                        isDarkMode
                                            ? 'bg-gray-800 ring-1 ring-gray-700'
                                            : 'bg-white'
                                    }`}
                                >
                                    <div className="p-6">
                                        <h3
                                            className={`mb-6 text-xl font-semibold ${
                                                isDarkMode
                                                    ? 'text-gray-200'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            Family Connections
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {member.relationships
                                                .filter((rel) => {
                                                    // For parent-child relationships, only show if:
                                                    // 1. It's not a parent-child relationship, OR
                                                    // 2. It's a parent-child relationship and this is the first occurrence
                                                    if (
                                                        rel.relationship_type !==
                                                            'parent' &&
                                                        rel.relationship_type !==
                                                            'child'
                                                    ) {
                                                        return true;
                                                    }

                                                    // Find if there's a matching reverse relationship
                                                    const reverseRelation =
                                                        member.relationships.find(
                                                            (r) =>
                                                                r.to_member
                                                                    ?.id ===
                                                                    rel
                                                                        .to_member
                                                                        ?.id &&
                                                                ((r.relationship_type ===
                                                                    'parent' &&
                                                                    rel.relationship_type ===
                                                                        'child') ||
                                                                    (r.relationship_type ===
                                                                        'child' &&
                                                                        rel.relationship_type ===
                                                                            'parent')),
                                                        );

                                                    // Only show if this is the first occurrence
                                                    return (
                                                        !reverseRelation ||
                                                        rel.id <
                                                            reverseRelation.id
                                                    );
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
                                                                <div
                                                                    className={`mb-3 h-24 w-24 overflow-hidden rounded-full border-4 ${
                                                                        isDarkMode
                                                                            ? 'border-gray-600'
                                                                            : 'border-white'
                                                                    }`}
                                                                >
                                                                    {renderMemberPhoto(
                                                                        rel.to_member,
                                                                    )}
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    {rel.to_member && (
                                                                        <Link
                                                                            href={`/genealogy/${clientIdentifier}/member/${rel.to_member.id}`}
                                                                            className={`block text-base font-semibold hover:underline ${
                                                                                isDarkMode
                                                                                    ? 'text-gray-200'
                                                                                    : 'text-gray-700'
                                                                            }`}
                                                                        >
                                                                            {
                                                                                rel
                                                                                    .to_member
                                                                                    .first_name
                                                                            }{' '}
                                                                            {
                                                                                rel
                                                                                    .to_member
                                                                                    .last_name
                                                                            }
                                                                        </Link>
                                                                    )}
                                                                    <div
                                                                        className={`inline-block rounded-full px-3 py-0.5 text-sm ${
                                                                            isDarkMode
                                                                                ? 'bg-gray-600 text-gray-300'
                                                                                : 'bg-gray-200 text-gray-700'
                                                                        }`}
                                                                    >
                                                                        {rel.relationship_type ===
                                                                        'child'
                                                                            ? 'Parent'
                                                                            : rel.relationship_type ===
                                                                                'parent'
                                                                              ? 'Child'
                                                                              : rel.relationship_type
                                                                                    .charAt(
                                                                                        0,
                                                                                    )
                                                                                    .toUpperCase() +
                                                                                rel.relationship_type.slice(
                                                                                    1,
                                                                                )}
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
                        <div
                            className={`overflow-hidden rounded-xl shadow-lg ${
                                isDarkMode
                                    ? 'bg-gray-800 ring-1 ring-gray-700'
                                    : 'bg-white'
                            }`}
                        >
                            <div className="p-6">
                                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                    <h3
                                        className={`text-lg font-semibold ${
                                            isDarkMode
                                                ? 'text-gray-200'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        All Family Members
                                    </h3>
                                    <div className="relative w-full sm:w-64">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <FaSearch
                                                className={`h-4 w-4 ${
                                                    isDarkMode
                                                        ? 'text-gray-400'
                                                        : 'text-gray-500'
                                                }`}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            placeholder="Search family members..."
                                            className={`w-full rounded-lg border py-2 pl-10 pr-4 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400'
                                                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                    </div>
                                </div>
                                {loading ? (
                                    <div
                                        className={`py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                    >
                                        Loading members...
                                    </div>
                                ) : filteredMembers.length === 0 ? (
                                    <div
                                        className={`py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                    >
                                        {searchQuery
                                            ? 'No members found matching your search.'
                                            : 'No family members available.'}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {filteredMembers
                                                .slice(0, displayCount)
                                                .map((familyMember) => (
                                                    <div
                                                        key={familyMember.id}
                                                        className={`rounded-lg p-4 transition-colors ${
                                                            isDarkMode
                                                                ? 'bg-gray-700/30'
                                                                : 'bg-gray-50/50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                                                    isDarkMode
                                                                        ? 'bg-gray-600'
                                                                        : 'bg-gray-200'
                                                                }`}
                                                            >
                                                                {renderMemberPhoto(
                                                                    familyMember,
                                                                )}
                                                            </div>
                                                            <div>
                                                                <Link
                                                                    href={`/genealogy/${clientIdentifier}/member/${familyMember.id}`}
                                                                    className={`font-medium hover:underline ${
                                                                        isDarkMode
                                                                            ? 'text-gray-200'
                                                                            : 'text-gray-700'
                                                                    }`}
                                                                >
                                                                    {
                                                                        familyMember.first_name
                                                                    }{' '}
                                                                    {
                                                                        familyMember.last_name
                                                                    }
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        {filteredMembers.length >
                                            displayCount && (
                                            <div className="mt-6 flex justify-center">
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setDisplayCount(
                                                            (prev) => prev + 15,
                                                        )
                                                    }
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
                            <div
                                className={`overflow-hidden rounded-xl shadow-lg ${
                                    isDarkMode
                                        ? 'bg-gray-800 ring-1 ring-gray-700'
                                        : 'bg-white'
                                }`}
                            >
                                <div className="p-6">
                                    <h3
                                        className={`mb-4 text-lg font-semibold ${
                                            isDarkMode
                                                ? 'text-gray-200'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        About
                                    </h3>
                                    <p
                                        className={`whitespace-pre-line ${
                                            isDarkMode
                                                ? 'text-gray-300'
                                                : 'text-gray-600'
                                        }`}
                                    >
                                        {member.notes}
                                    </p>

                                    {/* Social-like interaction buttons */}
                                    <div className="mt-4 flex items-center gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                        <button
                                            className={`rounded-full p-2 transition-colors ${
                                                isDarkMode
                                                    ? 'hover:bg-gray-700'
                                                    : 'hover:bg-gray-100'
                                            }`}
                                        >
                                            <FaHeart
                                                className={
                                                    isDarkMode
                                                        ? 'text-gray-400'
                                                        : 'text-gray-500'
                                                }
                                            />
                                        </button>
                                        <button
                                            className={`rounded-full p-2 transition-colors ${
                                                isDarkMode
                                                    ? 'hover:bg-gray-700'
                                                    : 'hover:bg-gray-100'
                                            }`}
                                        >
                                            <FaShare
                                                className={
                                                    isDarkMode
                                                        ? 'text-gray-400'
                                                        : 'text-gray-500'
                                                }
                                            />
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
                <DialogContent
                    className={`flex max-h-[90vh] flex-col overflow-hidden sm:max-h-[95vh] sm:max-w-2xl ${
                        isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'
                    }`}
                >
                    <DialogHeader
                        className={`hidden pb-2 sm:block ${
                            isDarkMode ? 'border-b border-gray-700' : 'border-b'
                        }`}
                    >
                        <DialogTitle
                            className={
                                isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }
                        >
                            Request Profile Edit
                        </DialogTitle>
                    </DialogHeader>

                    <div
                        className={`relative flex items-center justify-between border-b pb-2 sm:hidden ${
                            isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}
                    >
                        <h2
                            className={`text-lg font-semibold ${
                                isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}
                        >
                            Request Profile Edit
                        </h2>
                    </div>

                    {/* Scrollable Container */}
                    <div className="-mr-6 flex-1 overflow-y-auto pr-6">
                        <div className="mt-4">
                            {/* Photo Upload */}
                            <div className="mb-6 flex justify-center">
                                <div className="relative">
                                    <div
                                        className={`flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700'
                                                : 'border-gray-300 bg-gray-200'
                                        }`}
                                    >
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                alt="Profile Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <FaCamera
                                                className={`h-8 w-8 ${
                                                    isDarkMode
                                                        ? 'text-gray-500'
                                                        : 'text-gray-400'
                                                }`}
                                            />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    />
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label
                                            className={`mb-1 block text-sm font-medium ${
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.first_name}
                                            onChange={(e) => {
                                                setEditFormData((prev) => ({
                                                    ...prev,
                                                    first_name: e.target.value,
                                                }));
                                                clearFieldError('first_name');
                                            }}
                                            className={`w-full rounded-md border px-3 py-2 ${
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
                                            <p className="mt-1 text-sm text-red-500">
                                                {formErrors.first_name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            className={`mb-1 block text-sm font-medium ${
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.last_name}
                                            onChange={(e) => {
                                                setEditFormData((prev) => ({
                                                    ...prev,
                                                    last_name: e.target.value,
                                                }));
                                                clearFieldError('last_name');
                                            }}
                                            className={`w-full rounded-md border px-3 py-2 ${
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
                                            <p className="mt-1 text-sm text-red-500">
                                                {formErrors.last_name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label
                                            className={`mb-1 block text-sm font-medium ${
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            Birth Date
                                        </label>
                                        <input
                                            type="date"
                                            value={editFormData.birth_date}
                                            onChange={(e) => {
                                                setEditFormData((prev) => ({
                                                    ...prev,
                                                    birth_date: e.target.value,
                                                }));
                                                clearFieldError('birth_date');
                                            }}
                                            className={`w-full rounded-md border px-3 py-2 ${
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
                                            <p className="mt-1 text-sm text-red-500">
                                                {formErrors.birth_date}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            className={`mb-1 block text-sm font-medium ${
                                                isDarkMode
                                                    ? 'text-gray-300'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            Death Date (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            value={editFormData.death_date}
                                            onChange={(e) => {
                                                setEditFormData((prev) => ({
                                                    ...prev,
                                                    death_date: e.target.value,
                                                }));
                                                clearFieldError('death_date');
                                            }}
                                            min={editFormData.birth_date}
                                            className={`w-full rounded-md border px-3 py-2 ${
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
                                            <p className="mt-1 text-sm text-red-500">
                                                {formErrors.death_date}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label
                                        className={`mb-1 block text-sm font-medium ${
                                            isDarkMode
                                                ? 'text-gray-300'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        Gender
                                    </label>
                                    <select
                                        value={editFormData.gender}
                                        onChange={(e) =>
                                            setEditFormData((prev) => ({
                                                ...prev,
                                                gender: e.target.value as
                                                    | 'male'
                                                    | 'female'
                                                    | 'other',
                                            }))
                                        }
                                        className={`w-full rounded-md border px-3 py-2 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-gray-200'
                                                : 'border-gray-300 bg-white text-gray-900'
                                        }`}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        className={`mb-1 block text-sm font-medium ${
                                            isDarkMode
                                                ? 'text-gray-300'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        Notes
                                    </label>
                                    <textarea
                                        value={editFormData.notes}
                                        onChange={(e) =>
                                            setEditFormData((prev) => ({
                                                ...prev,
                                                notes: e.target.value,
                                            }))
                                        }
                                        rows={3}
                                        className={`w-full rounded-md border px-3 py-2 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-gray-200'
                                                : 'border-gray-300 bg-white text-gray-900'
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Always visible */}
                    <div
                        className={`mt-6 border-t pt-4 ${
                            isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}
                    >
                        <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row-reverse sm:gap-4">
                            <Button
                                onClick={handleSubmitEdit}
                                disabled={isSubmitting}
                                className={`w-full sm:w-auto ${
                                    isDarkMode
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-500/50'
                                        : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-400'
                                }`}
                            >
                                {isSubmitting
                                    ? 'Sending Request...'
                                    : 'Send Edit Request'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                className={`w-full bg-transparent sm:w-auto ${
                                    isDarkMode
                                        ? 'border-gray-500 text-gray-200 hover:border-gray-400 hover:bg-gray-700 hover:text-white'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
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

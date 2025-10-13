import FamilyTreeVisualization from '@/Components/FamilyTreeVisualization';
import { useTheme } from '@/Components/ThemeProvider';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type {
    FamilyMember,
    FamilyRelationship,
    FamilyTreeProps,
    RelationshipType,
} from '@/types/genealogy';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    FaCamera,
    FaChartPie,
    FaCompressAlt,
    FaExpandAlt,
    FaFileAlt,
    FaFileExport,
    FaFileImport,
    FaSearch,
    FaSitemap,
    FaUserPlus,
    FaUsers,
} from 'react-icons/fa';

interface Props extends FamilyTreeProps {
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

export default function Index({ auth, familyMembers }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
        null,
    );
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isManageRelationshipsModalOpen, setIsManageRelationshipsModalOpen] =
        useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<FamilyMember | null>(
        null,
    );
    const [managingMember, setManagingMember] = useState<FamilyMember | null>(
        null,
    );
    const [newMember, setNewMember] = useState<{
        first_name: string;
        last_name: string;
        birth_date: string;
        death_date: string;
        gender: 'male' | 'female' | 'other';
        notes: string;
        photo: File | null;
    }>({
        first_name: '',
        last_name: '',
        birth_date: '',
        death_date: '',
        gender: 'male',
        notes: '',
        photo: null,
    });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importMode, setImportMode] = useState<
        'skip' | 'update' | 'duplicate'
    >('skip');
    const [formErrors, setFormErrors] = useState<{
        first_name?: string;
        last_name?: string;
        birth_date?: string;
        death_date?: string;
        gender?: string;
        photo?: string;
    }>({});
    const [showDeathDate, setShowDeathDate] = useState(false);
    const [showEditDeathDate, setShowEditDeathDate] = useState(false);
    const [focusedMemberId, setFocusedMemberId] = useState<number | null>(null);
    const [newRelationship, setNewRelationship] = useState<{
        relationship_type: string;
        to_member_id: string;
    }>({
        relationship_type: '',
        to_member_id: '',
    });

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

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - only admin or manager can delete
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    // Use global theme instead of local state
    const { theme, setTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    // Automatic time-based theme switching
    useEffect(() => {
        const updateThemeBasedOnTime = () => {
            const now = new Date();
            const hour = now.getHours();

            // Dark mode from 6 PM (18:00) to 6 AM (06:00)
            // Light mode from 6 AM (06:00) to 6 PM (18:00)
            const shouldBeDark = hour >= 18 || hour < 6;

            if (shouldBeDark && theme !== 'dark') {
                setTheme('dark');
            } else if (!shouldBeDark && theme !== 'light') {
                setTheme('light');
            }
        };

        // Update theme immediately
        updateThemeBasedOnTime();

        // Set up interval to check every minute
        const interval = setInterval(updateThemeBasedOnTime, 60000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, [theme, setTheme]);

    const filteredMembers = familyMembers.filter((member: FamilyMember) =>
        `${member.first_name} ${member.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
    );

    // Helper to get member by ID
    const getMemberById = (id: number): FamilyMember | undefined => {
        return familyMembers.find((member: FamilyMember) => member.id === id);
    };

    // Helper to get relationship label
    const getRelationshipLabel = (type: RelationshipType): string => {
        const labels: Record<RelationshipType, string> = {
            parent: 'Parent of',
            child: 'Child of',
            spouse: 'Spouse of',
            sibling: 'Sibling of',
        };
        return labels[type] || type;
    };

    // Helper to calculate age
    const calculateAge = (
        birthDate: string,
        endDate: string | null,
    ): number => {
        const birth = new Date(birthDate);
        const end = endDate ? new Date(endDate) : new Date();
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

    // Export functionality
    const handleExport = () => {
        try {
            console.log('Exporting family data as JSON:', {
                memberCount: familyMembers.length,
            });

            const exportData = {
                exportDate: new Date().toISOString(),
                familyMembers: familyMembers.map((member) => ({
                    id: member.id,
                    first_name: member.first_name,
                    last_name: member.last_name,
                    birth_date: member.birth_date,
                    death_date: member.death_date,
                    gender: member.gender,
                    notes: member.notes,
                    relationships: member.relationships,
                })),
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `family-tree-${new Date().toISOString().split('T')[0]}.json`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log('JSON export completed');
        } catch (error) {
            console.error('Export failed:', error);
            alert(
                `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    };

    // Import functionality
    const handleImport = async () => {
        if (!importFile) return;

        try {
            console.log('Starting import:', {
                fileName: importFile.name,
                fileSize: importFile.size,
            });

            const fileContent = await importFile.text();
            let importData;

            // Try to parse as JSON
            try {
                importData = JSON.parse(fileContent);
                console.log('Successfully parsed JSON file');
            } catch (parseError) {
                throw new Error('Invalid JSON file format');
            }

            // Validate the imported data structure
            if (
                !importData.familyMembers ||
                !Array.isArray(importData.familyMembers)
            ) {
                throw new Error(
                    'Invalid file format: missing or invalid familyMembers array',
                );
            }

            // Validate each member has required fields
            const requiredFields = [
                'id',
                'first_name',
                'last_name',
                'birth_date',
                'gender',
            ];
            const invalidMembers = importData.familyMembers.filter(
                (member: any) =>
                    !requiredFields.every((field) =>
                        member.hasOwnProperty(field),
                    ),
            );

            if (invalidMembers.length > 0) {
                throw new Error(
                    `Invalid member data: ${invalidMembers.length} members missing required fields`,
                );
            }

            console.log(
                `Import validation passed: ${importData.familyMembers.length} members found`,
            );

            // Send data to backend
            const result = await importFamilyData(importData, importMode);

            // Show success message with stats
            alert(
                `Import successful!\n\nFound ${importData.familyMembers.length} family members\nExport date: ${importData.exportDate || 'Unknown'}\n\nImport Stats:\n- Created: ${result.stats?.created || 0}\n- Updated: ${result.stats?.updated || 0}\n- Skipped: ${result.stats?.skipped || 0}\n- Relationships: ${result.stats?.relationships_created || 0}`,
            );

            // Reset import state
            setIsImporting(false);
            setIsImportModalOpen(false);
            setImportFile(null);

            // Refresh the page to show imported data
            refreshData();
        } catch (error) {
            console.error('Import failed:', error);
            alert(
                `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            setIsImporting(false);
        }
    };

    // Reset form function
    const resetForm = () => {
        setNewMember({
            first_name: '',
            last_name: '',
            birth_date: '',
            death_date: '',
            gender: 'male',
            notes: '',
            photo: null,
        });
        setPhotoPreview(null);
        setShowDeathDate(false);
        setShowEditDeathDate(false);
        setFormErrors({});
    };

    // Reset relationship form function
    const resetRelationshipForm = () => {
        setNewRelationship({
            relationship_type: '',
            to_member_id: '',
        });
    };

    // Populate edit form function
    const populateEditForm = (member: FamilyMember) => {
        setNewMember({
            first_name: member.first_name,
            last_name: member.last_name,
            birth_date: member.birth_date,
            death_date: member.death_date || '',
            gender: member.gender,
            notes: member.notes || '',
            photo: null,
        });
        setShowEditDeathDate(!!member.death_date);
        setPhotoPreview(null);
        setFormErrors({});
    };

    // Backend integration functions
    const addMember = async (memberData: any) => {
        try {
            const formData = new FormData();
            formData.append('first_name', memberData.first_name);
            formData.append('last_name', memberData.last_name);
            formData.append('birth_date', memberData.birth_date);
            formData.append('gender', memberData.gender);
            formData.append('notes', memberData.notes || '');
            if (memberData.death_date) {
                formData.append('death_date', memberData.death_date);
            }
            if (memberData.photo) {
                formData.append('photo', memberData.photo);
            }

            const response = await fetch('/genealogy/members', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add member');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error adding member:', error);
            throw error;
        }
    };

    const updateMember = async (memberId: number, memberData: any) => {
        try {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('first_name', memberData.first_name);
            formData.append('last_name', memberData.last_name);
            formData.append('birth_date', memberData.birth_date);
            formData.append('gender', memberData.gender);
            formData.append('notes', memberData.notes || '');
            if (memberData.death_date) {
                formData.append('death_date', memberData.death_date);
            }
            if (memberData.photo) {
                formData.append('photo', memberData.photo);
            }

            const response = await fetch(`/genealogy/members/${memberId}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update member');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating member:', error);
            throw error;
        }
    };

    const deleteMember = async (memberId: number) => {
        try {
            const response = await fetch(`/genealogy/members/${memberId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete member');
            }

            return true;
        } catch (error) {
            console.error('Error deleting member:', error);
            throw error;
        }
    };

    const addRelationship = async (
        fromMemberId: number,
        toMemberId: number,
        relationshipType: string,
    ) => {
        try {
            const response = await fetch('/genealogy/relationships', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    from_member_id: fromMemberId,
                    to_member_id: toMemberId,
                    relationship_type: relationshipType,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || 'Failed to add relationship',
                );
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error adding relationship:', error);
            throw error;
        }
    };

    const removeRelationship = async (relationshipId: number) => {
        try {
            const response = await fetch(
                `/genealogy/relationships/${relationshipId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || 'Failed to remove relationship',
                );
            }

            return true;
        } catch (error) {
            console.error('Error removing relationship:', error);
            throw error;
        }
    };

    const importFamilyData = async (importData: any, importMode: string) => {
        try {
            const response = await fetch('/genealogy/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    family_members: importData.familyMembers,
                    import_mode: importMode,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to import data');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    };

    // Refresh page data
    const refreshData = () => {
        window.location.reload();
    };

    // ...rest of the component will be added in the next steps...
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Members
                </h2>
            }
        >
            <Head title="Genealogy" />
            <div className="w-full px-2 py-4 sm:px-4 md:px-6">
                <div
                    className={`mb-4 overflow-hidden shadow-lg transition-all duration-300 sm:mb-6 sm:rounded-xl ${
                        isDarkMode
                            ? 'border border-gray-700 bg-gray-800'
                            : 'border border-gray-200 bg-white'
                    }`}
                >
                    <div className="flex flex-col items-start justify-between gap-4 p-3 sm:flex-row sm:items-center sm:p-4 md:p-6">
                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-4">
                            {canEdit && (
                                <button
                                    className="inline-flex flex-1 transform items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-lg sm:flex-none sm:px-4"
                                    onClick={() => setIsAddModalOpen(true)}
                                >
                                    <FaUserPlus className="mr-2" />
                                    Add Member
                                </button>
                            )}
                            <div className="export-dropdown relative">
                                <button
                                    className="inline-flex flex-1 transform items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-green-700 hover:shadow-lg sm:flex-none sm:px-4"
                                    onClick={handleExport}
                                >
                                    <FaFileExport className="mr-2" />
                                    Export
                                </button>
                            </div>
                            <button
                                className="inline-flex flex-1 transform items-center justify-center rounded-lg bg-purple-600 px-3 py-2 text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-purple-700 hover:shadow-lg sm:flex-none sm:px-4"
                                onClick={() => setIsImportModalOpen(true)}
                            >
                                <FaFileImport className="mr-2" />
                                Import
                            </button>
                            <a
                                href={`/genealogy/${auth.user.identifier}/full-view`}
                                className={`transform rounded-lg p-2 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                    isDarkMode
                                        ? 'border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <FaSitemap />
                            </a>
                            <a
                                href={`/genealogy/${auth.user.identifier}/circular`}
                                className={`transform rounded-lg p-2 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                    isDarkMode
                                        ? 'border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                                target="_blank"
                                title="Circular View"
                                rel="noreferrer"
                            >
                                <FaChartPie />
                            </a>
                            <a
                                href={`/genealogy/${auth.user.identifier}/printable`}
                                className={`transform rounded-lg p-2 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                    isDarkMode
                                        ? 'border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                                target="_blank"
                                title="Printable View"
                                rel="noreferrer"
                            >
                                <FaFileAlt />
                            </a>
                            <a
                                href={`/genealogy/${auth.user.identifier}/members`}
                                className={`transform rounded-lg p-2 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                    isDarkMode
                                        ? 'border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                                target="_blank"
                                title="View Members Directory"
                                rel="noreferrer"
                            >
                                <FaUsers />
                            </a>
                        </div>

                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-4">
                            <div className="relative flex-1 sm:flex-none">
                                <FaSearch
                                    className={`absolute left-3 top-1/2 -translate-y-1/2 transform ${
                                        isDarkMode
                                            ? 'text-gray-400'
                                            : 'text-gray-500'
                                    }`}
                                />
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    className={`w-full rounded-lg border py-2 pl-10 pr-4 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto ${
                                        isDarkMode
                                            ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:border-blue-500'
                                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500'
                                    }`}
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className={`inline-flex transform items-center rounded-lg px-3 py-2 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                        isDarkMode
                                            ? 'border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                                            : 'border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                    onClick={() =>
                                        setIsFullscreen(!isFullscreen)
                                    }
                                    title={
                                        isFullscreen
                                            ? 'Exit Fullscreen'
                                            : 'Enter Fullscreen'
                                    }
                                >
                                    {isFullscreen ? (
                                        <FaCompressAlt />
                                    ) : (
                                        <FaExpandAlt />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                <div
                    className={`mb-4 overflow-hidden shadow-lg transition-all duration-300 sm:mb-6 sm:rounded-xl ${
                        isDarkMode
                            ? 'border border-gray-700 bg-gray-800'
                            : 'border border-gray-200 bg-white'
                    }`}
                >
                    <div className="p-4">
                        <h3
                            className={`mb-4 text-lg font-semibold ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}
                        >
                            Family Statistics
                        </h3>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                            {/* Total Members */}
                            <div
                                className={`transform rounded-xl p-4 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                    isDarkMode
                                        ? 'border border-gray-600 bg-gray-700'
                                        : 'border border-gray-200 bg-gray-50'
                                }`}
                            >
                                <div
                                    className={`text-sm font-medium ${
                                        isDarkMode
                                            ? 'text-gray-400'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    Total Members
                                </div>
                                <div
                                    className={`mt-1 text-2xl font-bold ${
                                        isDarkMode
                                            ? 'text-gray-200'
                                            : 'text-gray-900'
                                    }`}
                                >
                                    {familyMembers.length}
                                </div>
                            </div>
                            {/* Levels */}
                            <div
                                className={`transform rounded-xl p-4 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                    isDarkMode
                                        ? 'border border-gray-600 bg-gray-700'
                                        : 'border border-gray-200 bg-gray-50'
                                }`}
                            >
                                <div
                                    className={`text-sm font-medium ${
                                        isDarkMode
                                            ? 'text-gray-400'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    Levels
                                </div>
                                <div
                                    className={`mt-1 text-2xl font-bold ${
                                        isDarkMode
                                            ? 'text-gray-200'
                                            : 'text-gray-900'
                                    }`}
                                >
                                    {(() => {
                                        const getLevel = (
                                            member: FamilyMember,
                                            visited = new Set<number>(),
                                        ): number => {
                                            if (visited.has(member.id))
                                                return 0;
                                            visited.add(member.id);
                                            const parentRelationships =
                                                member.relationships.filter(
                                                    (rel) =>
                                                        rel.relationship_type ===
                                                        'parent',
                                                );
                                            if (
                                                parentRelationships.length === 0
                                            )
                                                return 1;
                                            return (
                                                1 +
                                                Math.max(
                                                    ...parentRelationships.map(
                                                        (rel) => {
                                                            const parent =
                                                                familyMembers.find(
                                                                    (m) =>
                                                                        m.id ===
                                                                        rel.to_member_id,
                                                                );
                                                            return parent
                                                                ? getLevel(
                                                                      parent,
                                                                      visited,
                                                                  )
                                                                : 0;
                                                        },
                                                    ),
                                                )
                                            );
                                        };
                                        return Math.max(
                                            ...familyMembers.map((member) =>
                                                getLevel(member),
                                            ),
                                        );
                                    })()}
                                </div>
                            </div>
                            {/* Male Members */}
                            <div
                                className={`transform rounded-xl p-4 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                    isDarkMode
                                        ? 'border border-blue-700 bg-blue-900/30'
                                        : 'border border-blue-200 bg-blue-50'
                                }`}
                            >
                                <div
                                    className={`text-sm font-medium ${
                                        isDarkMode
                                            ? 'text-blue-300'
                                            : 'text-blue-600'
                                    }`}
                                >
                                    Male Members
                                </div>
                                <div
                                    className={`mt-1 text-2xl font-bold ${
                                        isDarkMode
                                            ? 'text-blue-200'
                                            : 'text-blue-700'
                                    }`}
                                >
                                    {
                                        familyMembers.filter(
                                            (member) =>
                                                member.gender === 'male',
                                        ).length
                                    }
                                </div>
                            </div>
                            {/* Female Members */}
                            <div
                                className={`transform rounded-xl p-4 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                    isDarkMode
                                        ? 'border border-pink-700 bg-pink-900/30'
                                        : 'border border-pink-200 bg-pink-50'
                                }`}
                            >
                                <div
                                    className={`text-sm font-medium ${
                                        isDarkMode
                                            ? 'text-pink-300'
                                            : 'text-pink-600'
                                    }`}
                                >
                                    Female Members
                                </div>
                                <div
                                    className={`mt-1 text-2xl font-bold ${
                                        isDarkMode
                                            ? 'text-pink-200'
                                            : 'text-pink-700'
                                    }`}
                                >
                                    {
                                        familyMembers.filter(
                                            (member) =>
                                                member.gender === 'female',
                                        ).length
                                    }
                                </div>
                            </div>
                            {/* Children (<18) */}
                            <div
                                className={`transform rounded-xl p-4 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                    isDarkMode
                                        ? 'border border-yellow-700 bg-yellow-900/30'
                                        : 'border border-yellow-200 bg-yellow-50'
                                }`}
                            >
                                <div
                                    className={`text-sm font-medium ${
                                        isDarkMode
                                            ? 'text-yellow-300'
                                            : 'text-yellow-600'
                                    }`}
                                >
                                    Children (&lt;18)
                                </div>
                                <div
                                    className={`mt-1 text-2xl font-bold ${
                                        isDarkMode
                                            ? 'text-yellow-200'
                                            : 'text-yellow-700'
                                    }`}
                                >
                                    {
                                        familyMembers.filter((member) => {
                                            const birthDate = new Date(
                                                member.birth_date,
                                            );
                                            const endDate = member.death_date
                                                ? new Date(member.death_date)
                                                : new Date();
                                            const age =
                                                endDate.getFullYear() -
                                                birthDate.getFullYear();
                                            const monthDiff =
                                                endDate.getMonth() -
                                                birthDate.getMonth();
                                            const adjustedAge =
                                                monthDiff < 0 ||
                                                (monthDiff === 0 &&
                                                    endDate.getDate() <
                                                        birthDate.getDate())
                                                    ? age - 1
                                                    : age;
                                            return adjustedAge < 18;
                                        }).length
                                    }
                                </div>
                            </div>
                            {/* Adults (18+) */}
                            <div
                                className={`transform rounded-xl p-4 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                    isDarkMode
                                        ? 'border border-green-700 bg-green-900/30'
                                        : 'border border-green-200 bg-green-50'
                                }`}
                            >
                                <div
                                    className={`text-sm font-medium ${
                                        isDarkMode
                                            ? 'text-green-300'
                                            : 'text-green-600'
                                    }`}
                                >
                                    Adults (18+)
                                </div>
                                <div
                                    className={`mt-1 text-2xl font-bold ${
                                        isDarkMode
                                            ? 'text-green-200'
                                            : 'text-green-700'
                                    }`}
                                >
                                    {
                                        familyMembers.filter((member) => {
                                            const birthDate = new Date(
                                                member.birth_date,
                                            );
                                            const endDate = member.death_date
                                                ? new Date(member.death_date)
                                                : new Date();
                                            const age =
                                                endDate.getFullYear() -
                                                birthDate.getFullYear();
                                            const monthDiff =
                                                endDate.getMonth() -
                                                birthDate.getMonth();
                                            const adjustedAge =
                                                monthDiff < 0 ||
                                                (monthDiff === 0 &&
                                                    endDate.getDate() <
                                                        birthDate.getDate())
                                                    ? age - 1
                                                    : age;
                                            return adjustedAge >= 18;
                                        }).length
                                    }
                                </div>
                            </div>
                            {/* Living Members */}
                            <div
                                className={`transform rounded-xl p-4 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                    isDarkMode
                                        ? 'border border-emerald-700 bg-emerald-900/30'
                                        : 'border border-emerald-200 bg-emerald-50'
                                }`}
                            >
                                <div
                                    className={`text-sm font-medium ${
                                        isDarkMode
                                            ? 'text-emerald-300'
                                            : 'text-emerald-600'
                                    }`}
                                >
                                    Living Members
                                </div>
                                <div
                                    className={`mt-1 text-2xl font-bold ${
                                        isDarkMode
                                            ? 'text-emerald-200'
                                            : 'text-emerald-700'
                                    }`}
                                >
                                    {
                                        familyMembers.filter(
                                            (member) => !member.death_date,
                                        ).length
                                    }
                                </div>
                            </div>
                            {/* Deceased Members */}
                            <div
                                className={`transform rounded-xl p-4 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                    isDarkMode
                                        ? 'border border-gray-600 bg-gray-700'
                                        : 'border border-gray-200 bg-gray-50'
                                }`}
                            >
                                <div
                                    className={`text-sm font-medium ${
                                        isDarkMode
                                            ? 'text-gray-400'
                                            : 'text-gray-600'
                                    }`}
                                >
                                    Deceased Members
                                </div>
                                <div
                                    className={`mt-1 text-2xl font-bold ${
                                        isDarkMode
                                            ? 'text-gray-300'
                                            : 'text-gray-700'
                                    }`}
                                >
                                    {
                                        familyMembers.filter(
                                            (member) => !!member.death_date,
                                        ).length
                                    }
                                </div>
                            </div>
                            {/* Unconnected Members */}
                            <div
                                className={`transform rounded-xl p-4 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                                    isDarkMode
                                        ? 'border border-red-700 bg-red-900/30'
                                        : 'border border-red-200 bg-red-50'
                                }`}
                            >
                                <div
                                    className={`text-sm font-medium ${
                                        isDarkMode
                                            ? 'text-red-300'
                                            : 'text-red-600'
                                    }`}
                                >
                                    Unconnected Members
                                </div>
                                <div
                                    className={`mt-1 text-2xl font-bold ${
                                        isDarkMode
                                            ? 'text-red-200'
                                            : 'text-red-700'
                                    }`}
                                >
                                    {
                                        familyMembers.filter(
                                            (member) =>
                                                member.relationships.length ===
                                                0,
                                        ).length
                                    }
                                </div>
                            </div>
                        </div>
                        {/* Age Distribution */}
                        <div
                            className={`mt-6 rounded-xl p-4 shadow-md transition-all duration-200 ${
                                isDarkMode
                                    ? 'border border-purple-700/50 bg-purple-900/20'
                                    : 'border border-purple-200 bg-purple-50'
                            }`}
                        >
                            <div
                                className={`mb-3 text-sm font-medium ${
                                    isDarkMode
                                        ? 'text-purple-300'
                                        : 'text-purple-600'
                                }`}
                            >
                                Age Distribution (5-year groups)
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                                {(() => {
                                    const ages = familyMembers.map((member) => {
                                        const birthDate = new Date(
                                            member.birth_date,
                                        );
                                        const endDate = member.death_date
                                            ? new Date(member.death_date)
                                            : new Date();
                                        const age =
                                            endDate.getFullYear() -
                                            birthDate.getFullYear();
                                        const monthDiff =
                                            endDate.getMonth() -
                                            birthDate.getMonth();
                                        return monthDiff < 0 ||
                                            (monthDiff === 0 &&
                                                endDate.getDate() <
                                                    birthDate.getDate())
                                            ? age - 1
                                            : age;
                                    });
                                    const minAge =
                                        Math.floor(Math.min(...ages) / 5) * 5;
                                    const maxAge =
                                        Math.ceil(Math.max(...ages) / 5) * 5;
                                    const groups: Record<string, number> = {};
                                    for (let i = minAge; i < maxAge; i += 5) {
                                        const rangeLabel = `${i}-${i + 4}`;
                                        groups[rangeLabel] = ages.filter(
                                            (age) => age >= i && age <= i + 4,
                                        ).length;
                                    }
                                    return Object.entries(groups)
                                        .filter(([_, count]) => count > 0)
                                        .map(([range, count]) => (
                                            <div
                                                key={range}
                                                className={`transform rounded-lg p-3 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                                    isDarkMode
                                                        ? 'border border-gray-600 bg-gray-700'
                                                        : 'border border-gray-200 bg-white'
                                                }`}
                                            >
                                                <div
                                                    className={`text-sm font-medium ${
                                                        isDarkMode
                                                            ? 'text-purple-300'
                                                            : 'text-purple-600'
                                                    }`}
                                                >
                                                    {range} years
                                                </div>
                                                <div
                                                    className={`text-xl font-bold ${
                                                        isDarkMode
                                                            ? 'text-gray-200'
                                                            : 'text-gray-900'
                                                    }`}
                                                >
                                                    {count}
                                                </div>
                                            </div>
                                        ));
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-4">
                    {/* Family tree visualization */}
                    <div
                        className={`order-2 overflow-hidden shadow-lg transition-all duration-300 sm:rounded-xl lg:order-1 lg:col-span-3 ${
                            isDarkMode
                                ? 'border border-gray-700 bg-gray-800'
                                : 'border border-gray-200 bg-white'
                        }`}
                    >
                        <div className="p-3 sm:p-4 md:p-6">
                            <h3
                                className={`mb-4 text-lg font-semibold ${
                                    isDarkMode
                                        ? 'text-gray-200'
                                        : 'text-gray-900'
                                }`}
                            >
                                Family Tree Visualization
                            </h3>
                            <div
                                className={`relative flex h-[400px] items-center justify-center rounded-xl transition-all duration-300 sm:h-[500px] md:h-[600px] ${
                                    isDarkMode
                                        ? 'border border-gray-700 bg-gray-900'
                                        : 'border border-gray-200 bg-gray-50'
                                }`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FamilyTreeVisualization
                                        familyMembers={familyMembers}
                                        onNodeClick={setSelectedMember}
                                        isDarkMode={isDarkMode}
                                        focusedMemberId={focusedMemberId}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Member list and details */}
                    <div
                        className={`order-1 overflow-hidden shadow-lg transition-all duration-300 sm:rounded-xl lg:order-2 ${
                            isDarkMode
                                ? 'border border-gray-700 bg-gray-800'
                                : 'border border-gray-200 bg-white'
                        }`}
                    >
                        <div className="p-4">
                            <h3
                                className={`mb-3 text-lg font-semibold ${
                                    isDarkMode
                                        ? 'text-gray-200'
                                        : 'text-gray-900'
                                }`}
                            >
                                Family Members ({filteredMembers.length})
                            </h3>
                            <div className="h-[calc(100vh-300px)] max-h-[700px] min-h-[400px] space-y-2 overflow-y-auto pr-2">
                                {filteredMembers.map((member: FamilyMember) => (
                                    <div
                                        key={member.id}
                                        className={`transform cursor-pointer rounded-lg p-3 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                            selectedMember?.id === member.id
                                                ? isDarkMode
                                                    ? 'border-2 border-blue-600 bg-blue-900/30 shadow-lg'
                                                    : 'border-2 border-blue-200 bg-blue-50 shadow-lg'
                                                : focusedMemberId === member.id
                                                  ? isDarkMode
                                                      ? 'border-2 border-green-600 bg-green-900/30 shadow-lg'
                                                      : 'border-2 border-green-200 bg-green-50 shadow-lg'
                                                  : isDarkMode
                                                    ? 'border border-gray-600 bg-gray-700 hover:bg-gray-600'
                                                    : 'border border-gray-200 bg-gray-50 hover:bg-gray-100'
                                        }`}
                                        onClick={() => {
                                            setSelectedMember(member);
                                            setFocusedMemberId(member.id);
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                                                    isDarkMode
                                                        ? 'border border-gray-500 bg-gray-600'
                                                        : 'border border-gray-400 bg-gray-300'
                                                }`}
                                            >
                                                {member.photo ? (
                                                    <img
                                                        src={member.photo}
                                                        alt={`${member.first_name} ${member.last_name}`}
                                                        className="h-full w-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span
                                                        className={`text-xs font-medium ${
                                                            isDarkMode
                                                                ? 'text-gray-300'
                                                                : 'text-gray-600'
                                                        }`}
                                                    >
                                                        {member.first_name[0]}
                                                        {member.last_name[0]}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4
                                                    className={`truncate text-sm font-medium ${
                                                        isDarkMode
                                                            ? 'text-gray-200'
                                                            : 'text-gray-900'
                                                    }`}
                                                >
                                                    {member.first_name}{' '}
                                                    {member.last_name}
                                                    {focusedMemberId ===
                                                        member.id && (
                                                        <span
                                                            className={`ml-2 rounded-full px-2 py-1 text-xs ${
                                                                isDarkMode
                                                                    ? 'bg-green-600 text-green-100'
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}
                                                        >
                                                            Focused
                                                        </span>
                                                    )}
                                                </h4>
                                                <p
                                                    className={`break-words text-xs ${
                                                        isDarkMode
                                                            ? 'text-gray-400'
                                                            : 'text-gray-600'
                                                    }`}
                                                >
                                                    {new Date(
                                                        member.birth_date,
                                                    ).toLocaleDateString()}{' '}
                                                    (
                                                    {calculateAge(
                                                        member.birth_date,
                                                        member.death_date ||
                                                            null,
                                                    )}
                                                    )
                                                    {member.death_date && (
                                                        <span className="text-red-500">
                                                            {' '}
                                                            • Deceased
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {selectedMember?.id === member.id && (
                                            <div className="mt-3 border-t border-gray-300 pt-3 dark:border-gray-600">
                                                {member.notes && (
                                                    <p
                                                        className={`mb-2 break-words text-xs ${
                                                            isDarkMode
                                                                ? 'text-gray-400'
                                                                : 'text-gray-600'
                                                        }`}
                                                    >
                                                        {member.notes}
                                                    </p>
                                                )}
                                                {member.relationships.length >
                                                    0 && (
                                                    <div className="mb-3">
                                                        <h5
                                                            className={`mb-1 text-xs font-medium ${
                                                                isDarkMode
                                                                    ? 'text-gray-300'
                                                                    : 'text-gray-700'
                                                            }`}
                                                        >
                                                            Relationships:
                                                        </h5>
                                                        <ul
                                                            className={`space-y-0.5 text-xs ${
                                                                isDarkMode
                                                                    ? 'text-gray-400'
                                                                    : 'text-gray-600'
                                                            }`}
                                                        >
                                                            {member.relationships
                                                                .slice(0, 3)
                                                                .map(
                                                                    (
                                                                        rel: FamilyRelationship,
                                                                    ) => {
                                                                        const relatedMemberId =
                                                                            rel.to_member_id ===
                                                                            member.id
                                                                                ? rel.from_member_id
                                                                                : rel.to_member_id;
                                                                        const relatedMember =
                                                                            getMemberById(
                                                                                relatedMemberId,
                                                                            );
                                                                        return (
                                                                            <li
                                                                                key={
                                                                                    rel.id
                                                                                }
                                                                            >
                                                                                {getRelationshipLabel(
                                                                                    rel.relationship_type,
                                                                                )}{' '}
                                                                                {relatedMember
                                                                                    ? `${relatedMember.first_name} ${relatedMember.last_name}`
                                                                                    : `Member ${relatedMemberId}`}
                                                                            </li>
                                                                        );
                                                                    },
                                                                )}
                                                            {member
                                                                .relationships
                                                                .length > 3 && (
                                                                <li
                                                                    className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}
                                                                >
                                                                    +
                                                                    {member
                                                                        .relationships
                                                                        .length -
                                                                        3}{' '}
                                                                    more...
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap gap-1">
                                                    {canDelete && (
                                                        <button
                                                            className={`inline-flex transform items-center rounded px-2 py-1 text-xs shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                                                isDarkMode
                                                                    ? 'border border-red-600 bg-red-700 text-gray-200 hover:bg-red-600'
                                                                    : 'border border-red-300 bg-red-100 text-red-700 hover:bg-red-200'
                                                            }`}
                                                            onClick={async (
                                                                e,
                                                            ) => {
                                                                e.stopPropagation();
                                                                if (
                                                                    confirm(
                                                                        `Are you sure you want to delete ${member.first_name} ${member.last_name}? This action cannot be undone.`,
                                                                    )
                                                                ) {
                                                                    try {
                                                                        await deleteMember(
                                                                            member.id,
                                                                        );
                                                                        alert(
                                                                            `Member deleted successfully!`,
                                                                        );
                                                                        refreshData();
                                                                    } catch (error) {
                                                                        console.error(
                                                                            'Failed to delete member:',
                                                                            error,
                                                                        );
                                                                        alert(
                                                                            `Failed to delete member: ${error instanceof Error ? error.message : 'Unknown error'}`,
                                                                        );
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                    {canEdit && (
                                                        <button
                                                            className={`inline-flex transform items-center rounded px-2 py-1 text-xs shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                                                isDarkMode
                                                                    ? 'border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                                                                    : 'border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingMember(
                                                                    member,
                                                                );
                                                                populateEditForm(
                                                                    member,
                                                                );
                                                                setIsEditModalOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    <button
                                                        className={`inline-flex transform items-center rounded px-2 py-1 text-xs shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                                            isDarkMode
                                                                ? 'border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                                                                : 'border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setManagingMember(
                                                                member,
                                                            );
                                                            setIsManageRelationshipsModalOpen(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        Relationships
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

            {/* Add Member Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div
                        className={`w-full max-w-2xl ${isDarkMode ? 'border border-gray-700 bg-gray-800' : 'border border-gray-200 bg-white'} rounded-xl shadow-2xl`}
                    >
                        <div
                            className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <h3
                                    className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                                >
                                    Add Family Member
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        resetForm();
                                    }}
                                    className={`rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700`}
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Photo Upload */}
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <div
                                            className={`flex h-32 w-32 items-center justify-center overflow-hidden rounded-full shadow-lg transition-all duration-200 ${
                                                isDarkMode
                                                    ? 'border border-gray-600 bg-gray-700'
                                                    : 'border border-gray-300 bg-gray-200'
                                            }`}
                                        >
                                            {photoPreview ? (
                                                <img
                                                    src={photoPreview}
                                                    alt="Preview"
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
                                            onChange={(e) => {
                                                const file =
                                                    e.target.files?.[0];
                                                if (file) {
                                                    setNewMember((prev) => ({
                                                        ...prev,
                                                        photo: file,
                                                    }));
                                                    const reader =
                                                        new FileReader();
                                                    reader.onloadend = () => {
                                                        setPhotoPreview(
                                                            reader.result as string,
                                                        );
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                        />
                                    </div>
                                </div>

                                {/* Basic Information */}
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
                                            value={newMember.first_name}
                                            onChange={(e) =>
                                                setNewMember((prev) => ({
                                                    ...prev,
                                                    first_name: e.target.value,
                                                }))
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                    : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 ${formErrors.first_name ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.first_name && (
                                            <p className="mt-1 text-xs text-red-500">
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
                                            value={newMember.last_name}
                                            onChange={(e) =>
                                                setNewMember((prev) => ({
                                                    ...prev,
                                                    last_name: e.target.value,
                                                }))
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                    : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 ${formErrors.last_name ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.last_name && (
                                            <p className="mt-1 text-xs text-red-500">
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
                                            value={newMember.birth_date}
                                            onChange={(e) =>
                                                setNewMember((prev) => ({
                                                    ...prev,
                                                    birth_date: e.target.value,
                                                }))
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                    : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 ${formErrors.birth_date ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.birth_date && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {formErrors.birth_date}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <div className="mb-2 flex items-center">
                                            <input
                                                type="checkbox"
                                                id="enableDeathDate"
                                                checked={showDeathDate}
                                                onChange={(e) => {
                                                    setShowDeathDate(
                                                        e.target.checked,
                                                    );
                                                    if (!e.target.checked) {
                                                        setNewMember(
                                                            (prev) => ({
                                                                ...prev,
                                                                death_date: '',
                                                            }),
                                                        );
                                                    }
                                                }}
                                                className={`mr-2 rounded transition-all duration-200 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700'
                                                        : 'border-gray-300 bg-white'
                                                }`}
                                            />
                                            <label
                                                htmlFor="enableDeathDate"
                                                className={`text-sm font-medium ${
                                                    isDarkMode
                                                        ? 'text-gray-300'
                                                        : 'text-gray-700'
                                                }`}
                                            >
                                                Add Death Date
                                            </label>
                                        </div>
                                        {showDeathDate && (
                                            <>
                                                <input
                                                    type="date"
                                                    value={newMember.death_date}
                                                    onChange={(e) =>
                                                        setNewMember(
                                                            (prev) => ({
                                                                ...prev,
                                                                death_date:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    min={newMember.birth_date}
                                                    className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 ${
                                                        isDarkMode
                                                            ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                            : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                                    } focus:outline-none focus:ring-2 ${formErrors.death_date ? 'border-red-500' : ''}`}
                                                />
                                                {formErrors.death_date && (
                                                    <p className="mt-1 text-xs text-red-500">
                                                        {formErrors.death_date}
                                                    </p>
                                                )}
                                            </>
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
                                            Gender
                                        </label>
                                        <select
                                            value={newMember.gender}
                                            onChange={(e) =>
                                                setNewMember((prev) => ({
                                                    ...prev,
                                                    gender: e.target.value as
                                                        | 'male'
                                                        | 'female'
                                                        | 'other',
                                                }))
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                    : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2`}
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">
                                                Female
                                            </option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Notes */}
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
                                        value={newMember.notes}
                                        onChange={(e) =>
                                            setNewMember((prev) => ({
                                                ...prev,
                                                notes: e.target.value,
                                            }))
                                        }
                                        rows={3}
                                        className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                        } focus:outline-none focus:ring-2`}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex justify-end gap-4">
                                    <button
                                        onClick={() => {
                                            setIsAddModalOpen(false);
                                            resetForm();
                                        }}
                                        className={`transform rounded-lg px-4 py-2 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                            isDarkMode
                                                ? 'border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                                                : 'border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            // Add member logic
                                            const errors: typeof formErrors =
                                                {};

                                            // Validation
                                            if (!newMember.first_name.trim()) {
                                                errors.first_name =
                                                    'First name is required';
                                            }
                                            if (!newMember.last_name.trim()) {
                                                errors.last_name =
                                                    'Last name is required';
                                            }
                                            if (!newMember.birth_date) {
                                                errors.birth_date =
                                                    'Birth date is required';
                                            }
                                            if (
                                                showDeathDate &&
                                                newMember.death_date &&
                                                new Date(
                                                    newMember.death_date,
                                                ) <=
                                                    new Date(
                                                        newMember.birth_date,
                                                    )
                                            ) {
                                                errors.death_date =
                                                    'Death date must be after birth date';
                                            }

                                            if (
                                                Object.keys(errors).length > 0
                                            ) {
                                                setFormErrors(errors);
                                                return;
                                            }

                                            try {
                                                // Send data to backend
                                                await addMember(newMember);

                                                // Show success message
                                                alert(
                                                    `Member added successfully!\n\nName: ${newMember.first_name} ${newMember.last_name}\nBirth Date: ${newMember.birth_date}\nGender: ${newMember.gender}`,
                                                );

                                                // Reset form and close modal
                                                resetForm();
                                                setIsAddModalOpen(false);

                                                // Refresh the page to show new data
                                                refreshData();
                                            } catch (error) {
                                                console.error(
                                                    'Failed to add member:',
                                                    error,
                                                );
                                                alert(
                                                    `Failed to add member: ${error instanceof Error ? error.message : 'Unknown error'}`,
                                                );
                                            }
                                        }}
                                        className={`transform rounded-lg px-4 py-2 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                            isDarkMode
                                                ? 'border border-blue-500 bg-blue-600 hover:bg-blue-700'
                                                : 'border border-blue-400 bg-blue-500 hover:bg-blue-600'
                                        } text-white`}
                                    >
                                        Add Member
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Member Modal */}
            {isEditModalOpen && editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div
                        className={`w-full max-w-2xl ${isDarkMode ? 'border border-gray-700 bg-gray-800' : 'border border-gray-200 bg-white'} rounded-xl shadow-2xl`}
                    >
                        <div
                            className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <h3
                                    className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                                >
                                    Edit Family Member
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingMember(null);
                                    }}
                                    className={`rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700`}
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Photo Upload */}
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <div
                                            className={`flex h-32 w-32 items-center justify-center overflow-hidden rounded-full shadow-lg transition-all duration-200 ${
                                                isDarkMode
                                                    ? 'border border-gray-600 bg-gray-700'
                                                    : 'border border-gray-300 bg-gray-200'
                                            }`}
                                        >
                                            {photoPreview ? (
                                                <img
                                                    src={photoPreview}
                                                    alt="Preview"
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
                                            onChange={(e) => {
                                                const file =
                                                    e.target.files?.[0];
                                                if (file) {
                                                    setNewMember((prev) => ({
                                                        ...prev,
                                                        photo: file,
                                                    }));
                                                    const reader =
                                                        new FileReader();
                                                    reader.onloadend = () => {
                                                        setPhotoPreview(
                                                            reader.result as string,
                                                        );
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                        />
                                    </div>
                                </div>

                                {/* Basic Information */}
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
                                            value={newMember.first_name}
                                            onChange={(e) =>
                                                setNewMember((prev) => ({
                                                    ...prev,
                                                    first_name: e.target.value,
                                                }))
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                    : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 ${formErrors.first_name ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.first_name && (
                                            <p className="mt-1 text-xs text-red-500">
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
                                            value={newMember.last_name}
                                            onChange={(e) =>
                                                setNewMember((prev) => ({
                                                    ...prev,
                                                    last_name: e.target.value,
                                                }))
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                    : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 ${formErrors.last_name ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.last_name && (
                                            <p className="mt-1 text-xs text-red-500">
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
                                            value={newMember.birth_date}
                                            onChange={(e) =>
                                                setNewMember((prev) => ({
                                                    ...prev,
                                                    birth_date: e.target.value,
                                                }))
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                    : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 ${formErrors.birth_date ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.birth_date && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {formErrors.birth_date}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <div className="mb-2 flex items-center">
                                            <input
                                                type="checkbox"
                                                id="enableDeathDate"
                                                checked={showDeathDate}
                                                onChange={(e) => {
                                                    setShowDeathDate(
                                                        e.target.checked,
                                                    );
                                                    if (!e.target.checked) {
                                                        setNewMember(
                                                            (prev) => ({
                                                                ...prev,
                                                                death_date: '',
                                                            }),
                                                        );
                                                    }
                                                }}
                                                className={`mr-2 rounded transition-all duration-200 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700'
                                                        : 'border-gray-300 bg-white'
                                                }`}
                                            />
                                            <label
                                                htmlFor="enableDeathDate"
                                                className={`text-sm font-medium ${
                                                    isDarkMode
                                                        ? 'text-gray-300'
                                                        : 'text-gray-700'
                                                }`}
                                            >
                                                Add Death Date
                                            </label>
                                        </div>
                                        {showDeathDate && (
                                            <>
                                                <input
                                                    type="date"
                                                    value={newMember.death_date}
                                                    onChange={(e) =>
                                                        setNewMember(
                                                            (prev) => ({
                                                                ...prev,
                                                                death_date:
                                                                    e.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    min={newMember.birth_date}
                                                    className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 ${
                                                        isDarkMode
                                                            ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                            : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                                    } focus:outline-none focus:ring-2 ${formErrors.death_date ? 'border-red-500' : ''}`}
                                                />
                                                {formErrors.death_date && (
                                                    <p className="mt-1 text-xs text-red-500">
                                                        {formErrors.death_date}
                                                    </p>
                                                )}
                                            </>
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
                                            Gender
                                        </label>
                                        <select
                                            value={newMember.gender}
                                            onChange={(e) =>
                                                setNewMember((prev) => ({
                                                    ...prev,
                                                    gender: e.target.value as
                                                        | 'male'
                                                        | 'female'
                                                        | 'other',
                                                }))
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 ${
                                                isDarkMode
                                                    ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                    : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2`}
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">
                                                Female
                                            </option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Notes */}
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
                                        value={newMember.notes}
                                        onChange={(e) =>
                                            setNewMember((prev) => ({
                                                ...prev,
                                                notes: e.target.value,
                                            }))
                                        }
                                        rows={3}
                                        className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                        } focus:outline-none focus:ring-2`}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex justify-end gap-4">
                                    <button
                                        onClick={() => {
                                            setIsEditModalOpen(false);
                                            setEditingMember(null);
                                        }}
                                        className={`transform rounded-lg px-4 py-2 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                            isDarkMode
                                                ? 'border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                                                : 'border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            // Edit member logic
                                            const errors: typeof formErrors =
                                                {};

                                            // Validation
                                            if (!newMember.first_name.trim()) {
                                                errors.first_name =
                                                    'First name is required';
                                            }
                                            if (!newMember.last_name.trim()) {
                                                errors.last_name =
                                                    'Last name is required';
                                            }
                                            if (!newMember.birth_date) {
                                                errors.birth_date =
                                                    'Birth date is required';
                                            }
                                            if (
                                                showDeathDate &&
                                                newMember.death_date &&
                                                new Date(
                                                    newMember.death_date,
                                                ) <=
                                                    new Date(
                                                        newMember.birth_date,
                                                    )
                                            ) {
                                                errors.death_date =
                                                    'Death date must be after birth date';
                                            }

                                            if (
                                                Object.keys(errors).length > 0
                                            ) {
                                                setFormErrors(errors);
                                                return;
                                            }

                                            if (!editingMember) return;

                                            try {
                                                // Send data to backend
                                                await updateMember(
                                                    editingMember.id,
                                                    newMember,
                                                );

                                                // Show success message
                                                alert(
                                                    `Member updated successfully!\n\nName: ${newMember.first_name} ${newMember.last_name}\nBirth Date: ${newMember.birth_date}\nGender: ${newMember.gender}`,
                                                );

                                                // Reset form and close modal
                                                resetForm();
                                                setIsEditModalOpen(false);
                                                setEditingMember(null);

                                                // Refresh the page to show updated data
                                                refreshData();
                                            } catch (error) {
                                                console.error(
                                                    'Failed to update member:',
                                                    error,
                                                );
                                                alert(
                                                    `Failed to update member: ${error instanceof Error ? error.message : 'Unknown error'}`,
                                                );
                                            }
                                        }}
                                        className={`transform rounded-lg px-4 py-2 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                            isDarkMode
                                                ? 'border border-blue-500 bg-blue-600 hover:bg-blue-700'
                                                : 'border border-blue-400 bg-blue-500 hover:bg-blue-600'
                                        } text-white`}
                                    >
                                        Update Member
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Relationships Modal */}
            {isManageRelationshipsModalOpen && managingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div
                        className={`max-4xl w-full ${isDarkMode ? 'border border-gray-700 bg-gray-800' : 'border border-gray-200 bg-white'} rounded-xl shadow-2xl`}
                    >
                        <div
                            className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <h3
                                    className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                                >
                                    Manage Relationships for{' '}
                                    {managingMember.first_name}{' '}
                                    {managingMember.last_name}
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsManageRelationshipsModalOpen(
                                            false,
                                        );
                                        setManagingMember(null);
                                        resetRelationshipForm();
                                    }}
                                    className={`rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700`}
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Current Relationships */}
                                <div>
                                    <h4
                                        className={`mb-4 text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                                    >
                                        Current Relationships
                                    </h4>
                                    <div className="space-y-3">
                                        {managingMember.relationships.length ===
                                        0 ? (
                                            <p
                                                className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                            >
                                                No relationships defined yet.
                                            </p>
                                        ) : (
                                            managingMember.relationships.map(
                                                (rel: FamilyRelationship) => {
                                                    const relatedMemberId =
                                                        rel.to_member_id ===
                                                        managingMember.id
                                                            ? rel.from_member_id
                                                            : rel.to_member_id;
                                                    const relatedMember =
                                                        getMemberById(
                                                            relatedMemberId,
                                                        );
                                                    return (
                                                        <div
                                                            key={rel.id}
                                                            className={`transform rounded-lg p-3 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                                                isDarkMode
                                                                    ? 'border border-gray-600 bg-gray-700'
                                                                    : 'border border-gray-200 bg-gray-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <p
                                                                        className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                                                                    >
                                                                        {relatedMember
                                                                            ? `${relatedMember.first_name} ${relatedMember.last_name}`
                                                                            : 'Unknown Member'}
                                                                    </p>
                                                                    <p
                                                                        className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                                                    >
                                                                        {getRelationshipLabel(
                                                                            rel.relationship_type,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    onClick={async () => {
                                                                        // Delete relationship logic
                                                                        if (
                                                                            confirm(
                                                                                `Are you sure you want to remove the relationship between ${managingMember.first_name} ${managingMember.last_name} and ${relatedMember ? `${relatedMember.first_name} ${relatedMember.last_name}` : 'this member'}?`,
                                                                            )
                                                                        ) {
                                                                            try {
                                                                                await removeRelationship(
                                                                                    rel.id,
                                                                                );
                                                                                alert(
                                                                                    `Relationship removed successfully!`,
                                                                                );
                                                                                refreshData();
                                                                            } catch (error) {
                                                                                console.error(
                                                                                    'Failed to remove relationship:',
                                                                                    error,
                                                                                );
                                                                                alert(
                                                                                    `Failed to remove relationship: ${error instanceof Error ? error.message : 'Unknown error'}`,
                                                                                );
                                                                            }
                                                                        }
                                                                    }}
                                                                    className={`rounded-lg p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20`}
                                                                    title="Remove Relationship"
                                                                >
                                                                    <span className="text-lg">
                                                                        ×
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Add New Relationship */}
                                <div>
                                    <h4
                                        className={`mb-4 text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                                    >
                                        Add New Relationship
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                className={`mb-1 block text-sm font-medium ${
                                                    isDarkMode
                                                        ? 'text-gray-300'
                                                        : 'text-gray-700'
                                                }`}
                                            >
                                                Relationship Type
                                            </label>
                                            <select
                                                value={
                                                    newRelationship.relationship_type
                                                }
                                                onChange={(e) =>
                                                    setNewRelationship(
                                                        (prev) => ({
                                                            ...prev,
                                                            relationship_type:
                                                                e.target.value,
                                                        }),
                                                    )
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                        : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                                } focus:outline-none focus:ring-2`}
                                            >
                                                <option value="">
                                                    Select relationship type
                                                </option>
                                                <option value="parent">
                                                    Parent
                                                </option>
                                                <option value="child">
                                                    Child
                                                </option>
                                                <option value="spouse">
                                                    Spouse
                                                </option>
                                                <option value="sibling">
                                                    Sibling
                                                </option>
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
                                                Related Member
                                            </label>
                                            <select
                                                value={
                                                    newRelationship.to_member_id
                                                }
                                                onChange={(e) =>
                                                    setNewRelationship(
                                                        (prev) => ({
                                                            ...prev,
                                                            to_member_id:
                                                                e.target.value,
                                                        }),
                                                    )
                                                }
                                                className={`w-full rounded-lg border px-3 py-2 shadow-sm transition-all duration-200 ${
                                                    isDarkMode
                                                        ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                        : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                                } focus:outline-none focus:ring-2`}
                                            >
                                                <option value="">
                                                    Select a family member
                                                </option>
                                                {familyMembers
                                                    .filter(
                                                        (member) =>
                                                            member.id !==
                                                            managingMember?.id,
                                                    )
                                                    .map((member) => (
                                                        <option
                                                            key={member.id}
                                                            value={member.id}
                                                        >
                                                            {member.first_name}{' '}
                                                            {member.last_name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (
                                                    !newRelationship.relationship_type ||
                                                    !newRelationship.to_member_id ||
                                                    !managingMember
                                                ) {
                                                    alert(
                                                        'Please select both relationship type and related member.',
                                                    );
                                                    return;
                                                }

                                                try {
                                                    await addRelationship(
                                                        managingMember.id,
                                                        parseInt(
                                                            newRelationship.to_member_id,
                                                        ),
                                                        newRelationship.relationship_type,
                                                    );

                                                    alert(
                                                        'Relationship added successfully!',
                                                    );

                                                    // Reset form
                                                    resetRelationshipForm();

                                                    // Refresh data
                                                    refreshData();
                                                } catch (error) {
                                                    console.error(
                                                        'Failed to add relationship:',
                                                        error,
                                                    );
                                                    alert(
                                                        `Failed to add relationship: ${error instanceof Error ? error.message : 'Unknown error'}`,
                                                    );
                                                }
                                            }}
                                            className={`w-full transform rounded-lg px-4 py-2 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                                isDarkMode
                                                    ? 'border border-blue-500 bg-blue-600 hover:bg-blue-700'
                                                    : 'border border-blue-400 bg-blue-500 hover:bg-blue-600'
                                            } text-white`}
                                        >
                                            Add Relationship
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex justify-end gap-4">
                                <button
                                    onClick={() => {
                                        setIsManageRelationshipsModalOpen(
                                            false,
                                        );
                                        setManagingMember(null);
                                        resetRelationshipForm();
                                    }}
                                    className={`transform rounded-lg px-4 py-2 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                        isDarkMode
                                            ? 'border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                                            : 'border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div
                        className={`w-full max-w-2xl ${isDarkMode ? 'border border-gray-700 bg-gray-800' : 'border border-gray-200 bg-white'} rounded-xl shadow-2xl`}
                    >
                        <div
                            className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <h3
                                    className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                                >
                                    Import Family Data
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsImportModalOpen(false);
                                        setImportFile(null);
                                        setIsImporting(false);
                                    }}
                                    className={`rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700`}
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* File Upload */}
                                <div>
                                    <label
                                        className={`mb-2 block text-sm font-medium ${
                                            isDarkMode
                                                ? 'text-gray-300'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        Select File (JSON)
                                    </label>
                                    <div
                                        className={`rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 ${
                                            isDarkMode
                                                ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                                        }`}
                                    >
                                        {importFile ? (
                                            <div>
                                                <p
                                                    className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                                                >
                                                    {importFile.name}
                                                </p>
                                                <p
                                                    className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                                >
                                                    {(
                                                        importFile.size / 1024
                                                    ).toFixed(1)}{' '}
                                                    KB
                                                </p>
                                                <button
                                                    onClick={() =>
                                                        setImportFile(null)
                                                    }
                                                    className={`mt-2 text-red-500 transition-colors hover:text-red-700`}
                                                >
                                                    Remove File
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <FaFileImport
                                                    className={`mx-auto mb-2 h-8 w-8 ${
                                                        isDarkMode
                                                            ? 'text-gray-400'
                                                            : 'text-gray-500'
                                                    }`}
                                                />
                                                <p
                                                    className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                                                >
                                                    Supports JSON format only
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={(e) => {
                                                const file =
                                                    e.target.files?.[0];
                                                if (file) {
                                                    setImportFile(file);
                                                }
                                            }}
                                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                        />
                                    </div>
                                </div>

                                {/* Import Mode Selection */}
                                <div>
                                    <label
                                        className={`mb-2 block text-sm font-medium ${
                                            isDarkMode
                                                ? 'text-gray-300'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        Import Mode
                                    </label>
                                    <div className="space-y-2">
                                        <label
                                            className={`flex cursor-pointer items-center rounded-lg p-3 transition-all duration-200 ${
                                                importMode === 'skip'
                                                    ? isDarkMode
                                                        ? 'border border-blue-600 bg-blue-900/30'
                                                        : 'border border-blue-200 bg-blue-50'
                                                    : isDarkMode
                                                      ? 'border border-gray-600 bg-gray-700 hover:bg-gray-600'
                                                      : 'border border-gray-200 bg-gray-50 hover:bg-gray-100'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="importMode"
                                                value="skip"
                                                checked={importMode === 'skip'}
                                                onChange={(e) =>
                                                    setImportMode(
                                                        e.target.value as
                                                            | 'skip'
                                                            | 'update'
                                                            | 'duplicate',
                                                    )
                                                }
                                                className="mr-3"
                                            />
                                            <div>
                                                <div
                                                    className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                                                >
                                                    Skip Duplicates
                                                </div>
                                                <div
                                                    className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                                >
                                                    Only import new members,
                                                    skip existing ones
                                                </div>
                                            </div>
                                        </label>
                                        <label
                                            className={`flex cursor-pointer items-center rounded-lg p-3 transition-all duration-200 ${
                                                importMode === 'update'
                                                    ? isDarkMode
                                                        ? 'border border-blue-600 bg-blue-900/30'
                                                        : 'border border-blue-200 bg-blue-50'
                                                    : isDarkMode
                                                      ? 'border border-gray-600 bg-gray-700 hover:bg-gray-600'
                                                      : 'border border-gray-200 bg-gray-50 hover:bg-gray-100'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="importMode"
                                                value="update"
                                                checked={
                                                    importMode === 'update'
                                                }
                                                onChange={(e) =>
                                                    setImportMode(
                                                        e.target.value as
                                                            | 'skip'
                                                            | 'update'
                                                            | 'duplicate',
                                                    )
                                                }
                                                className="mr-3"
                                            />
                                            <div>
                                                <div
                                                    className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                                                >
                                                    Update Existing
                                                </div>
                                                <div
                                                    className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                                >
                                                    Update existing members with
                                                    new data
                                                </div>
                                            </div>
                                        </label>
                                        <label
                                            className={`flex cursor-pointer items-center rounded-lg p-3 transition-all duration-200 ${
                                                importMode === 'duplicate'
                                                    ? isDarkMode
                                                        ? 'border border-blue-600 bg-blue-900/30'
                                                        : 'border border-blue-200 bg-blue-50'
                                                    : isDarkMode
                                                      ? 'border border-gray-600 bg-gray-700 hover:bg-gray-600'
                                                      : 'border border-gray-200 bg-gray-50 hover:bg-gray-100'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="importMode"
                                                value="duplicate"
                                                checked={
                                                    importMode === 'duplicate'
                                                }
                                                onChange={(e) =>
                                                    setImportMode(
                                                        e.target.value as
                                                            | 'skip'
                                                            | 'update'
                                                            | 'duplicate',
                                                    )
                                                }
                                                className="mr-3"
                                            />
                                            <div>
                                                <div
                                                    className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                                                >
                                                    Allow Duplicates
                                                </div>
                                                <div
                                                    className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                                >
                                                    Import all data, including
                                                    duplicates
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Import Progress */}
                                {isImporting && (
                                    <div
                                        className={`rounded-lg p-4 ${
                                            isDarkMode
                                                ? 'border border-blue-700/50 bg-blue-900/20'
                                                : 'border border-blue-200 bg-blue-50'
                                        }`}
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <span
                                                className={`text-sm font-medium ${
                                                    isDarkMode
                                                        ? 'text-blue-300'
                                                        : 'text-blue-600'
                                                }`}
                                            >
                                                Importing...
                                            </span>
                                            <span
                                                className={`text-sm ${
                                                    isDarkMode
                                                        ? 'text-blue-400'
                                                        : 'text-blue-500'
                                                }`}
                                            >
                                                50%
                                            </span>
                                        </div>
                                        <div
                                            className={`h-2 w-full rounded-full bg-gray-200 ${
                                                isDarkMode
                                                    ? 'bg-gray-700'
                                                    : 'bg-gray-200'
                                            }`}
                                        >
                                            <div
                                                className={`h-2 rounded-full bg-blue-600 transition-all duration-300`}
                                                style={{ width: '50%' }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-6 flex justify-end gap-4">
                                    <button
                                        onClick={() => {
                                            setIsImportModalOpen(false);
                                            setImportFile(null);
                                            setIsImporting(false);
                                        }}
                                        className={`transform rounded-lg px-4 py-2 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                            isDarkMode
                                                ? 'border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                                                : 'border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (importFile) {
                                                setIsImporting(true);
                                                handleImport();
                                            }
                                        }}
                                        disabled={!importFile || isImporting}
                                        className={`transform rounded-lg px-4 py-2 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                            !importFile || isImporting
                                                ? isDarkMode
                                                    ? 'cursor-not-allowed border border-gray-600 bg-gray-600 text-gray-400'
                                                    : 'cursor-not-allowed border border-gray-300 bg-gray-300 text-gray-500'
                                                : isDarkMode
                                                  ? 'border border-blue-500 bg-blue-600 hover:bg-blue-700'
                                                  : 'border border-blue-400 bg-blue-500 hover:bg-blue-600'
                                        } text-white`}
                                    >
                                        {isImporting
                                            ? 'Importing...'
                                            : 'Import Data'}
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

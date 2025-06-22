import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { FamilyMember, FamilyTreeProps, RelationshipType, FamilyRelationship } from '@/types/genealogy';
import { FaUserPlus, FaFileExport, FaFileImport, FaSearch, FaExpandAlt, FaCompressAlt, FaSun, FaMoon, FaCamera, FaSitemap, FaUsers, FaChartPie, FaFileAlt } from 'react-icons/fa';
import FamilyTreeVisualization from '@/Components/FamilyTreeVisualization';
import { useTheme } from '@/Components/ThemeProvider';

export default function Index({ auth, familyMembers }: FamilyTreeProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isManageRelationshipsModalOpen, setIsManageRelationshipsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
    const [managingMember, setManagingMember] = useState<FamilyMember | null>(null);
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
    const [importMode, setImportMode] = useState<'skip' | 'update' | 'duplicate'>('skip');
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

    // Use global theme instead of local state
    const { theme, setTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    const filteredMembers = familyMembers.filter((member: FamilyMember) =>
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
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
            sibling: 'Sibling of'
        };
        return labels[type] || type;
    };

    // Helper to calculate age
    const calculateAge = (birthDate: string, endDate: string | null): number => {
        const birth = new Date(birthDate);
        const end = endDate ? new Date(endDate) : new Date();
        let age = end.getFullYear() - birth.getFullYear();
        const monthDiff = end.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // Export functionality
    const handleExport = () => {
        try {
            console.log('Exporting family data as JSON:', { memberCount: familyMembers.length });
            
            const exportData = {
                exportDate: new Date().toISOString(),
                familyMembers: familyMembers.map(member => ({
                    id: member.id,
                    first_name: member.first_name,
                    last_name: member.last_name,
                    birth_date: member.birth_date,
                    death_date: member.death_date,
                    gender: member.gender,
                    notes: member.notes,
                    relationships: member.relationships
                }))
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
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    // Import functionality
    const handleImport = async () => {
        if (!importFile) return;

        try {
            console.log('Starting import:', { fileName: importFile.name, fileSize: importFile.size });
            
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
            if (!importData.familyMembers || !Array.isArray(importData.familyMembers)) {
                throw new Error('Invalid file format: missing or invalid familyMembers array');
            }

            // Validate each member has required fields
            const requiredFields = ['id', 'first_name', 'last_name', 'birth_date', 'gender'];
            const invalidMembers = importData.familyMembers.filter((member: any) => 
                !requiredFields.every(field => member.hasOwnProperty(field))
            );

            if (invalidMembers.length > 0) {
                throw new Error(`Invalid member data: ${invalidMembers.length} members missing required fields`);
            }

            console.log(`Import validation passed: ${importData.familyMembers.length} members found`);

            // Send data to backend
            const result = await importFamilyData(importData, importMode);
            
            // Show success message with stats
            alert(`Import successful!\n\nFound ${importData.familyMembers.length} family members\nExport date: ${importData.exportDate || 'Unknown'}\n\nImport Stats:\n- Created: ${result.stats?.created || 0}\n- Updated: ${result.stats?.updated || 0}\n- Skipped: ${result.stats?.skipped || 0}\n- Relationships: ${result.stats?.relationships_created || 0}`);
            
            // Reset import state
            setIsImporting(false);
            setIsImportModalOpen(false);
            setImportFile(null);
            
            // Refresh the page to show imported data
            refreshData();
            
        } catch (error) {
            console.error('Import failed:', error);
            alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Content-Type': 'application/json',
                }
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

    const addRelationship = async (fromMemberId: number, toMemberId: number, relationshipType: string) => {
        try {
            const response = await fetch('/genealogy/relationships', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    from_member_id: fromMemberId,
                    to_member_id: toMemberId,
                    relationship_type: relationshipType
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add relationship');
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
            const response = await fetch(`/genealogy/relationships/${relationshipId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove relationship');
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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    family_members: importData.familyMembers,
                    import_mode: importMode
                })
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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Members</h2>}
        >
            <Head title="Genealogy" />
            <div className="w-full px-2 sm:px-4 md:px-6 py-4">
                <div className={`overflow-hidden shadow-lg sm:rounded-xl mb-4 sm:mb-6 transition-all duration-300 ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                    <div className="p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                            <button
                                className="flex-1 sm:flex-none inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 justify-center shadow-md hover:shadow-lg transform hover:scale-105"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                <FaUserPlus className="mr-2" />
                                Add Member
                            </button>
                            <div className="relative export-dropdown">
                                <button
                                    className="flex-1 sm:flex-none inline-flex items-center px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 justify-center shadow-md hover:shadow-lg transform hover:scale-105"
                                    onClick={handleExport}
                                >
                                    <FaFileExport className="mr-2" />
                                    Export
                                </button>
                            </div>
                            <button
                                className="flex-1 sm:flex-none inline-flex items-center px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 justify-center shadow-md hover:shadow-lg transform hover:scale-105"
                                onClick={() => setIsImportModalOpen(true)}
                            >
                                <FaFileImport className="mr-2" />
                                Import
                            </button>
                            <a
                                href={`/genealogy/${auth.user.identifier}/full-view`}
                                className={`p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                                }`}
                                target="_blank"
                            >
                                <FaSitemap />
                            </a>
                            <a
                                href={`/genealogy/${auth.user.identifier}/circular`}
                                className={`p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                                }`}
                                target="_blank"
                                title="Circular View"
                            >
                                <FaChartPie />
                            </a>
                            <a
                                href={`/genealogy/${auth.user.identifier}/printable`}
                                className={`p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                                }`}
                                target="_blank"
                                title="Printable View"
                            >
                                <FaFileAlt />
                            </a>
                            <a
                                href={`/genealogy/${auth.user.identifier}/members`}
                                className={`p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                                }`}
                                target="_blank"
                                title="View Members Directory"
                            >
                                <FaUsers />
                            </a>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`} />
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    className={`w-full sm:w-auto pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500' 
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                                    }`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className={`inline-flex items-center px-3 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                        isDarkMode 
                                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' 
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                                    }`}
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                                >
                                    {isFullscreen ? <FaCompressAlt /> : <FaExpandAlt />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className={`overflow-hidden shadow-lg sm:rounded-xl mb-4 sm:mb-6 transition-all duration-300 ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                    <div className="p-4">
                        <h3 className={`text-lg font-semibold mb-4 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                            Family Statistics
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                            {/* Total Members */}
                            <div className={`p-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                            }`}>
                                <div className={`text-sm font-medium ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>Total Members</div>
                                <div className={`text-2xl font-bold mt-1 ${
                                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                }`}>
                                    {familyMembers.length}
                                </div>
                            </div>
                            {/* Levels */}
                            <div className={`p-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                            }`}>
                                <div className={`text-sm font-medium ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>Levels</div>
                                <div className={`text-2xl font-bold mt-1 ${
                                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                }`}>
                                    {(() => {
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
                                    })()}
                                </div>
                            </div>
                            {/* Male Members */}
                            <div className={`p-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                isDarkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'
                            }`}>
                                <div className={`text-sm font-medium ${
                                    isDarkMode ? 'text-blue-300' : 'text-blue-600'
                                }`}>Male Members</div>
                                <div className={`text-2xl font-bold mt-1 ${
                                    isDarkMode ? 'text-blue-200' : 'text-blue-700'
                                }`}>
                                    {familyMembers.filter(member => member.gender === 'male').length}
                                </div>
                            </div>
                            {/* Female Members */}
                            <div className={`p-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                isDarkMode ? 'bg-pink-900/30 border border-pink-700' : 'bg-pink-50 border border-pink-200'
                            }`}>
                                <div className={`text-sm font-medium ${
                                    isDarkMode ? 'text-pink-300' : 'text-pink-600'
                                }`}>Female Members</div>
                                <div className={`text-2xl font-bold mt-1 ${
                                    isDarkMode ? 'text-pink-200' : 'text-pink-700'
                                }`}>
                                    {familyMembers.filter(member => member.gender === 'female').length}
                                </div>
                            </div>
                            {/* Children (<18) */}
                            <div className={`p-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                isDarkMode ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
                            }`}>
                                <div className={`text-sm font-medium ${
                                    isDarkMode ? 'text-yellow-300' : 'text-yellow-600'
                                }`}>Children (&lt;18)</div>
                                <div className={`text-2xl font-bold mt-1 ${
                                    isDarkMode ? 'text-yellow-200' : 'text-yellow-700'
                                }`}>
                                    {familyMembers.filter(member => {
                                        const birthDate = new Date(member.birth_date);
                                        const endDate = member.death_date ? new Date(member.death_date) : new Date();
                                        const age = endDate.getFullYear() - birthDate.getFullYear();
                                        const monthDiff = endDate.getMonth() - birthDate.getMonth();
                                        const adjustedAge = monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate()) 
                                            ? age - 1 
                                            : age;
                                        return adjustedAge < 18;
                                    }).length}
                                </div>
                            </div>
                            {/* Adults (18+) */}
                            <div className={`p-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
                            }`}>
                                <div className={`text-sm font-medium ${
                                    isDarkMode ? 'text-green-300' : 'text-green-600'
                                }`}>Adults (18+)</div>
                                <div className={`text-2xl font-bold mt-1 ${
                                    isDarkMode ? 'text-green-200' : 'text-green-700'
                                }`}>
                                    {familyMembers.filter(member => {
                                        const birthDate = new Date(member.birth_date);
                                        const endDate = member.death_date ? new Date(member.death_date) : new Date();
                                        const age = endDate.getFullYear() - birthDate.getFullYear();
                                        const monthDiff = endDate.getMonth() - birthDate.getMonth();
                                        const adjustedAge = monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate()) 
                                            ? age - 1 
                                            : age;
                                        return adjustedAge >= 18;
                                    }).length}
                                </div>
                            </div>
                            {/* Living Members */}
                            <div className={`p-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                isDarkMode ? 'bg-emerald-900/30 border border-emerald-700' : 'bg-emerald-50 border border-emerald-200'
                            }`}>
                                <div className={`text-sm font-medium ${
                                    isDarkMode ? 'text-emerald-300' : 'text-emerald-600'
                                }`}>Living Members</div>
                                <div className={`text-2xl font-bold mt-1 ${
                                    isDarkMode ? 'text-emerald-200' : 'text-emerald-700'
                                }`}>
                                    {familyMembers.filter(member => !member.death_date).length}
                                </div>
                            </div>
                            {/* Deceased Members */}
                            <div className={`p-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                            }`}>
                                <div className={`text-sm font-medium ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>Deceased Members</div>
                                <div className={`text-2xl font-bold mt-1 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    {familyMembers.filter(member => !!member.death_date).length}
                                </div>
                            </div>
                            {/* Unconnected Members */}
                            <div className={`p-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                isDarkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'
                            }`}>
                                <div className={`text-sm font-medium ${
                                    isDarkMode ? 'text-red-300' : 'text-red-600'
                                }`}>Unconnected Members</div>
                                <div className={`text-2xl font-bold mt-1 ${
                                    isDarkMode ? 'text-red-200' : 'text-red-700'
                                }`}>
                                    {familyMembers.filter(member => member.relationships.length === 0).length}
                                </div>
                            </div>
                        </div>
                        {/* Age Distribution */}
                        <div className={`mt-6 p-4 rounded-xl transition-all duration-200 shadow-md ${
                            isDarkMode ? 'bg-purple-900/20 border border-purple-700/50' : 'bg-purple-50 border border-purple-200'
                        }`}>
                            <div className={`text-sm font-medium mb-3 ${
                                isDarkMode ? 'text-purple-300' : 'text-purple-600'
                            }`}>
                                Age Distribution (5-year groups)
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                                {(() => {
                                    const ages = familyMembers.map(member => {
                                        const birthDate = new Date(member.birth_date);
                                        const endDate = member.death_date ? new Date(member.death_date) : new Date();
                                        const age = endDate.getFullYear() - birthDate.getFullYear();
                                        const monthDiff = endDate.getMonth() - birthDate.getMonth();
                                        return monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate()) 
                                            ? age - 1 
                                            : age;
                                    });
                                    const minAge = Math.floor(Math.min(...ages) / 5) * 5;
                                    const maxAge = Math.ceil(Math.max(...ages) / 5) * 5;
                                    const groups: Record<string, number> = {};
                                    for (let i = minAge; i < maxAge; i += 5) {
                                        const rangeLabel = `${i}-${i + 4}`;
                                        groups[rangeLabel] = ages.filter(age => age >= i && age <= i + 4).length;
                                    }
                                    return Object.entries(groups)
                                        .filter(([_, count]) => count > 0)
                                        .map(([range, count]) => (
                                            <div key={range} className={`p-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                                                isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
                                            }`}>
                                                <div className={`text-sm font-medium ${
                                                    isDarkMode ? 'text-purple-300' : 'text-purple-600'
                                                }`}>{range} years</div>
                                                <div className={`text-xl font-bold ${
                                                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                                }`}>{count}</div>
                                            </div>
                                        ));
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Family tree visualization */}
                    <div className={`lg:col-span-3 overflow-hidden shadow-lg sm:rounded-xl transition-all duration-300 order-2 lg:order-1 ${
                        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}>
                        <div className="p-3 sm:p-4 md:p-6">
                            <h3 className={`text-lg font-semibold mb-4 ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                                Family Tree Visualization
                            </h3>
                            <div className={`relative h-[400px] sm:h-[500px] md:h-[600px] rounded-xl transition-all duration-300 flex items-center justify-center ${
                                isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                            }`}>
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
                    <div className={`overflow-hidden shadow-lg sm:rounded-xl transition-all duration-300 order-1 lg:order-2 ${
                        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}>
                        <div className="p-4">
                            <h3 className={`text-lg font-semibold mb-3 ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                                Family Members ({filteredMembers.length})
                            </h3>
                            <div className="space-y-2 h-[calc(100vh-300px)] min-h-[400px] max-h-[700px] overflow-y-auto pr-2">
                                {filteredMembers.map((member: FamilyMember) => (
                                    <div
                                        key={member.id}
                                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                                                selectedMember?.id === member.id
                                                    ? isDarkMode 
                                                    ? 'bg-blue-900/30 border-2 border-blue-600 shadow-lg'
                                                    : 'bg-blue-50 border-2 border-blue-200 shadow-lg'
                                                    : focusedMemberId === member.id
                                                    ? isDarkMode
                                                    ? 'bg-green-900/30 border-2 border-green-600 shadow-lg'
                                                    : 'bg-green-50 border-2 border-green-200 shadow-lg'
                                                    : isDarkMode
                                                    ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                                                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    onClick={() => {
                                        setSelectedMember(member);
                                        setFocusedMemberId(member.id);
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                                        isDarkMode ? 'bg-gray-600 border border-gray-500' : 'bg-gray-300 border border-gray-400'
                                        }`}>
                                            {member.photo ? (
                                                <img
                                                    src={member.photo}
                                                    alt={`${member.first_name} ${member.last_name}`}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                            <span className={`text-xs font-medium ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                }`}>
                                                    {member.first_name[0]}
                                                    {member.last_name[0]}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-medium truncate text-sm ${
                                                isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                            }`}>
                                                {member.first_name} {member.last_name}
                                                {focusedMemberId === member.id && (
                                                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                                        isDarkMode ? 'bg-green-600 text-green-100' : 'bg-green-100 text-green-700'
                                                    }`}>
                                                        Focused
                                                    </span>
                                                )}
                                            </h4>
                                            <p className={`text-xs break-words ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                {new Date(member.birth_date).toLocaleDateString()} ({calculateAge(member.birth_date, member.death_date || null)})
                                                {member.death_date && (
                                                    <span className="text-red-500"> • Deceased</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedMember?.id === member.id && (
                                        <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                                            {member.notes && (
                                                <p className={`text-xs break-words mb-2 ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                    {member.notes}
                                                </p>
                                            )}
                                            {member.relationships.length > 0 && (
                                                <div className="mb-3">
                                                    <h5 className={`text-xs font-medium mb-1 ${
                                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                                    }`}>
                                                        Relationships:
                                                    </h5>
                                                    <ul className={`text-xs space-y-0.5 ${
                                                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                    }`}>
                                                    {member.relationships.slice(0, 3).map((rel: FamilyRelationship) => {
                                                        const relatedMemberId = rel.to_member_id === member.id ? rel.from_member_id : rel.to_member_id;
                                                        const relatedMember = getMemberById(relatedMemberId);
                                                        return (
                                                            <li key={rel.id}>
                                                                {getRelationshipLabel(rel.relationship_type)} {relatedMember ? `${relatedMember.first_name} ${relatedMember.last_name}` : `Member ${relatedMemberId}`}
                                                            </li>
                                                        );
                                                    })}
                                                    {member.relationships.length > 3 && (
                                                        <li className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                            +{member.relationships.length - 3} more...
                                                        </li>
                                                    )}
                                                    </ul>
                                                </div>
                                            )}
                                            <div className="flex flex-wrap gap-1">
                                                <button
                                                className={`inline-flex items-center px-2 py-1 rounded text-xs transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                                                    isDarkMode ? 'bg-red-700 hover:bg-red-600 text-gray-200 border border-red-600' : 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300'
                                                    }`}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Are you sure you want to delete ${member.first_name} ${member.last_name}? This action cannot be undone.`)) {
                                                            try {
                                                                await deleteMember(member.id);
                                                                alert(`Member deleted successfully!`);
                                                                refreshData();
                                                            } catch (error) {
                                                                console.error('Failed to delete member:', error);
                                                                alert(`Failed to delete member: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                className={`inline-flex items-center px-2 py-1 rounded text-xs transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                                                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    setEditingMember(member);
                                                    populateEditForm(member);
                                                    setIsEditModalOpen(true);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                className={`inline-flex items-center px-2 py-1 rounded text-xs transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                                                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    setManagingMember(member);
                                                    setIsManageRelationshipsModalOpen(true);
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className={`w-full max-w-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-2xl`}>
                        <div className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                    Add Family Member
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        resetForm();
                                    }}
                                    className={`text-gray-400 hover:text-gray-500 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Photo Upload */}
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <div className={`w-32 h-32 rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 shadow-lg ${
                                            isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-200 border border-gray-300'
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
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setNewMember(prev => ({ ...prev, photo: file }));
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setPhotoPreview(reader.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
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
                                            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 ${formErrors.first_name ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.first_name && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.first_name}</p>
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
                                            value={newMember.last_name}
                                            onChange={(e) => setNewMember(prev => ({ ...prev, last_name: e.target.value }))}
                                            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 ${formErrors.last_name ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.last_name && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.last_name}</p>
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
                                            value={newMember.birth_date}
                                            onChange={(e) => setNewMember(prev => ({ ...prev, birth_date: e.target.value }))}
                                            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 ${formErrors.birth_date ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.birth_date && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.birth_date}</p>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center mb-2">
                                            <input
                                                type="checkbox"
                                                id="enableDeathDate"
                                                checked={showDeathDate}
                                                onChange={(e) => {
                                                    setShowDeathDate(e.target.checked);
                                                    if (!e.target.checked) {
                                                        setNewMember(prev => ({ ...prev, death_date: '' }));
                                                    }
                                                }}
                                                className={`mr-2 rounded transition-all duration-200 ${
                                                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                                }`}
                                            />
                                            <label
                                                htmlFor="enableDeathDate"
                                                className={`text-sm font-medium ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
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
                                                    onChange={(e) => setNewMember(prev => ({ ...prev, death_date: e.target.value }))}
                                                    min={newMember.birth_date}
                                                    className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                                                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                                    } focus:outline-none focus:ring-2 ${formErrors.death_date ? 'border-red-500' : ''}`}
                                                />
                                                {formErrors.death_date && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.death_date}</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Gender
                                        </label>
                                        <select
                                            value={newMember.gender}
                                            onChange={(e) => setNewMember(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' }))}
                                            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2`}
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
                                        className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                        } focus:outline-none focus:ring-2`}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        onClick={() => {
                                            setIsAddModalOpen(false);
                                            resetForm();
                                        }}
                                        className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                                            isDarkMode
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            // Add member logic
                                            const errors: typeof formErrors = {};
                                            
                                            // Validation
                                            if (!newMember.first_name.trim()) {
                                                errors.first_name = 'First name is required';
                                            }
                                            if (!newMember.last_name.trim()) {
                                                errors.last_name = 'Last name is required';
                                            }
                                            if (!newMember.birth_date) {
                                                errors.birth_date = 'Birth date is required';
                                            }
                                            if (showDeathDate && newMember.death_date && new Date(newMember.death_date) <= new Date(newMember.birth_date)) {
                                                errors.death_date = 'Death date must be after birth date';
                                            }
                                            
                                            if (Object.keys(errors).length > 0) {
                                                setFormErrors(errors);
                                                return;
                                            }
                                            
                                            try {
                                                // Send data to backend
                                                await addMember(newMember);
                                                
                                                // Show success message
                                                alert(`Member added successfully!\n\nName: ${newMember.first_name} ${newMember.last_name}\nBirth Date: ${newMember.birth_date}\nGender: ${newMember.gender}`);
                                                
                                                // Reset form and close modal
                                                resetForm();
                                                setIsAddModalOpen(false);
                                                
                                                // Refresh the page to show new data
                                                refreshData();
                                            } catch (error) {
                                                console.error('Failed to add member:', error);
                                                alert(`Failed to add member: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                                            isDarkMode
                                                ? 'bg-blue-600 hover:bg-blue-700 border border-blue-500'
                                                : 'bg-blue-500 hover:bg-blue-600 border border-blue-400'
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className={`w-full max-w-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-2xl`}>
                        <div className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                    Edit Family Member
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingMember(null);
                                    }}
                                    className={`text-gray-400 hover:text-gray-500 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Photo Upload */}
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <div className={`w-32 h-32 rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 shadow-lg ${
                                            isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-200 border border-gray-300'
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
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setNewMember(prev => ({ ...prev, photo: file }));
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setPhotoPreview(reader.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
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
                                            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 ${formErrors.first_name ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.first_name && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.first_name}</p>
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
                                            value={newMember.last_name}
                                            onChange={(e) => setNewMember(prev => ({ ...prev, last_name: e.target.value }))}
                                            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 ${formErrors.last_name ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.last_name && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.last_name}</p>
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
                                            value={newMember.birth_date}
                                            onChange={(e) => setNewMember(prev => ({ ...prev, birth_date: e.target.value }))}
                                            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 ${formErrors.birth_date ? 'border-red-500' : ''}`}
                                        />
                                        {formErrors.birth_date && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.birth_date}</p>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center mb-2">
                                            <input
                                                type="checkbox"
                                                id="enableDeathDate"
                                                checked={showDeathDate}
                                                onChange={(e) => {
                                                    setShowDeathDate(e.target.checked);
                                                    if (!e.target.checked) {
                                                        setNewMember(prev => ({ ...prev, death_date: '' }));
                                                    }
                                                }}
                                                className={`mr-2 rounded transition-all duration-200 ${
                                                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                                }`}
                                            />
                                            <label
                                                htmlFor="enableDeathDate"
                                                className={`text-sm font-medium ${
                                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
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
                                                    onChange={(e) => setNewMember(prev => ({ ...prev, death_date: e.target.value }))}
                                                    min={newMember.birth_date}
                                                    className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                                                        isDarkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                                                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                                    } focus:outline-none focus:ring-2 ${formErrors.death_date ? 'border-red-500' : ''}`}
                                                />
                                                {formErrors.death_date && (
                                                    <p className="text-red-500 text-xs mt-1">{formErrors.death_date}</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${
                                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Gender
                                        </label>
                                        <select
                                            value={newMember.gender}
                                            onChange={(e) => setNewMember(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' }))}
                                            className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2`}
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
                                        className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                        } focus:outline-none focus:ring-2`}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        onClick={() => {
                                            setIsEditModalOpen(false);
                                            setEditingMember(null);
                                        }}
                                        className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                                            isDarkMode
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            // Edit member logic
                                            const errors: typeof formErrors = {};
                                            
                                            // Validation
                                            if (!newMember.first_name.trim()) {
                                                errors.first_name = 'First name is required';
                                            }
                                            if (!newMember.last_name.trim()) {
                                                errors.last_name = 'Last name is required';
                                            }
                                            if (!newMember.birth_date) {
                                                errors.birth_date = 'Birth date is required';
                                            }
                                            if (showDeathDate && newMember.death_date && new Date(newMember.death_date) <= new Date(newMember.birth_date)) {
                                                errors.death_date = 'Death date must be after birth date';
                                            }
                                            
                                            if (Object.keys(errors).length > 0) {
                                                setFormErrors(errors);
                                                return;
                                            }
                                            
                                            if (!editingMember) return;
                                            
                                            try {
                                                // Send data to backend
                                                await updateMember(editingMember.id, newMember);
                                                
                                                // Show success message
                                                alert(`Member updated successfully!\n\nName: ${newMember.first_name} ${newMember.last_name}\nBirth Date: ${newMember.birth_date}\nGender: ${newMember.gender}`);
                                                
                                                // Reset form and close modal
                                                resetForm();
                                                setIsEditModalOpen(false);
                                                setEditingMember(null);
                                                
                                                // Refresh the page to show updated data
                                                refreshData();
                                            } catch (error) {
                                                console.error('Failed to update member:', error);
                                                alert(`Failed to update member: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                            }
                                        }}
                                        className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                                            isDarkMode
                                                ? 'bg-blue-600 hover:bg-blue-700 border border-blue-500'
                                                : 'bg-blue-500 hover:bg-blue-600 border border-blue-400'
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className={`w-full max-4xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-2xl`}>
                        <div className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                    Manage Relationships for {managingMember.first_name} {managingMember.last_name}
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsManageRelationshipsModalOpen(false);
                                        setManagingMember(null);
                                        resetRelationshipForm();
                                    }}
                                    className={`text-gray-400 hover:text-gray-500 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Current Relationships */}
                                <div>
                                    <h4 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                        Current Relationships
                                    </h4>
                                    <div className="space-y-3">
                                        {managingMember.relationships.length === 0 ? (
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                No relationships defined yet.
                                            </p>
                                        ) : (
                                            managingMember.relationships.map((rel: FamilyRelationship) => {
                                                const relatedMemberId = rel.to_member_id === managingMember.id ? rel.from_member_id : rel.to_member_id;
                                                const relatedMember = getMemberById(relatedMemberId);
                                                return (
                                                    <div
                                                        key={rel.id}
                                                        className={`p-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                                                            isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                                    {relatedMember ? `${relatedMember.first_name} ${relatedMember.last_name}` : 'Unknown Member'}
                                                                </p>
                                                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                    {getRelationshipLabel(rel.relationship_type)}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={async () => {
                                                                    // Delete relationship logic
                                                                    if (confirm(`Are you sure you want to remove the relationship between ${managingMember.first_name} ${managingMember.last_name} and ${relatedMember ? `${relatedMember.first_name} ${relatedMember.last_name}` : 'this member'}?`)) {
                                                                        try {
                                                                            await removeRelationship(rel.id);
                                                                            alert(`Relationship removed successfully!`);
                                                                            refreshData();
                                                                        } catch (error) {
                                                                            console.error('Failed to remove relationship:', error);
                                                                            alert(`Failed to remove relationship: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                                                        }
                                                                    }
                                                                }}
                                                                className={`text-red-500 hover:text-red-700 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20`}
                                                                title="Remove Relationship"
                                                            >
                                                                <span className="text-lg">×</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Add New Relationship */}
                                <div>
                                    <h4 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                        Add New Relationship
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                Relationship Type
                                            </label>
                                            <select
                                                value={newRelationship.relationship_type}
                                                onChange={(e) => setNewRelationship(prev => ({ ...prev, relationship_type: e.target.value }))}
                                                className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                                                    isDarkMode 
                                                        ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                                                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                                } focus:outline-none focus:ring-2`}
                                            >
                                                <option value="">Select relationship type</option>
                                                <option value="parent">Parent</option>
                                                <option value="child">Child</option>
                                                <option value="spouse">Spouse</option>
                                                <option value="sibling">Sibling</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}>
                                                Related Member
                                            </label>
                                            <select
                                                value={newRelationship.to_member_id}
                                                onChange={(e) => setNewRelationship(prev => ({ ...prev, to_member_id: e.target.value }))}
                                                className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                                                    isDarkMode 
                                                        ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500 focus:ring-blue-500' 
                                                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                                                } focus:outline-none focus:ring-2`}
                                            >
                                                <option value="">Select a family member</option>
                                                {familyMembers
                                                    .filter(member => member.id !== managingMember?.id)
                                                    .map(member => (
                                                        <option key={member.id} value={member.id}>
                                                            {member.first_name} {member.last_name}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (!newRelationship.relationship_type || !newRelationship.to_member_id || !managingMember) {
                                                    alert('Please select both relationship type and related member.');
                                                    return;
                                                }

                                                try {
                                                    await addRelationship(
                                                        managingMember.id,
                                                        parseInt(newRelationship.to_member_id),
                                                        newRelationship.relationship_type
                                                    );
                                                    
                                                    alert('Relationship added successfully!');
                                                    
                                                    // Reset form
                                                    resetRelationshipForm();
                                                    
                                                    // Refresh data
                                                    refreshData();
                                                } catch (error) {
                                                    console.error('Failed to add relationship:', error);
                                                    alert(`Failed to add relationship: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                                }
                                            }}
                                            className={`w-full px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                                                isDarkMode
                                                    ? 'bg-blue-600 hover:bg-blue-700 border border-blue-500'
                                                    : 'bg-blue-500 hover:bg-blue-600 border border-blue-400'
                                            } text-white`}
                                        >
                                            Add Relationship
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    onClick={() => {
                                        setIsManageRelationshipsModalOpen(false);
                                        setManagingMember(null);
                                        resetRelationshipForm();
                                    }}
                                    className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                                        isDarkMode
                                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className={`w-full max-w-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl shadow-2xl`}>
                        <div className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                    Import Family Data
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsImportModalOpen(false);
                                        setImportFile(null);
                                        setIsImporting(false);
                                    }}
                                    className={`text-gray-400 hover:text-gray-500 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* File Upload */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Select File (JSON)
                                    </label>
                                    <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                                        isDarkMode 
                                            ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50' 
                                            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                                    }`}>
                                        {importFile ? (
                                            <div>
                                                <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                    {importFile.name}
                                                </p>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {(importFile.size / 1024).toFixed(1)} KB
                                                </p>
                                                <button
                                                    onClick={() => setImportFile(null)}
                                                    className={`mt-2 text-red-500 hover:text-red-700 transition-colors`}
                                                >
                                                    Remove File
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <FaFileImport className={`mx-auto w-8 h-8 mb-2 ${
                                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`} />
                                                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    Supports JSON format only
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setImportFile(file);
                                                }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Import Mode Selection */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Import Mode
                                    </label>
                                    <div className="space-y-2">
                                        <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                            importMode === 'skip' 
                                                ? isDarkMode 
                                                    ? 'bg-blue-900/30 border border-blue-600' 
                                                    : 'bg-blue-50 border border-blue-200'
                                                : isDarkMode 
                                                    ? 'bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                                                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="importMode"
                                                value="skip"
                                                checked={importMode === 'skip'}
                                                onChange={(e) => setImportMode(e.target.value as 'skip' | 'update' | 'duplicate')}
                                                className="mr-3"
                                            />
                                            <div>
                                                <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                    Skip Duplicates
                                                </div>
                                                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Only import new members, skip existing ones
                                                </div>
                                            </div>
                                        </label>
                                        <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                            importMode === 'update' 
                                                ? isDarkMode 
                                                    ? 'bg-blue-900/30 border border-blue-600' 
                                                    : 'bg-blue-50 border border-blue-200'
                                                : isDarkMode 
                                                    ? 'bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                                                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="importMode"
                                                value="update"
                                                checked={importMode === 'update'}
                                                onChange={(e) => setImportMode(e.target.value as 'skip' | 'update' | 'duplicate')}
                                                className="mr-3"
                                            />
                                            <div>
                                                <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                    Update Existing
                                                </div>
                                                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Update existing members with new data
                                                </div>
                                            </div>
                                        </label>
                                        <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                            importMode === 'duplicate' 
                                                ? isDarkMode 
                                                    ? 'bg-blue-900/30 border border-blue-600' 
                                                    : 'bg-blue-50 border border-blue-200'
                                                : isDarkMode 
                                                    ? 'bg-gray-700 border border-gray-600 hover:bg-gray-600' 
                                                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="importMode"
                                                value="duplicate"
                                                checked={importMode === 'duplicate'}
                                                onChange={(e) => setImportMode(e.target.value as 'skip' | 'update' | 'duplicate')}
                                                className="mr-3"
                                            />
                                            <div>
                                                <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                    Allow Duplicates
                                                </div>
                                                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Import all data, including duplicates
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Import Progress */}
                                {isImporting && (
                                    <div className={`p-4 rounded-lg ${
                                        isDarkMode ? 'bg-blue-900/20 border border-blue-700/50' : 'bg-blue-50 border border-blue-200'
                                    }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-sm font-medium ${
                                                isDarkMode ? 'text-blue-300' : 'text-blue-600'
                                            }`}>
                                                Importing...
                                            </span>
                                            <span className={`text-sm ${
                                                isDarkMode ? 'text-blue-400' : 'text-blue-500'
                                            }`}>
                                                50%
                                            </span>
                                        </div>
                                        <div className={`w-full bg-gray-200 rounded-full h-2 ${
                                            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                        }`}>
                                            <div className={`bg-blue-600 h-2 rounded-full transition-all duration-300`} style={{ width: '50%' }}></div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        onClick={() => {
                                            setIsImportModalOpen(false);
                                            setImportFile(null);
                                            setIsImporting(false);
                                        }}
                                        className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                                            isDarkMode
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
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
                                        className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 ${
                                            !importFile || isImporting
                                                ? isDarkMode
                                                    ? 'bg-gray-600 text-gray-400 border border-gray-600 cursor-not-allowed'
                                                    : 'bg-gray-300 text-gray-500 border border-gray-300 cursor-not-allowed'
                                                : isDarkMode
                                                    ? 'bg-blue-600 hover:bg-blue-700 border border-blue-500'
                                                    : 'bg-blue-500 hover:bg-blue-600 border border-blue-400'
                                        } text-white`}
                                    >
                                        {isImporting ? 'Importing...' : 'Import Data'}
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
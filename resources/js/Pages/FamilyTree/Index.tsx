import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { FamilyMember, FamilyTreeProps, RelationshipType, FamilyRelationship } from '@/types/family-tree';
import { FaUserPlus, FaFileExport, FaFileImport, FaSearch, FaExpandAlt, FaCompressAlt, FaSun, FaMoon, FaCamera, FaExpand } from 'react-icons/fa';
import FamilyTreeVisualization from '@/Components/FamilyTreeVisualization';

export default function Index({ auth, familyMembers }: FamilyTreeProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
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

    const validateForm = (data: { 
        first_name: string;
        last_name: string;
        birth_date: string;
        death_date?: string | null | undefined;
        gender: 'male' | 'female' | 'other';
        notes: string;
        photo: File | string | null;
    }) => {
        const errors: typeof formErrors = {};

        // First Name validation
        if (!data.first_name.trim()) {
            errors.first_name = 'First name is required';
        } else if (data.first_name.length > 255) {
            errors.first_name = 'First name must be less than 255 characters';
        }

        // Last Name validation
        if (!data.last_name.trim()) {
            errors.last_name = 'Last name is required';
        } else if (data.last_name.length > 255) {
            errors.last_name = 'Last name must be less than 255 characters';
        }

        // Birth Date validation
        if (!data.birth_date) {
            errors.birth_date = 'Birth date is required';
        } else if (new Date(data.birth_date) > new Date()) {
            errors.birth_date = 'Birth date cannot be in the future';
        }

        // Death Date validation
        if (data.death_date) {
            if (new Date(data.death_date) > new Date()) {
                errors.death_date = 'Death date cannot be in the future';
            }
            if (new Date(data.death_date) < new Date(data.birth_date)) {
                errors.death_date = 'Death date must be after birth date';
            }
        }

        // Photo validation
        if (data.photo && typeof data.photo !== 'string' && !(data.photo instanceof File)) {
            errors.photo = 'Invalid photo format';
        }

        return errors;
    };

    const handleAddMember = async () => {
        // Validate form before submission
        const errors = validateForm(newMember);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return; // Stop if there are validation errors
        }

        const formData = new FormData();
        formData.append('first_name', newMember.first_name);
        formData.append('last_name', newMember.last_name);
        formData.append('birth_date', newMember.birth_date);
        formData.append('death_date', newMember.death_date);
        formData.append('gender', newMember.gender);
        formData.append('notes', newMember.notes);
        if (newMember.photo) {
            formData.append('photo', newMember.photo);
        }

        try {
            const response = await fetch('/family-tree/members', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add family member');
            }

            const result = await response.json();
            
            // Close modal and reset form
            setIsAddModalOpen(false);
            resetNewMember();
            setFormErrors({});

            // Show success message and refresh page
            alert('Family member added successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error adding family member:', error);
            alert(error instanceof Error ? error.message : 'Failed to add family member. Please try again.');
        }
    };

    // Add new relationship management functions
    const handleAddRelationship = async (fromMemberId: number, toMemberId: number, relationshipType: RelationshipType) => {
        try {
            const response = await fetch('/family-tree/relationships', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    from_member_id: fromMemberId,
                    to_member_id: toMemberId,
                    relationship_type: relationshipType,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add relationship');
            }

            const result = await response.json();
            
            // Update the managing member's relationships
            if (managingMember) {
                setManagingMember({
                    ...managingMember,
                    relationships: [...managingMember.relationships, result.data]
                });
            }

            alert('Relationship added successfully!');
            
            // Instead of returning the data, we'll just close the modal and refresh the page
            setIsManageRelationshipsModalOpen(false);
            setManagingMember(null);
            window.location.reload();
        } catch (error) {
            console.error('Error adding relationship:', error);
            alert('Failed to add relationship. Please try again.');
        }
    };

    const handleRemoveRelationship = async (relationshipId: number) => {
        if (!confirm('Are you sure you want to remove this relationship?')) {
            return;
        }

        try {
            const response = await fetch(`/family-tree/relationships/${relationshipId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    from_member_id: managingMember?.id,
                    to_member_id: managingMember?.relationships.find(rel => rel.id === relationshipId)?.to_member_id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to remove relationship');
            }

            // Update the managing member's relationships
            if (managingMember) {
                setManagingMember({
                    ...managingMember,
                    relationships: managingMember.relationships.filter(rel => rel.id !== relationshipId)
                });
            }

            alert('Relationship removed successfully!');
        } catch (error) {
            console.error('Error removing relationship:', error);
            alert('Failed to remove relationship. Please try again.');
        }
    };

    const startManagingRelationships = (member: FamilyMember) => {
        setManagingMember(member);
        setIsManageRelationshipsModalOpen(true);
    };

    const resetNewMember = () => {
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
    };

    const handleEditMember = async () => {
        if (!editingMember) return;

        // Validate form before submission
        const errors = validateForm(editingMember);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return; // Stop if there are validation errors
        }

        const formData = new FormData();
        formData.append('first_name', editingMember.first_name);
        formData.append('last_name', editingMember.last_name);
        formData.append('birth_date', editingMember.birth_date);
        formData.append('death_date', editingMember.death_date || '');
        formData.append('gender', editingMember.gender);
        formData.append('notes', editingMember.notes || '');
        if (editingMember.photo && typeof editingMember.photo !== 'string') {
            formData.append('photo', editingMember.photo);
        }

        try {
            const response = await fetch(`/family-tree/members/${editingMember.id}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-HTTP-Method-Override': 'PUT',
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update family member');
            }

            const result = await response.json();

            // Update the member in the list
            const updatedFamilyMembers = familyMembers.map(member => 
                member.id === editingMember.id ? result.data : member
            );
            window.location.reload(); // Refresh the page to update the tree visualization

            setIsEditModalOpen(false);
            setEditingMember(null);
            setFormErrors({});
            
            // Show success message
            alert('Family member updated successfully!');
        } catch (error) {
            console.error('Error updating family member:', error);
            alert(error instanceof Error ? error.message : 'Failed to update family member. Please try again.');
        }
    };

    const handleDeleteMember = async (memberId: number) => {
        if (!confirm('Are you sure you want to delete this family member? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/family-tree/members/${memberId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete family member');
            }

            // Remove the member from the list and close any open modals
            const updatedFamilyMembers = familyMembers.filter(member => member.id !== memberId);
            window.location.reload(); // Refresh the page to update the tree visualization

            setIsEditModalOpen(false);
            setEditingMember(null);
            setSelectedMember(null);
            
            // Show success message
            alert('Family member deleted successfully!');
        } catch (error) {
            console.error('Error deleting family member:', error);
            alert('Failed to delete family member. Please try again.');
        }
    };

    const startEditing = (member: FamilyMember) => {
        setEditingMember({
            ...member,
            photo: member.photo // Keep the existing photo URL as string
        });
        setIsEditModalOpen(true);
    };

    const handleExport = async () => {
        try {
            const response = await fetch('/family-tree/export', {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to export family tree');
            }

            // Get the filename from the Content-Disposition header if available
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'family-tree-export.json';
            if (contentDisposition) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            // Create a blob from the response and trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting family tree:', error);
            alert('Failed to export family tree. Please try again.');
        }
    };

    const handleImport = async () => {
        if (!importFile) {
            alert('Please select a file to import');
            return;
        }

        setIsImporting(true);

        try {
            // Read the file content
            const fileContent = await importFile.text();
            
            // Validate JSON format
            let jsonData;
            try {
                jsonData = JSON.parse(fileContent);
                console.log('Successfully parsed JSON:', jsonData); // Debug log
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                throw new Error('Invalid JSON format. Please ensure the file contains valid JSON data.');
            }

            // Validate the file structure and version
            if (!jsonData.version || !jsonData.familyMembers) {
                console.error('Invalid file structure:', jsonData);
                throw new Error('Invalid file format: Missing required data (version or family members)');
            }

            // Log the request that will be sent
            const requestData = {
                family_members: jsonData.familyMembers.map((member: {
                    id: number;
                    first_name: string;
                    last_name: string;
                    birth_date: string;
                    death_date: string | null;
                    gender: 'male' | 'female' | 'other';
                    notes: string | null;
                    photo: string | null;
                    relationships?: Array<{
                        id: number;
                        to_member_id: number;
                        relationship_type: RelationshipType;
                    }>;
                }) => ({
                    import_id: member.id,
                    first_name: member.first_name,
                    last_name: member.last_name,
                    birth_date: member.birth_date,
                    death_date: member.death_date,
                    gender: member.gender,
                    notes: member.notes,
                    photo: member.photo,
                    relationships: member.relationships?.map((rel: {
                        id: number;
                        to_member_id: number;
                        relationship_type: RelationshipType;
                    }) => ({
                        import_id: rel.id,
                        to_member_import_id: rel.to_member_id,
                        relationship_type: rel.relationship_type
                    }))
                })),
                import_mode: importMode
            };

            console.log('Sending import request with data:', requestData);

            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                throw new Error('CSRF token not found. Please refresh the page and try again.');
            }

            const response = await fetch('/family-tree/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(requestData)
            });

            // Log the raw response for debugging
            console.log('Raw response status:', response.status);
            console.log('Raw response headers:', Object.fromEntries(response.headers.entries()));
            
            // Try to get the response content
            const responseText = await response.text();
            console.log('Raw response text:', responseText);

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (error) {
                console.error('Error parsing response:', error);
                throw new Error('Server returned invalid JSON response. Please try again.');
            }

            if (!response.ok) {
                throw new Error(result.error || `Import failed with status ${response.status}`);
            }

            // Close modal and reset state
            setIsImportModalOpen(false);
            setImportFile(null);
            
            // Show success message with stats
            const stats = result.stats || {
                total: 0,
                created: 0,
                updated: 0,
                skipped: 0,
                relationships_created: 0
            };
            
            alert(`Family tree imported successfully!\n\nStats:\n` +
                  `Total processed: ${stats.total}\n` +
                  `Created: ${stats.created}\n` +
                  `Updated: ${stats.updated}\n` +
                  `Skipped: ${stats.skipped}\n` +
                  `Relationships created: ${stats.relationships_created}`);
            
            window.location.reload();
        } catch (error) {
            console.error('Error importing family tree:', error);
            alert(error instanceof Error ? error.message : 'Failed to import family tree. Please make sure the file is valid and try again.');
        } finally {
            setIsImporting(false);
        }
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
                                    onClick={handleExport}
                                >
                                    <FaFileExport className="mr-2" />
                                    Export
                                </button>
                                <button
                                    className="flex-1 sm:flex-none inline-flex items-center px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200 justify-center"
                                    onClick={() => setIsImportModalOpen(true)}
                                >
                                    <FaFileImport className="mr-2" />
                                    Import
                                </button>
                                <a
                                    href="/family-tree/full-view"
                                    className="flex-1 sm:flex-none inline-flex items-center px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-200 justify-center"
                                >
                                    <FaExpand className="mr-2" />
                                    Full View
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
                                        className={`inline-flex items-center px-3 py-2 rounded-md transition-colors ${
                                            isDarkMode 
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                        onClick={toggleDarkMode}
                                    >
                                        {isDarkMode ? <FaSun /> : <FaMoon />}
                                    </button>
                                    <button
                                        className={`inline-flex items-center px-3 py-2 rounded-md transition-colors ${
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

                    {/* Statistics Section */}
                    <div className={`overflow-hidden shadow-sm sm:rounded-lg mb-4 sm:mb-6 transition-colors duration-200 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="p-4">
                            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                Family Statistics
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Members</div>
                                    <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {familyMembers.length}
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Generations</div>
                                    <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {Math.max(...familyMembers.map(member => member.last_name.match(/Generation(\d+)/)?.[1] || '1').map(Number))}
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-blue-600'}`}>Male Members</div>
                                    <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                        {familyMembers.filter(member => member.gender === 'male').length}
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-pink-50'}`}>
                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-pink-600'}`}>Female Members</div>
                                    <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-pink-300' : 'text-pink-700'}`}>
                                        {familyMembers.filter(member => member.gender === 'female').length}
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-yellow-600'}`}>Children (&lt;18)</div>
                                    <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
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
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-green-600'}`}>Adults (18+)</div>
                                    <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
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
                                {/* Add new card for members without relationships */}
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-red-600'}`}>Unconnected Members</div>
                                    <div className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                                        {familyMembers.filter(member => member.relationships.length === 0).length}
                                    </div>
                                </div>
                            </div>

                            {/* Add new section for listing unconnected members */}
                            <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
                                <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-red-600'}`}>
                                    Members Without Relationships
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {familyMembers
                                        .filter(member => member.relationships.length === 0)
                                        .map(member => (
                                            <div 
                                                key={member.id} 
                                                className={`p-3 rounded-md cursor-pointer ${
                                                    isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white hover:bg-red-100'
                                                }`}
                                                onClick={() => startManagingRelationships(member)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                        isDarkMode ? 'bg-gray-500' : 'bg-red-200'
                                                    }`}>
                                                        {member.photo ? (
                                                            <img
                                                                src={member.photo}
                                                                alt={`${member.first_name} ${member.last_name}`}
                                                                className="w-full h-full rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className={`text-sm ${
                                                                isDarkMode ? 'text-gray-300' : 'text-red-600'
                                                            }`}>
                                                                {member.first_name[0]}
                                                                {member.last_name[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className={`font-medium ${
                                                            isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                                        }`}>
                                                            {member.first_name} {member.last_name}
                                                        </div>
                                                        <div className={`text-sm ${
                                                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                        }`}>
                                                            Click to add relationships
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    {familyMembers.filter(member => member.relationships.length === 0).length === 0 && (
                                        <div className={`col-span-full text-center p-4 ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                            All family members have relationships defined.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Age Distribution */}
                            <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                                <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-purple-600'}`}>
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
                                                <div key={range} className={`p-3 rounded-md ${
                                                    isDarkMode ? 'bg-gray-600' : 'bg-white'
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
                                                            onClick={() => startEditing(member)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                                                                isDarkMode
                                                                    ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-900/70'
                                                                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                            }`}
                                                            onClick={() => startManagingRelationships(member)}
                                                        >
                                                            Manage Relationships
                                                        </button>
                                                        <button
                                                            className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                                                                isDarkMode
                                                                    ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                            }`}
                                                            onClick={() => handleDeleteMember(member.id)}
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
                                            onChange={(e) => {
                                                setNewMember(prev => ({ ...prev, first_name: e.target.value }));
                                                setFormErrors(prev => ({ ...prev, first_name: undefined }));
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
                                            } focus:outline-none focus:ring-2 ${
                                                formErrors.first_name
                                                    ? 'focus:ring-red-500'
                                                    : 'focus:ring-blue-500'
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
                                            value={newMember.last_name}
                                            onChange={(e) => {
                                                setNewMember(prev => ({ ...prev, last_name: e.target.value }));
                                                setFormErrors(prev => ({ ...prev, last_name: undefined }));
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
                                            } focus:outline-none focus:ring-2 ${
                                                formErrors.last_name
                                                    ? 'focus:ring-red-500'
                                                    : 'focus:ring-blue-500'
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
                                            value={newMember.birth_date}
                                            onChange={(e) => {
                                                setNewMember(prev => ({ ...prev, birth_date: e.target.value }));
                                                setFormErrors(prev => ({ ...prev, birth_date: undefined }));
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
                                            } focus:outline-none focus:ring-2 ${
                                                formErrors.birth_date
                                                    ? 'focus:ring-red-500'
                                                    : 'focus:ring-blue-500'
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
                                            Death Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newMember.death_date}
                                            onChange={(e) => setNewMember(prev => ({ ...prev, death_date: e.target.value }))}
                                            min={newMember.birth_date}
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

            {/* Edit Member Modal */}
            {isEditModalOpen && editingMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`w-full max-w-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl`}>
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
                                            {editingMember.photo ? (
                                                <img
                                                    src={typeof editingMember.photo === 'string' ? editingMember.photo : URL.createObjectURL(editingMember.photo as File)}
                                                    alt={`${editingMember.first_name} ${editingMember.last_name}`}
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
                                                    setEditingMember(prev => prev ? {
                                                        ...prev,
                                                        photo: file as unknown as string // Type assertion to match FamilyMember interface
                                                    } : null);
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
                                            value={editingMember.first_name}
                                            onChange={(e) => setEditingMember(prev => prev ? ({
                                                ...prev,
                                                first_name: e.target.value
                                            }) : null)}
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
                                            value={editingMember.last_name}
                                            onChange={(e) => setEditingMember(prev => prev ? ({
                                                ...prev,
                                                last_name: e.target.value
                                            }) : null)}
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
                                            value={editingMember.birth_date}
                                            onChange={(e) => setEditingMember(prev => prev ? ({
                                                ...prev,
                                                birth_date: e.target.value
                                            }) : null)}
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
                                            Death Date
                                        </label>
                                        <input
                                            type="date"
                                            value={editingMember.death_date || ''}
                                            onChange={(e) => setEditingMember(prev => prev ? ({
                                                ...prev,
                                                death_date: e.target.value
                                            }) : null)}
                                            min={editingMember.birth_date}
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
                                            Gender
                                        </label>
                                        <select
                                            value={editingMember.gender}
                                            onChange={(e) => setEditingMember(prev => prev ? ({
                                                ...prev,
                                                gender: e.target.value as 'male' | 'female' | 'other'
                                            }) : null)}
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
                                        value={editingMember.notes || ''}
                                        onChange={(e) => setEditingMember(prev => prev ? ({
                                            ...prev,
                                            notes: e.target.value
                                        }) : null)}
                                        rows={3}
                                        className={`w-full px-3 py-2 rounded-md border ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        onClick={() => {
                                            setIsEditModalOpen(false);
                                            setEditingMember(null);
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
                                        onClick={handleEditMember}
                                        className={`px-4 py-2 rounded-md ${
                                            isDarkMode
                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                : 'bg-blue-500 hover:bg-blue-600'
                                        } text-white transition-colors`}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Relationships Modal */}
            {isManageRelationshipsModalOpen && managingMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`w-full max-w-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl`}>
                        <div className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                    Manage Relationships for {managingMember.first_name} {managingMember.last_name}
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsManageRelationshipsModalOpen(false);
                                        setManagingMember(null);
                                    }}
                                    className={`text-gray-400 hover:text-gray-500 transition-colors`}
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Current Relationships */}
                                <div>
                                    <h4 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Current Relationships
                                    </h4>
                                    <div className="space-y-2">
                                        {managingMember.relationships.map((rel) => {
                                            const relatedMember = getMemberById(rel.to_member_id);
                                            return (
                                                <div key={rel.id} className={`flex items-center justify-between p-2 rounded-md ${
                                                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                                }`}>
                                                    <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                                                        {getRelationshipLabel(rel.relationship_type)}: {relatedMember?.first_name} {relatedMember?.last_name}
                                                    </span>
                                                    <button
                                                        onClick={() => handleRemoveRelationship(rel.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {managingMember.relationships.length === 0 && (
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                No relationships added yet.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Add New Relationship */}
                                <div>
                                    <h4 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Add New Relationship
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <select
                                            name="member"
                                            className={`flex-1 px-3 py-2 rounded-md border ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <option value="">Select a member...</option>
                                            {familyMembers
                                                .filter(m => m.id !== managingMember.id)
                                                .map(member => (
                                                    <option key={member.id} value={member.id}>
                                                        {member.first_name} {member.last_name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                        <select
                                            name="relationship"
                                            className={`w-40 px-3 py-2 rounded-md border ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <option value="">Select type...</option>
                                            <option value="parent">Parent</option>
                                            <option value="child">Child</option>
                                            <option value="spouse">Spouse</option>
                                            <option value="sibling">Sibling</option>
                                        </select>
                                        <button
                                            onClick={async () => {
                                                const memberSelect = document.querySelector('select[name="member"]') as HTMLSelectElement;
                                                const relationshipSelect = document.querySelector('select[name="relationship"]') as HTMLSelectElement;
                                                
                                                if (memberSelect && relationshipSelect) {
                                                    const toMemberId = parseInt(memberSelect.value);
                                                    const relationshipType = relationshipSelect.value as RelationshipType;
                                                    
                                                    if (!toMemberId || !relationshipType) {
                                                        alert('Please select both a member and a relationship type.');
                                                        return;
                                                    }

                                                    await handleAddRelationship(managingMember.id, toMemberId, relationshipType);
                                                    // Reset selects
                                                    memberSelect.value = '';
                                                    relationshipSelect.value = '';
                                                }
                                            }}
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

                                {/* Close Button */}
                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={() => {
                                            setIsManageRelationshipsModalOpen(false);
                                            setManagingMember(null);
                                            // Reload the page after closing the relationships modal
                                            window.location.reload();
                                        }}
                                        className={`px-4 py-2 rounded-md ${
                                            isDarkMode
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        } transition-colors`}
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl`}>
                        <div className={`p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                    Import Family Tree
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsImportModalOpen(false);
                                        setImportFile(null);
                                    }}
                                    className={`text-gray-400 hover:text-gray-500 transition-colors`}
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Select JSON File
                                    </label>
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                        className={`w-full px-3 py-2 rounded-md border ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    />
                                    <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Please select a JSON file exported from a family tree.
                                    </p>
                                </div>

                                {/* Import Options */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        How to handle existing members?
                                    </label>
                                    <select
                                        value={importMode}
                                        onChange={(e) => setImportMode(e.target.value as 'skip' | 'update' | 'duplicate')}
                                        className={`w-full px-3 py-2 rounded-md border ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    >
                                        <option value="skip">Skip existing members</option>
                                        <option value="update">Update existing members</option>
                                        <option value="duplicate">Create as new members</option>
                                    </select>
                                    <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {importMode === 'skip' && 'Existing members will be skipped during import.'}
                                        {importMode === 'update' && 'Existing members will be updated with new data.'}
                                        {importMode === 'duplicate' && 'All members will be created as new entries.'}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        onClick={() => {
                                            setIsImportModalOpen(false);
                                            setImportFile(null);
                                        }}
                                        className={`px-4 py-2 rounded-md ${
                                            isDarkMode
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        } transition-colors`}
                                        disabled={isImporting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleImport}
                                        disabled={!importFile || isImporting}
                                        className={`px-4 py-2 rounded-md ${
                                            isDarkMode
                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                : 'bg-blue-500 hover:bg-blue-600'
                                        } text-white transition-colors ${
                                            (!importFile || isImporting) ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isImporting ? 'Importing...' : 'Import'}
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
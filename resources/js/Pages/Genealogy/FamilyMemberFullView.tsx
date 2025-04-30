import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import type { FamilyMember, FamilyTreeProps, FamilyRelationship } from '@/types/family-tree';
import { FaMoon, FaSun, FaSearch, FaMars, FaVenus, FaChevronDown, FaLink, FaCheck, FaQrcode, FaList, FaThLarge, FaFileDownload } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';

interface FamilyMemberFullViewProps extends FamilyTreeProps {
    clientIdentifier: string;
}

export default function FamilyMemberFullView({ familyMembers, clientIdentifier }: FamilyMemberFullViewProps) {
    const { url } = usePage();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
    const [isRootSelectorOpen, setIsRootSelectorOpen] = useState(false);
    const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);
    const [showQRCode, setShowQRCode] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'qr'>('grid');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [rootSelectorSearch, setRootSelectorSearch] = useState('');

    // Initialize rootMember from URL parameter
    const [rootMember, setRootMember] = useState<FamilyMember | null>(() => {
        const params = new URLSearchParams(window.location.search);
        const rootId = params.get('root');
        if (rootId) {
            const member = familyMembers.find(m => m.id === parseInt(rootId));
            return member || null;
        }
        return null;
    });

    // Update URL when root member changes
    const updateRootMember = (member: FamilyMember | null) => {
        setRootMember(member);
        setIsRootSelectorOpen(false);
        
        // Update URL without full page reload
        const params = new URLSearchParams(window.location.search);
        if (member) {
            params.set('root', member.id.toString());
        } else {
            params.delete('root');
        }
        
        router.get(`${url.split('?')[0]}?${params.toString()}`, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const getMemberById = (id: number): FamilyMember | undefined => {
        return familyMembers.find((member: FamilyMember) => member.id === id);
    };

    // Helper function to get all descendants and spouses of a member
    const getAllDescendantsAndSpouses = (member: FamilyMember): Set<number> => {
        const memberIds = new Set<number>();
        
        const addDescendants = (currentMember: FamilyMember) => {
            // Add spouses of current member
            currentMember.relationships
                .filter(rel => rel.relationship_type === 'spouse')
                .forEach(rel => memberIds.add(rel.to_member_id));
            
            // Add and process children
            const children = currentMember.relationships
                .filter(rel => rel.relationship_type === 'parent')
                .map(rel => getMemberById(rel.to_member_id))
                .filter((child): child is FamilyMember => child !== undefined);
            
            children.forEach(child => {
                memberIds.add(child.id);
                addDescendants(child);
            });
        };
        
        // Add root member
        memberIds.add(member.id);
        
        // Add spouses of root member
        member.relationships
            .filter(rel => rel.relationship_type === 'spouse')
            .forEach(rel => memberIds.add(rel.to_member_id));
        
        // Process descendants
        addDescendants(member);
        
        return memberIds;
    };

    const filteredMembers = useMemo(() => {
        let filtered = [...familyMembers];

        // First filter by root member if selected
        if (rootMember) {
            const memberIds = new Set<number>();
            
            // Add root member
            memberIds.add(rootMember.id);
            
            // Add parents of root member
            rootMember.relationships
                .filter(rel => rel.relationship_type === 'child')
                .forEach(rel => memberIds.add(rel.to_member_id));
            
            // Add spouses of root member
            rootMember.relationships
                .filter(rel => rel.relationship_type === 'spouse')
                .forEach(rel => memberIds.add(rel.to_member_id));
            
            // Add all descendants
            const processDescendants = (member: FamilyMember) => {
                const children = member.relationships
                    .filter(rel => rel.relationship_type === 'parent')
                    .map(rel => getMemberById(rel.to_member_id))
                    .filter((child): child is FamilyMember => child !== undefined);
                
                children.forEach(child => {
                    memberIds.add(child.id);
                    // Add child's spouses
                    child.relationships
                        .filter(rel => rel.relationship_type === 'spouse')
                        .forEach(rel => memberIds.add(rel.to_member_id));
                    processDescendants(child);
                });
            };
            
            processDescendants(rootMember);
            filtered = filtered.filter(member => memberIds.has(member.id));
        }

        // Then filter by search term
        filtered = filtered.filter((member: FamilyMember) => 
            `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Finally sort alphabetically
        return filtered.sort((a, b) => 
            `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        );
    }, [familyMembers, searchTerm, rootMember]);

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

    // Modified parentChildStructure to consider root member and sorting
    const parentChildStructure = useMemo(() => {
        const structure: { parent: FamilyMember; children: FamilyMember[] }[] = [];
        
        // If root member is selected, only show their direct descendants
        const membersToProcess = rootMember 
            ? [rootMember]
            : familyMembers;
        
        membersToProcess.forEach((member) => {
            const isParent = member.relationships.some(rel => rel.relationship_type === 'parent');
            
            if (isParent) {
                const children = member.relationships
                    .filter(rel => rel.relationship_type === 'parent')
                    .map(rel => getMemberById(rel.to_member_id))
                    .filter((child): child is FamilyMember => child !== undefined)
                    // Sort children by birth date (oldest first)
                    .sort((a, b) => new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime());
                
                structure.push({ parent: member, children });
            }
        });

        // Sort parents alphabetically by full name
        return structure.sort((a, b) => 
            `${a.parent.first_name} ${a.parent.last_name}`.localeCompare(`${b.parent.first_name} ${b.parent.last_name}`)
        );
    }, [familyMembers, rootMember]);

    const copyLinkToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowCopiedFeedback(true);
        setTimeout(() => setShowCopiedFeedback(false), 2000);
    };

    const exportToCSV = (onlyLiving: boolean = false) => {
        // Define CSV headers
        const headers = [
            'First Name',
            'Last Name',
            'Birth Date',
            ...(onlyLiving ? [] : ['Death Date']),
            'Age',
            'Gender'
        ].join(',');

        // Filter members if onlyLiving is true
        const membersToExport = onlyLiving 
            ? filteredMembers.filter(member => !member.death_date)
            : filteredMembers;

        // Convert members to CSV rows
        const csvRows = membersToExport.map(member => {
            const values = [
                member.first_name,
                member.last_name,
                new Date(member.birth_date).toLocaleDateString(),
                ...(onlyLiving ? [] : [member.death_date ? new Date(member.death_date).toLocaleDateString() : '']),
                calculateAge(member.birth_date, member.death_date),
                member.gender
            ];
            return values.join(',');
        });

        // Combine headers and rows
        const csvContent = [headers, ...csvRows].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `family_members${onlyLiving ? '_living' : ''}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    // Update the export menu content
    const exportMenuContent = (
        <div 
            className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 z-50 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
        >
            <button
                onClick={() => exportToCSV(false)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                    isDarkMode 
                        ? 'text-gray-200 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
                Export All Members
            </button>
            <button
                onClick={() => exportToCSV(true)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                    isDarkMode 
                        ? 'text-gray-200 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
                Export Living Members
            </button>
        </div>
    );

    // Add click outside handler for export menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.export-menu-container')) {
                setShowExportMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <Head title="Family Members - Full View" />

            {/* Header */}
            <div className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="container mx-auto px-4 py-3">
                    {/* Mobile Layout */}
                    <div className="lg:hidden space-y-3">
                        <div className="flex items-center justify-between">
                            <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Members
                            </h1>
                            <div className="flex items-center space-x-2">
                                <div className="relative export-menu-container">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowExportMenu(!showExportMenu);
                                        }}
                                        className={`p-2 rounded-lg transition-colors ${
                                            isDarkMode 
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                        title="Export options"
                                    >
                                        <FaFileDownload />
                                    </button>
                                    {showExportMenu && exportMenuContent}
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-colors ${
                                            isDarkMode 
                                                ? `${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-gray-600 text-gray-200` 
                                                : `${viewMode === 'list' ? 'bg-blue-100' : 'bg-gray-100'} hover:bg-gray-200 text-gray-700`
                                        }`}
                                        title="List View"
                                    >
                                        <FaList />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-colors ${
                                            isDarkMode 
                                                ? `${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-gray-600 text-gray-200` 
                                                : `${viewMode === 'grid' ? 'bg-blue-100' : 'bg-gray-100'} hover:bg-gray-200 text-gray-700`
                                        }`}
                                        title="Grid View"
                                    >
                                        <FaThLarge />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('qr')}
                                        className={`p-2 rounded-lg transition-colors ${
                                            isDarkMode 
                                                ? `${viewMode === 'qr' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-gray-600 text-gray-200` 
                                                : `${viewMode === 'qr' ? 'bg-blue-100' : 'bg-gray-100'} hover:bg-gray-200 text-gray-700`
                                        }`}
                                        title="QR Code View"
                                    >
                                        <FaQrcode />
                                    </button>
                                </div>
                                <button
                                    onClick={copyLinkToClipboard}
                                    className={`p-2 rounded-lg transition-colors relative ${
                                        isDarkMode 
                                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                    title="Copy link to clipboard"
                                >
                                    {showCopiedFeedback ? <FaCheck className="text-green-500" /> : <FaLink />}
                                </button>
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
                        <div className="relative">
                            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            <input
                                type="text"
                                placeholder="Search members..."
                                className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                }`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:flex items-center justify-between">
                        <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Family Members Directory
                        </h1>
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
                            <div className="relative export-menu-container">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowExportMenu(!showExportMenu);
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${
                                        isDarkMode 
                                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                    title="Export options"
                                >
                                    <FaFileDownload />
                                </button>
                                {showExportMenu && exportMenuContent}
                            </div>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-colors ${
                                        isDarkMode 
                                            ? `${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-gray-600 text-gray-200` 
                                            : `${viewMode === 'list' ? 'bg-blue-100' : 'bg-gray-100'} hover:bg-gray-200 text-gray-700`
                                    }`}
                                    title="List View"
                                >
                                    <FaList />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-colors ${
                                        isDarkMode 
                                            ? `${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-gray-600 text-gray-200` 
                                            : `${viewMode === 'grid' ? 'bg-blue-100' : 'bg-gray-100'} hover:bg-gray-200 text-gray-700`
                                    }`}
                                    title="Grid View"
                                >
                                    <FaThLarge />
                                </button>
                                <button
                                    onClick={() => setViewMode('qr')}
                                    className={`p-2 rounded-lg transition-colors ${
                                        isDarkMode 
                                            ? `${viewMode === 'qr' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-gray-600 text-gray-200` 
                                            : `${viewMode === 'qr' ? 'bg-blue-100' : 'bg-gray-100'} hover:bg-gray-200 text-gray-700`
                                    }`}
                                    title="QR Code View"
                                >
                                    <FaQrcode />
                                </button>
                            </div>
                            <button
                                onClick={copyLinkToClipboard}
                                className={`p-2 rounded-lg transition-colors relative ${
                                    isDarkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                                title="Copy link to clipboard"
                            >
                                {showCopiedFeedback ? <FaCheck className="text-green-500" /> : <FaLink />}
                            </button>
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

            {/* Sidebar */}
            <div className={`fixed left-0 top-16 bottom-0 w-64 overflow-y-auto transition-colors duration-200 
                ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg
                hidden lg:block`}>
                <div className="p-4">
                    {/* Root Selector */}
                    <div className="mb-6">
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Root Member
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => setIsRootSelectorOpen(!isRootSelectorOpen)}
                                className={`w-full px-3 py-2 text-left rounded-lg border flex items-center justify-between
                                    ${isDarkMode 
                                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                                        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <span>
                                    {rootMember 
                                        ? `${rootMember.first_name} ${rootMember.last_name}`
                                        : 'Show All Members'
                                    }
                                </span>
                                <FaChevronDown className={`transform transition-transform ${isRootSelectorOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isRootSelectorOpen && (
                                <div className={`absolute z-50 w-full mt-1 rounded-lg border shadow-lg overflow-hidden
                                    ${isDarkMode 
                                        ? 'bg-gray-700 border-gray-600' 
                                        : 'bg-white border-gray-300'
                                    }`}>
                                    {/* Search input */}
                                    <div className="p-2 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}">
                                        <div className="relative">
                                            <FaSearch className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${
                                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`} />
                                            <input
                                                type="text"
                                                placeholder="Search members..."
                                                className={`w-full pl-8 pr-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                                                    ${isDarkMode 
                                                        ? 'bg-gray-800 text-white placeholder-gray-400' 
                                                        : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                                                    }`}
                                                value={rootSelectorSearch}
                                                onChange={(e) => setRootSelectorSearch(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="max-h-60 overflow-y-auto">
                                        <button
                                            className={`w-full px-3 py-2 text-left hover:bg-opacity-10 hover:bg-blue-500
                                                ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                            onClick={() => updateRootMember(null)}
                                        >
                                            Show All Members
                                        </button>
                                        {[...familyMembers]
                                            .filter(member => 
                                                rootSelectorSearch === '' || 
                                                `${member.first_name} ${member.last_name}`
                                                    .toLowerCase()
                                                    .includes(rootSelectorSearch.toLowerCase())
                                            )
                                            .sort((a, b) => 
                                                `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
                                            )
                                            .map(member => (
                                            <button
                                                key={member.id}
                                                className={`w-full px-3 py-2 text-left hover:bg-opacity-10 hover:bg-blue-500
                                                    ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                                onClick={() => updateRootMember(member)}
                                            >
                                                {member.first_name} {member.last_name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Family Structure
                    </h2>
                    <div className="space-y-4">
                        {rootMember ? (
                            <div className="space-y-6">
                                {/* Parents Section */}
                                <div className="space-y-2">
                                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Parents</h3>
                                    <ul className={`pl-4 space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {rootMember.relationships
                                            .filter(rel => rel.relationship_type === 'child')
                                            .map(rel => {
                                                const parent = getMemberById(rel.to_member_id);
                                                return parent ? (
                                                    <li 
                                                        key={parent.id}
                                                        className="cursor-pointer hover:underline"
                                                        onClick={() => {
                                                            setSelectedMember(parent);
                                                            setSearchTerm(`${parent.first_name} ${parent.last_name}`);
                                                        }}
                                                    >
                                                        {parent.first_name} {parent.last_name}
                                                    </li>
                                                ) : null;
                                            })}
                                        {rootMember.relationships.filter(rel => rel.relationship_type === 'child').length === 0 && (
                                            <li className="italic text-sm">No parents defined</li>
                                        )}
                                    </ul>
                                </div>

                                {/* Spouse Section */}
                                <div className="space-y-2">
                                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Spouse(s)</h3>
                                    <ul className={`pl-4 space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {rootMember.relationships
                                            .filter(rel => rel.relationship_type === 'spouse')
                                            .map(rel => {
                                                const spouse = getMemberById(rel.to_member_id);
                                                return spouse ? (
                                                    <li 
                                                        key={spouse.id}
                                                        className="cursor-pointer hover:underline"
                                                        onClick={() => {
                                                            setSelectedMember(spouse);
                                                            setSearchTerm(`${spouse.first_name} ${spouse.last_name}`);
                                                        }}
                                                    >
                                                        {spouse.first_name} {spouse.last_name}
                                                    </li>
                                                ) : null;
                                            })}
                                        {rootMember.relationships.filter(rel => rel.relationship_type === 'spouse').length === 0 && (
                                            <li className="italic text-sm">No spouse defined</li>
                                        )}
                                    </ul>
                                </div>

                                {/* Siblings Section */}
                                <div className="space-y-2">
                                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Siblings</h3>
                                    <ul className={`pl-4 space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {rootMember.relationships
                                            .filter(rel => rel.relationship_type === 'sibling')
                                            .map(rel => {
                                                const sibling = getMemberById(rel.to_member_id);
                                                return sibling ? (
                                                    <li 
                                                        key={sibling.id}
                                                        className="cursor-pointer hover:underline"
                                                        onClick={() => {
                                                            setSelectedMember(sibling);
                                                            setSearchTerm(`${sibling.first_name} ${sibling.last_name}`);
                                                        }}
                                                    >
                                                        {sibling.first_name} {sibling.last_name}
                                                    </li>
                                                ) : null;
                                            })}
                                        {rootMember.relationships.filter(rel => rel.relationship_type === 'sibling').length === 0 && (
                                            <li className="italic text-sm">No siblings defined</li>
                                        )}
                                    </ul>
                                </div>

                                {/* Descendants Section */}
                                <div className="space-y-2">
                                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descendants</h3>
                                    {parentChildStructure.map(({ parent, children }) => (
                                        <div key={parent.id} className="space-y-2">
                                            <div 
                                                className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} cursor-pointer hover:underline`}
                                                onClick={() => {
                                                    setSelectedMember(parent);
                                                    setSearchTerm(`${parent.first_name} ${parent.last_name}`);
                                                }}
                                            >
                                                {parent.first_name} {parent.last_name}
                                            </div>
                                            <ul className={`pl-4 space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {children.map(child => (
                                                    <li 
                                                        key={child.id}
                                                        className="cursor-pointer hover:underline"
                                                        onClick={() => {
                                                            setSelectedMember(child);
                                                            setSearchTerm(`${child.first_name} ${child.last_name}`);
                                                        }}
                                                    >
                                                        {child.first_name} {child.last_name}
                                                    </li>
                                                ))}
                                                {children.length === 0 && (
                                                    <li className="italic text-sm">No children</li>
                                                )}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Show alphabetical list when no root member is selected
                            <div className="space-y-4">
                                {Object.entries(
                                    [...familyMembers]
                                        .sort((a, b) => 
                                            `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`)
                                        )
                                        .reduce((acc, member) => {
                                            const letter = member.last_name[0].toUpperCase();
                                            if (!acc[letter]) {
                                                acc[letter] = [];
                                            }
                                            acc[letter].push(member);
                                            return acc;
                                        }, {} as Record<string, FamilyMember[]>)
                                ).map(([letter, members]) => (
                                    <div key={letter} className="space-y-2">
                                        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {letter}
                                        </h3>
                                        <ul className={`pl-4 space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {members.map(member => (
                                                <li 
                                                    key={member.id}
                                                    className="cursor-pointer hover:underline"
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setSearchTerm(`${member.first_name} ${member.last_name}`);
                                                    }}
                                                >
                                                    {member.last_name}, {member.first_name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content - Adjusted with margin for sidebar */}
            <div className="px-4 pt-28 lg:pt-20 pb-8 lg:pl-72">
                {/* Stats Section */}
                <div className="mb-6 overflow-x-auto">
                    <div className="min-w-max">
                        <div className={`grid grid-cols-9 gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {/* Total, Living, Deceased Stats */}
                            <div className={`p-2 border border-gray-200 rounded-lg ${isDarkMode ? 'bg-gray-800/80 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'} shadow-lg min-w-[90px] transition-colors`}>
                                <div className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>Total</div>
                                <div className="text-lg font-semibold">{filteredMembers.length}</div>
                            </div>
                            <div className={`p-2 border border-gray-200 rounded-lg ${isDarkMode ? 'bg-gray-800/80 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'} shadow-lg min-w-[90px] transition-colors`}>
                                <div className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>Living</div>
                                <div className="text-lg font-semibold">
                                    {filteredMembers.filter(member => !member.death_date).length}
                                </div>
                            </div>
                            <div className={`p-2 border border-gray-200 rounded-lg ${isDarkMode ? 'bg-gray-800/80 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'} shadow-lg min-w-[90px] transition-colors`}>
                                <div className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>Deceased</div>
                                <div className="text-lg font-semibold">
                                    {filteredMembers.filter(member => member.death_date).length}
                                </div>
                            </div>

                            {/* Gender Stats */}
                            <div className={`p-2 border border-gray-200 rounded-lg ${isDarkMode ? 'bg-gray-800/80 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'} shadow-lg min-w-[90px] transition-colors`}>
                                <div className={`text-xs ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Male</div>
                                <div className="text-lg font-semibold">
                                    {filteredMembers.filter(member => member.gender === 'male').length}
                                </div>
                            </div>
                            <div className={`p-2 border border-gray-200 rounded-lg ${isDarkMode ? 'bg-gray-800/80 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'} shadow-lg min-w-[90px] transition-colors`}>
                                <div className={`text-xs ${isDarkMode ? 'text-pink-300' : 'text-pink-600'}`}>Female</div>
                                <div className="text-lg font-semibold">
                                    {filteredMembers.filter(member => member.gender === 'female').length}
                                </div>
                            </div>

                            {/* Age Group Stats */}
                            <div className={`p-2 border border-gray-200 rounded-lg ${isDarkMode ? 'bg-gray-800/80 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'} shadow-lg min-w-[90px] transition-colors`}>
                                <div className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>Age 1-6</div>
                                <div className="text-lg font-semibold">
                                    {filteredMembers.filter(member => {
                                        const age = calculateAge(member.birth_date, member.death_date);
                                        return age >= 1 && age <= 6;
                                    }).length}
                                </div>
                            </div>
                            <div className={`p-2 border border-gray-200 rounded-lg ${isDarkMode ? 'bg-gray-800/80 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'} shadow-lg min-w-[90px] transition-colors`}>
                                <div className={`text-xs ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>Age 7-17</div>
                                <div className="text-lg font-semibold">
                                    {filteredMembers.filter(member => {
                                        const age = calculateAge(member.birth_date, member.death_date);
                                        return age >= 7 && age <= 17;
                                    }).length}
                                </div>
                            </div>
                            <div className={`p-2 border border-gray-200 rounded-lg ${isDarkMode ? 'bg-gray-800/80 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'} shadow-lg min-w-[90px] transition-colors`}>
                                <div className={`text-xs ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>18-59</div>
                                <div className="text-lg font-semibold">
                                    {filteredMembers.filter(member => {
                                        const age = calculateAge(member.birth_date, member.death_date);
                                        return age >= 18 && age < 60;
                                    }).length}
                                </div>
                            </div>
                            <div className={`p-2 border border-gray-200 rounded-lg ${isDarkMode ? 'bg-gray-800/80 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'} shadow-lg min-w-[90px] transition-colors`}>
                                <div className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>60+</div>
                                <div className="text-lg font-semibold">
                                    {filteredMembers.filter(member => calculateAge(member.birth_date, member.death_date) >= 60).length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    // List View
                    <div className="space-y-4">
                        {filteredMembers.map((member: FamilyMember) => (
                            <div
                                key={member.id}
                                className={`flex items-center p-4 rounded-lg shadow-lg transition-all duration-200 
                                    ${selectedMember?.id === member.id
                                        ? isDarkMode 
                                            ? 'bg-indigo-900/30 ring-2 ring-indigo-500'
                                            : 'bg-indigo-50 ring-2 ring-indigo-300'
                                        : isDarkMode
                                            ? 'bg-gray-800/80 hover:bg-gray-800'
                                            : 'bg-white hover:bg-gray-50'
                                    }`}
                                onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                            >
                                {/* QR Code */}
                                <div className={`mr-6 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg flex-shrink-0 shadow-inner`}>
                                    <QRCodeSVG
                                        value={`${window.location.origin}/genealogy/${clientIdentifier}/member/${member.id}`}
                                        size={120}
                                        level="H"
                                        includeMargin={true}
                                    />
                                </div>

                                {/* Member Info */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {member.first_name} {member.last_name}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateRootMember(member);
                                                }}
                                                className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                                                    rootMember?.id === member.id
                                                        ? isDarkMode
                                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                                        : isDarkMode
                                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {rootMember?.id === member.id ? 'Current Root' : 'Set as Root'}
                                            </button>
                                            <a
                                                href={`/genealogy/${clientIdentifier}/member/${member.id}`}
                                                className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                                                    isDarkMode
                                                        ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                                }`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                View Profile
                                            </a>
                                        </div>
                                    </div>
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <span className="inline-block mr-4">
                                            <span className={`font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Birth Date:</span>{' '}
                                            {new Date(member.birth_date).toLocaleDateString()}
                                        </span>
                                        <span className="inline-block mr-4">
                                            <span className={`font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Age:</span>{' '}
                                            {calculateAge(member.birth_date, member.death_date)} years
                                        </span>
                                        <span className="inline-block">
                                            <span className={`font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Gender:</span>{' '}
                                            {member.gender.charAt(0).toUpperCase() + member.gender.slice(1)}
                                        </span>
                                        {member.death_date && (
                                            <span className="inline-block ml-4">
                                                <span className={`font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Death Date:</span>{' '}
                                                {new Date(member.death_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {filteredMembers.map((member: FamilyMember) => (
                            <div
                                key={member.id}
                                className={`border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all duration-200 cursor-pointer 
                                    ${selectedMember?.id === member.id
                                        ? isDarkMode 
                                            ? 'bg-indigo-900/30 ring-2 ring-indigo-500'
                                            : 'bg-indigo-50 ring-2 ring-indigo-300'
                                        : isDarkMode
                                            ? 'bg-gray-800/80 hover:bg-gray-800'
                                            : 'bg-white hover:bg-gray-50'
                                    }
                                    lg:max-w-sm`}
                                onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                            >
                                {/* Member Photo */}
                                <div className={`aspect-square w-full lg:aspect-[4/3] ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    {member.photo ? (
                                        <img
                                            src={member.photo}
                                            alt={`${member.first_name} ${member.last_name}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className={`text-4xl lg:text-3xl font-semibold ${
                                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                            }`}>
                                                {member.first_name[0]}
                                                {member.last_name[0]}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Member Info */}
                                <div className="p-4 lg:p-3">
                                    <h3 className={`text-lg lg:text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {member.first_name} {member.last_name}
                                    </h3>
                                    <div className="flex items-center mt-2 mb-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowQRCode(member.id);
                                            }}
                                            className={`text-sm p-2 rounded-lg transition-colors mr-2 ${
                                                isDarkMode
                                                    ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                                                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                            }`}
                                        >
                                            <FaQrcode className="w-4 h-4" />
                                        </button>
                                        <div className="flex-grow flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateRootMember(member);
                                                }}
                                                className={`text-sm px-3 py-1.5 rounded-lg transition-colors flex-1 ${
                                                    rootMember?.id === member.id
                                                        ? isDarkMode
                                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                                        : isDarkMode
                                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {rootMember?.id === member.id ? 'Current Root' : 'Set as Root'}
                                            </button>
                                            <a
                                                href={`/genealogy/${clientIdentifier}/member/${member.id}`}
                                                className={`text-sm px-3 py-1.5 rounded-lg transition-colors flex-1 text-center ${
                                                    isDarkMode
                                                        ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                                }`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                View Profile
                                            </a>
                                        </div>
                                    </div>
                                    <div className={`space-y-2 lg:space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <p>
                                            <span className={`font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Birth Date:</span>{' '}
                                            {new Date(member.birth_date).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <span className={`font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Age:</span>{' '}
                                            {calculateAge(member.birth_date, member.death_date)} years
                                        </p>
                                        {member.death_date && (
                                            <p>
                                                <span className={`font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Death Date:</span>{' '}
                                                {new Date(member.death_date).toLocaleDateString()}
                                            </p>
                                        )}
                                        <p>
                                            <span className={`font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Gender:</span>{' '}
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
                ) : (
                    // QR Code View
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredMembers.map((member: FamilyMember) => (
                            <div
                                key={member.id}
                                className={`p-4 rounded-lg shadow-lg w-full max-w-[280px] mx-auto ${
                                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                                }`}
                            >
                                <div className={`mb-4 p-3 ${isDarkMode ? 'bg-white' : 'bg-gray-100'} rounded-lg flex justify-center items-center`}>
                                    <QRCodeSVG
                                        value={`${window.location.origin}/genealogy/${clientIdentifier}/member/${member.id}`}
                                        size={200}
                                        level="H"
                                        includeMargin={true}
                                    />
                                </div>
                                <h3 className={`text-center font-semibold ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {member.first_name} {member.last_name}
                                </h3>
                            </div>
                        ))}
                    </div>
                )}

                {filteredMembers.length === 0 && (
                    <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No family members found matching your search.
                    </div>
                )}
            </div>

            {/* QR Code Modal */}
            {showQRCode !== null && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setShowQRCode(null)}
                >
                    <div 
                        className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="mb-4 text-center">
                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Profile QR Code
                            </h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Scan to view profile
                            </p>
                        </div>
                        <div className={`p-4 ${isDarkMode ? 'bg-white' : 'bg-gray-100'} rounded-lg`}>
                            <QRCodeSVG
                                value={`${window.location.origin}/genealogy/${clientIdentifier}/member/${showQRCode}`}
                                size={200}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <button
                            className={`mt-4 w-full py-2 rounded-lg text-center ${
                                isDarkMode
                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            }`}
                            onClick={() => setShowQRCode(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
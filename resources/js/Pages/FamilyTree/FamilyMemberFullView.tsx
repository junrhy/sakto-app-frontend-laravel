import React, { useState, useMemo, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import type { FamilyMember, FamilyTreeProps, FamilyRelationship } from '@/types/family-tree';
import { FaMoon, FaSun, FaSearch, FaMars, FaVenus, FaChevronDown, FaLink, FaCheck, FaQrcode } from 'react-icons/fa';
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
                                Family Members Directory
                            </h1>
                            <div className="flex items-center space-x-2">
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
                                    {showCopiedFeedback && (
                                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-black text-white whitespace-nowrap">
                                            Link copied!
                                        </span>
                                    )}
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
                                {showCopiedFeedback && (
                                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-black text-white whitespace-nowrap">
                                        Link copied!
                                    </span>
                                )}
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
                                <div className={`absolute z-50 w-full mt-1 rounded-lg border shadow-lg max-h-60 overflow-y-auto
                                    ${isDarkMode 
                                        ? 'bg-gray-700 border-gray-600' 
                                        : 'bg-white border-gray-300'
                                    }`}>
                                    <button
                                        className={`w-full px-3 py-2 text-left hover:bg-opacity-10 hover:bg-blue-500
                                            ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                        onClick={() => updateRootMember(null)}
                                    >
                                        Show All Members
                                    </button>
                                    {[...familyMembers]
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
                            )}
                        </div>
                    </div>

                    <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Family Structure
                    </h2>
                    <div className="space-y-4">
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
                        {parentChildStructure.length === 0 && (
                            <p className={`italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                No family structure defined
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content - Adjusted with margin for sidebar */}
            <div className="container mx-auto px-4 pt-20 pb-8 lg:ml-64">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {filteredMembers.map((member: FamilyMember) => (
                        <div
                            key={member.id}
                            className={`rounded-lg shadow-lg overflow-hidden transition-all duration-200 cursor-pointer 
                                ${selectedMember?.id === member.id
                                    ? isDarkMode 
                                        ? 'bg-blue-900/30 ring-2 ring-blue-500'
                                        : 'bg-blue-50 ring-2 ring-blue-300'
                                    : isDarkMode
                                        ? 'bg-gray-800 hover:bg-gray-700'
                                        : 'bg-white hover:bg-gray-50'
                                }
                                lg:max-w-sm`}
                            onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                        >
                            {/* Member Photo */}
                            <div className={`aspect-square w-full lg:aspect-[4/3] ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
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
                                <h3 className={`text-lg lg:text-base font-semibold ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
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
                                                ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                        }`}
                                    >
                                        <FaQrcode className="w-4 h-4" />
                                    </button>
                                    <a
                                        href={`/family-tree/${clientIdentifier}/member/${member.id}`}
                                        className={`text-sm px-4 py-2 rounded-lg transition-colors flex-grow text-center ${
                                            isDarkMode
                                                ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                        }`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        View Profile
                                    </a>
                                </div>
                                <div className={`space-y-2 lg:space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
                                    value={`${window.location.origin}/family-tree/${clientIdentifier}/member/${showQRCode}`}
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

                {filteredMembers.length === 0 && (
                    <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No family members found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
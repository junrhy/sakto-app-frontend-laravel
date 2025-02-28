import React, { useCallback, useState, useEffect } from 'react';
import Tree from 'react-d3-tree';
import type { FamilyMember } from '@/types/family-tree';
import { FaSearch, FaSearchMinus, FaSearchPlus, FaRedo, FaShare, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaChevronDown } from 'react-icons/fa';
import { router } from '@inertiajs/react';

interface Props {
    familyMembers: FamilyMember[];
    onNodeClick: (member: FamilyMember) => void;
    isDarkMode?: boolean;
    isFullPage?: boolean;
}

interface TreeNode {
    name: string;
    attributes?: {
        birth?: string;
        death?: string;
        gender?: string;
        relationship?: string;
        isBranch?: boolean;
        isHidden?: boolean;
        isReference?: boolean;
    };
    children?: TreeNode[];
}

export default function FamilyTreeVisualization({ familyMembers, onNodeClick, isDarkMode = false, isFullPage = false }: Props) {
    const [zoom, setZoom] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [selectedRootMember, setSelectedRootMember] = useState<number | null>(null);
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    const [hideControls, setHideControls] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isRootSelectorOpen, setIsRootSelectorOpen] = useState(false);
    const [rootSelectorSearch, setRootSelectorSearch] = useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize position and handle URL parameters
    useEffect(() => {
        if (!containerRef.current || isInitialized) return;

        const params = new URLSearchParams(window.location.search);
        const memberId = params.get('member');
        const hideControlsParam = params.get('hideControls');
        const posX = params.get('x');
        const posY = params.get('y');
        const zoomLevel = params.get('zoom');
        
        if (memberId && familyMembers.some(member => member.id === parseInt(memberId))) {
            setSelectedRootMember(parseInt(memberId));
        }
        
        setHideControls(hideControlsParam === 'true');

        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });

        // Load position and zoom if they exist in URL
        if (posX && posY && zoomLevel) {
            setTranslate({ 
                x: parseFloat(posX), 
                y: parseFloat(posY) 
            });
            setZoom(parseFloat(zoomLevel));
        } else {
            // Set initial position if not loading from URL
            setTranslate({ x: width / 2, y: isFullPage ? height / 4 : 50 });
            setZoom(isFullPage ? 0.6 : 0.8);
        }

        setIsInitialized(true);
    }, [familyMembers, isFullPage, containerRef.current, isInitialized]);

    // Function to update URL with current position
    const updatePositionInURL = useCallback((newTranslate: { x: number, y: number }, newZoom: number) => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('x', newTranslate.x.toString());
        currentUrl.searchParams.set('y', newTranslate.y.toString());
        currentUrl.searchParams.set('zoom', newZoom.toString());
        
        router.get(currentUrl.pathname + currentUrl.search, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    }, []);

    // Update URL when member is selected
    const handleMemberSelect = (value: string) => {
        const newMemberId = value === '' ? null : parseInt(value);
        setSelectedRootMember(newMemberId);
        handleReset(); // Reset zoom and position when changing root member

        // Update URL while preserving other parameters
        const currentUrl = new URL(window.location.href);
        if (newMemberId === null) {
            currentUrl.searchParams.delete('member');
        } else {
            currentUrl.searchParams.set('member', newMemberId.toString());
        }
        
        router.get(currentUrl.pathname + currentUrl.search, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    // Find the oldest member
    const getOldestMember = useCallback(() => {
        return familyMembers.reduce((oldest, current) => {
            const oldestDate = new Date(oldest.birth_date);
            const currentDate = new Date(current.birth_date);
            return currentDate < oldestDate ? current : oldest;
        }, familyMembers[0]);
    }, [familyMembers]);

    const buildTreeData = useCallback((): TreeNode[] => {
        if (!familyMembers.length) return [];

        // Track all processed members to ensure we don't miss any
        const globalProcessedIds = new Set<number>();

        const buildNode = (member: FamilyMember, processedIds = new Set<number>()): TreeNode => {
            if (processedIds.has(member.id)) {
                return {
                    name: `${member.first_name} ${member.last_name}`,
                    attributes: {
                        birth: new Date(member.birth_date).toISOString().split('T')[0],
                        death: member.death_date ? new Date(member.death_date).toISOString().split('T')[0] : undefined,
                        gender: member.gender,
                        isReference: true
                    }
                };
            }

            processedIds.add(member.id);
            globalProcessedIds.add(member.id);
            const children: TreeNode[] = [];

            // Add spouse if exists (check both directions)
            const spouseRelationships = [
                ...member.relationships.filter(rel => rel.relationship_type === 'spouse'),
                ...member.related_to.filter(rel => rel.relationship_type === 'spouse')
            ];

            spouseRelationships.forEach(spouseRel => {
                const spouseMember = familyMembers.find(m => 
                    m.id === (spouseRel.from_member_id === member.id ? spouseRel.to_member_id : spouseRel.from_member_id)
                );
                if (spouseMember && !processedIds.has(spouseMember.id)) {
                    children.push({
                        name: `${spouseMember.first_name} ${spouseMember.last_name}`,
                        attributes: {
                            birth: new Date(spouseMember.birth_date).toISOString().split('T')[0],
                            death: spouseMember.death_date ? new Date(spouseMember.death_date).toISOString().split('T')[0] : undefined,
                            relationship: 'Spouse',
                            gender: spouseMember.gender
                        }
                    });
                    processedIds.add(spouseMember.id);
                    globalProcessedIds.add(spouseMember.id);
                }
            });

            // Find all children (both as parent and through spouse relationships)
            const allChildren = new Set<FamilyMember>();
            
            // Direct children (check both directions)
            const childrenRelationships = [
                ...member.relationships.filter(rel => rel.relationship_type === 'parent'),
                ...member.related_to.filter(rel => rel.relationship_type === 'child')
            ];

            childrenRelationships.forEach(rel => {
                const child = familyMembers.find(m => 
                    m.id === (rel.from_member_id === member.id ? rel.to_member_id : rel.from_member_id)
                );
                if (child) allChildren.add(child);
            });

            // Children through spouse
            spouseRelationships.forEach(spouseRel => {
                const spouse = familyMembers.find(m => 
                    m.id === (spouseRel.from_member_id === member.id ? spouseRel.to_member_id : spouseRel.from_member_id)
                );
                if (spouse) {
                    const spouseChildren = [
                        ...spouse.relationships.filter(rel => rel.relationship_type === 'parent'),
                        ...spouse.related_to.filter(rel => rel.relationship_type === 'child')
                    ];
                    
                    spouseChildren.forEach(rel => {
                        const child = familyMembers.find(m => 
                            m.id === (rel.from_member_id === spouse.id ? rel.to_member_id : rel.from_member_id)
                        );
                        if (child) allChildren.add(child);
                    });
                }
            });

            // Add each child as a node
            Array.from(allChildren)
                .sort((a, b) => new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime())
                .forEach(child => {
                    children.push(buildNode(child, new Set(processedIds)));
                });

            return {
                name: `${member.first_name} ${member.last_name}`,
                attributes: {
                    birth: new Date(member.birth_date).toISOString().split('T')[0],
                    death: member.death_date ? new Date(member.death_date).toISOString().split('T')[0] : undefined,
                    gender: member.gender
                },
                children: children.length > 0 ? children : undefined
            };
        };

        // If a root member is selected, build tree from that member
        if (selectedRootMember !== null) {
            const selectedMember = familyMembers.find(m => m.id === selectedRootMember);
            if (selectedMember) {
                return [buildNode(selectedMember)];
            }
            return [];
        }

        // For "All Trees" or default view, start with the oldest member
        const oldestMember = getOldestMember();
        return [buildNode(oldestMember)];
    }, [familyMembers, selectedRootMember, getOldestMember]);

    const handleNodeClick = (nodeData: any) => {
        const memberName = nodeData.data.name;
        const member = familyMembers.find(
            m => `${m.first_name} ${m.last_name}` === memberName
        );
        if (member) {
            onNodeClick(member);
        }
    };

    const calculateAge = (birth: string, death?: string): number => {
        const birthDate = new Date(birth);
        const endDate = death ? new Date(death) : new Date();
        let age = endDate.getFullYear() - birthDate.getFullYear();
        const monthDiff = endDate.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const renderForeignObjectNode = ({
        nodeDatum,
        foreignObjectProps
    }: any) => {
        // Skip rendering for branch nodes but return an empty group to maintain structure
        if (nodeDatum.attributes?.isBranch) {
            return <g />;
        }

        const age = calculateAge(nodeDatum.attributes?.birth, nodeDatum.attributes?.death);
        const isDeceased = !!nodeDatum.attributes?.death;

        return (
            <g>
                <circle 
                    r={isFullPage ? 12 : 8} 
                    fill={nodeDatum.attributes?.gender === 'male' 
                        ? (isDarkMode ? '#1d4ed8' : '#93c5fd')
                        : (isDarkMode ? '#db2777' : '#f9a8d4')
                    }
                    className="transition-colors duration-200"
                    cy={isFullPage ? -30 : -15}
                />
                <foreignObject {...foreignObjectProps}>
                    <div style={{ 
                        backgroundColor: isDarkMode ? '#1f2937' : 'white',
                        padding: isFullPage ? '6px' : '3px',
                        borderRadius: '4px',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        fontSize: isFullPage ? '14px' : '10px',
                        width: isFullPage ? '160px' : '90px',
                        textAlign: 'center',
                        boxShadow: isDarkMode 
                            ? '0 1px 2px rgba(0, 0, 0, 0.3)' 
                            : '0 1px 2px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s ease',
                        opacity: nodeDatum.attributes?.isReference ? 0.7 : 1,
                        marginTop: isFullPage ? '45px' : '20px'
                    }}>
                        <div style={{ 
                            fontWeight: 'bold',
                            color: isDarkMode ? '#e5e7eb' : '#111827',
                            fontSize: isFullPage ? '13px' : '9px',
                            lineHeight: isFullPage ? '16px' : '11px',
                            maxHeight: isFullPage ? '48px' : '33px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            wordBreak: 'break-word'
                        }}>
                            {nodeDatum.name}
                        </div>
                        <div style={{ 
                            color: isDarkMode ? '#9ca3af' : '#6b7280',
                            fontSize: isFullPage ? '11px' : '8px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: isFullPage ? '14px' : '10px',
                            marginTop: isFullPage ? '2px' : '1px'
                        }}>
                            {nodeDatum.attributes?.relationship ? (
                                <>
                                    <span>Spouse • </span>
                                    {isDeceased ? (
                                        <span style={{ color: isDarkMode ? '#ef4444' : '#dc2626' }}>
                                            Age: {age}
                                        </span>
                                    ) : (
                                        <span style={{ color: isDarkMode ? '#10b981' : '#059669' }}>
                                            Age: {age}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <>
                                    {isDeceased ? (
                                        <span style={{ color: isDarkMode ? '#ef4444' : '#dc2626' }}>
                                            Age: {age}
                                        </span>
                                    ) : (
                                        <span style={{ color: isDarkMode ? '#10b981' : '#059669' }}>
                                            Age: {age}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </foreignObject>
            </g>
        );
    };

    const handleZoomIn = () => {
        const newZoom = Math.min(zoom + 0.2, 2);
        setZoom(newZoom);
        updatePositionInURL(translate, newZoom);
    };

    const handleZoomOut = () => {
        const newZoom = Math.max(zoom - 0.2, 0.4);
        setZoom(newZoom);
        updatePositionInURL(translate, newZoom);
    };

    const handleReset = () => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            const newZoom = isFullPage ? 0.6 : 0.8;
            const newTranslate = { x: width / 2, y: isFullPage ? height / 4 : 50 };
            setZoom(newZoom);
            setTranslate(newTranslate);
            
            // Clear position parameters from URL
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete('x');
            currentUrl.searchParams.delete('y');
            currentUrl.searchParams.delete('zoom');
            
            router.get(currentUrl.pathname + currentUrl.search, {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });
        }
    };

    const handleWheel = useCallback((event: WheelEvent) => {
        event.preventDefault();
        if (!containerRef.current) return;

        const { width, height } = containerRef.current.getBoundingClientRect();
        const mouseX = event.clientX - containerRef.current.offsetLeft;
        const mouseY = event.clientY - containerRef.current.offsetTop;

        const deltaY = event.deltaY;
        const zoomFactor = 0.1;
        const newZoom = deltaY > 0 
            ? Math.max(zoom - zoomFactor, 0.4) 
            : Math.min(zoom + zoomFactor, 2);

        // Calculate the point-under-mouse-before-zoom in screen coordinates
        const pointBeforeZoomX = (mouseX - translate.x) / zoom;
        const pointBeforeZoomY = (mouseY - translate.y) / zoom;

        // Calculate the point-under-mouse-after-zoom in screen coordinates
        const pointAfterZoomX = (mouseX - translate.x) / newZoom;
        const pointAfterZoomY = (mouseY - translate.y) / newZoom;

        // Adjust translation to keep the point under the mouse fixed
        setTranslate(prev => ({
            x: prev.x + (pointAfterZoomX - pointBeforeZoomX) * newZoom,
            y: prev.y + (pointAfterZoomY - pointBeforeZoomY) * newZoom
        }));
        setZoom(newZoom);
    }, [zoom, translate]);

    React.useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [handleWheel]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
    };

    // Add keyboard controls
    useEffect(() => {
        const normalStep = 50; // pixels to move per normal arrow key press
        const pageStep = 200; // pixels to move per page movement
        
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent default for all our custom key combinations
            if (
                ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(e.key) ||
                (e.shiftKey && ['ArrowLeft', 'ArrowRight'].includes(e.key))
            ) {
                e.preventDefault();
            }

            const step = e.shiftKey ? pageStep : normalStep;
            let newTranslate = { ...translate };

            switch(e.key) {
                case 'ArrowUp':
                    newTranslate = { ...translate, y: translate.y + step };
                    setTranslate(newTranslate);
                    if (e.shiftKey) updatePositionInURL(newTranslate, zoom);
                    break;
                case 'ArrowDown':
                    newTranslate = { ...translate, y: translate.y - step };
                    setTranslate(newTranslate);
                    if (e.shiftKey) updatePositionInURL(newTranslate, zoom);
                    break;
                case 'ArrowLeft':
                    newTranslate = { ...translate, x: translate.x + step };
                    setTranslate(newTranslate);
                    if (e.shiftKey) updatePositionInURL(newTranslate, zoom);
                    break;
                case 'ArrowRight':
                    newTranslate = { ...translate, x: translate.x - step };
                    setTranslate(newTranslate);
                    if (e.shiftKey) updatePositionInURL(newTranslate, zoom);
                    break;
                case 'PageUp':
                    newTranslate = { ...translate, y: translate.y + pageStep };
                    setTranslate(newTranslate);
                    updatePositionInURL(newTranslate, zoom);
                    break;
                case 'PageDown':
                    newTranslate = { ...translate, y: translate.y - pageStep };
                    setTranslate(newTranslate);
                    updatePositionInURL(newTranslate, zoom);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [translate, zoom, updatePositionInURL]);

    // Filter members based on search term
    const filteredMembers = familyMembers
        .filter(member => 
            rootSelectorSearch === '' || 
            `${member.first_name} ${member.last_name}`
                .toLowerCase()
                .includes(rootSelectorSearch.toLowerCase())
        )
        .sort((a, b) => 
            `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.root-member-selector')) {
                setIsRootSelectorOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div 
            ref={containerRef} 
            className={`relative ${isFullPage ? 'w-screen h-screen' : 'w-full h-full'} ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}
        >
            {/* Root Member Selector - Only show if controls are not hidden */}
            {!hideControls && (
                <>
                    <div className={`absolute top-4 left-4 z-10 p-2 rounded-lg ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } shadow-lg min-w-[250px] root-member-selector`}>
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
                                    {selectedRootMember 
                                        ? familyMembers.find(m => m.id === selectedRootMember)
                                            ? `${familyMembers.find(m => m.id === selectedRootMember)!.first_name} ${familyMembers.find(m => m.id === selectedRootMember)!.last_name}`
                                            : 'All Trees (Oldest Member)'
                                        : 'All Trees (Oldest Member)'
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
                                    <div className={`p-2 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
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
                                            onClick={() => {
                                                handleMemberSelect('');
                                                setIsRootSelectorOpen(false);
                                            }}
                                        >
                                            All Trees (Oldest Member)
                                        </button>
                                        {filteredMembers.map(member => (
                                            <button
                                                key={member.id}
                                                className={`w-full px-3 py-2 text-left hover:bg-opacity-10 hover:bg-blue-500
                                                    ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                                onClick={() => {
                                                    handleMemberSelect(member.id.toString());
                                                    setIsRootSelectorOpen(false);
                                                }}
                                            >
                                                {member.first_name} {member.last_name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Updated arrow key controls info */}
                    <div className={`absolute bottom-4 left-4 z-10 p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'
                    } shadow-lg space-y-2`}>
                        <div className="flex items-center gap-2">
                            <span>Normal move:</span>
                            <div className="flex gap-1">
                                <FaArrowUp className="text-sm" />
                                <FaArrowDown className="text-sm" />
                                <FaArrowLeft className="text-sm" />
                                <FaArrowRight className="text-sm" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Page move:</span>
                            <div className="flex items-center gap-1">
                                <span className="text-xs px-1 border rounded">Shift</span>
                                <span>+</span>
                                <div className="flex gap-1">
                                    <FaArrowUp className="text-sm" />
                                    <FaArrowDown className="text-sm" />
                                    <FaArrowLeft className="text-sm" />
                                    <FaArrowRight className="text-sm" />
                                </div>
                                <span>or</span>
                                <span className="text-xs px-1 border rounded">Page Up/Down</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Controls - Only show if controls are not hidden */}
            {!hideControls && (
                <div className={`absolute top-4 right-4 flex flex-col gap-2 z-10 p-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}>
                    <button
                        onClick={handleZoomIn}
                        className={`p-2 rounded-lg transition-colors ${
                            isDarkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                        <FaSearchPlus />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className={`p-2 rounded-lg transition-colors ${
                            isDarkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                        <FaSearchMinus />
                    </button>
                    <button
                        onClick={handleReset}
                        className={`p-2 rounded-lg transition-colors ${
                            isDarkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                        <FaRedo />
                    </button>
                    <button
                        onClick={handleShare}
                        className={`p-2 rounded-lg transition-colors ${
                            isDarkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                        <FaShare />
                    </button>
                </div>
            )}

            {/* Toast - Only show if controls are not hidden */}
            {!hideControls && showCopiedToast && (
                <div className={`absolute top-16 right-4 z-20 p-2 rounded-lg shadow-lg ${
                    isDarkMode 
                        ? 'bg-gray-800 text-gray-200' 
                        : 'bg-white text-gray-700'
                }`}>
                    Link copied to clipboard!
                </div>
            )}

            {/* Tree container */}
            <div className="w-full h-full">
                <Tree
                    data={buildTreeData()[0] || { name: 'No family members', children: [] }}
                    orientation="vertical"
                    translate={translate}
                    nodeSize={{ x: isFullPage ? 180 : 120, y: isFullPage ? 120 : 80 }}
                    zoom={zoom}
                    onNodeClick={handleNodeClick}
                    renderCustomNodeElement={(rd3tProps) =>
                        renderForeignObjectNode({
                            ...rd3tProps,
                            foreignObjectProps: {
                                width: isFullPage ? 160 : 100,
                                height: isFullPage ? 100 : 50,
                                x: isFullPage ? -80 : -50,
                                y: isFullPage ? -50 : -25,
                            },
                        })
                    }
                    pathClassFunc={() => isDarkMode ? 'stroke-gray-500' : 'stroke-gray-400'}
                />
            </div>
        </div>
    );
}
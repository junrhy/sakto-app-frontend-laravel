import React, { useCallback, useState, useEffect } from 'react';
import Tree from 'react-d3-tree';
import type { FamilyMember } from '@/types/family-tree';
import { FaSearch, FaSearchMinus, FaSearchPlus, FaRedo, FaShare, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
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
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Read URL parameters on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const memberId = params.get('member');
        const hideControlsParam = params.get('hideControls');
        
        if (memberId && familyMembers.some(member => member.id === parseInt(memberId))) {
            setSelectedRootMember(parseInt(memberId));
        }
        
        setHideControls(hideControlsParam === 'true');
    }, [familyMembers]);

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

    React.useEffect(() => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            setDimensions({ width, height });
            setTranslate({ x: width / 2, y: isFullPage ? height / 4 : 50 });
        }

        const handleResize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
                setTranslate({ x: width / 2, y: isFullPage ? height / 4 : 50 });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isFullPage]);

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
        setZoom(prev => Math.min(prev + 0.2, 2));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.2, 0.4));
    };

    const handleReset = () => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            setZoom(isFullPage ? 0.6 : 0.8);
            setTranslate({ x: width / 2, y: isFullPage ? height / 4 : 50 });
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
        const moveStep = 50; // pixels to move per key press
        
        const handleKeyDown = (e: KeyboardEvent) => {
            switch(e.key) {
                case 'ArrowUp':
                    setTranslate(prev => ({ ...prev, y: prev.y + moveStep }));
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    setTranslate(prev => ({ ...prev, y: prev.y - moveStep }));
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    setTranslate(prev => ({ ...prev, x: prev.x + moveStep }));
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    setTranslate(prev => ({ ...prev, x: prev.x - moveStep }));
                    e.preventDefault();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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
                    } shadow-lg min-w-[200px]`}>
                        <select
                            value={selectedRootMember || ''}
                            onChange={(e) => handleMemberSelect(e.target.value)}
                            className={`w-full p-2 rounded-md border ${
                                isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                    : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                            <option value="">All Trees (Oldest Member)</option>
                            {familyMembers
                                .sort((a, b) => a.first_name.localeCompare(b.first_name))
                                .map(member => (
                                    <option key={member.id} value={member.id}>
                                        {member.first_name} {member.last_name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    {/* Add arrow key controls info */}
                    <div className={`absolute bottom-4 left-4 z-10 p-2 rounded-lg ${
                        isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'
                    } shadow-lg`}>
                        <div className="flex items-center gap-2">
                            <span>Move with arrow keys</span>
                            <div className="flex gap-1">
                                <FaArrowUp className="text-sm" />
                                <FaArrowDown className="text-sm" />
                                <FaArrowLeft className="text-sm" />
                                <FaArrowRight className="text-sm" />
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
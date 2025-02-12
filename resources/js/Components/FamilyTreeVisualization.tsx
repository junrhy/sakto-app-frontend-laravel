import React, { useCallback, useState } from 'react';
import Tree from 'react-d3-tree';
import type { FamilyMember } from '@/types/family-tree';
import { FaSearch, FaSearchMinus, FaSearchPlus, FaRedo } from 'react-icons/fa';

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
    const containerRef = React.useRef<HTMLDivElement>(null);

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

        // Find root nodes (members without parents or oldest in their generation)
        const rootMembers = familyMembers.filter(member => 
            !member.relationships.some(rel => rel.relationship_type === 'child')
        );

        // If no root members found, take the oldest members based on birth date
        if (rootMembers.length === 0) {
            const sortedByAge = [...familyMembers].sort((a, b) => 
                new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime()
            );
            rootMembers.push(sortedByAge[0]);
        }

        const buildNode = (member: FamilyMember, processedIds = new Set<number>()): TreeNode => {
            if (processedIds.has(member.id)) {
                return {
                    name: `${member.first_name} ${member.last_name}`,
                    attributes: {
                        birth: new Date(member.birth_date).getFullYear().toString(),
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
                ...familyMembers
                    .filter(m => m.relationships.some(r => r.relationship_type === 'spouse' && r.to_member_id === member.id))
                    .map(m => ({ relationship_type: 'spouse' as const, to_member_id: m.id }))
            ];

            spouseRelationships.forEach(spouseRel => {
                const spouseMember = familyMembers.find(m => m.id === spouseRel.to_member_id);
                if (spouseMember && !processedIds.has(spouseMember.id)) {
                    children.push({
                        name: `${spouseMember.first_name} ${spouseMember.last_name}`,
                        attributes: {
                            birth: new Date(spouseMember.birth_date).getFullYear().toString(),
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
            const parentRelationships = [
                ...member.relationships.filter(rel => rel.relationship_type === 'parent'),
                ...familyMembers
                    .filter(m => m.relationships.some(r => r.relationship_type === 'child' && r.to_member_id === member.id))
                    .map(m => ({ relationship_type: 'parent' as const, to_member_id: m.id }))
            ];

            parentRelationships.forEach(rel => {
                const child = familyMembers.find(m => m.id === rel.to_member_id);
                if (child) allChildren.add(child);
            });

            // Children through spouse
            spouseRelationships.forEach(spouseRel => {
                const spouse = familyMembers.find(m => m.id === spouseRel.to_member_id);
                if (spouse) {
                    const spouseChildren = [
                        ...spouse.relationships.filter(rel => rel.relationship_type === 'parent'),
                        ...familyMembers
                            .filter(m => m.relationships.some(r => r.relationship_type === 'child' && r.to_member_id === spouse.id))
                            .map(m => ({ relationship_type: 'parent' as const, to_member_id: m.id }))
                    ];
                    
                    spouseChildren.forEach(rel => {
                        const child = familyMembers.find(m => m.id === rel.to_member_id);
                        if (child) allChildren.add(child);
                    });
                }
            });

            // Group children by their spouses
            const childrenBySpouse = new Map<number | null, FamilyMember[]>();
            allChildren.forEach(child => {
                const childSpouses = [
                    ...child.relationships.filter(rel => rel.relationship_type === 'spouse'),
                    ...familyMembers
                        .filter(m => m.relationships.some(r => r.relationship_type === 'spouse' && r.to_member_id === child.id))
                        .map(m => ({ relationship_type: 'spouse' as const, to_member_id: m.id }))
                ];
                
                const spouseId = childSpouses.length > 0 ? childSpouses[0].to_member_id : null;
                
                if (!childrenBySpouse.has(spouseId)) {
                    childrenBySpouse.set(spouseId, []);
                }
                childrenBySpouse.get(spouseId)?.push(child);
            });

            // Add each child group as a separate branch
            childrenBySpouse.forEach((childGroup) => {
                if (childGroup.length > 0) {
                    const familyBranch: TreeNode = {
                        name: "Family Branch",
                        attributes: {
                            isBranch: true,
                            isHidden: true
                        },
                        children: childGroup.map(child => buildNode(child, new Set(processedIds)))
                    };
                    children.push(familyBranch);
                }
            });

            return {
                name: `${member.first_name} ${member.last_name}`,
                attributes: {
                    birth: new Date(member.birth_date).getFullYear().toString(),
                    gender: member.gender
                },
                children: children.length > 0 ? children : undefined
            };
        };

        // Build trees starting from root members
        const trees = rootMembers.map(member => buildNode(member));

        // Handle any remaining unprocessed members
        const remainingMembers = familyMembers.filter(member => !globalProcessedIds.has(member.id));
        if (remainingMembers.length > 0) {
            // Sort remaining members by birth date
            remainingMembers.sort((a, b) => new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime());
            
            // Create additional trees for unconnected members
            const additionalTrees = remainingMembers.map(member => buildNode(member));
            trees.push(...additionalTrees);
        }

        return trees;
    }, [familyMembers]);

    const handleNodeClick = (nodeData: any) => {
        const memberName = nodeData.data.name;
        const member = familyMembers.find(
            m => `${m.first_name} ${m.last_name}` === memberName
        );
        if (member) {
            onNodeClick(member);
        }
    };

    const renderForeignObjectNode = ({
        nodeDatum,
        foreignObjectProps
    }: any) => {
        // Skip rendering for branch nodes but return an empty group to maintain structure
        if (nodeDatum.attributes?.isBranch) {
            return <g />;
        }

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
                            {nodeDatum.attributes?.relationship || `Born: ${nodeDatum.attributes?.birth}`}
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

    return (
        <div 
            ref={containerRef} 
            className={`relative ${isFullPage ? 'w-screen h-screen' : 'w-full h-full'} ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}
        >
            {/* Controls */}
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
            </div>

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
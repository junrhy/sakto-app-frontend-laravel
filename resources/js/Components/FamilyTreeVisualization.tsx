import React, { useCallback, useState } from 'react';
import Tree from 'react-d3-tree';
import type { FamilyMember } from '@/types/family-tree';
import { FaSearch, FaSearchMinus, FaSearchPlus, FaRedo } from 'react-icons/fa';

interface Props {
    familyMembers: FamilyMember[];
    onNodeClick: (member: FamilyMember) => void;
    isDarkMode?: boolean;
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

export default function FamilyTreeVisualization({ familyMembers, onNodeClick, isDarkMode = false }: Props) {
    const [zoom, setZoom] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            setDimensions({ width, height });
            setTranslate({ x: width / 2, y: 50 });
        }
    }, [containerRef]);

    const buildTreeData = useCallback((): TreeNode[] => {
        if (!familyMembers.length) return [];

        // Find root nodes (members without parents)
        const rootMembers = familyMembers.filter(member => 
            !member.relationships.some(rel => rel.relationship_type === 'child')
        );

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
            const children: TreeNode[] = [];

            // Add spouse if exists
            const spouseRelationship = member.relationships.find(rel => rel.relationship_type === 'spouse');
            if (spouseRelationship) {
                const spouseMember = familyMembers.find(m => m.id === spouseRelationship.to_member_id);
                if (spouseMember) {
                    children.push({
                        name: `${spouseMember.first_name} ${spouseMember.last_name}`,
                        attributes: {
                            birth: new Date(spouseMember.birth_date).getFullYear().toString(),
                            relationship: 'Spouse',
                            gender: spouseMember.gender
                        }
                    });
                }
            }

            // Group children by their spouses
            const childRelationships = member.relationships.filter(rel => rel.relationship_type === 'parent');
            const childrenBySpouse = new Map<number | null, FamilyMember[]>();

            childRelationships.forEach(rel => {
                const childMember = familyMembers.find(m => m.id === rel.to_member_id);
                if (childMember) {
                    const childSpouse = childMember.relationships.find(r => r.relationship_type === 'spouse');
                    const spouseId = childSpouse ? childSpouse.to_member_id : null;
                    
                    if (!childrenBySpouse.has(spouseId)) {
                        childrenBySpouse.set(spouseId, []);
                    }
                    childrenBySpouse.get(spouseId)?.push(childMember);
                }
            });

            // Add each child group as a separate branch
            childrenBySpouse.forEach((childGroup) => {
                if (childGroup.length > 0) {
                    // Create a branch node for this family group
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

        return rootMembers.map(member => buildNode(member));
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
                    r={8} 
                    fill={nodeDatum.attributes?.gender === 'male' 
                        ? (isDarkMode ? '#1d4ed8' : '#93c5fd')
                        : (isDarkMode ? '#db2777' : '#f9a8d4')
                    }
                    className="transition-colors duration-200"
                />
                <foreignObject {...foreignObjectProps}>
                    <div style={{ 
                        backgroundColor: isDarkMode ? '#1f2937' : 'white',
                        padding: '3px',
                        borderRadius: '4px',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        fontSize: '10px',
                        width: '90px',
                        textAlign: 'center',
                        boxShadow: isDarkMode 
                            ? '0 1px 2px rgba(0, 0, 0, 0.3)' 
                            : '0 1px 2px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s ease',
                        opacity: nodeDatum.attributes?.isReference ? 0.7 : 1
                    }}>
                        <div style={{ 
                            fontWeight: 'bold',
                            color: isDarkMode ? '#e5e7eb' : '#111827',
                            fontSize: '9px',
                            lineHeight: '11px',
                            maxHeight: '33px',
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
                            fontSize: '8px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: '10px',
                            marginTop: '1px'
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
            setZoom(0.8);
            setTranslate({ x: width / 2, y: 50 });
        }
    };

    // Add resize listener to handle window resizing
    React.useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
                setTranslate({ x: width / 2, y: 50 });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative w-full h-full flex flex-col" ref={containerRef}>
            {/* Controls */}
            <div className={`sticky top-4 right-4 z-10 flex gap-1 p-1 rounded-lg ml-auto mr-2 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
                <button
                    onClick={handleZoomIn}
                    className={`p-1 rounded-md hover:bg-opacity-80 transition-colors ${
                        isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title="Zoom In"
                >
                    <FaSearchPlus size={12} />
                </button>
                <button
                    onClick={handleZoomOut}
                    className={`p-1 rounded-md hover:bg-opacity-80 transition-colors ${
                        isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title="Zoom Out"
                >
                    <FaSearchMinus size={12} />
                </button>
                <button
                    onClick={handleReset}
                    className={`p-1 rounded-md hover:bg-opacity-80 transition-colors ${
                        isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title="Reset View"
                >
                    <FaRedo size={12} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
                <div className="h-[2000px] relative w-full min-w-[800px]">
                    {familyMembers.length > 0 ? (
                        <Tree
                            data={buildTreeData()[0]}
                            orientation="vertical"
                            pathFunc="step"
                            translate={translate}
                            nodeSize={{ x: 100, y: 90 }}
                            zoom={zoom}
                            onNodeClick={handleNodeClick}
                            separation={{ siblings: 0.8, nonSiblings: 1.2 }}
                            renderCustomNodeElement={(rd3tProps) =>
                                renderForeignObjectNode({
                                    ...rd3tProps,
                                    foreignObjectProps: {
                                        width: 90,
                                        height: 50,
                                        x: -45,
                                        y: -25,
                                    },
                                })
                            }
                            pathClassFunc={() => isDarkMode ? 'stroke-gray-600' : 'stroke-gray-300'}
                        />
                    ) : (
                        <div className={`h-full flex items-center justify-center ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                            No family members to display
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
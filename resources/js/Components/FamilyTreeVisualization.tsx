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
    attributes?: Record<string, string>;
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
            setTranslate({ x: width / 2, y: height / 8 });
        }
    }, [containerRef]);

    const buildTreeData = useCallback((): TreeNode[] => {
        if (!familyMembers.length) return [];

        // Find root nodes (members without parents)
        const rootMembers = familyMembers.filter(member => 
            !member.relationships.some(rel => rel.relationship_type === 'child')
        );

        const buildNode = (member: FamilyMember): TreeNode => {
            const children: TreeNode[] = [];

            // Add children
            const childRelationships = member.relationships.filter(rel => rel.relationship_type === 'parent');
            childRelationships.forEach(rel => {
                const childMember = familyMembers.find(m => m.id === rel.to_member_id);
                if (childMember) {
                    children.push(buildNode(childMember));
                }
            });

            // Add spouse if exists
            const spouseRelationship = member.relationships.find(rel => rel.relationship_type === 'spouse');
            if (spouseRelationship) {
                const spouseMember = familyMembers.find(m => m.id === spouseRelationship.to_member_id);
                if (spouseMember) {
                    children.unshift({
                        name: `${spouseMember.first_name} ${spouseMember.last_name}`,
                        attributes: {
                            birth: new Date(spouseMember.birth_date).getFullYear().toString(),
                            relationship: 'Spouse',
                            gender: spouseMember.gender
                        }
                    });
                }
            }

            return {
                name: `${member.first_name} ${member.last_name}`,
                attributes: {
                    birth: new Date(member.birth_date).getFullYear().toString(),
                    gender: member.gender
                },
                children: children.length > 0 ? children : undefined
            };
        };

        return rootMembers.map(buildNode);
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
    }: any) => (
        <g>
            <circle 
                r={15} 
                fill={nodeDatum.attributes?.gender === 'male' 
                    ? (isDarkMode ? '#1d4ed8' : '#93c5fd')
                    : (isDarkMode ? '#db2777' : '#f9a8d4')
                }
                className="transition-colors duration-200"
            />
            <foreignObject {...foreignObjectProps}>
                <div style={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : 'white',
                    padding: '5px',
                    borderRadius: '8px',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    fontSize: '12px',
                    width: '120px',
                    textAlign: 'center',
                    boxShadow: isDarkMode 
                        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease'
                }}>
                    <div style={{ 
                        fontWeight: 'bold',
                        color: isDarkMode ? '#e5e7eb' : '#111827'
                    }}>
                        {nodeDatum.name}
                    </div>
                    <div style={{ 
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        fontSize: '10px'
                    }}>
                        {nodeDatum.attributes?.relationship || `Born: ${nodeDatum.attributes?.birth}`}
                    </div>
                </div>
            </foreignObject>
        </g>
    );

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.2, 2));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.2, 0.4));
    };

    const handleReset = () => {
        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            setZoom(1);
            setTranslate({ x: width / 2, y: height / 8 });
        }
    };

    // Add resize listener to handle window resizing
    React.useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
                setTranslate({ x: width / 2, y: height / 8 });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative w-full h-full" ref={containerRef}>
            {/* Controls */}
            <div className={`absolute top-4 right-4 z-10 flex gap-2 p-2 rounded-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
                <button
                    onClick={handleZoomIn}
                    className={`p-2 rounded-md hover:bg-opacity-80 transition-colors ${
                        isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title="Zoom In"
                >
                    <FaSearchPlus />
                </button>
                <button
                    onClick={handleZoomOut}
                    className={`p-2 rounded-md hover:bg-opacity-80 transition-colors ${
                        isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title="Zoom Out"
                >
                    <FaSearchMinus />
                </button>
                <button
                    onClick={handleReset}
                    className={`p-2 rounded-md hover:bg-opacity-80 transition-colors ${
                        isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title="Reset View"
                >
                    <FaRedo />
                </button>
            </div>

            <div className="w-full h-full">
                {familyMembers.length > 0 ? (
                    <Tree
                        data={buildTreeData()[0]}
                        orientation="vertical"
                        pathFunc="step"
                        translate={translate}
                        nodeSize={{ x: 200, y: 100 }}
                        zoom={zoom}
                        onNodeClick={handleNodeClick}
                        separation={{ siblings: 1.5, nonSiblings: 2 }}
                        renderCustomNodeElement={(rd3tProps) =>
                            renderForeignObjectNode({
                                ...rd3tProps,
                                foreignObjectProps: {
                                    width: 160,
                                    height: 60,
                                    x: -80,
                                    y: -30,
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
    );
} 
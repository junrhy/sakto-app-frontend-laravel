import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { FamilyMember } from '@/types/genealogy';

// First, install d3 types:
// npm install --save-dev @types/d3

interface CircularFamilyTreeVisualizationProps {
    familyMembers: FamilyMember[];
    onNodeClick: (member: FamilyMember) => void;
    isDarkMode: boolean;
    isFullPage?: boolean;
    selectedRootId?: number | string;
    onBack?: () => void;
}

interface HierarchyNode {
    id: string | number;
    name: string;
    member: FamilyMember;
    children?: HierarchyNode[];
    hasChildren?: boolean;
    isSpouse?: boolean;
}

type ExtendedHierarchyNode = d3.HierarchyRectangularNode<HierarchyNode>;

export default function CircularFamilyTreeVisualization({
    familyMembers,
    onNodeClick,
    isDarkMode,
    isFullPage = false,
    selectedRootId,
    onBack,
}: CircularFamilyTreeVisualizationProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || familyMembers.length === 0) return;

        // Clear previous visualization
        d3.select(svgRef.current).selectAll('*').remove();

        // Find the oldest ancestor
        const oldestAncestor = familyMembers.reduce((oldest, current) => {
            if (!oldest.birth_date) return current;
            if (!current.birth_date) return oldest;
            return new Date(current.birth_date) < new Date(oldest.birth_date) ? current : oldest;
        });

        // Find root member (either selected or oldest)
        const rootMember = selectedRootId 
            ? familyMembers.find(m => m.id === selectedRootId) 
            : oldestAncestor;

        if (!rootMember) return;

        // Build hierarchy data (two levels: spouses and children)
        const buildHierarchy = (member: FamilyMember): HierarchyNode => {
            // Get spouses
            const spouses = familyMembers.filter(m => 
                m.relationships.some(r => 
                    r.relationship_type === 'spouse' && 
                    r.to_member_id === member.id
                )
            );

            // Get children
            const children = familyMembers
                .filter(m => 
                    m.relationships.some(r => 
                        r.relationship_type === 'child' && 
                        r.to_member_id === member.id
                    )
                )
                .sort((a, b) => {
                    if (!a.birth_date) return 1;
                    if (!b.birth_date) return -1;
                    return new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime();
                });

            // Combine spouses and children into segments
            const segments = [
                // Add spouses first
                ...spouses.map(spouse => ({
                    id: spouse.id,
                    name: `${spouse.first_name} ${spouse.last_name}`,
                    member: spouse,
                    isSpouse: true,
                    hasChildren: false
                })),
                // Then add children
                ...children.map(child => ({
                    id: child.id,
                    name: `${child.first_name} ${child.last_name}`,
                    member: child,
                    isSpouse: false,
                    hasChildren: familyMembers.some(m => 
                        m.relationships.some(r => 
                            r.relationship_type === 'child' && 
                            r.to_member_id === child.id
                        )
                    )
                }))
            ];

            return {
                id: member.id,
                name: `${member.first_name} ${member.last_name}`,
                member: member,
                children: segments
            };
        };

        const hierarchyData = buildHierarchy(rootMember);

        // Set up dimensions
        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;
        const radius = Math.min(width, height) / 2;

        // Create the base SVG
        const svg = d3.select(svgRef.current)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        // Create partition layout
        const partition = d3.partition<HierarchyNode>()
            .size([2 * Math.PI, radius * 0.8]); // Reduced radius for larger segments

        // Create root hierarchy
        const root = d3.hierarchy<HierarchyNode>(hierarchyData)
            .sum(() => 1);

        // Generate partition layout
        const nodes = partition(root).descendants();

        // Create arc generator
        const arc = d3.arc<ExtendedHierarchyNode>()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1 - 5); // Gap between rings

        // Create segments
        const path = svg.selectAll('path')
            .data(nodes)
            .join('path')
            .attr('d', arc)
            .attr('fill', d => {
                // Enhanced color scheme
                if (d.depth === 0) {
                    // Root node colors
                    return isDarkMode ? '#4F46E5' : '#6366F1';
                }
                if (d.data.isSpouse) {
                    // Spouse colors - warm colors
                    return isDarkMode ? '#FCA5A5' : '#EF4444';
                }
                if (d.data.member.gender === 'male') {
                    // Male colors - soft blues
                    return isDarkMode ? '#60A5FA' : '#3B82F6';
                }
                if (d.data.member.gender === 'female') {
                    // Female colors - soft purples
                    return isDarkMode ? '#C084FC' : '#A855F7';
                }
                // Default colors - soft grays
                return isDarkMode ? '#6B7280' : '#9CA3AF';
            })
            .attr('opacity', d => d.depth === 0 ? 0.9 : 0.8)
            .attr('stroke', isDarkMode ? '#1F2937' : '#FFFFFF')
            .attr('stroke-width', d => d.depth === 0 ? 2 : 1)
            .style('cursor', 'pointer')
            .on('click', (event: MouseEvent, d: ExtendedHierarchyNode) => onNodeClick(d.data.member));

        // Add text labels
        const text = svg.selectAll('text')
            .data(nodes)
            .join('text')
            .attr('transform', d => {
                // Special handling for root node (center circle)
                if (d.depth === 0) {
                    return 'translate(0,0)';
                }
                // Calculate position on the arc for other nodes
                const angle = (d.x0 + d.x1) / 2;
                const radius = (d.y0 + d.y1) / 2;
                return `translate(${radius * Math.sin(angle)},${-radius * Math.cos(angle)})`;
            })
            .attr('text-anchor', d => {
                // Center align for root node
                if (d.depth === 0) {
                    return 'middle';
                }
                // Dynamic alignment for other nodes
                const angle = (d.x0 + d.x1) / 2;
                if (angle < Math.PI * 0.25 || angle > Math.PI * 1.75) return 'start';
                if (angle >= Math.PI * 0.75 && angle <= Math.PI * 1.25) return 'end';
                return 'middle';
            })
            .attr('dy', d => d.depth === 0 ? '-0.5em' : '0.35em')  // Adjust vertical position for root
            .style('font-size', d => d.depth === 0 ? '14px' : '12px')  // Larger text for root
            .style('fill', isDarkMode ? '#E5E7EB' : '#1F2937')
            .style('pointer-events', 'none');

        // Add text in two lines, keeping it horizontal
        text.selectAll<SVGTSpanElement, ExtendedHierarchyNode>('tspan')
            .data(d => [d.data.member.first_name, d.data.member.last_name])
            .join('tspan')
            .attr('x', 0)
            .attr('dy', (_, i, nodes) => {
                const parentNode = d3.select<SVGElement, ExtendedHierarchyNode>(nodes[i].parentNode as SVGElement)
                    .datum();
                if (parentNode.depth === 0) {
                    return i === 0 ? '0em' : '1.2em';
                }
                return i === 0 ? '0em' : '1.1em';
            })
            .text(d => d)
            .attr('text-anchor', 'inherit');

        // Add child indicators
        svg.selectAll<SVGCircleElement, ExtendedHierarchyNode>('.indicator')
            .data(nodes.filter(d => d.depth === 1 && d.data.hasChildren))
            .join('circle')
            .attr('class', 'indicator')
            .attr('transform', d => {
                const x = (d.x0 + d.x1) / 2;
                const y = d.y1 - 15;
                return `rotate(${x * 180 / Math.PI - 90}) translate(${y},0)`;
            })
            .attr('r', 4)
            .attr('fill', isDarkMode ? '#34D399' : '#10B981'); // Softer green

        // Create tooltip
        const tooltip = d3.select('body')
            .append('div')
            .style('position', 'absolute')
            .style('background', isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)')
            .style('color', isDarkMode ? '#E5E7EB' : '#1F2937')
            .style('padding', '12px')
            .style('border-radius', '8px')
            .style('font-size', '12px')
            .style('box-shadow', isDarkMode 
                ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
                : '0 4px 6px rgba(0, 0, 0, 0.1)')
            .style('border', isDarkMode 
                ? '1px solid #374151' 
                : '1px solid #E5E7EB')
            .style('pointer-events', 'none')
            .style('opacity', 0);

        // Add hover effects
        path.on('mouseover', function(event: MouseEvent, d: ExtendedHierarchyNode) {
            d3.select(this)
                .attr('opacity', 1)
                .attr('stroke-width', 2);

            tooltip
                .style('opacity', 1)
                .html(`
                    ${d.data.name}<br>
                    ${d.data.isSpouse ? 'Spouse' : 'Child'}<br>
                    Birth: ${d.data.member.birth_date ? new Date(d.data.member.birth_date).getFullYear() : 'Unknown'}
                    ${d.data.member.death_date ? `<br>Death: ${new Date(d.data.member.death_date).getFullYear()}` : ''}
                    ${!d.data.isSpouse ? `<br>Children: ${d.children?.length || 0}` : ''}
                `);
        })
        .on('mousemove', (event: MouseEvent) => {
            tooltip
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .attr('opacity', 0.8)
                .attr('stroke-width', 1);
            tooltip.style('opacity', 0);
        });

        // Add back button if we're not viewing the oldest ancestor
        if (rootMember.id !== oldestAncestor.id && onBack) {
            // Create back button group at the top of the center circle
            const backButton = svg.append('g')
                .style('cursor', 'pointer')
                .on('click', onBack);

            // Add circle background
            backButton.append('circle')
                .attr('r', radius * 0.15)
                .attr('fill', isDarkMode ? '#374151' : '#F3F4F6')
                .attr('stroke', isDarkMode ? '#4B5563' : '#E5E7EB')
                .attr('stroke-width', 2);

            // Add back arrow at the top of the circle
            backButton.append('path')
                .attr('d', `M${-radius * 0.06},${-radius * 0.05} L${-radius * 0.02},${-radius * 0.09} L${-radius * 0.02},${-radius * 0.07} L${radius * 0.06},${-radius * 0.07} L${radius * 0.06},${-radius * 0.03} L${-radius * 0.02},${-radius * 0.03} L${-radius * 0.02},${-radius * 0.01} Z`)
                .attr('fill', isDarkMode ? '#E5E7EB' : '#4B5563');

            // Add selected member's name in the center
            backButton.append('text')
                .attr('y', radius * 0.02)  // Adjusted position since we removed the "Back" text
                .attr('text-anchor', 'middle')
                .attr('fill', isDarkMode ? '#E5E7EB' : '#374151')
                .style('font-size', '14px')
                .style('font-weight', 'bold')
                .text(rootMember.first_name);

            backButton.append('text')
                .attr('y', radius * 0.08)  // Adjusted position since we removed the "Back" text
                .attr('text-anchor', 'middle')
                .attr('fill', isDarkMode ? '#E5E7EB' : '#374151')
                .style('font-size', '14px')
                .style('font-weight', 'bold')
                .text(rootMember.last_name);

            // Add hover effect
            backButton
                .on('mouseover', function() {
                    d3.select(this).select('circle')
                        .attr('fill', isDarkMode ? '#4B5563' : '#E5E7EB')
                        .attr('stroke', isDarkMode ? '#6B7280' : '#D1D5DB');
                })
                .on('mouseout', function() {
                    d3.select(this).select('circle')
                        .attr('fill', isDarkMode ? '#374151' : '#F3F4F6')
                        .attr('stroke', isDarkMode ? '#4B5563' : '#E5E7EB');
                });
        }

        // Cleanup
        return () => {
            tooltip.remove();
        };

    }, [familyMembers, isDarkMode, selectedRootId, onBack, onNodeClick]);

    return (
        <svg
            ref={svgRef}
            className={`w-full ${isFullPage ? 'h-screen' : 'h-full'}`}
            style={{ minHeight: '500px' }}
        />
    );
}
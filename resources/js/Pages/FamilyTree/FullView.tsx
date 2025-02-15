import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import type { FamilyMember, FamilyTreeProps } from '@/types/family-tree';
import FamilyTreeVisualization from '@/Components/FamilyTreeVisualization';
import { FaMoon, FaSun, FaTimes } from 'react-icons/fa';

export default function FullView({ familyMembers }: FamilyTreeProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [hideControls, setHideControls] = useState(false);
    const [showScreenGrid, setShowScreenGrid] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hideControlsParam = params.get('hideControls');
        const showGridParam = params.get('showScreenGrid');
        setHideControls(hideControlsParam === 'true');
        setShowScreenGrid(showGridParam === 'true');
    }, []);

    const handleNodeClick = (member: FamilyMember) => {
        // Optional: Implement node click behavior for full view
        console.log('Node clicked:', member);
    };

    // Generate a 3x3 grid of screen sections
    const renderScreenGrid = () => {
        const gridSections = [];
        for (let i = 1; i <= 9; i++) {
            gridSections.push(
                <div
                    key={i}
                    className={`absolute w-1/3 h-1/3 border border-dashed ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-400'
                    } flex items-center justify-center`}
                    style={{
                        left: `${((i - 1) % 3) * 33.33}%`,
                        top: `${Math.floor((i - 1) / 3) * 33.33}%`,
                    }}
                >
                    <span
                        className={`text-4xl font-bold opacity-50 ${
                            isDarkMode ? 'text-gray-600' : 'text-gray-400'
                        }`}
                    >
                        {i}
                    </span>
                </div>
            );
        }
        return gridSections;
    };

    return (
        <>
            <Head title="Family Tree - Full View" />

            <div className="relative w-screen h-screen">
                <FamilyTreeVisualization 
                    familyMembers={familyMembers}
                    onNodeClick={handleNodeClick}
                    isDarkMode={isDarkMode}
                    isFullPage={true}
                />
                
                {showScreenGrid && (
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        {renderScreenGrid()}
                    </div>
                )}
            </div>
        </>
    );
} 
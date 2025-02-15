import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import type { FamilyMember, FamilyTreeProps } from '@/types/family-tree';
import FamilyTreeVisualization from '@/Components/FamilyTreeVisualization';
import { FaMoon, FaSun, FaTimes } from 'react-icons/fa';

export default function FullView({ familyMembers }: FamilyTreeProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [hideControls, setHideControls] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hideControlsParam = params.get('hideControls');
        setHideControls(hideControlsParam === 'true');
    }, []);

    const handleNodeClick = (member: FamilyMember) => {
        // Optional: Implement node click behavior for full view
        console.log('Node clicked:', member);
    };

    return (
        <>
            <Head title="Family Tree - Full View" />

            {!hideControls && (
                <div className={`fixed top-4 left-4 z-20 flex gap-2`}>
                    <a
                        href="/family-tree"
                        className={`p-2 rounded-lg transition-colors ${
                            isDarkMode 
                                ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' 
                                : 'bg-white hover:bg-gray-100 text-gray-700'
                        } shadow-lg`}
                    >
                        <FaTimes />
                    </a>
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2 rounded-lg transition-colors ${
                            isDarkMode 
                                ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' 
                                : 'bg-white hover:bg-gray-100 text-gray-700'
                        } shadow-lg`}
                    >
                        {isDarkMode ? <FaSun /> : <FaMoon />}
                    </button>
                </div>
            )}

            <FamilyTreeVisualization 
                familyMembers={familyMembers}
                onNodeClick={handleNodeClick}
                isDarkMode={isDarkMode}
                isFullPage={true}
            />
        </>
    );
} 
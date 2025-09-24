import CircularFamilyTreeVisualization from '@/Components/CircularFamilyTreeVisualization';
import type { FamilyMember, FamilyTreeProps } from '@/types/genealogy';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function CircularView({ familyMembers }: FamilyTreeProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [hideControls, setHideControls] = useState(false);
    const [showScreenGrid, setShowScreenGrid] = useState(false);
    const [selectedRoot, setSelectedRoot] = useState<
        number | string | undefined
    >(undefined);
    const [navigationHistory, setNavigationHistory] = useState<
        (number | string)[]
    >([]);

    // Find the oldest ancestor
    const oldestAncestor = familyMembers.reduce((oldest, current) => {
        if (!oldest.birth_date) return current;
        if (!current.birth_date) return oldest;
        return new Date(current.birth_date) < new Date(oldest.birth_date)
            ? current
            : oldest;
    });

    useEffect(() => {
        // Initialize with oldest ancestor
        setSelectedRoot(oldestAncestor.id);
    }, []);

    const handleNodeClick = (member: FamilyMember) => {
        if (member.id !== selectedRoot) {
            // Add current root to history before changing
            setNavigationHistory((prev) => [...prev, selectedRoot!]);
            setSelectedRoot(member.id);
        }
    };

    const handleBack = () => {
        if (navigationHistory.length > 0) {
            // Get the last root from history
            const previousRoot =
                navigationHistory[navigationHistory.length - 1];
            // Remove it from history
            setNavigationHistory((prev) => prev.slice(0, -1));
            // Set it as the current root
            setSelectedRoot(previousRoot);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hideControlsParam = params.get('hideControls');
        const showGridParam = params.get('showScreenGrid');
        setHideControls(hideControlsParam === 'true');
        setShowScreenGrid(showGridParam === 'true');
    }, []);

    // Generate a 3x3 grid of screen sections
    const renderScreenGrid = () => {
        const gridSections = [];
        for (let i = 1; i <= 9; i++) {
            gridSections.push(
                <div
                    key={i}
                    className={`absolute h-1/3 w-1/3 border border-dashed ${
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
                </div>,
            );
        }
        return gridSections;
    };

    return (
        <>
            <Head title="Family Tree - Circular View" />

            <div className="relative h-screen w-screen">
                <CircularFamilyTreeVisualization
                    familyMembers={familyMembers}
                    onNodeClick={handleNodeClick}
                    isDarkMode={isDarkMode}
                    selectedRootId={selectedRoot}
                    onBack={
                        navigationHistory.length > 0 ? handleBack : undefined
                    }
                />

                {showScreenGrid && (
                    <div className="pointer-events-none absolute inset-0 z-10">
                        {renderScreenGrid()}
                    </div>
                )}
            </div>
        </>
    );
}

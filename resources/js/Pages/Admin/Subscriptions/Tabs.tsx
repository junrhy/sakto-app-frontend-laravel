import React, { ReactNode } from 'react';

interface TabsProps {
    tabs: {
        id: string;
        label: string;
        icon?: ReactNode;
        count?: number;
    }[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`group inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        {tab.icon && (
                            <span
                                className={`mr-2 ${
                                    activeTab === tab.id
                                        ? 'text-blue-500 dark:text-blue-400'
                                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                                }`}
                            >
                                {tab.icon}
                            </span>
                        )}
                        {tab.label}
                        {tab.count !== undefined && (
                            <span
                                className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    activeTab === tab.id
                                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                }`}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
}


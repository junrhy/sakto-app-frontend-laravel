import { Card, CardContent } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Link } from '@inertiajs/react';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface Solution {
    name: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color: string;
    bgColor: string;
    comingSoon: boolean;
}

interface SolutionsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    solutions: Solution[];
    getUrlWithCurrency: (href: string) => string;
}

export default function SolutionsDialog({
    isOpen,
    onOpenChange,
    solutions,
    getUrlWithCurrency,
}: SolutionsDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                        Neulify
                    </DialogTitle>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                        Choose a solution to get started
                    </p>
                </DialogHeader>

                <div className="custom-scrollbar max-h-[60vh] overflow-y-auto pr-2">
                    <style>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 8px;
                        }
                        
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: rgb(243 244 246);
                            border-radius: 4px;
                        }
                        
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: rgb(209 213 219);
                            border-radius: 4px;
                        }
                        
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: rgb(156 163 175);
                        }
                        
                        .dark .custom-scrollbar::-webkit-scrollbar-track {
                            background: rgb(31 41 55);
                        }
                        
                        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: rgb(75 85 99);
                        }
                        
                        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: rgb(107 114 128);
                        }
                        
                        .custom-scrollbar {
                            scrollbar-width: thin;
                            scrollbar-color: rgb(209 213 219) rgb(243 244 246);
                        }
                        
                        .dark .custom-scrollbar {
                            scrollbar-color: rgb(75 85 99) rgb(31 41 55);
                        }
                    `}</style>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {solutions.map((solution) => {
                            const Icon = solution.icon;
                            const isDisabled = solution.comingSoon;

                            const cardContent = (
                                <Card
                                    className={`h-full border-2 transition-all duration-300 ${
                                        isDisabled
                                            ? 'cursor-not-allowed opacity-60'
                                            : 'hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg dark:hover:border-gray-600'
                                    }`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start space-x-4">
                                            {/* Icon */}
                                            <div
                                                className={`flex-shrink-0 rounded-xl p-3 ${solution.bgColor} transition-transform duration-300 ${
                                                    !isDisabled &&
                                                    'group-hover:scale-110'
                                                }`}
                                            >
                                                <Icon
                                                    className={`h-6 w-6 sm:h-8 sm:w-8 ${solution.color}`}
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                                                        {solution.name}
                                                    </h3>
                                                    {isDisabled ? (
                                                        <span className="flex-shrink-0 rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                            Coming Soon
                                                        </span>
                                                    ) : (
                                                        <ArrowRight className="h-5 w-5 flex-shrink-0 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                                    )}
                                                </div>
                                                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {solution.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );

                            return isDisabled ? (
                                <div key={solution.name}>{cardContent}</div>
                            ) : (
                                <Link
                                    key={solution.name}
                                    href={getUrlWithCurrency(solution.href)}
                                    className="group"
                                    onClick={() => onOpenChange(false)}
                                >
                                    {cardContent}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

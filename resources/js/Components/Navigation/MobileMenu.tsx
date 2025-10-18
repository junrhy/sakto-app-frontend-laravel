import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { getVisibleItems, menuCategories } from './MenuConfig';

interface MobileMenuProps {
    hasModuleAccess: (moduleId: string) => boolean;
    appParam: string | null;
    url: string;
}

export default function MobileMenu({
    hasModuleAccess,
    appParam,
    url,
}: MobileMenuProps) {
    return (
        <>
            {menuCategories.map((category) => {
                const visibleItems = getVisibleItems(
                    category,
                    hasModuleAccess,
                    appParam,
                    url,
                );
                if (visibleItems.length === 0) return null;

                return (
                    <div
                        key={category.id}
                        className="border-t border-gray-200/50 dark:border-white/10"
                    >
                        {/* Full-width Category Header */}
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-gray-700 dark:from-blue-500/20 dark:to-purple-500/20 dark:text-white/80">
                            {category.title}
                        </div>
                        
                        {/* Menu Items */}
                        <div className="space-y-2 px-4 py-3">
                            {visibleItems.map((item) => (
                                <ResponsiveNavLink
                                    key={item.id}
                                    href={item.href}
                                    className="flex justify-center rounded-xl bg-white/60 py-3 font-medium text-gray-800 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:shadow-md dark:bg-white/5 dark:text-white/90 dark:hover:from-blue-600 dark:hover:to-purple-700"
                                >
                                    {item.title}
                                </ResponsiveNavLink>
                            ))}
                        </div>
                    </div>
                );
            })}
        </>
    );
}

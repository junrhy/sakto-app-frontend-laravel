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
                        className="border-t border-gray-200 dark:border-white/10"
                    >
                        <div className="px-4 py-2">
                            <div className="text-base font-medium text-gray-800 dark:text-white/90">
                                {category.title}
                            </div>
                            {visibleItems.map((item) => (
                                <ResponsiveNavLink
                                    key={item.id}
                                    href={item.href}
                                    className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
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

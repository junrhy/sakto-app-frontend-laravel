import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import {
    getVisibleItems,
    GroupedMenuItem,
    groupMenuItems,
    menuCategories,
} from './MenuConfig';

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

                const { mainItems } = groupMenuItems(visibleItems);

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
                            {mainItems.map((item: GroupedMenuItem) => (
                                <div key={item.id} className="space-y-1">
                                    <ResponsiveNavLink
                                        href={item.href}
                                        className="flex justify-center rounded-xl bg-white/60 py-3 font-medium text-gray-800 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:shadow-md dark:bg-white/5 dark:text-white/90 dark:hover:from-blue-600 dark:hover:to-purple-700"
                                    >
                                        {item.title}
                                    </ResponsiveNavLink>
                                    {item.submenuItems &&
                                        item.submenuItems.length > 0 && (
                                            <div className="ml-4 space-y-1 border-l-2 border-gray-300 pl-3 dark:border-gray-600">
                                                {item.submenuItems.map(
                                                    (submenu) => (
                                                        <ResponsiveNavLink
                                                            key={submenu.id}
                                                            href={submenu.href}
                                                            className="dark:bg-white/3 flex justify-center rounded-lg bg-white/40 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-500 hover:text-white hover:shadow-md dark:text-white/70 dark:hover:from-blue-500 dark:hover:to-purple-600"
                                                        >
                                                            {submenu.title}
                                                        </ResponsiveNavLink>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </>
    );
}

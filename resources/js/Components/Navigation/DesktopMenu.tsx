import Dropdown from '@/Components/Dropdown';
import { getVisibleItems, groupMenuItems, menuCategories, GroupedMenuItem } from './MenuConfig';

interface DesktopMenuProps {
    hasModuleAccess: (moduleId: string) => boolean;
    appParam: string | null;
    url: string;
}

export default function DesktopMenu({
    hasModuleAccess,
    appParam,
    url,
}: DesktopMenuProps) {
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
                    <div key={category.id} className="inline-flex items-center">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-700 transition-all duration-200 ease-in-out hover:text-gray-900 focus:outline-none dark:text-gray-800 dark:text-white/90 dark:hover:text-white"
                                    >
                                        <span className="mt-[1px]">
                                            {category.title}
                                        </span>
                                        <svg
                                            className="-mr-0.5 ml-2 h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </span>
                            </Dropdown.Trigger>

                            <Dropdown.Content contentClasses="bg-white dark:bg-gray-900">
                                <div className="min-w-[240px] rounded-md border border-gray-100 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                                    {mainItems.map((item: GroupedMenuItem) => {
                                        const hasSubmenu =
                                            item.submenuItems &&
                                            item.submenuItems.length > 0;

                                        return (
                                            <div
                                                key={item.id}
                                                className="group relative"
                                            >
                                                <Dropdown.Link
                                                    href={item.href}
                                                    className={`flex items-center justify-between gap-3 font-medium ${
                                                        hasSubmenu
                                                            ? 'pr-8'
                                                            : ''
                                                    }`}
                                                >
                                                    <span>{item.title}</span>
                                                    {hasSubmenu && (
                                                        <svg
                                                            className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth="1.5"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                                            />
                                                        </svg>
                                                    )}
                                                </Dropdown.Link>

                                                {hasSubmenu && (
                                                    <div
                                                        className="pointer-events-none absolute top-0 left-full hidden min-w-[220px] translate-x-2 rounded-md border border-gray-100 bg-white py-2 shadow-lg transition-all duration-150 ease-out group-hover:block group-focus-within:block dark:border-gray-700 dark:bg-gray-900"
                                                    >
                                                        <div className="pointer-events-auto">
                                                            {item.submenuItems?.map((submenu) => (
                                                                <Dropdown.Link
                                                                    key={submenu.id}
                                                                    href={submenu.href}
                                                                    className="pl-4 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                                                                >
                                                                    {submenu.title}
                                                                </Dropdown.Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                );
            })}
        </>
    );
}

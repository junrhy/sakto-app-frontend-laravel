import Dropdown from '@/Components/Dropdown';
import { menuCategories, getVisibleItems } from './MenuConfig';

interface DesktopMenuProps {
    hasModuleAccess: (moduleId: string) => boolean;
    appParam: string | null;
    url: string;
}

export default function DesktopMenu({ hasModuleAccess, appParam, url }: DesktopMenuProps) {
    return (
        <>
            {menuCategories.map((category) => {
                const visibleItems = getVisibleItems(category, hasModuleAccess, appParam, url);
                if (visibleItems.length === 0) return null;

                return (
                    <div key={category.id} className="inline-flex items-center">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-700 dark:text-gray-800 dark:text-white/90 transition-all duration-200 ease-in-out hover:text-gray-900 dark:hover:text-white focus:outline-none"
                                    >
                                        <span className="mt-[1px]">{category.title}</span>
                                        <svg
                                            className="ml-2 -mr-0.5 h-4 w-4"
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

                            <Dropdown.Content>
                                {visibleItems.map((item) => (
                                    <Dropdown.Link key={item.id} href={item.href}>
                                        {item.title}
                                    </Dropdown.Link>
                                ))}
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                );
            })}
        </>
    );
}

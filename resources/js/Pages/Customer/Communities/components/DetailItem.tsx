interface DetailItemProps {
    label: string;
    value: string;
    iconPath: string;
    secondaryPath?: string;
}

export function DetailItem({
    label,
    value,
    iconPath,
    secondaryPath,
}: DetailItemProps) {
    return (
        <div className="flex items-center gap-3">
            <svg
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={iconPath}
                />
                {secondaryPath && (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={secondaryPath}
                    />
                )}
            </svg>
            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {label}
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                    {value}
                </p>
            </div>
        </div>
    );
}

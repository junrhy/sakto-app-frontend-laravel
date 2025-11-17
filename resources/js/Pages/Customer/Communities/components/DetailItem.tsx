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
        <div className="flex items-start gap-3">
            <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400"
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
            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-pink-600 dark:text-pink-300">
                    {label}
                </p>
                <p className="break-words break-all text-sm text-gray-900 dark:text-gray-100">
                    {value}
                </p>
            </div>
        </div>
    );
}

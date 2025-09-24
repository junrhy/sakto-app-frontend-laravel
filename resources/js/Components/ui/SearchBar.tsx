interface SearchBarProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function SearchBar({
    placeholder = 'Search...',
    value,
    onChange,
    className = '',
    size = 'md',
}: SearchBarProps) {
    const sizeClasses = {
        sm: 'pl-8 pr-3 py-1.5 text-sm',
        md: 'pl-10 pr-4 py-2',
        lg: 'pl-12 pr-6 py-3 text-lg',
    };

    const iconSizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    return (
        <div className={`relative w-full ${className}`}>
            <div
                className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3`}
            >
                <svg
                    className={`${iconSizes[size]} text-gray-400`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>
            <input
                type="text"
                placeholder={placeholder}
                className={`w-full ${sizeClasses[size]} rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

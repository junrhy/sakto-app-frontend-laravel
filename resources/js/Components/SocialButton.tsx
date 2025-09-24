import { ButtonHTMLAttributes } from 'react';

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    provider: string;
    icon?: string;
}

export default function SocialButton({
    provider,
    icon,
    className = '',
    children,
    ...props
}: SocialButtonProps) {
    return (
        <button
            {...props}
            className={`flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 ${className}`}
        >
            {icon && (
                <img
                    src={icon}
                    alt={`${provider} icon`}
                    className="mr-2 h-5 w-5"
                />
            )}
            {children}
        </button>
    );
}

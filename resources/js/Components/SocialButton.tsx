import { ButtonHTMLAttributes } from 'react';

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    provider: string;
    icon?: string;
}

export default function SocialButton({ provider, icon, className = '', children, ...props }: SocialButtonProps) {
    return (
        <button
            {...props}
            className={`flex items-center justify-center w-full px-4 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 ${className}`}
        >
            {icon && <img src={icon} alt={`${provider} icon`} className="w-5 h-5 mr-2" />}
            {children}
        </button>
    );
} 
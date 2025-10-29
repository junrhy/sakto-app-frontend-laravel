import { ImgHTMLAttributes, SVGProps } from 'react';

export default function ApplicationLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
    // Extract sizing classes from props or use defaults
    const sizeClasses = props.className?.match(/h-\d+|sm:h-\d+|md:h-\d+|lg:h-\d+/g)?.join(' ') || 'h-6 sm:h-5 md:h-7';
    const otherClasses = props.className?.replace(/h-\d+|sm:h-\d+|md:h-\d+|lg:h-\d+/g, '').trim() || '';
    
    return (
        <span className={`relative inline-block ${sizeClasses}`}>
            <img 
                src="/images/neulify-logo-big.png" 
                className={`absolute left-0 top-0 h-full w-auto dark:opacity-0 ${otherClasses}`}
                alt="Neulify" 
            />
            <img 
                src="/images/neulify-logo-big-white.png" 
                className={`h-full w-auto opacity-0 dark:opacity-100 ${otherClasses}`}
                alt="Neulify" 
            />
        </span>
    );
}

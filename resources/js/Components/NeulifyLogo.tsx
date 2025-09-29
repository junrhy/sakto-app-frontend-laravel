import { ImgHTMLAttributes } from 'react';

export default function NeulifyLogo(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    return (
        <div className={`${props.className} flex items-center space-x-3`}>
            <img
                src="/images/neulify-logo.png"
                alt="Neulify"
                className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-gray-800 dark:text-white">
                Neulify
            </span>
        </div>
    );
}

import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { ThemeProvider } from '@/Components/ThemeProvider';
import type { User } from '@/types/index';
import { PageProps } from '@/types';

interface InertiaUser extends User {
    theme?: 'light' | 'dark' | 'system';
}

interface InertiaProps {
    initialPage: {
        props: {
            auth: {
                user: {
                    theme?: 'light' | 'dark' | 'system';
                };
            };
        };
    };
}

const appName = 'Sakto Solutions'; // Default fallback

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }: { el: HTMLElement; App: any; props: InertiaProps }) {
        const resolvedAppName = import.meta.env.VITE_APP_NAME || 
                              import.meta.env.APP_NAME || 
                              appName;
        const userTheme = props.initialPage.props.auth?.user?.theme || 'system';
        const app = (
            <ThemeProvider defaultTheme={userTheme} storageKey="sakto-theme">
                <App {...props} />
            </ThemeProvider>
        );

        if (import.meta.env.SSR) {
            hydrateRoot(el, app);
            return;
        }

        createRoot(el).render(app);
    },
    progress: {
        color: '#4B5563',
    },
});

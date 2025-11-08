import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { AxiosInstance } from 'axios';
import { route as ziggyRoute } from 'ziggy-js';
import { PageProps as AppPageProps } from './';
import { User } from './index';

declare global {
    interface Window {
        axios: AxiosInstance;
    }

    /* eslint-disable no-var */
    var route: typeof ziggyRoute;
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps {
        auth: {
            user: User & {
                identifier: string;
                app_currency: {
                    symbol: string;
                };
                credits: number;
                is_admin: boolean;
                project_identifier: string;
                theme: 'light' | 'dark' | 'system';
                theme_color: string;
                slug?: string | null;
            };
        };
    }
}

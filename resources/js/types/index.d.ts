import { Config } from 'ziggy-js';

export interface ProjectModule {
    id: number;
    name: string;
    identifier: string;
}

export interface Project {
    id: number;
    name: string;
    modules: ProjectModule[];
}

export interface User {
    name: string;
    email: string;
    project?: {
        modules?: Array<{
            identifier: string;
        }>;
    };
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    ziggy: Config & { location: string };
};

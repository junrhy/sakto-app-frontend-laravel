export interface Project {
    id: number;
    name: string;
    identifier: string;
    enabledModules: string[];
    description: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    users_count: number;
}

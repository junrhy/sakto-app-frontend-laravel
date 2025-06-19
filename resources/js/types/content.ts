export interface Content {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    status: 'draft' | 'published' | 'archived';
    type: 'article' | 'page' | 'post';
    featured_image?: string;
    meta_title?: string;
    meta_description?: string;
    tags?: string[];
    categories?: string[];
    author_id: number;
    author?: string;
    scheduled_at?: string;
    created_at: string;
    updated_at: string;
}

export interface ContentSettings {
    default_status: 'draft' | 'published' | 'archived';
    default_type: 'article' | 'page' | 'post';
    allowed_types: string[];
    allowed_statuses: string[];
    max_featured_image_size: number;
    allowed_image_types: string[];
    default_meta_title_template: string;
    default_meta_description_template: string;
    enable_scheduling: boolean;
    enable_preview: boolean;
    enable_bulk_operations: boolean;
}

export interface ContentFilters {
    status?: string;
    type?: string;
    search?: string;
    author_id?: number;
    category?: string;
    tag?: string;
    date_from?: string;
    date_to?: string;
} 
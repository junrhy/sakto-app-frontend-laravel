export interface Page {
    id: number;
    title: string;
    slug: string;
    content: string;
    meta_description?: string;
    meta_keywords?: string;
    is_published: boolean;
    template?: string;
    custom_css?: string;
    custom_js?: string;
    featured_image?: string;
    created_at: string;
    updated_at: string;
}

export interface PageFormData {
    title: string;
    slug: string;
    content: string;
    meta_description?: string;
    meta_keywords?: string;
    is_published: boolean;
    template?: string;
    custom_css?: string;
    custom_js?: string;
    featured_image?: File | null;
}

export interface PageSettings {
    default_template?: string;
    allow_custom_css: boolean;
    allow_custom_js: boolean;
    max_image_size: number;
    allowed_image_types: string[];
}

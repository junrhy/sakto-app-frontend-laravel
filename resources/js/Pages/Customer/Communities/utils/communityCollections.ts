import { CommunityCollectionItem } from '../types';

export function normalizeCollection(
    items: CommunityCollectionItem | CommunityCollectionItem[] | null | undefined,
): CommunityCollectionItem[] {
    if (!items) {
        return [];
    }

    if (Array.isArray(items)) {
        return items;
    }

    return [];
}

export function getItemTitle(item: CommunityCollectionItem): string {
    if (typeof item.title === 'string' && item.title.trim().length) {
        return item.title;
    }

    if (typeof item.name === 'string' && item.name.trim().length) {
        return item.name;
    }

    if (typeof item.slug === 'string') {
        return item.slug;
    }

    return 'Untitled';
}

export function getItemDescription(item: CommunityCollectionItem): string | undefined {
    const possibleKeys = ['description', 'summary', 'short_description', 'details', 'content'];

    for (const key of possibleKeys) {
        const value = item[key];
        if (typeof value === 'string' && value.trim().length) {
            return value;
        }
    }

    return undefined;
}

export function coerceToString(value: unknown): string | null {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
        return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    return null;
}

export function formatDate(value: unknown): string {
    if (!value) {
        return '—';
    }

    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString();
}

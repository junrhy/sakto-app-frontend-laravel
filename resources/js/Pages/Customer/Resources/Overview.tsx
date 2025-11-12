import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { Link, Head } from '@inertiajs/react';
import type { PageProps } from '@/types';
import {
    CommunityCollectionItem,
    CommunityCurrency,
} from '../Communities/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';

interface ResourcesOverviewSectionProps {
    id?: string;
    resources: CommunityCollectionItem[];
    projectIdentifier?: string;
    ownerIdentifier?: string | number;
    emptyMessage?: string;
}

type OwnerSummary = {
    id: number | string;
    name?: string | null;
    slug?: string | null;
    identifier?: string | null;
    project_identifier?: string | null;
};

export interface ResourcesOverviewPageProps extends PageProps {
    project: string;
    owner: OwnerSummary;
    resources: CommunityCollectionItem[];
    backUrl?: string;
    error?: string | null;
}

const toString = (value: unknown, fallback = ''): string => {
    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    return fallback;
};

export function ResourcesOverviewSection({
    id = 'resources-overview',
    resources,
    projectIdentifier,
    ownerIdentifier,
    emptyMessage = 'No resources available yet.',
}: ResourcesOverviewSectionProps) {
    const publishedResources = Array.isArray(resources)
        ? resources.filter((resource) => Boolean(resource.is_published ?? resource.published ?? true))
        : [];

    const hasProjectContext =
        projectIdentifier !== undefined &&
        projectIdentifier !== null &&
        ownerIdentifier !== undefined &&
        ownerIdentifier !== null;

    const resourceBaseUrl = hasProjectContext
        ? route('customer.projects.resources.overview', {
              project: projectIdentifier,
              owner: ownerIdentifier,
          })
        : undefined;

    return (
        <section id={id} className="space-y-4">
            <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Resources
                    </CardTitle>
                    <CardDescription>
                        Helpful guides, documents, and announcements curated by this partner.
                    </CardDescription>
                </CardHeader>
                {publishedResources.length === 0 ? (
                    <CardContent className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-8 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-400">
                        <svg
                            className="h-12 w-12 text-gray-300 dark:text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {emptyMessage}
                        </p>
                        <p className="text-sm">
                            The partner has not published any resources yet.
                        </p>
                    </CardContent>
                ) : (
                    <CardContent className="space-y-4">
                        {publishedResources.map((resource, index) => {
                            const idValue = resource.id ?? resource.slug ?? index;
                            const title = toString(resource.title ?? resource.name, 'Untitled Resource');
                            const description = toString(resource.meta_description ?? resource.description, '');
                            const featuredImage = toString(resource.featured_image ?? resource.image_url ?? '');
                            const updatedAt = toString(resource.updated_at ?? resource.created_at ?? '');
                            const externalUrl = toString(resource.url, '');
                            const slug = toString(resource.slug, '');

                            const resourceUrl =
                                externalUrl ||
                                (hasProjectContext ? route('customer.projects.resources.overview', {
                                    project: projectIdentifier,
                                    owner: ownerIdentifier,
                                }) : '#');

                            const isExternal = Boolean(externalUrl);

                            return (
                                <div
                                    key={`resource-${idValue}`}
                                    className="flex flex-col gap-4 rounded-lg border border-gray-200/80 bg-white/80 p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-600/70 dark:bg-gray-800/50 dark:shadow-gray-900/40"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row">
                                        {featuredImage && (
                                            <div className="overflow-hidden rounded-lg md:w-40">
                                                <img
                                                    src={featuredImage}
                                                    alt={title}
                                                    className="h-28 w-full object-cover md:h-full"
                                                    onError={(event) => {
                                                        const target = event.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {title}
                                                </h3>
                                                {description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {description}
                                                    </p>
                                                )}
                                            </div>
                                            {updatedAt && (
                                                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                    Updated{' '}
                                                    {formatDateTimeForDisplay(updatedAt, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                            )}
                                            <div className="flex justify-end">
                                                <a
                                                    href={resourceUrl}
                                                    target={isExternal ? '_blank' : undefined}
                                                    rel={isExternal ? 'noopener noreferrer' : undefined}
                                                    className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                                >
                                                    <svg
                                                        className="mr-2 h-4 w-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                        />
                                                    </svg>
                                                    View Resource
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {resourceBaseUrl && (
                            <div className="flex justify-end">
                                <Link
                                    href={resourceBaseUrl}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
                                >
                                    View all resources
                                </Link>
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>
        </section>
    );
}

export default function ResourcesOverviewPage({
    auth,
    project,
    owner,
    resources,
    backUrl,
    error,
}: ResourcesOverviewPageProps) {
    const ownerName = owner?.name ?? 'Resources Partner';
    const ownerIdentifier =
        owner.slug ?? owner.identifier ?? String(owner.id);

    return (
        <CustomerLayout
            auth={auth}
            title={`Resources – ${ownerName}`}
            header={
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Resources
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Helpful guides and documents from {ownerName}.
                        </p>
                    </div>
                    <Link
                        href={backUrl ?? route('customer.dashboard')}
                        className="inline-flex items-center justify-center rounded-md border border-indigo-500 px-3 py-1 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-400/10"
                    >
                        ← Back
                    </Link>
                </div>
            }
        >
            <Head title={`Resources – ${ownerName}`} />

            <div className="space-y-6">
                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700/70 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Partner Details
                        </CardTitle>
                        <CardDescription>
                            Project: <span className="font-semibold">{project}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Partner
                            </p>
                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {ownerName}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Identifier
                            </p>
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                                {ownerIdentifier}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <ResourcesOverviewSection
                    resources={resources}
                    projectIdentifier={project}
                    ownerIdentifier={ownerIdentifier}
                />
            </div>
        </CustomerLayout>
    );
}



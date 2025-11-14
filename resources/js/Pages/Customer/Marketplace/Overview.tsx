import { Button } from '@/Components/ui/button';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { buildOwnerSidebarSections } from '@/Pages/Customer/Communities/utils/ownerSidebarSections';
import type { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import {
    CommunityCollectionItem,
    CommunityCurrency,
} from '../Communities/types';
import ProductsSection from './components/ProductsSection';

type OwnerSummary = {
    id: number | string;
    name?: string | null;
    slug?: string | null;
    identifier?: string | null;
    project_identifier?: string | null;
};

type AuthUserLite = {
    id?: number;
    identifier?: string | null;
};

export interface MarketplaceOverviewSectionProps {
    id?: string;
    projectIdentifier?: string;
    ownerIdentifier?: string | number;
    products: CommunityCollectionItem[];
    orderHistory: CommunityCollectionItem[];
    appCurrency?: CommunityCurrency | null;
    authUser?: AuthUserLite | null;
}

export interface MarketplaceOverviewPageProps extends PageProps {
    project: string;
    owner: OwnerSummary;
    products: CommunityCollectionItem[];
    orderHistory: CommunityCollectionItem[];
    appCurrency?: CommunityCurrency | null;
    authUser?: AuthUserLite | null;
    backUrl?: string;
    error?: string | null;
}

export function MarketplaceOverviewSection({
    id = 'marketplace-overview',
    projectIdentifier,
    ownerIdentifier,
    products,
    orderHistory,
    appCurrency,
    authUser,
}: MarketplaceOverviewSectionProps) {
    const resolvedProject = projectIdentifier ?? 'community';
    const resolvedOwner = ownerIdentifier ?? 'community';

    return (
        <section id={id} className="space-y-6">
            <ProductsSection
                products={products}
                orderHistory={orderHistory}
                appCurrency={appCurrency}
                projectIdentifier={resolvedProject}
                ownerIdentifier={resolvedOwner}
                authUser={authUser}
            />
        </section>
    );
}

export default function MarketplaceOverviewPage({
    auth,
    project,
    owner,
    products,
    orderHistory,
    appCurrency,
    authUser,
    backUrl,
    error,
}: MarketplaceOverviewPageProps) {
    const ownerName = owner?.name ?? 'Marketplace Partner';
    const ownerIdentifier = owner.slug ?? owner.identifier ?? String(owner.id);
    const projectIdentifier = project ?? 'community';
    const sidebarSections = useMemo(
        () =>
            buildOwnerSidebarSections(
                projectIdentifier,
                ownerIdentifier,
                'marketplace',
            ),
        [projectIdentifier, ownerIdentifier],
    );

    return (
        <CustomerLayout
            auth={auth}
            title={`Marketplace – ${ownerName}`}
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3 sm:block">
                            <h2 className="text-lg font-semibold leading-tight text-gray-800 dark:text-gray-200 sm:text-xl">
                                Marketplace
                            </h2>
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="shrink-0 sm:hidden"
                            >
                                <Link href={backUrl ?? route('customer.dashboard')}>
                                    ← Back
                                </Link>
                            </Button>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                            Browse products from {ownerName}
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="hidden shrink-0 sm:inline-flex"
                    >
                        <Link href={backUrl ?? route('customer.dashboard')}>
                            ← Back
                        </Link>
                    </Button>
                </div>
            }
            sidebarSections={sidebarSections}
            sidebarSectionTitle={ownerName}
        >
            <Head title={`Marketplace – ${ownerName}`} />

            <div className="space-y-6">
                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700/70 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                <ProductsSection
                    products={products}
                    orderHistory={orderHistory}
                    appCurrency={appCurrency}
                    projectIdentifier={project}
                    ownerIdentifier={ownerIdentifier}
                    authUser={authUser}
                />
            </div>
        </CustomerLayout>
    );
}

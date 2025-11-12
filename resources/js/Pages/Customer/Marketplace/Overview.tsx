import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import type { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
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

    return (
        <CustomerLayout
            auth={auth}
            title={`Marketplace Overview – ${ownerName}`}
            header={
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Marketplace Overview
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Quick snapshot of marketplace activity for{' '}
                            {ownerName}.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={backUrl ?? route('customer.dashboard')}>
                            ← Back
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title={`Marketplace Overview – ${ownerName}`} />

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
                            Project:{' '}
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {project}
                            </span>
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

                <MarketplaceOverviewSection
                    id="marketplace-overview"
                    projectIdentifier={project}
                    ownerIdentifier={ownerIdentifier}
                    products={products}
                    orderHistory={orderHistory}
                    appCurrency={appCurrency}
                    authUser={authUser}
                />
            </div>
        </CustomerLayout>
    );
}

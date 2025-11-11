import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

interface ProductSummary {
    id: number | string;
    name: string;
    price?: number | string | null;
    description?: string | null;
}

interface Props extends PageProps {
    community: {
        id: number;
        name: string;
        slug?: string | null;
        identifier?: string | null;
    };
    products: ProductSummary[];
    project: string;
}

export default function MarketplaceCheckout({
    auth,
    community,
    products,
    project,
}: Props) {
    const ownerIdentifier =
        community.slug || community.identifier || community.id;

    return (
        <CustomerLayout
            auth={auth}
            title="Marketplace Checkout"
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Marketplace Checkout
                    </h2>
                    <Button asChild variant="outline">
                        <Link
                            href={route('customer.projects.marketplace.index', {
                                project,
                                owner: ownerIdentifier,
                            })}
                        >
                            Back to Marketplace
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title={`Checkout • ${community.name}`} />

            <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Coming Soon
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        A guided checkout experience will be available in a future update.
                        For now, you can manage your cart and purchases directly from the marketplace listings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        You currently have {products.length} published product
                        {products.length === 1 ? '' : 's'} available for purchase.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {products.slice(0, 6).map((product) => (
                            <Card
                                key={product.id}
                                className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                            >
                                <CardHeader>
                                    <CardTitle className="text-base text-gray-900 dark:text-gray-100">
                                        {product.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                        {product.description ?? 'No description provided.'}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </CustomerLayout>
    );
}

import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home, Package } from 'lucide-react';

interface OrderNotFoundProps {
    domain: string;
    orderNumber: string;
}

export default function OrderNotFound({
    domain,
    orderNumber,
}: OrderNotFoundProps) {
    return (
        <>
            <Head title="Order Not Found" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <Card className="mx-auto max-w-md text-center">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                <Package className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                Order Not Found
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-400">
                                Order <strong>#{orderNumber}</strong> could not
                                be found.
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                This could be because:
                            </p>
                            <ul className="space-y-1 text-left text-sm text-gray-500 dark:text-gray-500">
                                <li>• The order number is incorrect</li>
                                <li>
                                    • The order belongs to a different store
                                </li>
                                <li>• The order has been removed</li>
                            </ul>

                            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                <Button
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="flex-1"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Go Back
                                </Button>
                                <Link
                                    href={`/fnb/store/${domain}`}
                                    className="flex-1"
                                >
                                    <Button className="w-full">
                                        <Home className="mr-2 h-4 w-4" />
                                        Back to Store
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

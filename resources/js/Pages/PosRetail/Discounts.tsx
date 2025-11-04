import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DiscountDialog from './components/DiscountDialog';

interface Discount {
    id: number;
    name: string;
    description?: string;
    type: 'percentage' | 'fixed' | 'buy_x_get_y';
    value: number;
    min_quantity?: number;
    buy_quantity?: number;
    get_quantity?: number;
    min_purchase_amount?: number;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
    applicable_items?: number[];
    applicable_categories?: number[];
    usage_limit?: number;
    usage_count?: number;
}

interface AuthWithTeamMember {
    user: PageProps['auth']['user'];
    selectedTeamMember?: {
        identifier: string;
        first_name: string;
        last_name: string;
        full_name: string;
        email: string;
        roles: string[];
        allowed_apps: string[];
        profile_picture?: string;
    };
    project?: {
        id: number;
        name: string;
        identifier: string;
    };
    modules?: string[];
}

interface Props extends PageProps {
    discounts?: Discount[] | null;
    categories?: Array<{ id: number; name: string }> | null;
    items?: Array<{ id: number; name: string }> | null;
}

export default function Discounts({
    discounts: initialDiscounts,
    categories: initialCategories,
    items: initialItems,
    auth,
}: Props & { auth: AuthWithTeamMember }) {
    const [discounts, setDiscounts] = useState<Discount[]>(
        initialDiscounts || [],
    );
    const [categories] = useState<Array<{ id: number; name: string }>>(
        initialCategories || [],
    );
    const [items] = useState<Array<{ id: number; name: string }>>(
        initialItems || [],
    );
    const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
        null,
    );

    useEffect(() => {
        setDiscounts(initialDiscounts || []);
    }, [initialDiscounts]);

    const handleEdit = (discount: Discount) => {
        setSelectedDiscount(discount);
        setIsDiscountDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedDiscount(null);
        setIsDiscountDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this discount?')) {
            router.delete(`/inventory/discounts/${id}`, {
                preserveState: true,
                onSuccess: () => {
                    toast.success('Discount deleted successfully');
                    setDiscounts(discounts.filter((d) => d.id !== id));
                },
                onError: () => {
                    toast.error('Failed to delete discount');
                },
            });
        }
    };

    const formatDiscountValue = (discount: Discount) => {
        switch (discount.type) {
            case 'percentage':
                return `${discount.value}%`;
            case 'fixed':
                return `$${discount.value.toFixed(2)}`;
            case 'buy_x_get_y':
                return `Buy ${discount.buy_quantity} Get ${discount.get_quantity}`;
            default:
                return '';
        }
    };

    const getDiscountStatus = (discount: Discount) => {
        if (!discount.is_active) {
            return {
                text: 'Inactive',
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
            };
        }

        const now = new Date();
        if (discount.start_date && new Date(discount.start_date) > now) {
            return {
                text: 'Scheduled',
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            };
        }
        if (discount.end_date && new Date(discount.end_date) < now) {
            return {
                text: 'Expired',
                color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            };
        }
        if (
            discount.usage_limit &&
            discount.usage_count &&
            discount.usage_count >= discount.usage_limit
        ) {
            return {
                text: 'Limit Reached',
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            };
        }

        return {
            text: 'Active',
            color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        };
    };

    return (
        <AuthenticatedLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Discounts & Promotions
                    </h2>
                    <Button
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Discount
                    </Button>
                </div>
            }
        >
            <Head title="Discounts & Promotions" />

            <Card>
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">
                        Active Discounts
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">
                                    Name
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Type
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Value
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Status
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Valid Period
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Usage
                                </TableHead>
                                <TableHead className="text-right text-gray-900 dark:text-white">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {discounts.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-8 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No discounts found. Create your first
                                        discount to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                discounts.map((discount) => {
                                    const status = getDiscountStatus(discount);
                                    return (
                                        <TableRow
                                            key={discount.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <div>
                                                    <div className="font-medium">
                                                        {discount.name}
                                                    </div>
                                                    {discount.description && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {
                                                                discount.description
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <span className="capitalize">
                                                    {discount.type.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {formatDiscountValue(discount)}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                                                >
                                                    {status.text}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {discount.start_date ||
                                                discount.end_date ? (
                                                    <div className="text-xs">
                                                        {discount.start_date
                                                            ? format(
                                                                  new Date(
                                                                      discount.start_date,
                                                                  ),
                                                                  'MMM dd, yyyy',
                                                              )
                                                            : 'No start'}
                                                        {' - '}
                                                        {discount.end_date
                                                            ? format(
                                                                  new Date(
                                                                      discount.end_date,
                                                                  ),
                                                                  'MMM dd, yyyy',
                                                              )
                                                            : 'No end'}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Always
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {discount.usage_limit ? (
                                                    <span className="text-xs">
                                                        {discount.usage_count ||
                                                            0}{' '}
                                                        / {discount.usage_limit}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {discount.usage_count ||
                                                            0}{' '}
                                                        uses
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right text-gray-900 dark:text-white">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEdit(discount)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                discount.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Discount Dialog */}
            <DiscountDialog
                open={isDiscountDialogOpen}
                onOpenChange={setIsDiscountDialogOpen}
                discount={selectedDiscount}
                categories={categories}
                items={items}
                onSuccess={() => {
                    router.reload({ only: ['discounts'] });
                }}
            />
        </AuthenticatedLayout>
    );
}

import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type SubdomainRedirect = {
    id: number;
    subdomain: string;
    destination_url: string;
    http_status: number;
    is_active: boolean;
    notes?: string | null;
    created_at: string;
    updated_at: string;
};

type StatusOption = {
    label: string;
    value: number;
};

interface Props extends PageProps {
    redirects: SubdomainRedirect[];
    statusOptions: StatusOption[];
}

const defaultFormData = {
    id: undefined as number | undefined,
    subdomain: '',
    destination_url: '',
    http_status: 302,
    is_active: true,
    notes: '',
};

export default function SubdomainRedirectsIndex({
    auth,
    redirects,
    statusOptions,
}: Props) {
    const [editingId, setEditingId] = useState<number | undefined>(undefined);
    const form = useForm({ ...defaultFormData });

    const heading = editingId ? 'Edit Redirect' : 'Create Redirect';

    const editingRedirect = useMemo(
        () => redirects.find((redirect) => redirect.id === editingId),
        [redirects, editingId],
    );

    useEffect(() => {
        if (editingRedirect) {
            form.setData({
                id: editingRedirect.id,
                subdomain: editingRedirect.subdomain,
                destination_url: editingRedirect.destination_url,
                http_status: editingRedirect.http_status,
                is_active: editingRedirect.is_active,
                notes: editingRedirect.notes ?? '',
            });
        } else {
            form.setData({ ...defaultFormData });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingRedirect]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            form.put(
                route('admin.subdomain-redirects.update', editingId),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Redirect updated.');
                        setEditingId(undefined);
                    },
                },
            );
        } else {
            form.post(route('admin.subdomain-redirects.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Redirect created.');
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (redirect: SubdomainRedirect) => {
        if (
            !confirm(
                `Delete redirect for "${redirect.subdomain}"? This cannot be undone.`,
            )
        ) {
            return;
        }

        form.delete(route('admin.subdomain-redirects.destroy', redirect.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Redirect deleted.'),
        });
    };

    return (
        <AdminLayout auth={auth}>
            <Head title="Subdomain Redirects" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Subdomain Redirects
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage branded subdomains that should redirect to
                        specific customer pages.
                    </p>
                </div>

                <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                    <CardHeader>
                        <CardTitle>{heading}</CardTitle>
                        <CardDescription>
                            Map a subdomain (e.g., member) to a destination URL
                            or path (e.g., /customer/login).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="subdomain">Subdomain</Label>
                                    <Input
                                        id="subdomain"
                                        value={form.data.subdomain}
                                        onChange={(e) =>
                                            form.setData(
                                                'subdomain',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="member"
                                        className="uppercase sm:lowercase"
                                    />
                                    {form.errors.subdomain && (
                                        <p className="text-sm text-red-500">
                                            {form.errors.subdomain}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="destination_url">
                                        Destination URL or Path
                                    </Label>
                                    <Input
                                        id="destination_url"
                                        value={form.data.destination_url}
                                        onChange={(e) =>
                                            form.setData(
                                                'destination_url',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="/customer/login or https://example.com/login"
                                    />
                                    {form.errors.destination_url && (
                                        <p className="text-sm text-red-500">
                                            {form.errors.destination_url}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>HTTP Status</Label>
                                    <Select
                                        value={String(form.data.http_status)}
                                        onValueChange={(value) =>
                                            form.setData(
                                                'http_status',
                                                Number(value),
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={String(
                                                        option.value,
                                                    )}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.http_status && (
                                        <p className="text-sm text-red-500">
                                            {form.errors.http_status}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <div className="flex items-center gap-3 rounded-md border border-input px-3 py-2">
                                        <input
                                            id="is_active"
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={form.data.is_active}
                                            onChange={(e) =>
                                                form.setData(
                                                    'is_active',
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="is_active"
                                            className="text-sm font-medium"
                                        >
                                            Active
                                        </Label>
                                    </div>
                                </div>
                                <div className="space-y-2 sm:col-span-1">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={form.data.notes}
                                        onChange={(e) =>
                                            form.setData('notes', e.target.value)
                                        }
                                        placeholder="Optional notes about this redirect"
                                        className="min-h-[80px]"
                                    />
                                    {form.errors.notes && (
                                        <p className="text-sm text-red-500">
                                            {form.errors.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    {editingId ? 'Update Redirect' : 'Add Redirect'}
                                </Button>
                                {editingId && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingId(undefined)}
                                    >
                                        Cancel Edit
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                    <CardHeader>
                        <CardTitle>Existing Redirects</CardTitle>
                        <CardDescription>
                            Subdomains currently mapped for automatic
                            redirection.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-900/40">
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Subdomain
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Destination
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        HTTP
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Updated
                                    </TableHead>
                                    <TableHead className="text-right text-gray-900 dark:text-white">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {redirects.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-10 text-center text-sm text-muted-foreground"
                                        >
                                            No redirects configured yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {redirects.map((redirect) => (
                                    <TableRow
                                        key={redirect.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                                    >
                                        <TableCell className="font-medium">
                                            {redirect.subdomain}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-gray-100">
                                            {redirect.destination_url}
                                        </TableCell>
                                        <TableCell>
                                            {redirect.is_active ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                                >
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{redirect.http_status}</TableCell>
                                        <TableCell>
                                            {new Date(
                                                redirect.updated_at,
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setEditingId(
                                                            redirect.id,
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(redirect)
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}


import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Upload } from 'lucide-react';
import { Product } from '../types';

interface ProductSearchProps {
    products: Product[];
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onAddToOrder: (product: Product) => void;
    onImageClick: (imageUrl: string) => void;
    canEdit: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const ITEMS_PER_PAGE = 5;

export default function ProductSearch({
    products,
    searchTerm,
    onSearchChange,
    onAddToOrder,
    onImageClick,
    canEdit,
    currentPage,
    totalPages,
    onPageChange,
}: ProductSearchProps) {
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxVisiblePages / 2),
        );
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    const paginatedProducts = products.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Search</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col space-y-2">
                    <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    <div className="max-h-[600px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-700">
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Image
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Product
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Price
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        In Stock
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedProducts.map((product) => (
                                    <TableRow
                                        key={product.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="flex gap-1">
                                                {product.images &&
                                                product.images.length > 0 ? (
                                                    product.images
                                                        .slice(0, 3)
                                                        .map((image, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex h-[50px] w-[50px] items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800"
                                                            >
                                                                <img
                                                                    src={image}
                                                                    alt={`${product.name} ${index + 1}`}
                                                                    className="h-full w-full cursor-pointer object-cover transition-opacity hover:opacity-80"
                                                                    onClick={() =>
                                                                        onImageClick(
                                                                            image,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        ))
                                                ) : (
                                                    <div className="flex h-[50px] w-[50px] items-center justify-center bg-gray-200 dark:bg-gray-700">
                                                        <Upload className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {product.name}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {product.price_formatted}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {product.quantity}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {canEdit && (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        onAddToOrder(product)
                                                    }
                                                    disabled={
                                                        product.quantity === 0
                                                    }
                                                >
                                                    Add
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                            {Math.min(
                                currentPage * ITEMS_PER_PAGE,
                                products.length,
                            )}{' '}
                            of {products.length} entries
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() =>
                                    onPageChange(Math.max(currentPage - 1, 1))
                                }
                                disabled={currentPage === 1}
                                variant="outline"
                                size="sm"
                            >
                                Previous
                            </Button>
                            {getPageNumbers().map((pageNumber) => (
                                <Button
                                    key={pageNumber}
                                    variant={
                                        pageNumber === currentPage
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() => onPageChange(pageNumber)}
                                    size="sm"
                                >
                                    {pageNumber}
                                </Button>
                            ))}
                            <Button
                                onClick={() =>
                                    onPageChange(
                                        Math.min(currentPage + 1, totalPages),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                variant="outline"
                                size="sm"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

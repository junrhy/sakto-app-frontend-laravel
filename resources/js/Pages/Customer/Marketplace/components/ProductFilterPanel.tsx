interface Product {
    id: number;
    name: string;
    description: string;
    price: number | string;
    category: string;
    type: 'physical' | 'digital' | 'service' | 'subscription';
    sku: string | null;
    stock_quantity: number | null;
    weight: number | null;
    dimensions: string | null;
    file_url: string | null;
    thumbnail_url: string | null;
    status: 'draft' | 'published' | 'archived' | 'inactive';
    tags: string[] | null;
    metadata: any;
    client_identifier: string;
    created_at: string;
    updated_at: string;
    images?: Array<{
        id: number;
        image_url: string;
        alt_text?: string;
        is_primary: boolean;
        sort_order: number;
    }>;
    active_variants?: Array<{
        id: number;
        sku?: string;
        price?: number;
        stock_quantity: number;
        weight?: number;
        dimensions?: string;
        thumbnail_url?: string;
        attributes: Record<string, string>;
        is_active: boolean;
    }>;
}

interface ProductFilterPanelProps {
    showFilters: boolean;
    filters: {
        search: string;
        category: string;
        type: string;
        priceRange: string;
        availability: string;
    };
    setFilters: React.Dispatch<
        React.SetStateAction<{
            search: string;
            category: string;
            type: string;
            priceRange: string;
            availability: string;
        }>
    >;
    getUniqueCategories: () => string[];
    getUniqueTypes: () => string[];
    clearFilters: () => void;
    hasActiveFilters: () => boolean;
    getFilteredProducts: () => Product[];
    products: Product[];
    appCurrency?: { code: string; symbol: string } | null;
}

export default function ProductFilterPanel({
    showFilters,
    filters,
    setFilters,
    getUniqueCategories,
    getUniqueTypes,
    clearFilters,
    hasActiveFilters,
    getFilteredProducts,
    products,
    appCurrency,
}: ProductFilterPanelProps) {
    if (!showFilters) {
        return null;
    }

    return (
        <div className="mb-6 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Search
                    </label>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                search: e.target.value,
                            }))
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category
                    </label>
                    <select
                        value={filters.category}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                category: e.target.value,
                            }))
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    >
                        <option value="">All Categories</option>
                        {getUniqueCategories().map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                    </label>
                    <select
                        value={filters.type}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                type: e.target.value,
                            }))
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    >
                        <option value="">All Types</option>
                        {getUniqueTypes().map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Price Range
                    </label>
                    <select
                        value={filters.priceRange}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                priceRange: e.target.value,
                            }))
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    >
                        <option value="">All Prices</option>
                        <option value="under_10">
                            Under {appCurrency?.symbol || '$'}10
                        </option>
                        <option value="10_50">
                            {appCurrency?.symbol || '$'}10 - {appCurrency?.symbol || '$'}50
                        </option>
                        <option value="50_100">
                            {appCurrency?.symbol || '$'}50 - {appCurrency?.symbol || '$'}100
                        </option>
                        <option value="over_100">
                            Over {appCurrency?.symbol || '$'}100
                        </option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Availability
                    </label>
                    <select
                        value={filters.availability}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                availability: e.target.value,
                            }))
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    >
                        <option value="">All Items</option>
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {getFilteredProducts().length} of {products.length} products
                </div>
                <div className="flex items-center gap-2">
                    {hasActiveFilters() && (
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900/30"
                        >
                            <svg
                                className="mr-1 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            Clear All
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Star, Filter, MessageSquare, Plus } from 'lucide-react';
import ProductReviewComponent from './ProductReview';

interface ReviewUser {
    id: number;
    name: string;
    email: string;
}

interface ProductReview {
    id: number;
    product_id: number;
    user_id: number;
    title?: string;
    content: string;
    rating: number;
    is_verified_purchase: boolean;
    is_approved: boolean;
    is_featured: boolean;
    images?: string[];
    helpful_votes?: number[];
    unhelpful_votes?: number[];
    helpful_votes_count: number;
    unhelpful_votes_count: number;
    total_votes_count: number;
    created_at: string;
    updated_at: string;
    user: ReviewUser;
}

interface ReviewListProps {
    productId: number;
    reviews: ProductReview[];
    currentUserId?: number;
    isAdmin?: boolean;
    onVote: (reviewId: number, voteType: 'helpful' | 'unhelpful') => Promise<void>;
    onEdit?: (review: ProductReview) => void;
    onDelete?: (reviewId: number) => Promise<void>;
    onApprove?: (reviewId: number) => Promise<void>;
    onToggleFeature?: (reviewId: number) => Promise<void>;
    onWriteReview?: () => void;
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    onPageChange?: (page: number) => void;
    onFilterChange?: (filters: ReviewFilters) => void;
    onSortChange?: (sort: string) => void;
}

interface ReviewFilters {
    rating?: number;
    verified_purchase?: boolean;
    sort?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({
    productId,
    reviews,
    currentUserId,
    isAdmin = false,
    onVote,
    onEdit,
    onDelete,
    onApprove,
    onToggleFeature,
    onWriteReview,
    pagination,
    onPageChange,
    onFilterChange,
    onSortChange,
}) => {
    const [filters, setFilters] = useState<ReviewFilters>({});
    const [showFilters, setShowFilters] = useState(false);

    const handleFilterChange = (key: keyof ReviewFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const handleSortChange = (sort: string) => {
        setFilters(prev => ({ ...prev, sort }));
        onSortChange?.(sort);
    };

    const clearFilters = () => {
        setFilters({});
        onFilterChange?.({});
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

    return (
        <Card className="border border-gray-200 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Customer Reviews ({pagination?.total || reviews.length})
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                hasActiveFilters ? 'border-blue-500 text-blue-600 dark:text-blue-400' : ''
                            }`}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                            {hasActiveFilters && (
                                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                                    {Object.values(filters).filter(v => v !== undefined && v !== '').length}
                                </Badge>
                            )}
                        </Button>
                        {onWriteReview && (
                            <Button
                                size="sm"
                                onClick={onWriteReview}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Write Review
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Rating Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Rating
                                </label>
                                <Select
                                    value={filters.rating?.toString() || ''}
                                    onValueChange={(value) => handleFilterChange('rating', value ? parseInt(value) : undefined)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                                        <SelectValue placeholder="All ratings" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All ratings</SelectItem>
                                        <SelectItem value="5">5 stars</SelectItem>
                                        <SelectItem value="4">4 stars</SelectItem>
                                        <SelectItem value="3">3 stars</SelectItem>
                                        <SelectItem value="2">2 stars</SelectItem>
                                        <SelectItem value="1">1 star</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sort by
                                </label>
                                <Select
                                    value={filters.sort || 'recent'}
                                    onValueChange={handleSortChange}
                                >
                                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="recent">Most Recent</SelectItem>
                                        <SelectItem value="helpful">Most Helpful</SelectItem>
                                        <SelectItem value="highest_rating">Highest Rating</SelectItem>
                                        <SelectItem value="lowest_rating">Lowest Rating</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Verified Purchase Filter */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="verified-purchase"
                                    checked={filters.verified_purchase || false}
                                    onCheckedChange={(checked) => handleFilterChange('verified_purchase', checked)}
                                />
                                <label
                                    htmlFor="verified-purchase"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Verified Purchase Only
                                </label>
                            </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {reviews.length} of {pagination?.total || reviews.length} reviews
                            </div>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-gray-200 dark:border-gray-600"
                                >
                                    Clear All Filters
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Reviews List */}
                {reviews.length > 0 ? (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <ProductReviewComponent
                                key={review.id}
                                review={review}
                                currentUserId={currentUserId}
                                isAdmin={isAdmin}
                                onVote={onVote}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onApprove={onApprove}
                                onToggleFeature={onToggleFeature}
                                userVotedHelpful={review.helpful_votes?.includes(currentUserId || 0) || false}
                                userVotedUnhelpful={review.unhelpful_votes?.includes(currentUserId || 0) || false}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No reviews yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Be the first to share your experience with this product.
                        </p>
                        {onWriteReview && (
                            <Button
                                onClick={onWriteReview}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Write the First Review
                            </Button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                            {pagination.total} reviews
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange?.(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Page {pagination.current_page} of {pagination.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange?.(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ReviewList; 
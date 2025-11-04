import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { router } from '@inertiajs/react';
import { Filter } from 'lucide-react';
import React, { useState } from 'react';
import ProductReviewComponent from './ProductReview';
import ReviewForm from './ReviewForm';

interface ProductReview {
    id: number;
    product_id: number;
    reviewer_name: string;
    reviewer_email: string;
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
}

interface ReviewListProps {
    productId: number;
    productName: string;
    reviews: ProductReview[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary: {
        average_rating: number;
        total_reviews: number;
        rating_distribution: { [key: number]: number };
    };
    currentUserEmail?: string;
    currentUserId?: number;
    isAdmin?: boolean;
    filters?: {
        rating?: number;
        verified_purchase?: boolean;
        sort?: string;
        approved?: boolean;
    };
}

type FilterValue = string | number | boolean | undefined;

const ReviewList: React.FC<ReviewListProps> = ({
    productId,
    productName,
    reviews,
    pagination,
    currentUserEmail,
    currentUserId,
    isAdmin = false,
    filters = {},
}) => {
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [currentFilters, setCurrentFilters] = useState(filters);

    const handleFilterChange = (key: string, value: FilterValue) => {
        const newFilters = { ...currentFilters, [key]: value };
        setCurrentFilters(newFilters);

        // Update URL with new filters
        router.get(route('products.show', productId), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleVote = async (
        reviewId: number,
        voteType: 'helpful' | 'unhelpful',
    ) => {
        if (!currentUserEmail) return;

        try {
            const response = await fetch(
                `/products/${productId}/reviews/${reviewId}/vote`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        vote_type: voteType,
                    }),
                },
            );

            if (response.ok) {
                // Refresh the page to show updated vote counts
                window.location.reload();
            }
        } catch (error) {
            console.error('Error voting on review:', error);
        }
    };

    const handleEditReview = (review: ProductReview) => {
        // Implement edit functionality
        console.log('Edit review:', review);
    };

    const handleDeleteReview = async (reviewId: number) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            const response = await fetch(
                `/products/${productId}/reviews/${reviewId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        reviewer_email: currentUserEmail,
                    }),
                },
            );

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const handleApproveReview = async (reviewId: number) => {
        try {
            const response = await fetch(
                `/products/${productId}/reviews/${reviewId}/approve`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error approving review:', error);
        }
    };

    const handleToggleFeature = async (reviewId: number) => {
        try {
            const response = await fetch(
                `/products/${productId}/reviews/${reviewId}/toggle-feature`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error toggling feature:', error);
        }
    };

    interface ReviewData {
        rating: number;
        comment: string;
        product_id: number;
        reviewer_name?: string;
        reviewer_email?: string;
    }

    const handleReviewSubmit = async (reviewData: ReviewData) => {
        try {
            const response = await fetch(`/products/${productId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    ...reviewData,
                    client_identifier: 'default',
                }),
            });

            if (response.ok) {
                setShowReviewForm(false);
                window.location.reload();
            } else {
                const error = await response.json();
                console.error('Error submitting review:', error);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Write Review Button */}
            <div className="flex justify-end">
                <Button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-blue-600 text-white hover:bg-blue-700 dark:text-white"
                >
                    Write a Review
                </Button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
                <ReviewForm
                    productId={productId}
                    productName={productName}
                    onSubmit={async (data) => {
                        await handleReviewSubmit({
                            rating: data.rating,
                            comment: data.content,
                            product_id: productId,
                        });
                    }}
                    onCancel={() => setShowReviewForm(false)}
                    currentUserEmail={currentUserEmail}
                />
            )}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="h-5 w-5" />
                        <span>Filter Reviews</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Rating Filter */}
                        <div>
                            <Label htmlFor="rating-filter">Rating</Label>
                            <Select
                                value={
                                    currentFilters.rating?.toString() || 'all'
                                }
                                onValueChange={(value) =>
                                    handleFilterChange(
                                        'rating',
                                        value === 'all'
                                            ? undefined
                                            : parseInt(value),
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All ratings" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All ratings
                                    </SelectItem>
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
                            <Label htmlFor="sort-filter">Sort by</Label>
                            <Select
                                value={currentFilters.sort || 'recent'}
                                onValueChange={(value) =>
                                    handleFilterChange('sort', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recent">
                                        Most Recent
                                    </SelectItem>
                                    <SelectItem value="helpful">
                                        Most Helpful
                                    </SelectItem>
                                    <SelectItem value="highest_rating">
                                        Highest Rating
                                    </SelectItem>
                                    <SelectItem value="lowest_rating">
                                        Lowest Rating
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Approval Status Filter (Admin Only) */}
                        {isAdmin && (
                            <div>
                                <Label htmlFor="approval-filter">
                                    Approval Status
                                </Label>
                                <Select
                                    value={
                                        currentFilters.approved?.toString() ||
                                        'all'
                                    }
                                    onValueChange={(value) =>
                                        handleFilterChange(
                                            'approved',
                                            value === 'all'
                                                ? undefined
                                                : value === 'true',
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All reviews" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All reviews
                                        </SelectItem>
                                        <SelectItem value="true">
                                            Approved only
                                        </SelectItem>
                                        <SelectItem value="false">
                                            Pending approval
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Verified Purchase Filter */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="verified-purchase"
                                checked={
                                    currentFilters.verified_purchase || false
                                }
                                onCheckedChange={(checked) =>
                                    handleFilterChange(
                                        'verified_purchase',
                                        checked,
                                    )
                                }
                            />
                            <Label htmlFor="verified-purchase">
                                Verified Purchase Only
                            </Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                No reviews found. Be the first to review this
                                product!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    reviews.map((review) => (
                        <ProductReviewComponent
                            key={review.id}
                            review={review}
                            currentUserEmail={currentUserEmail}
                            isAdmin={isAdmin}
                            onVote={handleVote}
                            onEdit={handleEditReview}
                            onDelete={handleDeleteReview}
                            onApprove={handleApproveReview}
                            onToggleFeature={handleToggleFeature}
                            userVotedHelpful={
                                currentUserId
                                    ? review.helpful_votes?.includes(
                                          currentUserId,
                                      ) || false
                                    : false
                            }
                            userVotedUnhelpful={
                                currentUserId
                                    ? review.unhelpful_votes?.includes(
                                          currentUserId,
                                      ) || false
                                    : false
                            }
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
                <div className="flex items-center justify-center space-x-2">
                    <Button
                        variant="outline"
                        disabled={pagination.current_page === 1}
                        onClick={() =>
                            handleFilterChange(
                                'page',
                                pagination.current_page - 1,
                            )
                        }
                    >
                        Previous
                    </Button>

                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {pagination.current_page} of {pagination.last_page}
                    </span>

                    <Button
                        variant="outline"
                        disabled={
                            pagination.current_page === pagination.last_page
                        }
                        onClick={() =>
                            handleFilterChange(
                                'page',
                                pagination.current_page + 1,
                            )
                        }
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ReviewList;

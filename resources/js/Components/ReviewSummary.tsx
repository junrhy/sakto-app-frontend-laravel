import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Star, TrendingUp, Users, Award, CheckCircle } from 'lucide-react';

interface RatingDistribution {
    [key: number]: number;
}

interface ReviewSummaryProps {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: RatingDistribution;
    verifiedPurchaseCount?: number;
    featuredReviewsCount?: number;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
    averageRating,
    totalReviews,
    ratingDistribution,
    verifiedPurchaseCount = 0,
    featuredReviewsCount = 0,
}) => {
    const getRatingPercentage = (rating: number): number => {
        if (totalReviews === 0) return 0;
        return Math.round((ratingDistribution[rating] || 0) / totalReviews * 100);
    };

    const getRatingLabel = (rating: number): string => {
        switch (rating) {
            case 5: return 'Excellent';
            case 4: return 'Very Good';
            case 3: return 'Good';
            case 2: return 'Fair';
            case 1: return 'Poor';
            default: return '';
        }
    };

    return (
        <Card className="border border-gray-200 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Customer Reviews
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Rating */}
                <div className="flex items-center space-x-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            {(Number(averageRating) || 0).toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center space-x-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                        star <= Math.round(Number(averageRating) || 0)
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                />
                            ))}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        {/* Rating Distribution */}
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = ratingDistribution[rating] || 0;
                                const percentage = getRatingPercentage(rating);
                                
                                return (
                                    <div key={rating} className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-1 w-8">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{rating}</span>
                                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                        </div>
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="w-12 text-right">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {count}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Review Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    {verifiedPurchaseCount > 0 && (
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {verifiedPurchaseCount}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Verified Purchases
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {featuredReviewsCount > 0 && (
                        <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {featuredReviewsCount}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Featured Reviews
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Rating Summary */}
                {(Number(averageRating) || 0) > 0 && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {getRatingLabel(Math.round(Number(averageRating) || 0))}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Based on {totalReviews} customer {totalReviews === 1 ? 'review' : 'reviews'}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ReviewSummary; 
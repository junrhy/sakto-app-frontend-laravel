import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { 
    ThumbsUp, 
    ThumbsDown, 
    Star, 
    CheckCircle, 
    Award,
    MoreHorizontal,
    Edit,
    Trash2,
    Flag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

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

interface ProductReviewProps {
    review: ProductReview;
    currentUserId?: number;
    isAdmin?: boolean;
    onVote: (reviewId: number, voteType: 'helpful' | 'unhelpful') => void;
    onEdit?: (review: ProductReview) => void;
    onDelete?: (reviewId: number) => void;
    onApprove?: (reviewId: number) => void;
    onToggleFeature?: (reviewId: number) => void;
    userVotedHelpful?: boolean;
    userVotedUnhelpful?: boolean;
}

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ rating, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    return (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${sizeClasses[size]} ${
                        star <= rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300 dark:text-gray-600'
                    }`}
                />
            ))}
        </div>
    );
};

const ProductReview: React.FC<ProductReviewProps> = ({
    review,
    currentUserId,
    isAdmin = false,
    onVote,
    onEdit,
    onDelete,
    onApprove,
    onToggleFeature,
    userVotedHelpful = false,
    userVotedUnhelpful = false,
}) => {
    const [isVoting, setIsVoting] = useState(false);

    const handleVote = async (voteType: 'helpful' | 'unhelpful') => {
        if (!currentUserId || isVoting) return;
        
        setIsVoting(true);
        try {
            await onVote(review.id, voteType);
        } finally {
            setIsVoting(false);
        }
    };

    const canEdit = currentUserId === review.user_id;
    const canDelete = currentUserId === review.user_id || isAdmin;
    const canModerate = isAdmin;

    return (
        <Card className="border border-gray-200 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.name)}&background=random`} />
                            <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {review.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                    {review.user.name}
                                </h4>
                                {review.is_verified_purchase && (
                                    <Badge variant="secondary" className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700/50">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Verified Purchase
                                    </Badge>
                                )}
                                {review.is_featured && (
                                    <Badge variant="secondary" className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700/50">
                                        <Award className="w-3 h-3 mr-1" />
                                        Featured
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                <StarRating rating={review.rating} size="sm" />
                                <span>{review.rating}/5</span>
                                <span>•</span>
                                <span>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Actions Dropdown */}
                    {(canEdit || canDelete || canModerate) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {canEdit && onEdit && (
                                    <DropdownMenuItem onClick={() => onEdit(review)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Review
                                    </DropdownMenuItem>
                                )}
                                {canDelete && onDelete && (
                                    <DropdownMenuItem 
                                        onClick={() => onDelete(review.id)}
                                        className="text-red-600 dark:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Review
                                    </DropdownMenuItem>
                                )}
                                {canModerate && !review.is_approved && onApprove && (
                                    <DropdownMenuItem onClick={() => onApprove(review.id)}>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve Review
                                    </DropdownMenuItem>
                                )}
                                {canModerate && onToggleFeature && (
                                    <DropdownMenuItem onClick={() => onToggleFeature(review.id)}>
                                        <Award className="w-4 h-4 mr-2" />
                                        {review.is_featured ? 'Unfeature' : 'Feature'} Review
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>
            
            <CardContent className="pt-0">
                {/* Review Title */}
                {review.title && (
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {review.title}
                    </h5>
                )}
                
                {/* Review Content */}
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4">
                    {review.content}
                </p>
                
                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2 mb-4 overflow-x-auto">
                        {review.images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Review image ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600/50"
                            />
                        ))}
                    </div>
                )}
                
                {/* Voting Section */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote('helpful')}
                            disabled={isVoting || !currentUserId}
                            className={`flex items-center space-x-1 ${
                                userVotedHelpful 
                                    ? 'text-blue-600 dark:text-blue-400' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <ThumbsUp className={`w-4 h-4 ${userVotedHelpful ? 'fill-current' : ''}`} />
                            <span>{review.helpful_votes_count}</span>
                        </Button>
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote('unhelpful')}
                            disabled={isVoting || !currentUserId}
                            className={`flex items-center space-x-1 ${
                                userVotedUnhelpful 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <ThumbsDown className={`w-4 h-4 ${userVotedUnhelpful ? 'fill-current' : ''}`} />
                            <span>{review.unhelpful_votes_count}</span>
                        </Button>
                    </div>
                    
                    {/* Total Votes */}
                    {review.total_votes_count > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {review.total_votes_count} people found this helpful
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductReview; 
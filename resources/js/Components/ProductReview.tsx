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

interface ProductReviewProps {
    review: ProductReview;
    currentUserEmail?: string;
    isAdmin?: boolean;
    onVote: (reviewId: number, voteType: 'helpful' | 'unhelpful') => void;
    onEdit?: (review: ProductReview) => void;
    onDelete?: (reviewId: number) => void;
    onApprove?: (reviewId: number) => void;
    onToggleFeature?: (reviewId: number) => void;
    userVotedHelpful?: boolean;
    userVotedUnhelpful?: boolean;
}

const ProductReview: React.FC<ProductReviewProps> = ({
    review,
    currentUserEmail,
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
        if (!currentUserEmail || isVoting) return;
        
        setIsVoting(true);
        try {
            await onVote(review.id, voteType);
        } finally {
            setIsVoting(false);
        }
    };

    const canEdit = currentUserEmail === review.reviewer_email;
    const canDelete = currentUserEmail === review.reviewer_email || isAdmin;
    const canModerate = isAdmin;

    return (
        <Card className={`border ${!review.is_approved ? 'border-orange-300 dark:border-orange-600 bg-orange-50/50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50'} backdrop-blur-sm`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        {/* Reviewer Avatar */}
                        <Avatar className="w-10 h-10">
                            <AvatarImage src="" alt={review.reviewer_name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                                {review.reviewer_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                    {review.reviewer_name}
                                </h4>
                                
                                {/* Pending Approval Badge */}
                                {!review.is_approved && (
                                    <Badge variant="secondary" className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700/50">
                                        <Flag className="w-3 h-3 mr-1" />
                                        Pending Approval
                                    </Badge>
                                )}
                                
                                {/* Verified Purchase Badge */}
                                {review.is_verified_purchase && (
                                    <Badge variant="secondary" className="text-xs">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Verified Purchase
                                    </Badge>
                                )}
                                
                                {/* Featured Badge */}
                                {review.is_featured && (
                                    <Badge variant="default" className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500">
                                        <Award className="w-3 h-3 mr-1" />
                                        Featured
                                    </Badge>
                                )}
                            </div>
                            
                            {/* Rating Stars */}
                            <div className="flex items-center space-x-1 mb-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${
                                            star <= review.rating
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                    />
                                ))}
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                    {review.rating}/5
                                </span>
                            </div>
                            
                            {/* Review Date */}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                    
                    {/* Action Menu */}
                    {(canEdit || canDelete || canModerate) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
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
                                {canModerate && onApprove && !review.is_approved && (
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
                
                {/* Admin Approval Section */}
                {canModerate && !review.is_approved && onApprove && (
                    <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Flag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                    This review is pending approval
                                </span>
                            </div>
                            <Button
                                onClick={() => onApprove(review.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Review
                            </Button>
                        </div>
                    </div>
                )}
                
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
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote('helpful')}
                            disabled={isVoting}
                            className={`flex items-center space-x-1 ${
                                userVotedHelpful 
                                    ? 'text-blue-600 dark:text-blue-400' 
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <ThumbsUp className={`w-4 h-4 ${userVotedHelpful ? 'fill-current' : ''}`} />
                            <span>Helpful ({review.helpful_votes_count || 0})</span>
                        </Button>
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote('unhelpful')}
                            disabled={isVoting}
                            className={`flex items-center space-x-1 ${
                                userVotedUnhelpful 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <ThumbsDown className={`w-4 h-4 ${userVotedUnhelpful ? 'fill-current' : ''}`} />
                            <span>Unhelpful ({review.unhelpful_votes_count || 0})</span>
                        </Button>
                    </div>
                    
                    {/* Report Button */}
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                        <Flag className="w-4 h-4 mr-1" />
                        Report
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductReview; 
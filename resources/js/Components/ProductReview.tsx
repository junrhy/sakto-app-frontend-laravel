import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import {
    Award,
    CheckCircle,
    Edit,
    Flag,
    MoreHorizontal,
    Star,
    ThumbsDown,
    ThumbsUp,
    Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import Modal from './Modal';

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
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('Spam');
    const [reportComment, setReportComment] = useState('');
    const [isReporting, setIsReporting] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);

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

    const handleReport = async () => {
        setIsReporting(true);
        try {
            const response = await fetch(
                `/products/${review.product_id}/reviews/${review.id}/report`,
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
                        reason: reportReason,
                        comment: reportComment,
                    }),
                },
            );
            if (response.ok) {
                setReportSuccess(true);
                setTimeout(() => {
                    setShowReportModal(false);
                    setReportSuccess(false);
                    setReportReason('Spam');
                    setReportComment('');
                }, 1200);
            } else {
                alert('Failed to submit report.');
            }
        } catch (error) {
            alert('An error occurred while submitting the report.');
        } finally {
            setIsReporting(false);
        }
    };

    return (
        <Card
            className={`border ${!review.is_approved ? 'border-orange-300 bg-orange-50/50 dark:border-orange-600 dark:bg-orange-900/20' : 'border-gray-200 bg-white/50 dark:border-gray-700/50 dark:bg-gray-800/50'} backdrop-blur-sm`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        {/* Reviewer Avatar */}
                        <Avatar className="h-10 w-10">
                            <AvatarImage src="" alt={review.reviewer_name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-medium text-white">
                                {review.reviewer_name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center space-x-2">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    {review.reviewer_name}
                                </h4>

                                {/* Pending Approval Badge */}
                                {!review.is_approved && (
                                    <Badge
                                        variant="secondary"
                                        className="border-orange-200 bg-orange-100 text-xs text-orange-800 dark:border-orange-700/50 dark:bg-orange-900/30 dark:text-orange-200"
                                    >
                                        <Flag className="mr-1 h-3 w-3" />
                                        Pending Approval
                                    </Badge>
                                )}

                                {/* Verified Purchase Badge */}
                                {review.is_verified_purchase && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Verified Purchase
                                    </Badge>
                                )}

                                {/* Featured Badge */}
                                {review.is_featured && (
                                    <Badge
                                        variant="default"
                                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-xs"
                                    >
                                        <Award className="mr-1 h-3 w-3" />
                                        Featured
                                    </Badge>
                                )}
                            </div>

                            {/* Rating Stars */}
                            <div className="mb-1 flex items-center space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-4 w-4 ${
                                            star <= review.rating
                                                ? 'fill-current text-yellow-400'
                                                : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                    />
                                ))}
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    {review.rating}/5
                                </span>
                            </div>

                            {/* Review Date */}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(
                                    new Date(review.created_at),
                                    { addSuffix: true },
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Action Menu */}
                    {(canEdit || canDelete || canModerate) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {canEdit && onEdit && (
                                    <DropdownMenuItem
                                        onClick={() => onEdit(review)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Review
                                    </DropdownMenuItem>
                                )}
                                {canDelete && onDelete && (
                                    <DropdownMenuItem
                                        onClick={() => onDelete(review.id)}
                                        className="text-red-600 dark:text-red-400"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Review
                                    </DropdownMenuItem>
                                )}
                                {canModerate &&
                                    onApprove &&
                                    !review.is_approved && (
                                        <DropdownMenuItem
                                            onClick={() => onApprove(review.id)}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Approve Review
                                        </DropdownMenuItem>
                                    )}
                                {canModerate && onToggleFeature && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            onToggleFeature(review.id)
                                        }
                                    >
                                        <Award className="mr-2 h-4 w-4" />
                                        {review.is_featured
                                            ? 'Unfeature'
                                            : 'Feature'}{' '}
                                        Review
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
                    <h5 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                        {review.title}
                    </h5>
                )}

                {/* Review Content */}
                <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-200">
                    {review.content}
                </p>

                {/* Admin Approval Section */}
                {canModerate && !review.is_approved && onApprove && (
                    <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-700/50 dark:bg-orange-900/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Flag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                    This review is pending approval
                                </span>
                            </div>
                            <Button
                                onClick={() => onApprove(review.id)}
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve Review
                            </Button>
                        </div>
                    </div>
                )}

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                    <div className="mb-4 flex space-x-2 overflow-x-auto">
                        {review.images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Review image ${index + 1}`}
                                className="h-16 w-16 rounded-lg border border-gray-200 object-cover dark:border-gray-600/50"
                            />
                        ))}
                    </div>
                )}

                {/* Voting Section */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
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
                            <ThumbsUp
                                className={`h-4 w-4 ${userVotedHelpful ? 'fill-current' : ''}`}
                            />
                            <span>
                                Helpful ({review.helpful_votes_count || 0})
                            </span>
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
                            <ThumbsDown
                                className={`h-4 w-4 ${userVotedUnhelpful ? 'fill-current' : ''}`}
                            />
                            <span>
                                Unhelpful ({review.unhelpful_votes_count || 0})
                            </span>
                        </Button>
                    </div>

                    {/* Report Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setShowReportModal(true)}
                    >
                        <Flag className="mr-1 h-4 w-4" />
                        Report
                    </Button>
                </div>
                {/* Report Modal */}
                <Modal
                    show={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    maxWidth="sm"
                >
                    <div className="p-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Report Review
                        </h3>
                        {reportSuccess ? (
                            <div className="py-4 text-center font-medium text-green-600 dark:text-green-400">
                                Thank you for your report!
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleReport();
                                }}
                            >
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Reason
                                </label>
                                <select
                                    className="mb-4 w-full rounded border bg-white p-2 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                                    value={reportReason}
                                    onChange={(e) =>
                                        setReportReason(e.target.value)
                                    }
                                    required
                                >
                                    <option value="Spam">Spam</option>
                                    <option value="Inappropriate">
                                        Inappropriate
                                    </option>
                                    <option value="Offensive">Offensive</option>
                                    <option value="Other">Other</option>
                                </select>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Comment (optional)
                                </label>
                                <textarea
                                    className="mb-4 w-full rounded border bg-white p-2 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                                    rows={3}
                                    value={reportComment}
                                    onChange={(e) =>
                                        setReportComment(e.target.value)
                                    }
                                    placeholder="Add more details (optional)"
                                />
                                <div className="mt-4 flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowReportModal(false)
                                        }
                                        disabled={isReporting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-red-600 text-white hover:bg-red-700"
                                        disabled={isReporting}
                                    >
                                        {isReporting
                                            ? 'Reporting...'
                                            : 'Submit Report'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </Modal>
            </CardContent>
        </Card>
    );
};

export default ProductReview;

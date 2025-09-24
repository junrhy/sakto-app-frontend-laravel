import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Star, Upload, X } from 'lucide-react';
import React, { useState } from 'react';

interface ReviewFormData {
    reviewer_name: string;
    reviewer_email: string;
    title: string;
    content: string;
    rating: number;
    images: string[];
}

interface ReviewFormErrors {
    reviewer_name?: string;
    reviewer_email?: string;
    title?: string;
    content?: string;
    rating?: string;
    images?: string;
}

interface ReviewFormProps {
    productId: number;
    productName: string;
    onSubmit: (data: ReviewFormData) => Promise<void>;
    onCancel?: () => void;
    isSubmitting?: boolean;
    currentUserEmail?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
    productId,
    productName,
    onSubmit,
    onCancel,
    isSubmitting = false,
    currentUserEmail,
}) => {
    const [formData, setFormData] = useState<ReviewFormData>({
        reviewer_name: '',
        reviewer_email: currentUserEmail || '',
        title: '',
        content: '',
        rating: 0,
        images: [],
    });
    const [errors, setErrors] = useState<ReviewFormErrors>({});
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleInputChange = (
        field: keyof ReviewFormData,
        value: string | number | string[],
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleRatingChange = (rating: number) => {
        setFormData((prev) => ({ ...prev, rating }));
        if (errors.rating) {
            setErrors((prev) => ({ ...prev, rating: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ReviewFormErrors = {};

        if (!formData.reviewer_name.trim()) {
            newErrors.reviewer_name = 'Your name is required';
        }

        if (!formData.reviewer_email.trim()) {
            newErrors.reviewer_email = 'Your email is required';
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.reviewer_email)
        ) {
            newErrors.reviewer_email = 'Please enter a valid email address';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Review content is required';
        } else if (formData.content.trim().length < 10) {
            newErrors.content = 'Review content must be at least 10 characters';
        }

        if (formData.rating === 0) {
            newErrors.rating = 'Please select a rating';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(formData);
            // Reset form on success
            setFormData({
                reviewer_name: '',
                reviewer_email: currentUserEmail || '',
                title: '',
                content: '',
                rating: 0,
                images: [],
            });
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                alert('Image size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setFormData((prev) => ({
                    ...prev,
                    images: [...prev.images, result],
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    return (
        <Card className="border border-gray-200 bg-white/50 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Write a Review for {productName}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Reviewer Information */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label
                                htmlFor="reviewer_name"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Your Name *
                            </Label>
                            <Input
                                id="reviewer_name"
                                type="text"
                                value={formData.reviewer_name}
                                onChange={(e) =>
                                    handleInputChange(
                                        'reviewer_name',
                                        e.target.value,
                                    )
                                }
                                placeholder="Enter your name"
                                className="border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                maxLength={255}
                            />
                            {errors.reviewer_name && (
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {errors.reviewer_name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="reviewer_email"
                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Your Email *
                            </Label>
                            <Input
                                id="reviewer_email"
                                type="email"
                                value={formData.reviewer_email}
                                onChange={(e) =>
                                    handleInputChange(
                                        'reviewer_email',
                                        e.target.value,
                                    )
                                }
                                placeholder="Enter your email"
                                className="border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                maxLength={255}
                            />
                            {errors.reviewer_email && (
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {errors.reviewer_email}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Rating Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Rating *
                        </Label>
                        <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRatingChange(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        className={`h-8 w-8 transition-colors ${
                                            star <=
                                            (hoveredRating || formData.rating)
                                                ? 'fill-current text-yellow-400'
                                                : 'text-gray-300 hover:text-yellow-300 dark:text-gray-600'
                                        }`}
                                    />
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                {formData.rating > 0
                                    ? `${formData.rating} out of 5`
                                    : 'Select rating'}
                            </span>
                        </div>
                        {errors.rating && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.rating}
                            </p>
                        )}
                    </div>

                    {/* Review Title */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="title"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Review Title (Optional)
                        </Label>
                        <Input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                handleInputChange('title', e.target.value)
                            }
                            placeholder="Summarize your experience"
                            className="border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                            maxLength={255}
                        />
                    </div>

                    {/* Review Content */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="content"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Review Content *
                        </Label>
                        <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) =>
                                handleInputChange('content', e.target.value)
                            }
                            placeholder="Share your experience with this product..."
                            className="min-h-[120px] border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                            maxLength={2000}
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Minimum 10 characters</span>
                            <span>{formData.content.length}/2000</span>
                        </div>
                        {errors.content && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.content}
                            </p>
                        )}
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Add Photos (Optional)
                        </Label>
                        <div className="space-y-3">
                            {/* Upload Button */}
                            {formData.images.length < 5 && (
                                <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="cursor-pointer"
                                    >
                                        <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Click to upload images (max 5, 5MB
                                            each)
                                        </p>
                                    </label>
                                </div>
                            )}

                            {/* Image Preview */}
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                                    {formData.images.map((image, index) => (
                                        <div
                                            key={index}
                                            className="group relative"
                                        >
                                            <img
                                                src={image}
                                                alt={`Review image ${index + 1}`}
                                                className="h-24 w-full rounded-lg border border-gray-200 object-cover dark:border-gray-600/50"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeImage(index)
                                                }
                                                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ReviewForm;

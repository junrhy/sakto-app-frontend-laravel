import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Edit, GripVertical, Star, Trash2, Upload } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

interface ProductImage {
    id?: number;
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
    sort_order: number;
    file?: File;
}

interface ImageUploaderProps {
    images: ProductImage[];
    onImagesChange: (images: ProductImage[]) => void;
    maxImages?: number;
    maxFileSize?: number; // in MB
}

export default function ImageUploader({
    images,
    onImagesChange,
    maxImages = 10,
    maxFileSize = 2,
}: ImageUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback(
        (files: FileList | null) => {
            if (!files) return;

            const newImages: ProductImage[] = [];
            const allowedTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'image/webp',
            ];

            Array.from(files).forEach((file) => {
                // Check file type
                if (!allowedTypes.includes(file.type)) {
                    alert(
                        `File ${file.name} is not a valid image type. Please use JPEG, PNG, GIF, or WebP.`,
                    );
                    return;
                }

                // Check file size
                if (file.size > maxFileSize * 1024 * 1024) {
                    alert(
                        `File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`,
                    );
                    return;
                }

                // Check if we've reached the maximum number of images
                if (images.length + newImages.length >= maxImages) {
                    alert(`Maximum ${maxImages} images allowed.`);
                    return;
                }

                const imageUrl = URL.createObjectURL(file);
                newImages.push({
                    image_url: imageUrl,
                    alt_text: '',
                    is_primary: images.length + newImages.length === 0, // First image is primary
                    sort_order: images.length + newImages.length,
                    file: file,
                });
            });

            if (newImages.length > 0) {
                onImagesChange([...images, ...newImages]);
            }
        },
        [images, onImagesChange, maxImages, maxFileSize],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFileSelect(e.dataTransfer.files);
        },
        [handleFileSelect],
    );

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);

        // If we removed the primary image, make the first remaining image primary
        if (images[index].is_primary && newImages.length > 0) {
            newImages[0].is_primary = true;
        }

        // Update sort order
        newImages.forEach((img, i) => {
            img.sort_order = i;
        });

        onImagesChange(newImages);
    };

    const setPrimaryImage = (index: number) => {
        const newImages = images.map((img, i) => ({
            ...img,
            is_primary: i === index,
        }));
        onImagesChange(newImages);
    };

    const updateAltText = (index: number, altText: string) => {
        const newImages = [...images];
        newImages[index].alt_text = altText;
        onImagesChange(newImages);
    };

    const moveImage = (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;

        const newImages = [...images];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);

        // Update sort order
        newImages.forEach((img, i) => {
            img.sort_order = i;
        });

        onImagesChange(newImages);
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Product Images</Label>
                <p className="mt-1 text-sm text-gray-500">
                    Upload up to {maxImages} images. First image will be the
                    primary image.
                </p>
            </div>

            {/* Upload Area */}
            {images.length < maxImages && (
                <div
                    className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                        isDragOver
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Drag and drop images here, or{' '}
                            <button
                                type="button"
                                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                browse
                            </button>
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Maximum {maxFileSize}MB per image. Supported: JPEG,
                            PNG, GIF, WebP
                        </p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files)}
                    />
                </div>
            )}

            {/* Images Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {images.map((image, index) => (
                        <Card key={index} className="group relative">
                            <CardContent className="p-2">
                                <div className="relative aspect-square">
                                    <img
                                        src={image.image_url}
                                        alt={
                                            image.alt_text ||
                                            `Product image ${index + 1}`
                                        }
                                        className="h-full w-full rounded-md object-cover"
                                    />

                                    {/* Primary Badge */}
                                    {image.is_primary && (
                                        <Badge className="absolute left-2 top-2 bg-yellow-500 hover:bg-yellow-600">
                                            <Star className="mr-1 h-3 w-3" />
                                            Primary
                                        </Badge>
                                    )}

                                    {/* Actions Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black bg-opacity-0 transition-all duration-200 group-hover:bg-opacity-50">
                                        <div className="flex space-x-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {!image.is_primary && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setPrimaryImage(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <Star className="mr-2 h-4 w-4" />
                                                            Set as Primary
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            removeImage(index)
                                                        }
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Drag Handle */}
                                    <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                        <GripVertical className="h-4 w-4 cursor-move text-white" />
                                    </div>
                                </div>

                                {/* Alt Text Input */}
                                <div className="mt-2">
                                    <Input
                                        type="text"
                                        placeholder="Alt text (optional)"
                                        value={image.alt_text || ''}
                                        onChange={(e) =>
                                            updateAltText(index, e.target.value)
                                        }
                                        className="text-xs"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Image Count */}
            {images.length > 0 && (
                <div className="text-sm text-gray-500">
                    {images.length} of {maxImages} images uploaded
                </div>
            )}
        </div>
    );
}

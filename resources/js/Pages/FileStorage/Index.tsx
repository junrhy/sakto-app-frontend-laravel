import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Upload,
    Search,
    Filter,
    Folder,
    FolderPlus,
    Grid3X3,
    List,
    MoreVertical,
    Copy,
    Download,
    Trash2,
    Edit,
    Eye,
    FileText,
    Image as ImageIcon,
    Video,
    Music,
    File,
    X,
} from 'lucide-react';
import { format } from 'date-fns';

interface FileStorageItem {
    id: number;
    name: string;
    original_name: string;
    file_url: string;
    mime_type: string;
    file_size: string;
    file_type: string;
    description?: string;
    folder?: string;
    tags?: string[];
    download_count: number;
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    files: FileStorageItem[];
    folders: string[];
    filters: {
        folder?: string;
        file_type?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
    };
}

export default function Index({ auth, files, folders, filters: initialFilters }: Props) {
    const [search, setSearch] = useState(initialFilters.search || '');
    const [selectedFolder, setSelectedFolder] = useState(initialFilters.folder || 'all');
    const [selectedFileType, setSelectedFileType] = useState(initialFilters.file_type || 'all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileStorageItem | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [availableFolders, setAvailableFolders] = useState<string[]>(folders);

    const uploadForm = useForm({
        file: null as File | null,
        name: '',
        description: '',
        folder: '',
        tags: [] as string[],
    });

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

    const editForm = useForm({
        name: '',
        description: '',
        folder: '',
        tags: [] as string[],
    });

    // Calculate folder file counts
    const folderFileCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        files.forEach((file) => {
            if (file.folder) {
                counts[file.folder] = (counts[file.folder] || 0) + 1;
            }
        });
        return counts;
    }, [files]);

    const filteredFiles = useMemo(() => {
        let filtered = files;

        // Folder filter
        if (selectedFolder === 'all') {
            // When viewing all, only show files without folders (exclude files in folders)
            filtered = filtered.filter((file) => !file.folder);
        } else if (selectedFolder === 'none') {
            // Show files without folders
            filtered = filtered.filter((file) => !file.folder);
        } else {
            // Show files in the selected folder
            filtered = filtered.filter((file) => file.folder === selectedFolder);
        }

        // Search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (file) =>
                    file.name.toLowerCase().includes(searchLower) ||
                    file.original_name.toLowerCase().includes(searchLower) ||
                    file.description?.toLowerCase().includes(searchLower) ||
                    file.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
            );
        }

        // File type filter
        if (selectedFileType !== 'all') {
            filtered = filtered.filter((file) => file.file_type === selectedFileType);
        }

        // Sort
        const sortBy = initialFilters.sort_by || 'created_at';
        const sortOrder = initialFilters.sort_order || 'desc';
        filtered.sort((a, b) => {
            let aVal: any = a[sortBy as keyof FileStorageItem];
            let bVal: any = b[sortBy as keyof FileStorageItem];

            if (sortBy === 'file_size') {
                aVal = parseInt(aVal || '0');
                bVal = parseInt(bVal || '0');
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    }, [files, search, selectedFolder, selectedFileType, initialFilters]);

    // Filter folders based on search (only show folders that match search or are already selected)
    const filteredFolders = useMemo(() => {
        if (!search.trim() && selectedFolder === 'all') {
            return availableFolders;
        }
        
        // If searching, only show folders that contain files matching the search
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            return availableFolders.filter((folder) => {
                const folderFiles = files.filter((file) => file.folder === folder);
                return folderFiles.some(
                    (file) =>
                        file.name.toLowerCase().includes(searchLower) ||
                        file.original_name.toLowerCase().includes(searchLower) ||
                        file.description?.toLowerCase().includes(searchLower) ||
                        file.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
                );
            });
        }
        
        return availableFolders;
    }, [availableFolders, files, search, selectedFolder]);

    const handleFolderClick = (folderName: string) => {
        setSelectedFolder(folderName);
        // Update URL to reflect folder filter
        router.get(route('file-storage.index'), {
            folder: folderName,
            file_type: selectedFileType !== 'all' ? selectedFileType : undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleUpload = async () => {
        if (!uploadForm.data.file) {
            toast.error('Please select a file to upload');
            return;
        }

        // Client-side file size validation - prevent request if file is too large
        const fileSize = uploadForm.data.file.size;
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
        
        console.log('File size check:', {
            fileSize,
            fileSizeMB,
            MAX_FILE_SIZE,
            maxSizeMB,
            isTooLarge: fileSize > MAX_FILE_SIZE
        });
        
        if (fileSize > MAX_FILE_SIZE) {
            toast.error(`File too large! Selected file is ${fileSizeMB}MB. Maximum allowed size is ${maxSizeMB}MB. Please select a smaller file.`, {
                duration: 5000,
            });
            // Clear the file input to prevent accidental submission
            uploadForm.setData('file', null);
            return;
        }
        
        // Additional safety check - show warning if file is close to limit
        if (fileSize > MAX_FILE_SIZE * 0.9) {
            toast.warning(`File size (${fileSizeMB}MB) is close to the limit. Proceeding with upload...`, {
                duration: 3000,
            });
        }

        // Only proceed with upload if file size is valid
        // Use router.post directly to have better error handling
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        if (!csrfToken) {
            toast.error('CSRF token not found. Please refresh the page.');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', uploadForm.data.file);
        formData.append('_token', csrfToken); // Include CSRF token in form data
        if (uploadForm.data.name) {
            formData.append('name', uploadForm.data.name);
        }
        if (uploadForm.data.description) {
            formData.append('description', uploadForm.data.description);
        }
        if (uploadForm.data.folder) {
            formData.append('folder', uploadForm.data.folder);
        }
        
        // Make the request manually to catch 413 errors properly
        // Note: Don't set Content-Type header - browser will set it with boundary for FormData
        try {
            const response = await fetch(route('file-storage.store'), {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken, // Also include in header for Laravel
                    'Accept': 'application/json, text/html',
                },
                body: formData,
                credentials: 'same-origin', // Include cookies for CSRF
            });
            
            console.log('Upload response status:', response.status);
            
            // Handle 413 error directly
            if (response.status === 413) {
                toast.error(`File is too large. Maximum file size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB. Please select a smaller file.`, {
                    duration: 6000,
                });
                return;
            }
            
            // Handle 419 CSRF token mismatch
            if (response.status === 419) {
                toast.error('CSRF token mismatch. Please refresh the page and try again.', {
                    duration: 6000,
                });
                // Optionally reload the page to get a fresh CSRF token
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                return;
            }
            
            // Handle other error statuses (4xx, 5xx)
            if (!response.ok) {
                let errorMessage = '';
                const file = uploadForm.data.file;
                const fileSize = file ? file.size : 0;
                const isLargeFile = fileSize > MAX_FILE_SIZE;
                
                try {
                    const errorData = await response.json();
                    // Handle both string error and array of errors
                    if (typeof errorData.error === 'string') {
                        errorMessage = errorData.error;
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.errors && typeof errorData.errors === 'object') {
                        // Laravel validation errors
                        const errorValues = Object.values(errorData.errors).flat();
                        errorMessage = errorValues[0] as string || '';
                    }
                } catch (e) {
                    // If response is not JSON, try to get text
                    try {
                        const text = await response.text();
                        errorMessage = text || '';
                    } catch (e2) {
                        // Use default error message based on status code
                    }
                }
                
                const errorMsgLower = errorMessage.toLowerCase();
                
                // Check if file is large - prioritize file size error if file exceeds limit
                if (isLargeFile) {
                    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
                    toast.error(`File is too large (${fileSizeMB}MB). Maximum file size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB. Please select a smaller file.`, {
                        duration: 6000,
                    });
                    return;
                }
                
                // Handle file size errors from server response
                if (errorMsgLower.includes('too large') || 
                    errorMsgLower.includes('413') || 
                    errorMsgLower.includes('entity too large') ||
                    errorMsgLower.includes('request entity too large') ||
                    errorMsgLower.includes('exceed') ||
                    errorMsgLower.includes('max') ||
                    errorMsgLower.includes('size') ||
                    response.status === 413) {
                    toast.error(`File is too large. Maximum file size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB. Please select a smaller file.`, {
                        duration: 6000,
                    });
                    return;
                } 
                // Handle validation errors
                else if (response.status === 422 && errorMessage) {
                    toast.error(errorMessage, {
                        duration: 5000,
                    });
                    return;
                }
                // Handle server errors (500)
                else if (response.status === 500) {
                    // Check if it might be a file size issue even with 500 status
                    if (fileSize > MAX_FILE_SIZE * 0.8) {
                        toast.error(`File is too large. Maximum file size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB. Please select a smaller file.`, {
                            duration: 6000,
                        });
                    } else {
                        toast.error('Server error occurred. Please try again in a few moments. If the problem persists, contact support.', {
                            duration: 6000,
                        });
                    }
                    return;
                }
                // Handle not found (404)
                else if (response.status === 404) {
                    toast.error('Upload endpoint not found. Please refresh the page and try again.', {
                        duration: 5000,
                    });
                    return;
                }
                // Handle unauthorized (401)
                else if (response.status === 401) {
                    toast.error('Your session has expired. Please refresh the page and log in again.', {
                        duration: 6000,
                    });
                    return;
                }
                // Handle forbidden (403)
                else if (response.status === 403) {
                    toast.error('You do not have permission to upload files. Please contact your administrator.', {
                        duration: 6000,
                    });
                    return;
                }
                // Handle custom error message if available
                else if (errorMessage) {
                    toast.error(errorMessage, {
                        duration: 5000,
                    });
                    return;
                }
                // Generic error message - but check if file might be too large
                else {
                    // If file is large but we didn't catch it earlier, assume it's a size issue
                    if (fileSize > MAX_FILE_SIZE * 0.8) {
                        toast.error(`File is too large. Maximum file size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB. Please select a smaller file.`, {
                            duration: 6000,
                        });
                    } else {
                        toast.error('Unable to upload file. Please check your connection and try again.', {
                            duration: 5000,
                        });
                    }
                }
                return;
            }
            
            // Response is OK (200-299), now check the content
            const contentType = response.headers.get('content-type') || '';
            
            // Handle JSON response
            if (contentType.includes('application/json')) {
                const responseData = await response.json();
                
                // Check if response contains error (even with 200 status)
                if (responseData.error) {
                    const errorMsg = typeof responseData.error === 'string' 
                        ? responseData.error 
                        : JSON.stringify(responseData.error);
                    
                    const errorMsgLower = errorMsg.toLowerCase();
                    
                    // Handle file size errors
                    if (errorMsgLower.includes('too large') || 
                        errorMsgLower.includes('413') || 
                        errorMsgLower.includes('entity too large') ||
                        errorMsgLower.includes('exceed') ||
                        errorMsgLower.includes('max')) {
                        toast.error(`File is too large. Maximum file size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB. Please select a smaller file.`, {
                            duration: 6000,
                        });
                    }
                    // Handle API errors
                    else if (errorMsgLower.includes('api') || errorMsgLower.includes('backend')) {
                        toast.error('Unable to save file information. Please try again.', {
                            duration: 5000,
                        });
                    }
                    // Handle generic error messages
                    else {
                        toast.error(errorMsg, {
                            duration: 5000,
                        });
                    }
                    return;
                }
                
                // Check for success status
                if (responseData.status === 'success' || responseData.message) {
                    toast.success(responseData.message || 'File uploaded successfully');
                    setUploadDialogOpen(false);
                    uploadForm.reset();
                    router.reload({ only: ['files', 'folders'] });
                    return;
                }
                
                // If no error and no success flag, assume success
                toast.success('File uploaded successfully');
                setUploadDialogOpen(false);
                uploadForm.reset();
                router.reload({ only: ['files', 'folders'] });
                return;
            }
            
            // Handle HTML response (redirects) - check for errors in HTML
            if (contentType.includes('text/html')) {
                const responseText = await response.text();
                
                // Check if HTML contains error indicators
                if (responseText.includes('error') || 
                    responseText.includes('413') || 
                    responseText.includes('too large') ||
                    responseText.includes('Request Entity Too Large')) {
                    
                    if (responseText.includes('too large') || responseText.includes('413') || responseText.includes('Request Entity Too Large')) {
                        toast.error(`File is too large. Maximum file size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB. Please select a smaller file.`, {
                            duration: 6000,
                        });
                        return;
                    }
                    
                    // Check for validation errors in HTML
                    if (responseText.includes('validation') || responseText.includes('required')) {
                        toast.error('Please check the file and form fields, then try again.', {
                            duration: 5000,
                        });
                    } else {
                        toast.error('An error occurred during upload. Please try again.', {
                            duration: 5000,
                        });
                    }
                    return;
                }
                
                // If HTML doesn't contain errors, treat as success (Laravel redirect)
                toast.success('File uploaded successfully');
                setUploadDialogOpen(false);
                uploadForm.reset();
                router.reload({ only: ['files', 'folders'] });
                return;
            }
            
            // Default: if we got here with OK status and unknown content type, treat as success
            toast.success('File uploaded successfully');
            setUploadDialogOpen(false);
            uploadForm.reset();
            router.reload({ only: ['files', 'folders'] });
        } catch (error) {
            console.error('Upload catch error:', error);
            const errorMsg = error instanceof Error ? error.message : String(error);
            const errorMsgLower = errorMsg.toLowerCase();
            
            // Handle network errors
            if (errorMsgLower.includes('network') || 
                errorMsgLower.includes('fetch') || 
                errorMsgLower.includes('connection') ||
                errorMsgLower.includes('failed to fetch')) {
                toast.error('Network connection error. Please check your internet connection and try again.', {
                    duration: 6000,
                });
            }
            // Handle file size errors
            else if (errorMsgLower.includes('413') ||
                errorMsgLower.includes('too large') ||
                errorMsgLower.includes('request entity too large') ||
                errorMsgLower.includes('entity too large')) {
                toast.error(`File is too large. Maximum file size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB. Please select a smaller file.`, {
                    duration: 6000,
                });
            }
            // Handle timeout errors
            else if (errorMsgLower.includes('timeout') || errorMsgLower.includes('aborted')) {
                toast.error('Upload timed out. The file may be too large or your connection is slow. Please try again.', {
                    duration: 6000,
                });
            }
            // Generic error
            else {
                toast.error('An unexpected error occurred. Please try again. If the problem persists, contact support.', {
                    duration: 6000,
                });
            }
        }
    };

    const handleDelete = (file: FileStorageItem) => {
        if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
            return;
        }

        router.delete(route('file-storage.destroy', file.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('File deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete file');
            },
        });
    };

    const handleCopyUrl = (file: FileStorageItem) => {
        navigator.clipboard.writeText(file.file_url);
        toast.success('File URL copied to clipboard');
    };

    const handleDownload = (file: FileStorageItem) => {
        window.open(route('file-storage.download', file.id), '_blank');
    };

    const handleEdit = (file: FileStorageItem) => {
        setSelectedFile(file);
        editForm.setData({
            name: file.name,
            description: file.description || '',
            folder: file.folder || '',
            tags: file.tags || [],
        });
        setEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!selectedFile) return;

        editForm.put(route('file-storage.update', selectedFile.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('File updated successfully');
                setEditDialogOpen(false);
                setSelectedFile(null);
            },
            onError: () => {
                toast.error('Failed to update file');
            },
        });
    };

    const handlePreview = (file: FileStorageItem) => {
        setSelectedFile(file);
        setPreviewDialogOpen(true);
    };

    const formatFileSize = (bytes: string) => {
        const size = parseInt(bytes);
        if (size >= 1073741824) {
            return `${(size / 1073741824).toFixed(2)} GB`;
        } else if (size >= 1048576) {
            return `${(size / 1048576).toFixed(2)} MB`;
        } else if (size >= 1024) {
            return `${(size / 1024).toFixed(2)} KB`;
        } else {
            return `${size} bytes`;
        }
    };

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'image':
                return <ImageIcon className="h-8 w-8 text-blue-500" />;
            case 'video':
                return <Video className="h-8 w-8 text-purple-500" />;
            case 'audio':
                return <Music className="h-8 w-8 text-green-500" />;
            case 'document':
                return <FileText className="h-8 w-8 text-orange-500" />;
            default:
                return <File className="h-8 w-8 text-gray-500" />;
        }
    };

    const handleCreateFolder = () => {
        const folderName = newFolderName.trim();
        if (!folderName) {
            toast.error('Please enter a folder name');
            return;
        }

        // Check if folder already exists
        if (availableFolders.includes(folderName)) {
            toast.error(`Folder "${folderName}" already exists`);
            return;
        }

        // Add folder to available folders list
        setAvailableFolders([...availableFolders, folderName]);
        setNewFolderName('');
        setShowNewFolderInput(false);
        
        // If called from upload/edit dialog, also set it as selected
        toast.success(`Folder "${folderName}" created. It will be created when you upload a file to it.`, {
            duration: 3000,
        });
    };

    // Update available folders when folders prop changes
    useEffect(() => {
        setAvailableFolders(folders);
    }, [folders]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        File Storage
                    </h2>
                    <Button
                        onClick={() => setUploadDialogOpen(true)}
                        className="gap-2"
                    >
                        <Upload className="h-4 w-4" />
                        Upload File
                    </Button>
                </div>
            }
        >
            <Head title="File Storage" />

            <div className="space-y-6 py-6">
                {/* Filters and Search */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Filter and search your files
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search files..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <Select
                                value={selectedFolder}
                                onValueChange={setSelectedFolder}
                            >
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="All Folders" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Folders</SelectItem>
                                    <SelectItem value="none">No Folder</SelectItem>
                                    {availableFolders.map((folder) => (
                                        <SelectItem key={folder} value={folder}>
                                            {folder}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={selectedFileType}
                                onValueChange={setSelectedFileType}
                            >
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="image">Images</SelectItem>
                                    <SelectItem value="document">Documents</SelectItem>
                                    <SelectItem value="video">Videos</SelectItem>
                                    <SelectItem value="audio">Audio</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex gap-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Folders Section - Only show when not filtering by a specific folder */}
                {selectedFolder === 'all' && filteredFolders.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Folders</CardTitle>
                            <CardDescription>
                                Click on a folder to view its files
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {filteredFolders.map((folder) => (
                                    <FolderCard
                                        key={folder}
                                        folderName={folder}
                                        fileCount={folderFileCounts[folder] || 0}
                                        onClick={() => handleFolderClick(folder)}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Files Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {selectedFolder !== 'all' && (
                                    <>
                                        <Folder className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        <CardTitle className="text-lg">
                                            {selectedFolder === 'none' ? 'Files without folder' : `Folder: ${selectedFolder}`}
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedFolder('all');
                                                router.get(route('file-storage.index'), {
                                                    file_type: selectedFileType !== 'all' ? selectedFileType : undefined,
                                                    search: search || undefined,
                                                }, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                });
                                            }}
                                            className="ml-2 h-6 text-xs"
                                        >
                                            Show All
                                        </Button>
                                    </>
                                )}
                                {selectedFolder === 'all' && (
                                    <CardTitle className="text-lg">Files</CardTitle>
                                )}
                            </div>
                            {filteredFiles.length > 0 && (
                                <CardDescription>
                                    {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
                                </CardDescription>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <File className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                                <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">
                                    No files found
                                </p>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                                    {selectedFolder === 'all' ? 'Upload your first file to get started' : 'No files in this folder'}
                                </p>
                                {selectedFolder === 'all' && (
                                    <Button
                                        onClick={() => setUploadDialogOpen(true)}
                                        className="mt-4 gap-2"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload File
                                    </Button>
                                )}
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredFiles.map((file) => (
                                    <FileCard
                                        key={file.id}
                                        file={file}
                                        onCopyUrl={handleCopyUrl}
                                        onDownload={handleDownload}
                                        onDelete={handleDelete}
                                        onEdit={handleEdit}
                                        onPreview={handlePreview}
                                        formatFileSize={formatFileSize}
                                        getFileIcon={getFileIcon}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredFiles.map((file) => (
                                    <FileListItem
                                        key={file.id}
                                        file={file}
                                        onCopyUrl={handleCopyUrl}
                                        onDownload={handleDownload}
                                        onDelete={handleDelete}
                                        onEdit={handleEdit}
                                        onPreview={handlePreview}
                                        formatFileSize={formatFileSize}
                                        getFileIcon={getFileIcon}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upload Dialog */}
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Upload File</DialogTitle>
                            <DialogDescription>
                                Upload a new file to your storage
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="file">File</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            // Immediate validation on file selection - prevent selecting large files
                                            if (file.size > MAX_FILE_SIZE) {
                                                const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                                                const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
                                                toast.error(`File too large! Selected file is ${fileSizeMB}MB. Maximum allowed size is ${maxSizeMB}MB. Please select a smaller file.`, {
                                                    duration: 5000,
                                                });
                                                e.target.value = ''; // Clear the input
                                                uploadForm.setData('file', null); // Clear form data
                                                return;
                                            }
                                            uploadForm.setData('file', file);
                                            uploadForm.setData('name', file.name.replace(/\.[^/.]+$/, ''));
                                        }
                                    }}
                                    className="mt-1"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Max file size: {(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB
                                </p>
                                {uploadForm.data.file && (
                                    <p className={`mt-1 text-sm ${
                                        uploadForm.data.file.size > MAX_FILE_SIZE 
                                            ? 'text-red-600 dark:text-red-400' 
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                        Selected: {uploadForm.data.file.name} ({(uploadForm.data.file.size / (1024 * 1024)).toFixed(2)}MB)
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={uploadForm.data.name}
                                    onChange={(e) => uploadForm.setData('name', e.target.value)}
                                    placeholder="File name (optional)"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={uploadForm.data.description}
                                    onChange={(e) => uploadForm.setData('description', e.target.value)}
                                    placeholder="File description (optional)"
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="folder">Folder</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setShowNewFolderInput(!showNewFolderInput);
                                            if (!showNewFolderInput) {
                                                setNewFolderName('');
                                            }
                                        }}
                                        className="h-7 gap-1 text-xs"
                                    >
                                        <FolderPlus className="h-3 w-3" />
                                        {showNewFolderInput ? 'Cancel' : 'New Folder'}
                                    </Button>
                                </div>
                                {showNewFolderInput ? (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Folder name"
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (newFolderName.trim() && !availableFolders.includes(newFolderName.trim())) {
                                                        const folderName = newFolderName.trim();
                                                        setAvailableFolders([...availableFolders, folderName]);
                                                        uploadForm.setData('folder', folderName);
                                                        setNewFolderName('');
                                                        setShowNewFolderInput(false);
                                                        toast.success(`Folder "${folderName}" created`);
                                                    }
                                                }
                                            }}
                                            autoFocus
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => {
                                                if (newFolderName.trim() && !availableFolders.includes(newFolderName.trim())) {
                                                    const folderName = newFolderName.trim();
                                                    setAvailableFolders([...availableFolders, folderName]);
                                                    uploadForm.setData('folder', folderName);
                                                    setNewFolderName('');
                                                    setShowNewFolderInput(false);
                                                    toast.success(`Folder "${folderName}" created`);
                                                } else if (newFolderName.trim() && availableFolders.includes(newFolderName.trim())) {
                                                    toast.error(`Folder "${newFolderName.trim()}" already exists`);
                                                }
                                            }}
                                        >
                                            Create
                                        </Button>
                                    </div>
                                ) : (
                                    <Select
                                        value={uploadForm.data.folder || 'none'}
                                        onValueChange={(value) => uploadForm.setData('folder', value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select folder" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Folder</SelectItem>
                                            {availableFolders.map((folder) => (
                                                <SelectItem key={folder} value={folder}>
                                                    {folder}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setUploadDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={uploadForm.processing || !uploadForm.data.file}
                            >
                                {uploadForm.processing ? 'Uploading...' : 'Upload'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit File</DialogTitle>
                            <DialogDescription>
                                Update file information
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="edit-folder">Folder</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setShowNewFolderInput(!showNewFolderInput);
                                            if (!showNewFolderInput) {
                                                setNewFolderName('');
                                            }
                                        }}
                                        className="h-7 gap-1 text-xs"
                                    >
                                        <FolderPlus className="h-3 w-3" />
                                        {showNewFolderInput ? 'Cancel' : 'New Folder'}
                                    </Button>
                                </div>
                                {showNewFolderInput ? (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Folder name"
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (newFolderName.trim() && !availableFolders.includes(newFolderName.trim())) {
                                                        const folderName = newFolderName.trim();
                                                        setAvailableFolders([...availableFolders, folderName]);
                                                        editForm.setData('folder', folderName);
                                                        setNewFolderName('');
                                                        setShowNewFolderInput(false);
                                                        toast.success(`Folder "${folderName}" created`);
                                                    }
                                                }
                                            }}
                                            autoFocus
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => {
                                                if (newFolderName.trim() && !availableFolders.includes(newFolderName.trim())) {
                                                    const folderName = newFolderName.trim();
                                                    setAvailableFolders([...availableFolders, folderName]);
                                                    editForm.setData('folder', folderName);
                                                    setNewFolderName('');
                                                    setShowNewFolderInput(false);
                                                    toast.success(`Folder "${folderName}" created`);
                                                } else if (newFolderName.trim() && availableFolders.includes(newFolderName.trim())) {
                                                    toast.error(`Folder "${newFolderName.trim()}" already exists`);
                                                }
                                            }}
                                        >
                                            Create
                                        </Button>
                                    </div>
                                ) : (
                                    <Select
                                        value={editForm.data.folder || 'none'}
                                        onValueChange={(value) => editForm.setData('folder', value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select folder" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Folder</SelectItem>
                                            {availableFolders.map((folder) => (
                                                <SelectItem key={folder} value={folder}>
                                                    {folder}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setEditDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdate}
                                disabled={editForm.processing}
                            >
                                {editForm.processing ? 'Updating...' : 'Update'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Preview Dialog */}
                <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>{selectedFile?.name}</DialogTitle>
                            <DialogDescription>
                                {selectedFile?.description || 'No description'}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedFile && (
                            <div className="space-y-4">
                                {selectedFile.file_type === 'image' ? (
                                    <img
                                        src={selectedFile.file_url}
                                        alt={selectedFile.name}
                                        className="w-full rounded-lg"
                                    />
                                ) : (
                                    <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                        {getFileIcon(selectedFile.file_type)}
                                        <p className="ml-2 text-gray-600 dark:text-gray-400">
                                            Preview not available for this file type
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Size:</span>{' '}
                                        {formatFileSize(selectedFile.file_size)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Type:</span>{' '}
                                        {selectedFile.file_type}
                                    </div>
                                    <div>
                                        <span className="font-medium">Uploaded:</span>{' '}
                                        {format(new Date(selectedFile.created_at), 'PPp')}
                                    </div>
                                    <div>
                                        <span className="font-medium">Downloads:</span>{' '}
                                        {selectedFile.download_count}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleCopyUrl(selectedFile)}
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <Copy className="h-4 w-4" />
                                        Copy URL
                                    </Button>
                                    <Button
                                        onClick={() => handleDownload(selectedFile)}
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}

// Folder Card Component
interface FolderCardProps {
    folderName: string;
    fileCount: number;
    onClick: () => void;
}

function FolderCard({ folderName, fileCount, onClick }: FolderCardProps) {
    return (
        <Card 
            className="group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 transition-all duration-300 hover:shadow-lg hover:scale-105 dark:from-blue-900/20 dark:to-indigo-900/20"
            onClick={onClick}
        >
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Folder className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="truncate text-base font-semibold text-gray-900 dark:text-white">
                            {folderName}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {fileCount} file{fileCount !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// File Card Component
interface FileCardProps {
    file: FileStorageItem;
    onCopyUrl: (file: FileStorageItem) => void;
    onDownload: (file: FileStorageItem) => void;
    onDelete: (file: FileStorageItem) => void;
    onEdit: (file: FileStorageItem) => void;
    onPreview: (file: FileStorageItem) => void;
    formatFileSize: (bytes: string) => string;
    getFileIcon: (fileType: string) => JSX.Element;
}

function FileCard({
    file,
    onCopyUrl,
    onDownload,
    onDelete,
    onEdit,
    onPreview,
    formatFileSize,
    getFileIcon,
}: FileCardProps) {
    return (
        <Card className="group overflow-hidden border-0 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:bg-gray-800/50">
            {/* File Preview/Icon */}
            <div
                className="relative h-48 cursor-pointer overflow-hidden bg-gray-100 dark:bg-gray-700"
                onClick={() => onPreview(file)}
            >
                {file.file_type === 'image' ? (
                    <img
                        src={file.file_url}
                        alt={file.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        {getFileIcon(file.file_type)}
                    </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPreview(file);
                            }}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload(file);
                            }}
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="truncate text-base font-semibold text-gray-900 dark:text-white">
                            {file.name}
                        </CardTitle>
                        <CardDescription className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                            {file.original_name}
                        </CardDescription>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onCopyUrl(file)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDownload(file)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(file)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(file)}
                                className="text-red-600 dark:text-red-400"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between">
                        <span>Size:</span>
                        <span className="font-medium">{formatFileSize(file.file_size)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Type:</span>
                        <span className="font-medium capitalize">{file.file_type}</span>
                    </div>
                    {file.folder && (
                        <div className="flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            <span className="truncate">{file.folder}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span>Uploaded:</span>
                        <span>{format(new Date(file.created_at), 'MMM d, yyyy')}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// File List Item Component
function FileListItem({
    file,
    onCopyUrl,
    onDownload,
    onDelete,
    onEdit,
    onPreview,
    formatFileSize,
    getFileIcon,
}: FileCardProps) {
    return (
        <div className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
            <div
                className="flex h-12 w-12 cursor-pointer items-center justify-center"
                onClick={() => onPreview(file)}
            >
                {file.file_type === 'image' ? (
                    <img
                        src={file.file_url}
                        alt={file.name}
                        className="h-full w-full rounded object-cover"
                    />
                ) : (
                    getFileIcon(file.file_type)
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                        {file.name}
                    </h3>
                    {file.folder && (
                        <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            <Folder className="h-3 w-3" />
                            {file.folder}
                        </span>
                    )}
                </div>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {file.original_name}
                </p>
                <div className="mt-1 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span className="capitalize">{file.file_type}</span>
                    <span>{format(new Date(file.created_at), 'MMM d, yyyy')}</span>
                    <span>{file.download_count} downloads</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onCopyUrl(file)}
                    title="Copy URL"
                >
                    <Copy className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownload(file)}
                    title="Download"
                >
                    <Download className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(file)}
                    title="Edit"
                >
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(file)}
                    title="Delete"
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}


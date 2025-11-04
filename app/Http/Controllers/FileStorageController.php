<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FileStorageController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $params = [
                'client_identifier' => $clientIdentifier,
            ];
            
            // Add filters if provided
            if ($request->has('folder')) {
                $params['folder'] = $request->input('folder');
            }
            
            if ($request->has('file_type')) {
                $params['file_type'] = $request->input('file_type');
            }
            
            if ($request->has('search')) {
                $params['search'] = $request->input('search');
            }
            
            if ($request->has('sort_by')) {
                $params['sort_by'] = $request->input('sort_by');
            }
            
            if ($request->has('sort_order')) {
                $params['sort_order'] = $request->input('sort_order');
            }
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/file-storage", $params);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            $files = $response->json()['data'] ?? [];
            
            // Get folders
            $foldersResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/file-storage/folders", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            $folders = $foldersResponse->successful() 
                ? ($foldersResponse->json()['data'] ?? [])
                : [];
            
            return Inertia::render('FileStorage/Index', [
                'files' => $files,
                'folders' => $folders,
                'filters' => [
                    'folder' => $request->input('folder'),
                    'file_type' => $request->input('file_type'),
                    'search' => $request->input('search'),
                    'sort_by' => $request->input('sort_by', 'created_at'),
                    'sort_order' => $request->input('sort_order', 'desc'),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('FileStorageController@index error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to load files: ' . $e->getMessage()]);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'file' => 'required|file|max:51200', // max 50MB (in kilobytes: 50 * 1024)
                'name' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'folder' => 'nullable|string|max:255',
                'tags' => 'nullable|array',
            ], [
                'file.max' => 'The file size must not exceed 50MB.',
                'file.required' => 'Please select a file to upload.',
            ]);
            
            $file = $request->file('file');
            $clientIdentifier = auth()->user()->identifier;
            
            // Store file in public storage
            $path = $file->store('file-storage', 'public');
            $fileUrl = Storage::disk('public')->url($path);
            
            // Get file info
            $originalName = $file->getClientOriginalName();
            $mimeType = $file->getMimeType();
            $fileSize = $file->getSize();
            // Determine file type from mime type
            $fileType = 'other';
            if (str_starts_with($mimeType, 'image/')) {
                $fileType = 'image';
            } elseif (str_starts_with($mimeType, 'video/')) {
                $fileType = 'video';
            } elseif (str_starts_with($mimeType, 'audio/')) {
                $fileType = 'audio';
            } elseif (in_array($mimeType, [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain',
                'text/csv',
            ])) {
                $fileType = 'document';
            }
            
            // Prepare data for API (only URL, not file_path)
            $apiData = [
                'client_identifier' => $clientIdentifier,
                'name' => $validated['name'] ?? pathinfo($originalName, PATHINFO_FILENAME),
                'original_name' => $originalName,
                'file_url' => $fileUrl,
                'mime_type' => $mimeType,
                'file_size' => (string) $fileSize,
                'file_type' => $fileType,
                'description' => $validated['description'] ?? null,
                'folder' => $validated['folder'] ?? null,
                'tags' => $validated['tags'] ?? null,
            ];
            
            // Send to backend API
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/file-storage", $apiData);
            
            if (!$response->successful()) {
                // Delete file from storage if API call fails
                Storage::disk('public')->delete($path);
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            // Return JSON response for AJAX requests
            if ($request->wantsJson() || $request->ajax() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                return response()->json([
                    'status' => 'success',
                    'message' => 'File uploaded successfully',
                    'data' => $apiData
                ]);
            }
            
            return redirect()->back()->with('success', 'File uploaded successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            $errors = $e->errors();
            // Check if it's a file size error
            if (isset($errors['file']) && (str_contains(implode(' ', $errors['file']), 'max') || str_contains(implode(' ', $errors['file']), 'size'))) {
                $errorMsg = 'File size exceeds the maximum allowed size of 50MB.';
                if ($request->wantsJson() || $request->ajax() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                    return response()->json(['error' => $errorMsg], 422);
                }
                return back()->withErrors(['error' => $errorMsg]);
            }
            
            if ($request->wantsJson() || $request->ajax() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                return response()->json(['error' => $errors], 422);
            }
            return back()->withErrors($errors);
        } catch (\Exception $e) {
            Log::error('FileStorageController@store error: ' . $e->getMessage());
            
            // Check for 413 Request Entity Too Large error
            $errorMessage = $e->getMessage();
            $errorMsg = 'Unable to upload file. Please try again.';
            
            // Handle specific error types
            if (str_contains($errorMessage, '413') || str_contains($errorMessage, 'Request Entity Too Large') || str_contains($errorMessage, 'too large')) {
                $errorMsg = 'File is too large. Maximum file size is 50MB. Please select a smaller file.';
            } elseif (str_contains($errorMessage, 'API request failed')) {
                $errorMsg = 'Unable to save file information. Please try again.';
            } elseif (str_contains($errorMessage, 'storage') || str_contains($errorMessage, 'disk')) {
                $errorMsg = 'Storage error occurred. Please try again or contact support if the problem persists.';
            } elseif (str_contains($errorMessage, 'permission') || str_contains($errorMessage, 'access')) {
                $errorMsg = 'Permission denied. Please check your access rights and try again.';
            }
            
            if ($request->wantsJson() || $request->ajax() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                return response()->json(['error' => $errorMsg], 500);
            }
            
            return back()->withErrors(['error' => $errorMsg]);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'folder' => 'nullable|string|max:255',
                'tags' => 'nullable|array',
            ]);
            
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/file-storage/{$id}", array_merge($validated, [
                    'client_identifier' => $clientIdentifier
                ]));
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back()->with('success', 'File updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            Log::error('FileStorageController@update error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update file: ' . $e->getMessage()]);
        }
    }

    public function destroy(string $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Get file info first to delete from storage
            $getResponse = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/file-storage/{$id}", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if ($getResponse->successful()) {
                $fileData = $getResponse->json()['data'] ?? null;
                
                if ($fileData && isset($fileData['file_url'])) {
                    // Extract path from URL (URL format: /storage/file-storage/filename.jpg)
                    // Convert to storage path: file-storage/filename.jpg
                    $fileUrl = $fileData['file_url'];
                    $path = str_replace('/storage/', '', parse_url($fileUrl, PHP_URL_PATH));
                    
                    // Delete file from storage
                    if ($path && Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                }
            }
            
            // Delete from API
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/file-storage/{$id}", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            return redirect()->back()->with('success', 'File deleted successfully');
        } catch (\Exception $e) {
            Log::error('FileStorageController@destroy error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete file: ' . $e->getMessage()]);
        }
    }

    public function download(string $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/file-storage/{$id}", [
                    'client_identifier' => $clientIdentifier
                ]);
            
            if (!$response->successful()) {
                throw new \Exception('API request failed: ' . $response->body());
            }
            
            $fileData = $response->json()['data'];
            
            if (!$fileData || !isset($fileData['file_url'])) {
                throw new \Exception('File not found');
            }
            
            // Extract path from URL (URL format: /storage/file-storage/filename.jpg)
            // Convert to storage path: file-storage/filename.jpg
            $fileUrl = $fileData['file_url'];
            $filePath = str_replace('/storage/', '', parse_url($fileUrl, PHP_URL_PATH));
            
            if (!$filePath || !Storage::disk('public')->exists($filePath)) {
                throw new \Exception('File does not exist in storage');
            }
            
            return Storage::disk('public')->download(
                $filePath,
                $fileData['original_name'] ?? $fileData['name']
            );
        } catch (\Exception $e) {
            Log::error('FileStorageController@download error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to download file: ' . $e->getMessage()]);
        }
    }
}

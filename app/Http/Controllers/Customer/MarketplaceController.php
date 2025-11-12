<?php

namespace App\Http\Controllers\Customer;

use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceController extends CustomerProjectController
{
    public function index(Request $request, string $project, $ownerIdentifier): Response
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);
            $owner->app_currency = $this->decodeCurrency($owner->app_currency);

            $filters = $request->only([
                'search',
                'category',
                'type',
                'availability',
                'status',
                'sort',
                'price_min',
                'price_max',
                'page',
                'per_page',
            ]);

            $productsResponse = $this->fetchMarketplaceProducts($owner, $filters);
            $products = $productsResponse['data'] ?? ($productsResponse['products'] ?? []);
            $meta = $productsResponse['meta'] ?? null;

            $categories = $this->fetchProductCategories($owner);

            return Inertia::render('Customer/Marketplace/Index', [
                'community' => $owner,
                'products' => $products,
                'meta' => $meta,
                'categories' => $categories,
                'filters' => array_merge([
                    'search' => '',
                    'category' => '',
                    'type' => '',
                    'availability' => '',
                    'status' => 'published',
                    'sort' => 'latest',
                    'price_min' => null,
                    'price_max' => null,
                    'page' => 1,
                    'per_page' => 12,
                ], $filters),
                'project' => $project,
                'activeView' => $request->input('view', 'products'),
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Owner not found');
        } catch (\Throwable $th) {
            abort(500, 'Failed to load marketplace');
        }
    }

    public function overview(Request $request, string $project, $ownerIdentifier): Response
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);
            $owner->app_currency = $this->decodeCurrency($owner->app_currency);

            $productsResponse = $this->fetchMarketplaceProducts($owner, [
                'status' => 'published',
                'per_page' => 12,
                'page' => 1,
            ]);

            $ordersResponse = $this->fetchMarketplaceOrders($owner, $request->user(), [
                'per_page' => 50,
                'page' => 1,
            ]);

            return Inertia::render('Customer/Marketplace/Overview', [
                'project' => $project,
                'owner' => $this->transformOwner($owner),
                'products' => $productsResponse['data'] ?? ($productsResponse['products'] ?? []),
                'orderHistory' => $ordersResponse['data'] ?? ($ordersResponse['orders'] ?? []),
                'appCurrency' => $owner->app_currency ?? $this->decodeCurrency($request->user()->app_currency),
                'authUser' => $this->transformAuthUser($request->user()),
                'backUrl' => $this->resolveBackUrl($project, $owner),
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Owner not found');
        } catch (\Throwable $th) {
            abort(500, 'Failed to load marketplace overview');
        }
    }

    public function show(Request $request, string $project, $ownerIdentifier, $productId): Response
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);
            $owner->app_currency = $this->decodeCurrency($owner->app_currency);

            $product = $this->fetchMarketplaceProduct($owner, $productId);

            return Inertia::render('Customer/Marketplace/Product', [
                'community' => $owner,
                'product' => $product,
                'project' => $project,
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Product not found');
        } catch (\Throwable $th) {
            abort(500, 'Failed to load product');
        }
    }

    public function orders(Request $request, string $project, $ownerIdentifier): Response
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);
            $owner->app_currency = $this->decodeCurrency($owner->app_currency);

            $filters = $request->only([
                'status',
                'payment_status',
                'search',
                'page',
                'per_page',
            ]);

            $orders = $this->fetchMarketplaceOrders($owner, $request->user(), $filters);

            return Inertia::render('Customer/Marketplace/Orders', [
                'community' => $owner,
                'orders' => $orders['data'] ?? ($orders['orders'] ?? []),
                'meta' => $orders['meta'] ?? null,
                'filters' => array_merge([
                    'status' => '',
                    'payment_status' => '',
                    'search' => '',
                    'page' => 1,
                    'per_page' => 10,
                ], $filters),
                'project' => $project,
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Owner not found');
        } catch (\Throwable $th) {
            abort(500, 'Failed to load orders');
        }
    }

    public function checkout(Request $request, string $project, $ownerIdentifier): Response
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);
            $owner->app_currency = $this->decodeCurrency($owner->app_currency);

            $productsResponse = $this->fetchMarketplaceProducts($owner, [
                'status' => 'published',
                'per_page' => 50,
                'page' => 1,
            ]);

            $products = $productsResponse['data'] ?? ($productsResponse['products'] ?? []);

            return Inertia::render('Customer/Marketplace/Checkout', [
                'community' => $owner,
                'products' => $products,
                'project' => $project,
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Owner not found');
        } catch (\Throwable $th) {
            abort(500, 'Failed to load checkout');
        }
    }

    public function myProducts(Request $request, string $project, $ownerIdentifier): JsonResponse
    {
        $this->ensureCustomerProject($request, $project);

        try {
            $owner = $this->resolveOwner($project, $ownerIdentifier);

            $params = [
                'client_identifier' => $owner->identifier,
                'per_page' => $request->integer('per_page', 20),
                'page' => $request->integer('page', 1),
                'status' => $request->input('status'),
            ];

            $contactId = $request->input('contact_id') ?? $this->getDefaultContactId($request);
            if ($contactId) {
                $params['contact_products'] = true;
                $params['contact_id'] = $contactId;
            } else {
                $params['owned_only'] = true;
                $params['customer_email'] = $request->user()->email;
            }

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products", array_filter($params));

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'error' => 'Failed to fetch products',
            ], $response->status());
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Owner not found'], 404);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'Unable to load products',
            ], 500);
        }
    }

    public function store(Request $request, string $project, $ownerIdentifier): JsonResponse
    {
        $this->ensureCustomerProject($request, $project);

        $owner = $this->resolveOwner($project, $ownerIdentifier);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'type' => 'required|string|in:physical,digital,service,subscription',
            'sku' => 'nullable|string|max:255',
            'stock_quantity' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:255',
            'status' => 'required|string|in:draft,published,archived,inactive',
            'tags' => 'nullable',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $payload = $validated;
        $payload['client_identifier'] = $owner->identifier;

        if (isset($payload['tags']) && is_string($payload['tags'])) {
            $decodedTags = json_decode($payload['tags'], true);
            $payload['tags'] = is_array($decodedTags) ? $decodedTags : [];
        }

        $images = $request->file('images');
        unset($payload['images']);

        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/products", $payload);

            if (!$response->successful()) {
                return response()->json([
                    'error' => 'Failed to create product',
                    'details' => $response->json(),
                ], $response->status());
            }

            $product = $response->json();

            if ($product && isset($product['id']) && is_array($images)) {
                $this->uploadImagesToApi($images, $product['id']);
            }

            return response()->json($product, 201);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'An error occurred while creating the product',
            ], 500);
        }
    }

    public function update(Request $request, string $project, $ownerIdentifier, $productId): JsonResponse
    {
        $this->ensureCustomerProject($request, $project);
        $this->resolveOwner($project, $ownerIdentifier);

        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/products/{$productId}", $request->all());

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'error' => 'Failed to update product',
                'details' => $response->json(),
            ], $response->status());
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'An error occurred while updating the product',
            ], 500);
        }
    }

    public function destroy(Request $request, string $project, $ownerIdentifier, $productId): JsonResponse
    {
        $this->ensureCustomerProject($request, $project);
        $this->resolveOwner($project, $ownerIdentifier);

        try {
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/products/{$productId}");

            if ($response->successful()) {
                return response()->json([
                    'message' => 'Product deleted successfully',
                ]);
            }

            return response()->json([
                'error' => 'Failed to delete product',
                'details' => $response->json(),
            ], $response->status());
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'An error occurred while deleting the product',
            ], 500);
        }
    }

    public function uploadProductImages(Request $request, string $project, $ownerIdentifier, $productId): JsonResponse
    {
        $this->ensureCustomerProject($request, $project);
        $this->resolveOwner($project, $ownerIdentifier);

        $request->validate([
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            $images = $request->file('images');
            if (!is_array($images)) {
                return response()->json([
                    'error' => 'No images provided',
                ], 422);
            }

            $this->uploadImagesToApi($images, $productId);

            return response()->json([
                'message' => 'Images uploaded successfully',
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'An error occurred while uploading images',
            ], 500);
        }
    }

    public function deleteProductImage(Request $request, string $project, $ownerIdentifier, $productId, $imageId): JsonResponse
    {
        $this->ensureCustomerProject($request, $project);
        $this->resolveOwner($project, $ownerIdentifier);

        try {
            $imageDetails = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products/{$productId}/images/{$imageId}");

            if ($imageDetails->successful()) {
                $payload = $imageDetails->json();
                if (!empty($payload['image_url'])) {
                    $storagePath = str_replace(Storage::disk('public')->url(''), '', $payload['image_url']);
                    if (Storage::disk('public')->exists($storagePath)) {
                        Storage::disk('public')->delete($storagePath);
                    }
                }
            }

            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/products/{$productId}/images/{$imageId}");

            if ($response->successful()) {
                return response()->json([
                    'message' => 'Image deleted successfully',
                ]);
            }

            return response()->json([
                'error' => 'Failed to delete image',
                'details' => $response->json(),
            ], $response->status());
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'An error occurred while deleting the image',
            ], 500);
        }
    }

    public function productOrders(Request $request, string $project, $ownerIdentifier, $productId): JsonResponse
    {
        $this->ensureCustomerProject($request, $project);
        $owner = $this->resolveOwner($project, $ownerIdentifier);

        try {
            $params = $request->all();
            $params['client_identifier'] = $owner->identifier;

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/product-orders/product/{$productId}", $params);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'error' => 'Failed to fetch orders for this product',
                'details' => $response->json(),
            ], $response->status());
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'An error occurred while fetching orders for this product',
            ], 500);
        }
    }

    public function cancelOrder(Request $request, string $project, $ownerIdentifier, $orderId): JsonResponse
    {
        $this->ensureCustomerProject($request, $project);
        $this->resolveOwner($project, $ownerIdentifier);

        try {
            $response = Http::withToken($this->apiToken)
                ->put("{$this->apiUrl}/product-orders/{$orderId}", [
                    'order_status' => 'cancelled',
                ]);

            if ($response->successful()) {
                return response()->json([
                    'message' => 'Order cancelled successfully',
                    'order' => $response->json(),
                ]);
            }

            return response()->json([
                'error' => $response->json()['error'] ?? 'Failed to cancel order',
            ], $response->status());
        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'Network error occurred while cancelling order',
            ], 500);
        }
    }

    protected function fetchMarketplaceProducts(User $owner, array $filters = []): array
    {
        $params = array_filter([
            'client_identifier' => $owner->identifier,
            'status' => $filters['status'] ?? 'published',
            'per_page' => $filters['per_page'] ?? 12,
            'page' => $filters['page'] ?? 1,
            'search' => $filters['search'] ?? null,
            'category' => $filters['category'] ?? null,
            'type' => $filters['type'] ?? null,
            'availability' => $filters['availability'] ?? null,
            'sort' => $filters['sort'] ?? null,
            'price_min' => $filters['price_min'] ?? null,
            'price_max' => $filters['price_max'] ?? null,
        ], fn ($value) => $value !== null && $value !== '');

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products", $params);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Throwable $th) {
            // Swallow exceptions and return empty array
        }

        return [
            'data' => [],
            'meta' => null,
        ];
    }

    protected function fetchProductCategories(User $owner): array
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/products/categories", [
                    'client_identifier' => $owner->identifier,
                ]);

            if (!$response->successful()) {
                return [];
            }

            $payload = $response->json();

            if (isset($payload['data']) && is_array($payload['data'])) {
                return $payload['data'];
            }

            return is_array($payload) ? $payload : [];
        } catch (\Throwable $th) {
            return [];
        }
    }

    protected function fetchMarketplaceProduct(User $owner, $productId): array
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}/products/{$productId}", [
                'client_identifier' => $owner->identifier,
            ]);

        if (!$response->successful()) {
            throw new ModelNotFoundException('Product not found');
        }

        $payload = $response->json();

        return $payload['data'] ?? $payload;
    }

    protected function fetchMarketplaceOrders(User $owner, $customer, array $filters = []): array
    {
        $params = [
            'client_identifier' => $owner->identifier,
            'customer_name' => $customer->name,
            'customer_email' => $customer->email,
            'per_page' => $filters['per_page'] ?? 10,
            'page' => $filters['page'] ?? 1,
        ];

        if (!empty($filters['status'])) {
            $params['order_status'] = $filters['status'];
        }

        if (!empty($filters['payment_status'])) {
            $params['payment_status'] = $filters['payment_status'];
        }

        if (!empty($filters['search'])) {
            $params['search'] = $filters['search'];
        }

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/product-orders", $params);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Throwable $th) {
            // ignore
        }

        return [
            'data' => [],
            'meta' => null,
        ];
    }

    protected function uploadImagesToApi(array $images, int|string $productId): void
    {
        foreach ($images as $image) {
            if (!$image instanceof UploadedFile) {
                continue;
            }

            $path = $image->store('products/images', 'public');
            $imageUrl = Storage::disk('public')->url($path);

            $imagePayload = [
                'image_url' => $imageUrl,
                'alt_text' => $image->getClientOriginalName(),
                'is_primary' => false,
                'sort_order' => 0,
            ];

            Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/products/{$productId}/images", $imagePayload);
        }
    }

    protected function getDefaultContactId(Request $request): ?int
    {
        $customer = $request->user();
        if (!$customer) {
            return null;
        }

        $contactId = data_get($customer, 'contact_id');
        if ($contactId) {
            return (int) $contactId;
        }

        $metadata = data_get($customer, 'metadata');
        if (is_array($metadata) && isset($metadata['contact_id'])) {
            return (int) $metadata['contact_id'];
        }

        return null;
    }

    private function transformOwner(User $owner): array
    {
        return [
            'id' => $owner->id,
            'name' => $owner->name,
            'slug' => $owner->slug,
            'identifier' => $owner->identifier,
            'project_identifier' => $owner->project_identifier,
        ];
    }

    private function transformAuthUser(User $user): array
    {
        return [
            'id' => $user->id,
            'identifier' => $user->identifier,
            'name' => $user->name,
        ];
    }

    private function resolveBackUrl(string $project, User $owner): string
    {
        if ($project === 'community') {
            $identifier = $owner->slug ?? $owner->identifier ?? $owner->id;

            return route('customer.communities.show', $identifier);
        }

        return route('customer.dashboard');
    }
}


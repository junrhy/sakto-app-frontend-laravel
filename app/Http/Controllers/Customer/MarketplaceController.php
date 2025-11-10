<?php

namespace App\Http\Controllers\Customer;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
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
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Owner not found');
        } catch (\Throwable $th) {
            abort(500, 'Failed to load marketplace');
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
}


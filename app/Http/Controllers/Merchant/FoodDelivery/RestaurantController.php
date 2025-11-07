<?php

namespace App\Http\Controllers\Merchant\FoodDelivery;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class RestaurantController extends Controller
{
    protected string $apiUrl;
    protected string $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function dashboard(Request $request): Response
    {
        $restaurant = $this->getUserRestaurant();

        if (!$restaurant) {
            return Inertia::render('Merchant/FoodDelivery/Restaurant/Dashboard', [
                'restaurantId' => null,
                'error' => 'No restaurant found for this account.',
            ]);
        }

        return Inertia::render('Merchant/FoodDelivery/Restaurant/Dashboard', [
            'restaurantId' => $restaurant['id'],
        ]);
    }

    public function orders(): Response
    {
        return Inertia::render('Merchant/FoodDelivery/Restaurant/Orders');
    }

    public function menu(): Response
    {
        return Inertia::render('Merchant/FoodDelivery/Restaurant/Menu');
    }

    public function settings(): Response
    {
        return Inertia::render('Merchant/FoodDelivery/Restaurant/Settings');
    }

    public function restaurant(int $id): Response
    {
        return Inertia::render('Merchant/FoodDelivery/Restaurant/Show', [
            'restaurantId' => $id,
        ]);
    }

    private function getUserRestaurant(): ?array
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-restaurants", [
                    'client_identifier' => auth()->user()->identifier,
                    'status' => 'active',
                ]);

            if ($response->successful()) {
                $restaurants = $response->json()['data'] ?? [];
                if (!empty($restaurants)) {
                    return $restaurants[0];
                }
            }

            $fallback = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-restaurants", [
                    'client_identifier' => auth()->user()->identifier,
                    'status' => 'all',
                ]);

            if ($fallback->successful()) {
                $restaurants = $fallback->json()['data'] ?? [];
                if (!empty($restaurants)) {
                    return $restaurants[0];
                }
            }
        } catch (\Throwable $e) {
            report($e);
        }

        return null;
    }
}

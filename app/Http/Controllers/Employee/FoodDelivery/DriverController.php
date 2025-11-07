<?php

namespace App\Http\Controllers\Employee\FoodDelivery;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class DriverController extends Controller
{
    protected string $apiUrl;
    protected string $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function dashboard(): Response
    {
        $driver = $this->getUserDriver();

        if (!$driver) {
            return Inertia::render('Employee/FoodDelivery/Driver/Dashboard', [
                'driverId' => null,
                'error' => 'No driver profile found. Please contact your administrator.',
            ]);
        }

        return Inertia::render('Employee/FoodDelivery/Driver/Dashboard', [
            'driverId' => $driver['id'],
        ]);
    }

    public function orders(): Response
    {
        $driver = $this->getUserDriver();

        if (!$driver) {
            return Inertia::render('Employee/FoodDelivery/Driver/Orders', [
                'driverId' => null,
                'orders' => [],
                'error' => 'No driver profile found. Please contact your administrator.',
            ]);
        }

        $orders = [];
        $errorMessage = null;

        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-orders", [
                    'client_identifier' => auth()->user()->identifier,
                    'driver_id' => $driver['id'],
                ]);

            if ($response->successful()) {
                $orders = $response->json()['data'] ?? [];
            } else {
                $errorMessage = 'Failed to fetch driver orders.';
            }
        } catch (\Throwable $e) {
            $errorMessage = $e->getMessage();
        }

        return Inertia::render('Employee/FoodDelivery/Driver/Orders', [
            'driverId' => $driver['id'],
            'orders' => $orders,
            'error' => $errorMessage,
        ]);
    }

    private function getUserDriver(): ?array
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/food-delivery-drivers", [
                    'client_identifier' => auth()->user()->identifier,
                    'status' => 'active',
                ]);

            if (!$response->successful()) {
                return null;
            }

            $drivers = $response->json()['data'] ?? [];

            if (empty($drivers)) {
                return null;
            }

            $user = auth()->user();
            $userEmail = $user->email ?? null;
            $userPhone = $user->contact_number ?? null;

            foreach ($drivers as $driver) {
                if ($userEmail && isset($driver['email']) && $driver['email'] === $userEmail) {
                    return $driver;
                }

                if ($userPhone && isset($driver['phone']) && $driver['phone'] === $userPhone) {
                    return $driver;
                }
            }

            return $drivers[0];
        } catch (\Throwable $e) {
            return null;
        }
    }
}

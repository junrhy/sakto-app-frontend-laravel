<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class HandymanController extends Controller
{
    protected string $apiUrl;
    protected string $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index(Request $request): Response
    {
        $clientIdentifier = auth()->user()->identifier;
        $appCurrency = json_decode(auth()->user()->app_currency ?? '{}');

        try {
            $technicians = $this->fetchFromApi('/handyman/technicians', [
                'client_identifier' => $clientIdentifier,
            ]);

            $tasks = $this->fetchFromApi('/handyman/tasks', [
                'client_identifier' => $clientIdentifier,
            ]);

            $taskOverview = $this->fetchFromApi('/handyman/tasks-overview', [
                'client_identifier' => $clientIdentifier,
            ]);

            $workOrdersResponse = $this->fetchFromApi('/handyman/work-orders', [
                'client_identifier' => $clientIdentifier,
                'status' => $request->input('status'),
            ]);

            $inventoryResponse = $this->fetchFromApi('/handyman/inventory', [
                'client_identifier' => $clientIdentifier,
                'type' => $request->input('inventory_type'),
            ]);

            $lowStock = $this->fetchFromApi('/handyman/inventory/low-stock', [
                'client_identifier' => $clientIdentifier,
            ]);

            $inventoryTransactionsResponse = $this->fetchFromApi('/handyman/inventory-transactions', [
                'client_identifier' => $clientIdentifier,
            ]);

            return Inertia::render('Handyman/Index', [
                'technicians' => $technicians['data'] ?? [],
                'tasks' => $tasks['data'] ?? [],
                'taskOverview' => $taskOverview['data'] ?? [],
                'workOrders' => $workOrdersResponse['data']['data'] ?? [],
                'workOrdersPagination' => $workOrdersResponse['data']['meta'] ?? null,
                'inventory' => $inventoryResponse['data']['data'] ?? [],
                'inventoryPagination' => $inventoryResponse['data']['meta'] ?? null,
                'lowStock' => $lowStock['data'] ?? [],
                'inventoryTransactions' => $inventoryTransactionsResponse['data']['data'] ?? [],
                'transactionsPagination' => $inventoryTransactionsResponse['data']['meta'] ?? null,
                'appCurrency' => $appCurrency,
                'filters' => [
                    'status' => $request->input('status'),
                    'inventory_type' => $request->input('inventory_type'),
                ],
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Handyman/Index', [
                'error' => $e->getMessage(),
                'technicians' => [],
                'tasks' => [],
                'taskOverview' => [],
                'workOrders' => [],
                'workOrdersPagination' => null,
                'inventory' => [],
                'inventoryPagination' => null,
                'lowStock' => [],
                'inventoryTransactions' => [],
                'transactionsPagination' => null,
                'appCurrency' => $appCurrency,
                'filters' => [
                    'status' => $request->input('status'),
                    'inventory_type' => $request->input('inventory_type'),
                ],
            ])->withViewData([
                'error' => 'Failed to load handyman data.',
            ]);
        }
    }

    public function technicians(Request $request)
    {
        $clientIdentifier = auth()->user()->identifier;
        $query = array_merge(
            $request->query(),
            ['client_identifier' => $clientIdentifier],
        );

        return response()->json(
            $this->fetchFromApi('/handyman/technicians', $query),
        );
    }

    public function tasks(Request $request)
    {
        $clientIdentifier = auth()->user()->identifier;
        $query = array_merge(
            $request->query(),
            ['client_identifier' => $clientIdentifier],
        );

        return response()->json(
            $this->fetchFromApi('/handyman/tasks', $query),
        );
    }

    public function tasksOverview(Request $request)
    {
        $clientIdentifier = auth()->user()->identifier;
        $query = array_merge(
            $request->query(),
            ['client_identifier' => $clientIdentifier],
        );

        return response()->json(
            $this->fetchFromApi('/handyman/tasks-overview', $query),
        );
    }

    public function storeTask(Request $request)
    {
        $payload = array_merge(
            $request->all(),
            ['client_identifier' => auth()->user()->identifier],
        );

        return response()->json(
            $this->sendToApi(
                'post',
                '/handyman/tasks',
                $payload,
            ),
        );
    }

    public function updateTask(Request $request, int $taskId)
    {
        $payload = array_merge(
            $request->all(),
            ['client_identifier' => auth()->user()->identifier],
        );

        return response()->json(
            $this->sendToApi(
                'put',
                "/handyman/tasks/{$taskId}",
                $payload,
            ),
        );
    }

    public function storeTechnician(Request $request)
    {
        $payload = array_merge(
            $request->all(),
            ['client_identifier' => auth()->user()->identifier],
        );

        return response()->json(
            $this->sendToApi(
                'post',
                '/handyman/technicians',
                $payload,
            ),
        );
    }

    public function updateTechnician(Request $request, int $technicianId)
    {
        $payload = array_merge(
            $request->all(),
            ['client_identifier' => auth()->user()->identifier],
        );

        return response()->json(
            $this->sendToApi(
                'put',
                "/handyman/technicians/{$technicianId}",
                $payload,
            ),
        );
    }

    public function deleteTechnician(Request $request, int $technicianId)
    {
        $payload = array_merge(
            $request->all(),
            ['client_identifier' => auth()->user()->identifier],
        );

        return response()->json(
            $this->sendToApi(
                'delete',
                "/handyman/technicians/{$technicianId}",
                $payload,
            ),
        );
    }

    public function workOrders(Request $request)
    {
        $clientIdentifier = auth()->user()->identifier;
        $query = array_merge(
            $request->query(),
            ['client_identifier' => $clientIdentifier],
        );

        return response()->json(
            $this->fetchFromApi('/handyman/work-orders', $query),
        );
    }

    public function storeWorkOrder(Request $request)
    {
        $payload = array_merge(
            $request->all(),
            ['client_identifier' => auth()->user()->identifier],
        );

        return response()->json(
            $this->sendToApi(
                'post',
                '/handyman/work-orders',
                $payload,
            ),
        );
    }

    public function updateWorkOrder(Request $request, int $workOrderId)
    {
        $payload = array_merge(
            $request->all(),
            ['client_identifier' => auth()->user()->identifier],
        );

        return response()->json(
            $this->sendToApi(
                'put',
                "/handyman/work-orders/{$workOrderId}",
                $payload,
            ),
        );
    }

    public function inventory(Request $request)
    {
        $clientIdentifier = auth()->user()->identifier;
        $query = array_merge(
            $request->query(),
            ['client_identifier' => $clientIdentifier],
        );

        return response()->json(
            $this->fetchFromApi('/handyman/inventory', $query),
        );
    }

    public function storeInventory(Request $request)
    {
        $payload = array_merge(
            $request->all(),
            ['client_identifier' => auth()->user()->identifier],
        );

        return response()->json(
            $this->sendToApi(
                'post',
                '/handyman/inventory',
                $payload,
            ),
        );
    }

    public function updateInventory(Request $request, int $inventoryId)
    {
        $payload = array_merge(
            $request->all(),
            ['client_identifier' => auth()->user()->identifier],
        );

        return response()->json(
            $this->sendToApi(
                'put',
                "/handyman/inventory/{$inventoryId}",
                $payload,
            ),
        );
    }

    public function deleteInventory(Request $request, int $inventoryId)
    {
        $payload = array_merge(
            $request->all(),
            ['client_identifier' => auth()->user()->identifier],
        );

        return response()->json(
            $this->sendToApi(
                'delete',
                "/handyman/inventory/{$inventoryId}",
                $payload,
            ),
        );
    }

    public function lowStock(Request $request)
    {
        $clientIdentifier = auth()->user()->identifier;
        $query = array_merge(
            $request->query(),
            ['client_identifier' => $clientIdentifier],
        );

        return response()->json(
            $this->fetchFromApi('/handyman/inventory/low-stock', $query),
        );
    }

    public function inventoryTransactions(Request $request)
    {
        $clientIdentifier = auth()->user()->identifier;
        $query = array_merge(
            $request->query(),
            ['client_identifier' => $clientIdentifier],
        );

        return response()->json(
            $this->fetchFromApi('/handyman/inventory-transactions', $query),
        );
    }

    public function storeInventoryTransaction(Request $request)
    {
        $payload = array_merge(
            $request->all(),
            ['client_identifier' => auth()->user()->identifier],
        );

        return response()->json(
            $this->sendToApi(
                'post',
                '/handyman/inventory-transactions',
                $payload,
            ),
        );
    }

    protected function fetchFromApi(string $endpoint, array $params = []): array
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->apiUrl}{$endpoint}", $params);

        if (!$response->successful()) {
            throw new \Exception('API request failed: ' . $response->body());
        }

        return $response->json() ?? [];
    }

    protected function sendToApi(string $method, string $endpoint, array $payload = []): array
    {
        $response = Http::withToken($this->apiToken)
            ->{$method}("{$this->apiUrl}{$endpoint}", $payload);

        if (!$response->successful()) {
            throw new \Exception('API request failed: ' . $response->body());
        }

        return $response->json() ?? [];
    }
}


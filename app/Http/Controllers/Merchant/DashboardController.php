<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->merchantProfile;

        $customersQuery = $user->customers();

        $totalCustomers = (int) (clone $customersQuery)->count();
        $activeCustomers = (int) (clone $customersQuery)->where('is_active', true)->count();
        $totalOrders = (int) (clone $customersQuery)->sum('total_orders');
        $totalRevenue = (float) (clone $customersQuery)->sum('total_spent');

        $stats = [
            'total_customers' => $totalCustomers,
            'active_customers' => $activeCustomers,
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
        ];

        return Inertia::render('Merchant/Dashboard', [
            'profile' => $profile,
            'stats' => $stats,
        ]);
    }
}

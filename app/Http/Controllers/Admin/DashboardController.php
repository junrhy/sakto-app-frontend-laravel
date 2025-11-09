<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(Request $request)
    {
        $totalSubscriptionSales = UserSubscription::where('status', 'active')
            ->where('end_date', '>', now())
            ->sum('amount_paid');

        $startOfCurrentMonth = now()->startOfMonth();
        $endOfCurrentMonth = now()->endOfMonth();
        $startOfLastMonth = now()->subMonthNoOverflow()->startOfMonth();
        $endOfLastMonth = now()->subMonthNoOverflow()->endOfMonth();

        $thisMonthSales = UserSubscription::where('status', 'active')
            ->whereBetween('start_date', [$startOfCurrentMonth, $endOfCurrentMonth])
            ->sum('amount_paid');

        $lastMonthSales = UserSubscription::where('status', 'active')
            ->whereBetween('start_date', [$startOfLastMonth, $endOfLastMonth])
            ->sum('amount_paid');

        $recentSubscriptions = UserSubscription::with('plan')
            ->select('user_subscriptions.*')
            ->join('users', 'users.identifier', '=', 'user_subscriptions.user_identifier')
            ->addSelect('users.name as user_name')
            ->orderBy('user_subscriptions.created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($subscription) {
                return [
                    'id' => $subscription->id,
                    'user_name' => $subscription->user_name,
                    'plan_name' => $subscription->plan->name ?? 'N/A',
                    'amount_paid' => $subscription->amount_paid,
                    'currency' => $subscription->plan->currency ?? 'USD',
                    'status' => $subscription->status,
                    'start_date' => $subscription->start_date,
                    'end_date' => $subscription->end_date,
                ];
            });

        return Inertia::render('Admin/Dashboard/Index', [
            'totalSubscriptionSales' => $totalSubscriptionSales,
            'thisMonthSales' => $thisMonthSales,
            'lastMonthSales' => $lastMonthSales,
            'recentSubscriptions' => $recentSubscriptions,
        ]);
    }
}


<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PosRetailSaleController extends Controller
{
    public function index()
    {
        return Inertia::render('PosRetailSale');
    }

    public function showSalesReport() {
        return view('sales-report'); // Assuming you have a corresponding Blade view
    }
}

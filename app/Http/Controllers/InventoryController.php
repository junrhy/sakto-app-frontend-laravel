<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $inventory = [
            ['id' => 1, 'name' => "Example Product 11", 'sku' => "EX-001", 'quantity' => 100, 'price' => 10.0, 'images' => []],
            ['id' => 2, 'name' => "Example Product 2", 'sku' => "EX-002", 'quantity' => 50, 'price' => 15.0, 'images' => []],
            ['id' => 3, 'name' => "Example Product 3", 'sku' => "EX-003", 'quantity' => 75, 'price' => 20.0, 'images' => []],
            ['id' => 4, 'name' => "Example Product 4", 'sku' => "EX-004", 'quantity' => 30, 'price' => 25.0, 'images' => []],
            ['id' => 5, 'name' => "Example Product 5", 'sku' => "EX-005", 'quantity' => 60, 'price' => 30.0, 'images' => []],
            ['id' => 6, 'name' => "Example Product 6", 'sku' => "EX-006", 'quantity' => 40, 'price' => 35.0, 'images' => []],
        ];

        return Inertia::render('Inventory', ['inventory' => $inventory]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

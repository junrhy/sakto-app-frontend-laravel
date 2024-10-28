<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PosRetailController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = [
            ['id' => 1, 'name' => "Product A", 'price' => 10.0, 'images' => ["/images/product-a.jpg"], 'quantity' => 50],
            ['id' => 2, 'name' => "Product B", 'price' => 15.0, 'images' => ["/images/product-b.jpg"], 'quantity' => 30],
            ['id' => 3, 'name' => "Product C", 'price' => 20.0, 'images' => ["/images/product-c.jpg"], 'quantity' => 20],
            ['id' => 4, 'name' => "Product D", 'price' => 25.0, 'images' => ["/images/product-d.jpg"], 'quantity' => 15],
            ['id' => 5, 'name' => "Product E", 'price' => 30.0, 'images' => ["/images/product-e.jpg"], 'quantity' => 25],
            ['id' => 6, 'name' => "Product F", 'price' => 35.0, 'images' => ["/images/product-f.jpg"], 'quantity' => 10],
            ['id' => 7, 'name' => "Product G", 'price' => 40.0, 'images' => ["/images/product-g.jpg"], 'quantity' => 5],
        ];
    
        return Inertia::render('PosRetail', ['products' => $products]);
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
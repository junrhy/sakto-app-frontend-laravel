<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HelpController extends Controller
{
    private $faqItems = [
        [
            'question' => 'How do I add a new product to the retail inventory?',
            'answer' => 'To add a new product, go to the Inventory page, click on the \'Add New Product\' button, fill in the product details in the form that appears, and click \'Add Product\'. Make sure to include essential details like SKU, price, and initial stock quantity.'
        ],
        [
            'question' => 'How do I manage menu items in the restaurant POS?',
            'answer' => 'To manage restaurant menu items, navigate to the Restaurant POS section, select \'Menu Management\', and you can add, edit, or remove menu items. For each item, you can set the name, price, category, and specify if it needs to be sent to the kitchen for preparation.'
        ],
        [
            'question' => 'How do I handle kitchen orders in the restaurant POS?',
            'answer' => 'Kitchen orders are automatically sent to the kitchen display system when you create a new order. The kitchen staff can view and manage orders through their interface. To track order status, check the \'Kitchen Orders\' section where you can see pending, in-progress, and completed orders.'
        ],
        [
            'question' => 'How can I manage table assignments in the restaurant?',
            'answer' => 'In the Restaurant POS, use the \'Table Management\' feature to view and manage table assignments. You can assign servers to specific sections, mark tables as occupied/available, and track order status for each table. To modify table layout, access the settings menu under \'Restaurant Configuration\'.'
        ],
        [
            'question' => 'How do I apply discounts and promotions?',
            'answer' => 'For retail: Click \'Apply Discount\' during checkout, choose percentage or fixed amount, and enter the value. For restaurants: Select the order, click \'Modify\', then \'Apply Discount\'. You can also set up automatic happy hour discounts or special promotions through the Settings menu.'
        ],
        [
            'question' => 'How do I track inventory across retail and restaurant operations?',
            'answer' => 'Both retail and restaurant inventories are tracked in their respective sections. For retail, use the Inventory page to monitor stock levels. For restaurant inventory, use the \'Restaurant Inventory\' section to track ingredients and supplies. Set up low stock alerts in Settings for automatic notifications.'
        ],
        [
            'question' => 'How do I handle split payments in the restaurant POS?',
            'answer' => 'In the Restaurant POS, select the order you want to split, click \'Split Bill\', then choose your preferred splitting method: split equally, by item, or by custom amount. You can process each payment separately using different payment methods.'
        ],
        [
            'question' => 'How can I modify an order after it\'s been sent to the kitchen?',
            'answer' => 'To modify a kitchen order, find the order in the Restaurant POS, click \'Modify Order\', make your changes, and save. The kitchen will be notified of the modifications. Note that some changes may not be possible if the item is already being prepared.'
        ]
    ];

    public function index()
    {
        return Inertia::render('Help', [
            'faqItems' => $this->faqItems
        ]);
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
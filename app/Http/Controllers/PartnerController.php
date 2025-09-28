<?php

namespace App\Http\Controllers;

use App\Mail\PartnerApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class PartnerController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255',
            'contact_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'market' => 'required|string|max:255',
            'company_description' => 'required|string|max:2000',
            'partnership_interest' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Send email to jrcrodua@gmail.com
            Mail::to('jrcrodua@gmail.com')->send(new PartnerApplication($request->all()));

            return response()->json([
                'success' => true,
                'message' => 'Partnership application submitted successfully! We will contact you soon.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit application. Please try again later.'
            ], 500);
        }
    }
}

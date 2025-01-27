<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use App\Mail\GenericEmail;
use Illuminate\Support\Facades\Validator;

class EmailController extends Controller
{
    public function index()
    {
        return Inertia::render('Email/Index');
    }

    public function send(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'to' => 'required|array',
            'to.*' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'cc' => 'nullable|array',
            'cc.*' => 'email',
            'bcc' => 'nullable|array',
            'bcc.*' => 'email',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240', // 10MB max per file
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $attachments = [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $attachments[] = [
                        'path' => $file->getRealPath(),
                        'name' => $file->getClientOriginalName(),
                    ];
                }
            }

            Mail::to($request->to)
                ->cc($request->cc ?? [])
                ->bcc($request->bcc ?? [])
                ->send(new GenericEmail(
                    $request->subject,
                    $request->message,
                    $attachments
                ));

            return response()->json([
                'success' => true,
                'message' => 'Email sent successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getConfig()
    {
        return response()->json([
            'mail_from' => config('mail.from.address'),
            'mail_name' => config('mail.from.name'),
            'mail_driver' => config('mail.default'),
        ]);
    }
}

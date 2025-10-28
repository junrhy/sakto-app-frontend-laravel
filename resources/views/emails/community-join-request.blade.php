<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Community Join Request</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 30px;
            margin: 20px 0;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #4f46e5;
            margin: 0;
            font-size: 24px;
        }
        .content {
            background-color: white;
            border-radius: 6px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .content p {
            margin: 10px 0;
        }
        .customer-info {
            background-color: #f3f4f6;
            border-left: 4px solid #4f46e5;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .customer-info strong {
            color: #4f46e5;
        }
        .buttons {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            margin: 10px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s;
        }
        .button-approve {
            background-color: #10b981;
            color: white;
        }
        .button-approve:hover {
            background-color: #059669;
        }
        .button-deny {
            background-color: #ef4444;
            color: white;
        }
        .button-deny:hover {
            background-color: #dc2626;
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .message-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤝 Community Join Request</h1>
        </div>

        <div class="content">
            <p>Hello,</p>
            
            <p>You have received a new request to join your community.</p>

            <div class="customer-info">
                <p><strong>Customer Name:</strong> {{ $customerName }}</p>
                <p><strong>Email:</strong> {{ $customerEmail }}</p>
                <p><strong>Requested on:</strong> {{ $joinRequest->created_at->format('F d, Y \a\t g:i A') }}</p>
            </div>

            @if($joinRequest->message)
            <div class="message-box">
                <strong>Message from customer:</strong>
                <p style="margin: 10px 0 0 0;">{{ $joinRequest->message }}</p>
            </div>
            @endif

            <p style="margin-top: 20px;">Please review this request and take action:</p>
        </div>

        <div class="buttons">
            <a href="{{ $approveUrl }}" class="button button-approve">
                ✓ Approve Request
            </a>
            <a href="{{ $denyUrl }}" class="button button-deny">
                ✗ Deny Request
            </a>
        </div>

        <div class="footer">
            <p>This is an automated email from your Neulify community management system.</p>
            <p>If you did not expect this email, please ignore it.</p>
        </div>
    </div>
</body>
</html>


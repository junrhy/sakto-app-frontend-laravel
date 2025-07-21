<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wallet Transfer Received</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
        }
        .header h1 {
            color: #28a745;
            margin: 0;
            font-size: 24px;
        }
        .amount {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .amount .currency {
            font-size: 32px;
            font-weight: bold;
            color: #155724;
        }
        .details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .detail-label {
            font-weight: bold;
            color: #495057;
        }
        .detail-value {
            color: #6c757d;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
        }
        .success-icon {
            font-size: 48px;
            color: #28a745;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">💰</div>
            <h1>Wallet Transfer Received</h1>
            <p>You have received a wallet transfer</p>
        </div>

        <div class="amount">
            <div class="currency">{{ $currency }} {{ number_format($amount, 2) }}</div>
            <p>Amount Received</p>
        </div>

        <div class="details">
            <div class="detail-row">
                <span class="detail-label">From:</span>
                <span class="detail-value">{{ $senderName }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">To:</span>
                <span class="detail-value">{{ $recipientName }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Reference:</span>
                <span class="detail-value">{{ $reference }}</span>
            </div>
            @if($description)
            <div class="detail-row">
                <span class="detail-label">Description:</span>
                <span class="detail-value">{{ $description }}</span>
            </div>
            @endif
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">{{ now()->format('F j, Y \a\t g:i A') }}</span>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated notification from your wallet system.</p>
            <p>If you have any questions, please contact your system administrator.</p>
            <p>Sent via {{ config('app.name') }}</p>
        </div>
    </div>
</body>
</html> 
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Upcoming Invoices</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #e74c3c;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .invoice-item {
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .invoice-number {
            font-weight: bold;
            color: #e74c3c;
        }
        .invoice-amount {
            font-size: 18px;
            font-weight: bold;
            color: #e74c3c;
        }
        .invoice-details {
            font-size: 14px;
            color: #666;
        }
        .due-date {
            color: #e74c3c;
            font-weight: bold;
        }
        .total-section {
            background-color: #e74c3c;
            color: white;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
            margin-top: 20px;
        }
        .total-amount {
            font-size: 24px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            background-color: #e74c3c;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Upcoming Invoices</h1>
        <p>Due in 7 Days</p>
    </div>
    
    <div class="content">
        <p>Hello {{ $user->name }},</p>
        
        <p>This is a friendly reminder that you have upcoming invoices due in 7 days. Please review the details below:</p>
        
        @foreach($upcomingInvoices as $invoice)
        <div class="invoice-item">
            <div class="invoice-header">
                <div class="invoice-number">{{ $invoice['invoice_number'] }}</div>
                <div class="invoice-amount">PHP {{ number_format($invoice['total_amount'], 2) }}</div>
            </div>
            <div class="invoice-details">
                <p><strong>Type:</strong> {{ ucfirst(str_replace('_', ' ', $invoice['type'])) }}</p>
                @if(isset($invoice['plan_name']))
                    <p><strong>Plan:</strong> {{ $invoice['plan_name'] }}</p>
                @endif
                @if(isset($invoice['app_name']))
                    <p><strong>App:</strong> {{ $invoice['app_name'] }}</p>
                @endif
                <p><strong>Billing Cycle:</strong> {{ ucfirst($invoice['billing_cycle']) }}</p>
                <p><strong>Due Date:</strong> <span class="due-date">{{ date('F j, Y', strtotime($invoice['due_date'])) }}</span></p>
                <p><strong>Payment Method:</strong> {{ ucfirst($invoice['payment_method']) }}</p>
            </div>
        </div>
        @endforeach
        
        <div class="total-section">
            <h3>Total Upcoming Amount</h3>
            <div class="total-amount">PHP {{ number_format($totalAmount, 2) }}</div>
        </div>
        
        <p>Please ensure your payment method is up to date to avoid any service interruptions.</p>
        
        <p>If you have any questions about these upcoming charges, please don't hesitate to contact our support team.</p>
        
        <p>Best regards,<br>
        The Sakto App Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated notification. Please do not reply to this email.</p>
        <p>© {{ date('Y') }} Sakto App. All rights reserved.</p>
    </div>
</body>
</html>

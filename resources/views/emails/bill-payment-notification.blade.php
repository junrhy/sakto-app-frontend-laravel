<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bill Payment Notification</title>
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
            background-color: #3b82f6;
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
        .bill-details {
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
        }
        .bill-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 2px solid #3b82f6;
        }
        .bill-number {
            font-weight: bold;
            color: #3b82f6;
            font-size: 18px;
        }
        .bill-amount {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-label {
            font-weight: bold;
            color: #666;
        }
        .detail-value {
            color: #333;
        }
        .due-date {
            color: #e74c3c;
            font-weight: bold;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        .status-paid {
            background-color: #d1fae5;
            color: #065f46;
        }
        .status-overdue {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .priority-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .priority-low {
            background-color: #d1fae5;
            color: #065f46;
        }
        .priority-medium {
            background-color: #fef3c7;
            color: #92400e;
        }
        .priority-high {
            background-color: #fed7aa;
            color: #9a3412;
        }
        .priority-urgent {
            background-color: #fee2e2;
            color: #991b1b;
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
            background-color: #3b82f6;
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
        <h1>New Bill Payment Notification</h1>
        <p>Please review your bill details</p>
    </div>
    
    <div class="content">
        <p>Hello {{ $customerName }},</p>
        
        @if(isset($billPayment['biller']) && isset($billPayment['biller']['name']))
        <p>A new bill payment has been created for you by <strong>{{ $billPayment['biller']['name'] }}</strong>. Please review the details below:</p>
        @else
        <p>A new bill payment has been created for you. Please review the details below:</p>
        @endif
        
        <div class="bill-details">
            <div class="bill-header">
                <div class="bill-number">{{ $billPayment['bill_number'] ?? 'N/A' }}</div>
            </div>
            
            @if(isset($billPayment['biller']) && isset($billPayment['biller']['name']))
            <div class="detail-row" style="background-color: #eff6ff; padding: 12px; border-radius: 5px; margin-bottom: 15px;">
                <span class="detail-label" style="font-size: 16px; color: #1e40af;">Biller:</span>
                <span class="detail-value" style="font-size: 16px; font-weight: bold; color: #1e40af;">{{ $billPayment['biller']['name'] }}</span>
            </div>
            @endif
            
            @if(isset($billPayment['bill_description']) && $billPayment['bill_description'])
            <div class="detail-row">
                <span class="detail-label">Description:</span>
                <span class="detail-value">{{ $billPayment['bill_description'] }}</span>
            </div>
            @endif
            
            @if(isset($billPayment['biller']) && isset($billPayment['biller']['account_number']))
            <div class="detail-row">
                <span class="detail-label">Biller Account Number:</span>
                <span class="detail-value" style="font-family: monospace;">{{ $billPayment['biller']['account_number'] }}</span>
            </div>
            @endif

            <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">PHP {{ number_format($billPayment['amount'] ?? 0, 2) }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Due Date:</span>
                <span class="detail-value due-date">{{ isset($billPayment['due_date']) ? date('F j, Y', strtotime($billPayment['due_date'])) : 'N/A' }}</span>
            </div>
            
            @if(isset($billPayment['payment_date']) && $billPayment['payment_date'])
            <div class="detail-row">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">{{ date('F j, Y', strtotime($billPayment['payment_date'])) }}</span>
            </div>
            @endif
            
            @if(isset($billPayment['reference_number']) && $billPayment['reference_number'])
            <div class="detail-row">
                <span class="detail-label">Reference Number:</span>
                <span class="detail-value">{{ $billPayment['reference_number'] }}</span>
            </div>
            @endif
            
            @if(isset($billPayment['payment_method']) && $billPayment['payment_method'])
            <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">{{ $billPayment['payment_method'] }}</span>
            </div>
            @endif
            
            @if(isset($billPayment['notes']) && $billPayment['notes'])
            <div class="detail-row">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">{{ $billPayment['notes'] }}</span>
            </div>
            @endif
            
            @if(isset($billPayment['is_recurring']) && $billPayment['is_recurring'])
            <div class="detail-row" style="background-color: #eff6ff; padding: 15px; border-radius: 5px; margin-top: 15px;">
                <div style="width: 100%;">
                    <span class="detail-label" style="color: #1e40af; font-size: 14px;">🔄 Recurring Bill</span>
                    <div style="margin-top: 10px;">
                        @if(isset($billPayment['recurring_frequency']) && $billPayment['recurring_frequency'])
                        <p style="margin: 5px 0;"><strong>Frequency:</strong> {{ ucfirst($billPayment['recurring_frequency']) }}</p>
                        @endif
                        @if(isset($billPayment['next_due_date']) && $billPayment['next_due_date'])
                        <p style="margin: 5px 0;"><strong>Next Due Date:</strong> <span class="due-date">{{ date('F j, Y', strtotime($billPayment['next_due_date'])) }}</span></p>
                        @endif
                    </div>
                </div>
            </div>
            @endif
        </div>
        
        @if(isset($billPayment['is_recurring']) && $billPayment['is_recurring'])
        <p><strong>Recurring Bill:</strong> This is a recurring bill that will be automatically generated based on the frequency you've set. The next bill will be due on {{ isset($billPayment['next_due_date']) ? date('F j, Y', strtotime($billPayment['next_due_date'])) : 'the next cycle' }}.</p>
        @endif
        
        <p>Please ensure payment is made by the due date to avoid any late fees or service interruptions.</p>
        
        @if(isset($billPayment['status']) && $billPayment['status'] === 'pending')
        <p><strong>Action Required:</strong> This bill is currently pending payment. Please make payment by the due date.</p>
        @endif
        
        @if(isset($billPayment['status']) && $billPayment['status'] === 'overdue')
        <p><strong>Urgent:</strong> This bill is overdue. Please make payment as soon as possible.</p>
        @endif
        
        <p>If you have any questions about this bill, please don't hesitate to contact our support team.</p>
        
        <p>Best regards,<br>
        @if(isset($billPayment['biller']) && isset($billPayment['biller']['name']))
        {{ $billPayment['biller']['name'] }}
        @else
        The Neulify Team
        @endif</p>
    </div>
    
    <div class="footer">
        <p>This is an automated notification. Please do not reply to this email.</p>
        <p>© {{ date('Y') }} Neulify. All rights reserved.</p>
    </div>
</body>
</html>


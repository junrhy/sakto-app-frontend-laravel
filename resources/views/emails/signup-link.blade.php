<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Complete Your Registration</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: left;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
        }
        .content {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            text-align: center;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #4338ca;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ $memberName }}</div>
            <h1 class="title">Complete Your Registration</h1>
            <p class="subtitle">Welcome to {{ $memberName }}'s community!</p>
        </div>

        <div class="content">
            <p>Hello!</p>
            
            <p>You've requested to join <strong>{{ $memberName }}'s</strong> community. To complete your registration, please click the button below:</p

            <div style="text-align: center;">
                <a href="{{ $registrationUrl }}" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-align: center; margin: 20px 0; font-size: 16px; border: none; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">Complete Registration</a>
            </div>

            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4f46e5;">{{ $registrationUrl }}</p>

            <div class="warning">
                <strong>Important:</strong> This registration link is valid for a limited time. Please complete your registration as soon as possible.
            </div>

            <p>If you didn't request this registration link, you can safely ignore this email.</p>
        </div>

        <div class="footer">
            <p>This email was sent to {{ $email }}</p>
            <p>&copy; {{ date('Y') }} Sakto Community Platform. All rights reserved.</p>
        </div>
    </div>
</body>
</html> 
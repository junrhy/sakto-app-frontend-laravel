<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New Partnership Application - Neulify</title>
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
            background: linear-gradient(135deg, #1E3A8A, #14B8A6);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .field {
            margin-bottom: 20px;
        }
        .field-label {
            font-weight: bold;
            color: #1E3A8A;
            margin-bottom: 5px;
        }
        .field-value {
            background: white;
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #14B8A6;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>New Partnership Application</h1>
        <p>Neulify Global Technology Company</p>
    </div>
    
    <div class="content">
        <h2>Application Details</h2>
        
        <div class="field">
            <div class="field-label">Company Name:</div>
            <div class="field-value">{{ $data['company_name'] }}</div>
        </div>
        
        <div class="field">
            <div class="field-label">Contact Name:</div>
            <div class="field-value">{{ $data['contact_name'] }}</div>
        </div>
        
        <div class="field">
            <div class="field-label">Email Address:</div>
            <div class="field-value">{{ $data['email'] }}</div>
        </div>
        
        @if(!empty($data['phone']))
        <div class="field">
            <div class="field-label">Phone Number:</div>
            <div class="field-value">{{ $data['phone'] }}</div>
        </div>
        @endif
        
        <div class="field">
            <div class="field-label">Target Market/Region:</div>
            <div class="field-value">{{ $data['market'] }}</div>
        </div>
        
        <div class="field">
            <div class="field-label">Company Description:</div>
            <div class="field-value">{{ $data['company_description'] }}</div>
        </div>
        
        <div class="field">
            <div class="field-label">Partnership Interest:</div>
            <div class="field-value">{{ $data['partnership_interest'] }}</div>
        </div>
        
        <div class="footer">
            <p>This application was submitted through the Neulify website.</p>
            <p>Please review and respond to the applicant at: {{ $data['email'] }}</p>
        </div>
    </div>
</body>
</html>

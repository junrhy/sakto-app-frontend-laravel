<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
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
            background: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 30px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 5px;
        }
        .section h2 {
            color: #4F46E5;
            margin-top: 0;
        }
        .field {
            margin-bottom: 10px;
        }
        .label {
            font-weight: bold;
            color: #6B7280;
        }
        .value {
            color: #111827;
        }
        .photo {
            max-width: 200px;
            border-radius: 100%;
            margin: 10px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6B7280;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Family Member Edit Request</h1>
    </div>

    <p>Hello,</p>
    <p>A request has been made to edit a family member's information in your family tree. Below are the current details and the proposed changes:</p>

    <div class="section">
        <h2>Current Information</h2>
        <div class="field">
            <div class="label">Name:</div>
            <div class="value">{{ $editData['current']['first_name'] }} {{ $editData['current']['last_name'] }}</div>
        </div>
        <div class="field">
            <div class="label">Birth Date:</div>
            <div class="value">{{ \Carbon\Carbon::parse($editData['current']['birth_date'])->format('F j, Y') }}</div>
        </div>
        @if($editData['current']['death_date'])
        <div class="field">
            <div class="label">Death Date:</div>
            <div class="value">{{ \Carbon\Carbon::parse($editData['current']['death_date'])->format('F j, Y') }}</div>
        </div>
        @endif
        <div class="field">
            <div class="label">Gender:</div>
            <div class="value">{{ ucfirst($editData['current']['gender']) }}</div>
        </div>
        @if($editData['current']['notes'])
        <div class="field">
            <div class="label">Notes:</div>
            <div class="value">{{ $editData['current']['notes'] }}</div>
        </div>
        @endif
        @if($editData['current']['photo'])
        <div class="field">
            <div class="label">Current Photo:</div>
            <img src="{{ $editData['current']['photo'] }}" alt="Current Photo" class="photo">
        </div>
        @endif
    </div>

    <div class="section">
        <h2>Proposed Changes</h2>
        <div class="field">
            <div class="label">Name:</div>
            <div class="value">{{ $editData['proposed']['first_name'] }} {{ $editData['proposed']['last_name'] }}</div>
        </div>
        <div class="field">
            <div class="label">Birth Date:</div>
            <div class="value">{{ \Carbon\Carbon::parse($editData['proposed']['birth_date'])->format('F j, Y') }}</div>
        </div>
        @if($editData['proposed']['death_date'])
        <div class="field">
            <div class="label">Death Date:</div>
            <div class="value">{{ \Carbon\Carbon::parse($editData['proposed']['death_date'])->format('F j, Y') }}</div>
        </div>
        @endif
        <div class="field">
            <div class="label">Gender:</div>
            <div class="value">{{ ucfirst($editData['proposed']['gender']) }}</div>
        </div>
        @if($editData['proposed']['notes'])
        <div class="field">
            <div class="label">Notes:</div>
            <div class="value">{{ $editData['proposed']['notes'] }}</div>
        </div>
        @endif
        @if($editData['proposed']['photo'])
        <div class="field">
            <div class="label">Proposed New Photo:</div>
            <img src="{{ $editData['proposed']['photo'] }}" alt="Proposed Photo" class="photo">
        </div>
        @endif
    </div>

    <p>To review and approve these changes, please log in to your account and visit the family member's profile.</p>

    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html> 
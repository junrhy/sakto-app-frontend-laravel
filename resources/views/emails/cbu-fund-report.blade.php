<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CBU Fund Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            color: #2c3e50;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
        }
        .stat-label {
            font-weight: bold;
            color: #666;
            margin-bottom: 5px;
        }
        .stat-value {
            font-size: 1.2em;
            color: #2c3e50;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .message {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
            font-style: italic;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CBU Fund Report</h1>
        <h2>{{ $fund['name'] }}</h2>
    </div>

    @if($message)
    <div class="message">
        {{ $message }}
    </div>
    @endif

    <div class="section">
        <h3 class="section-title">Fund Overview</h3>
        <div class="stat-grid">
            <div class="stat-item">
                <div class="stat-label">Current Balance</div>
                <div class="stat-value">{{ number_format($statistics['currentBalance'], 2) }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Number of Shares</div>
                <div class="stat-value">{{ $statistics['numberOfShares'] }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Value Per Share</div>
                <div class="stat-value">{{ number_format($statistics['valuePerShare'], 2) }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Target Amount</div>
                <div class="stat-value">{{ number_format($fund['target_amount'], 2) }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h3 class="section-title">Recent Contributions</h3>
        @if(count($recentContributions) > 0)
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                @foreach($recentContributions as $contribution)
                <tr>
                    <td>{{ $contribution['contribution_date'] }}</td>
                    <td>{{ number_format($contribution['amount'], 2) }}</td>
                    <td>{{ $contribution['notes'] ?? '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p>No recent contributions</p>
        @endif
    </div>

    <div class="section">
        <h3 class="section-title">Recent Withdrawals</h3>
        @if(count($recentWithdrawals) > 0)
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                @foreach($recentWithdrawals as $withdrawal)
                <tr>
                    <td>{{ $withdrawal['date'] }}</td>
                    <td>{{ number_format($withdrawal['amount'], 2) }}</td>
                    <td>{{ $withdrawal['notes'] ?? '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p>No recent withdrawals</p>
        @endif
    </div>

    <div class="section">
        <h3 class="section-title">Recent Dividends</h3>
        @if(count($recentDividends) > 0)
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                @foreach($recentDividends as $dividend)
                <tr>
                    <td>{{ $dividend['dividend_date'] }}</td>
                    <td>{{ number_format($dividend['amount'], 2) }}</td>
                    <td>{{ $dividend['notes'] ?? '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p>No recent dividends</p>
        @endif
    </div>

    <div class="section">
        <h3 class="section-title">Fund Statistics</h3>
        <div class="stat-grid">
            <div class="stat-item">
                <div class="stat-label">Total Contributions</div>
                <div class="stat-value">{{ number_format($statistics['totalContributions'], 2) }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Total Withdrawals</div>
                <div class="stat-value">{{ number_format($statistics['totalWithdrawals'], 2) }}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Total Dividends</div>
                <div class="stat-value">{{ number_format($statistics['totalDividends'], 2) }}</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>This is an automated report. Please do not reply to this email.</p>
        <p>Generated on {{ now()->format('F j, Y H:i:s') }}</p>
    </div>
</body>
</html> 
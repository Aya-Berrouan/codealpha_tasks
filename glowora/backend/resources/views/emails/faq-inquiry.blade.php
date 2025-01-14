<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.5;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
        }

        .email-container {
            max-width: 700px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .header {
            color: #5b46df;
            padding: 40px 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 26px;
            font-weight: 300;
            margin: 0;
            color: #5b46df;
        }

        .logo {
            width: 180px;
            height: auto;
            margin-bottom: 25px;
            transition: transform 0.3s ease;
        }

        .logo:hover {
            transform: scale(1.05);
        }

        .logo-link {
            display: inline-block;
            text-decoration: none;
        }

        .content {
            padding: 30px;
        }

        .field {
            margin-bottom: 20px;
        }

        .field:last-child {
            margin-bottom: 0;
        }

        .label {
            font-weight: bold;
            font-size: 14px;
            color: #5b46df;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        .value {
            font-size: 16px;
            color: #333;
            margin: 0;
        }

        .email-highlight {
            color: #5b46df;
            text-decoration: none;
        }

        .timestamp {
            font-size: 12px;
            color: #999;
            margin-top: 10px;
        }

        .footer {
            background-color: #f7f8fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e5e5e5;
        }

        .footer a {
            color: #5b46df;
            text-decoration: none;
        }

        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background: linear-gradient(135deg, #5b46df, #9277ff);
            color: #ffffff;
            border-radius: 25px;
            text-decoration: none;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: background 0.3s ease;
        }

        .button:hover {
            background: linear-gradient(135deg, #9277ff, #5b46df);
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            <a href="http://localhost:5173" class="logo-link" target="_blank">
                <img src="https://i.imgur.com/RKBWT2V.png" alt="Glowora Logo" class="logo">
            </a>
            <h1>New FAQ Inquiry</h1>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">From</div>
                <p class="value">
                    <b>Name:</b> {{ $data['name'] }} <br>
                    <b>Email:</b> <a href="mailto:{{ $data['email'] }}"
                        class="email-highlight"> {{ $data['email'] }}
                    </a>
                </p>
            </div>
            <div class="field">
                <div class="label">Question</div>
                <p class="value">{{ $data['message'] }}</p>
            </div>
            <div class="field">
                <div class="label">Received</div>
                <p class="value timestamp">{{ now()->format('l, F j, Y \\a\\t g:i A') }}</p>
            </div>
        </div>
        <div class="footer">
            <p>This inquiry was sent through the FAQ section of <a href="http://localhost:5173">Glowora</a>. If you have
                any questions, please contact us.</p>
        </div>
    </div>
</body>

</html>

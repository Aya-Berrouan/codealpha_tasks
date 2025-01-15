<!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f9f9f9;
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

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            padding: 30px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .content {
            margin-bottom: 30px;
        }
        p {
            color: #000000;
        }

        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #5D5FEF;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }

        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <a href="http://localhost:5173" class="logo-link" target="_blank">
                <img src="https://i.imgur.com/RKBWT2V.png" alt="Glowora Logo" class="logo">
            </a>
            <h1>Reset Your Password</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>

            <center>
                <a href="{{ env('FRONTEND_URL') }}/reset-password?token={{ $token }}&email={{ urlencode($email) }}"
                    class="button" style="color: white !important;">Reset Password</a>
            </center>

            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>This link will expire in 60 minutes.</p>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; font-size: 12px;">
                {{ env('FRONTEND_URL') }}/reset-password?token={{ $token }}&email={{ urlencode($email) }}
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Glowora. All rights reserved.</p>
        </div>
    </div>
</body>

</html>

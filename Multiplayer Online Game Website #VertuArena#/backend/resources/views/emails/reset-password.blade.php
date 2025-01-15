<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #FF5AAF 0%, #60B5FF 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .content {
            padding: 30px 20px;
            color: #333333;
        }
        .button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #FF5AAF 0%, #60B5FF 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            background-color: #f8f8f8;
            padding: 20px;
            text-align: center;
            color: #666666;
            font-size: 12px;
        }
        .note {
            font-size: 14px;
            color: #666666;
            margin-top: 20px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">VertuArena</div>
            <h1>Reset Your Password</h1>
        </div>
        
        <div class="content">
            <p>Hello,</p>
            
            <p>We received a request to reset your password for your VertuArena account. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center;">
                <a href="{{ $resetUrl }}" class="button">Reset Password</a>
            </div>
            
            <p class="note">This password reset link will expire in 60 minutes.</p>
            
            <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; color: #666666;">{{ $resetUrl }}</p>
            
            <p>Best regards,<br>The VertuArena Team</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} VertuArena. All rights reserved.</p>
            <p>If you didn't request this password reset, please contact our support team.</p>
        </div>
    </div>
</body>
</html>

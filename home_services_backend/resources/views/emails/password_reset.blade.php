<!DOCTYPE html>
<html>
<head>
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3490dc;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        
        <p>You are receiving this email because we received a password reset request for your account.</p>
        
        <p>
            <a href="{{ $resetUrl }}" class="button">Reset Password</a>
        </p>
        
        <p>This password reset link will expire in 1 hour.</p>
        
        <p>If you did not request a password reset, no further action is required.</p>
        
        <div class="footer">
            <p>Thank you,<br>
            Home Services System</p>
            
            <p>If you're having trouble clicking the "Reset Password" button, 
            copy and paste the URL below into your web browser:</p>
            <p>{{ $resetUrl }}</p>
        </div>
    </div>
</body>
</html>
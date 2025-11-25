<?php
include __DIR__ . '/../../config.php';

// Rate Limiting للـ Login
$client_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
rateLimit("login_$client_ip", 50, 60); // 50 محاولات كل دقيقة (للتطوير)
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Username and password are required']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // المقارنة الأوتوماتيك هنا! 🔐
    if ($user && verifyPassword($password, $user['password'])) {
        // إنشاء JWT token
        $token = generateJWT([
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role']
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['full_name'],
                'role' => $user['role'],
                'email' => $user['email']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password'
        ]);
    }
}
?>
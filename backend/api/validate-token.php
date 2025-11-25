<?php
include '../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    try {
        // استخدام requireAuth() بدل authenticateRequest()
        $user = requireAuth();
        
        // جلب بيانات إضافية عن المستخدم
        $stmt = $pdo->prepare("
            SELECT id, username, email, phone, full_name, role, commission_rate, is_active, created_at
            FROM users 
            WHERE id = ?
        ");
        $stmt->execute([$user['user_id']]);
        $user_data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user_data) {
            sendError('User not found', 'USER_NOT_FOUND', 404);
        }
        
        sendSuccess([
            'user' => [
                'id' => $user_data['id'],
                'username' => $user_data['username'],
                'full_name' => $user_data['full_name'],
                'email' => $user_data['email'],
                'role' => $user_data['role'],
                'commission_rate' => $user_data['commission_rate'],
                'is_active' => (bool)$user_data['is_active']
            ],
            'token_info' => [
                'issuer' => $user['iss'],
                'issued_at' => date('Y-m-d H:i:s', $user['iat']),
                'expires_at' => date('Y-m-d H:i:s', $user['exp']),
                'remaining_time' => $user['exp'] - time()
            ]
        ], 'Token is valid');
        
    } catch (Exception $e) {
        sendError('Token validation failed', 'VALIDATION_FAILED', 401);
    }
} else {
    sendError('Method not allowed', 'METHOD_NOT_ALLOWED', 405);
}
?>
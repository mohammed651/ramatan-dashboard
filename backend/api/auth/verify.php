<?php
include __DIR__ . '/../../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    try {
        $user = requireAuth();

        echo json_encode([
            'success' => true,
            'message' => 'Token is valid',
            'user' => [
                'user_id' => $user['user_id'],
                'username' => $user['username'],
                'role' => $user['role']
            ],
            'token_info' => [
                'issuer' => $user['iss'],
                'issued_at' => date('Y-m-d H:i:s', $user['iat']),
                'expires_at' => date('Y-m-d H:i:s', $user['exp'])
            ]
        ]);
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Token verification failed'
        ]);
    }
}
?>
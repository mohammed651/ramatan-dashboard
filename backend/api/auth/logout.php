<?php
include __DIR__ . '/../../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user = requireAuth();

    // في نظام محترف ممكن نعمل blacklist للتوكن
    // لكن حالياً التوكن بيتعامل مع الـ expiration

    echo json_encode([
        'success' => true,
        'message' => 'Logout successful',
        'user' => [
            'username' => $user['username']
        ]
    ]);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
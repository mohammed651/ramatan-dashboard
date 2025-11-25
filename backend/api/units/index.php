<?php
include __DIR__ . '/../../config.php';

// التأكد من أن المستخدم مسجل دخول
$current_user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $stmt = $pdo->query("
        SELECT u.*, p.name as project_name 
        FROM units u 
        LEFT JOIN projects p ON u.project_id = p.id 
        ORDER BY u.created_at DESC
    ");
    $units = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $units,
        'count' => count($units),
        'user_role' => $current_user['role']
    ]);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
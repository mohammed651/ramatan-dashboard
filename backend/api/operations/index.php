<?php
include __DIR__ . '/../../config.php';

// التأكد من أن المستخدم مسجل دخول
$current_user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] == 'GET') {

    // إذا كان سالز، نشوف عملياته فقط
    if ($current_user['role'] == 'sales') {
        $stmt = $pdo->prepare("
            SELECT o.*, 
                   u.unit_number, u.unit_type, u.price as unit_price,
                   p.name as project_name,
                   s.full_name as sales_name
            FROM operations o
            LEFT JOIN units u ON o.unit_id = u.id
            LEFT JOIN projects p ON u.project_id = p.id
            LEFT JOIN users s ON o.sales_id = s.id
            WHERE o.sales_id = ?
            ORDER BY o.created_at DESC
        ");
        $stmt->execute([$current_user['user_id']]);
    } else {
        // الأدمن يشوف كل العمليات
        $stmt = $pdo->query("
            SELECT o.*, 
                   u.unit_number, u.unit_type, u.price as unit_price,
                   p.name as project_name,
                   s.full_name as sales_name
            FROM operations o
            LEFT JOIN units u ON o.unit_id = u.id
            LEFT JOIN projects p ON u.project_id = p.id
            LEFT JOIN users s ON o.sales_id = s.id
            ORDER BY o.created_at DESC
        ");
    }

    $operations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $operations,
        'count' => count($operations),
        'user_role' => $current_user['role']
    ]);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
<?php
include __DIR__ . '/../../config.php';

// التأكد من أن المستخدم مسجل دخول
$current_user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $stmt = $pdo->query("
        SELECT 
            p.*, 
            u.full_name as created_by_name,
            (p.total_units - p.sold_units) as available_units,
            CASE 
                WHEN p.total_units > 0 THEN ROUND((p.sold_units / p.total_units) * 100, 2)
                ELSE 0 
            END as sold_percentage,
            CASE 
                WHEN p.total_units > 0 THEN ROUND(((p.total_units - p.sold_units) / p.total_units) * 100, 2)
                ELSE 0 
            END as available_percentage
        FROM projects p 
        LEFT JOIN users u ON p.created_by = u.id 
        ORDER BY p.created_at DESC
    ");
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // حساب الإحصائيات الإجمالية
    $total_projects = count($projects);
    $total_units = array_sum(array_column($projects, 'total_units'));
    $total_sold_units = array_sum(array_column($projects, 'sold_units'));
    $total_available_units = array_sum(array_column($projects, 'available_units'));
    
    echo json_encode([
        'success' => true,
        'data' => $projects,
        'count' => $total_projects,
        'user' => [
            'id' => $current_user['user_id'],
            'role' => $current_user['role']
        ],
        'statistics' => [
            'total_projects' => $total_projects,
            'total_units' => $total_units,
            'total_sold_units' => $total_sold_units,
            'total_available_units' => $total_available_units,
            'overall_sold_percentage' => $total_units > 0 ? round(($total_sold_units / $total_units) * 100, 2) : 0,
            'overall_available_percentage' => $total_units > 0 ? round(($total_available_units / $total_units) * 100, 2) : 0
        ]
    ]);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
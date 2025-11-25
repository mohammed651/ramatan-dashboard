<?php
include __DIR__ . '/../../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $show_inactive = $_GET['show_inactive'] ?? false;

    if ($show_inactive) {
        // عرض كل المستخدمين بما فيهم غير النشطين
        $stmt = $pdo->query("
            SELECT id, username, email, phone, full_name, role, commission_rate, is_active, created_at
            FROM users 
            WHERE role != 'admin'
            ORDER BY is_active DESC, created_at DESC
        ");
    } else {
        // عرض المستخدمين النشطين فقط
        $stmt = $pdo->query("
            SELECT id, username, email, phone, full_name, role, commission_rate, is_active, created_at
            FROM users 
            WHERE role != 'admin' AND is_active = 1
            ORDER BY created_at DESC
        ");
    }

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $users,
        'count' => count($users)
    ]);
}
?>
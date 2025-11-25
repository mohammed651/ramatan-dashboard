<?php
include __DIR__ . '/../../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $user_id = $_GET['id'] ?? null;

    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User ID is required']);
        exit;
    }

    try {
        // منع حذف الأدمن الرئيسي
        $check_admin = $pdo->prepare("SELECT role FROM users WHERE id = ?");
        $check_admin->execute([$user_id]);
        $user = $check_admin->fetch(PDO::FETCH_ASSOC);

        if ($user && $user['role'] == 'admin') {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Cannot delete admin user'
            ]);
            exit;
        }

        // التحقق من وجود عمليات مرتبطة بالمستخدم
        $check_operations = $pdo->prepare("SELECT COUNT(*) as operation_count FROM operations WHERE sales_id = ?");
        $check_operations->execute([$user_id]);
        $result = $check_operations->fetch(PDO::FETCH_ASSOC);

        if ($result['operation_count'] > 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Cannot delete user with existing operations. Reassign operations first.'
            ]);
            exit;
        }

        // soft delete بدل الحذف المباشر (أفضل للمستخدمين)
        $stmt = $pdo->prepare("UPDATE users SET is_active = 0 WHERE id = ?");
        $stmt->execute([$user_id]);

        echo json_encode([
            'success' => true,
            'message' => 'User deactivated successfully',
            'affected_rows' => $stmt->rowCount()
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
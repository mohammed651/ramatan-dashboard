<?php
include __DIR__ . '/../../config.php';

// التأكد من أن المستخدم مسجل دخول
$current_user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $unit_id = $_GET['id'] ?? null;
    
    if (!$unit_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Unit ID is required']);
        exit;
    }
    
    try {
        $pdo->beginTransaction();
        
        // نجيب project_id قبل الحذف
        $get_project = $pdo->prepare("SELECT project_id FROM units WHERE id = ?");
        $get_project->execute([$unit_id]);
        $unit = $get_project->fetch(PDO::FETCH_ASSOC);
        
        if (!$unit) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Unit not found']);
            exit;
        }
        
        $project_id = $unit['project_id'];
        
        // نتحقق إذا فيه عمليات مرتبطة بالوحدة
        $check_operations = $pdo->prepare("SELECT COUNT(*) as operation_count FROM operations WHERE unit_id = ?");
        $check_operations->execute([$unit_id]);
        $result = $check_operations->fetch(PDO::FETCH_ASSOC);
        
        if ($result['operation_count'] > 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'Cannot delete unit with existing operations. Delete operations first.'
            ]);
            exit;
        }
        
        // حذف الوحدة
        $stmt = $pdo->prepare("DELETE FROM units WHERE id = ?");
        $stmt->execute([$unit_id]);
        
        // 🔥 تحديث total_units في المشروع
        $update_project = $pdo->prepare("
            UPDATE projects 
            SET total_units = GREATEST(0, total_units - 1) 
            WHERE id = ?
        ");
        $update_project->execute([$project_id]);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Unit deleted successfully',
            'affected_rows' => $stmt->rowCount(),
            'project_updated' => true
        ]);
        
    } catch(PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
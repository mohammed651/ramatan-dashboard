<?php
include __DIR__ . '/../../config.php';

// التأكد من أن المستخدم مسجل دخول
$current_user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $required = ['project_id', 'unit_type', 'area', 'price'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            exit;
        }
    }
    
    try {
        // بداية transaction
        $pdo->beginTransaction();
        
        // إضافة الوحدة
        $stmt = $pdo->prepare("
            INSERT INTO units (project_id, unit_number, unit_type, area, price, bedrooms, bathrooms, floor, features, status, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $input['project_id'],
            $input['unit_number'] ?? null,
            $input['unit_type'],
            $input['area'],
            $input['price'],
            $input['bedrooms'] ?? 0,
            $input['bathrooms'] ?? 1,
            $input['floor'] ?? 0,
            $input['features'] ?? '',
            $input['status'] ?? 'متاحة',
            $current_user['user_id']
        ]);
        
        $unit_id = $pdo->lastInsertId();
        
        // 🔥 تحديث total_units في المشروع تلقائياً
        $update_project = $pdo->prepare("
            UPDATE projects 
            SET total_units = total_units + 1 
            WHERE id = ?
        ");
        $update_project->execute([$input['project_id']]);
        
        // commit العملية
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Unit added successfully',
            'unit_id' => $unit_id,
            'added_by' => $current_user['user_id'],
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
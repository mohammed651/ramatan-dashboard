<?php
include __DIR__ . '/../../config.php';

// التأكد من أن المستخدم مسجل دخول
$current_user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $unit_id = $_GET['id'] ?? $input['id'] ?? null;

    if (!$unit_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Unit ID is required']);
        exit;
    }

    try {
        $updatable_fields = ['project_id', 'unit_number', 'unit_type', 'area', 'price', 'bedrooms', 'bathrooms', 'floor', 'features', 'status'];
        $update_data = [];
        $update_sql = [];

        foreach ($updatable_fields as $field) {
            if (isset($input[$field])) {
                $update_sql[] = "$field = ?";
                $update_data[] = $input[$field];
            }
        }

        if (empty($update_sql)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            exit;
        }

        $update_data[] = $unit_id;
        $sql = "UPDATE units SET " . implode(', ', $update_sql) . " WHERE id = ?";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($update_data);

        echo json_encode([
            'success' => true,
            'message' => 'Unit updated successfully',
            'affected_rows' => $stmt->rowCount(),
            'updated_by' => $current_user['user_id']
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
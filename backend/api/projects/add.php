<?php
include __DIR__ . '/../../config.php';

// التأكد من أن المستخدم مسجل دخول
$current_user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $required = ['name', 'location'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            exit;
        }
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO projects (name, location, description, amenities, status, created_by) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $input['name'],
            $input['location'],
            $input['description'] ?? '',
            $input['amenities'] ?? '',
            $input['status'] ?? 'قيد الإنشاء',
            $current_user['user_id']
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Project added successfully',
            'project_id' => $pdo->lastInsertId(),
            'added_by' => $current_user['user_id']
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
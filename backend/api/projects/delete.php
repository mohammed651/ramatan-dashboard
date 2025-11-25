<?php
include __DIR__ . '/../../config.php';

// التأكد من أن المستخدم أدمن
$current_user = requireAdmin();

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $project_id = $_GET['id'] ?? null;

    if (!$project_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Project ID is required']);
        exit;
    }

    try {
        // نتحقق إذا فيه وحدات مرتبطة بالمشروع
        $check_units = $pdo->prepare("SELECT COUNT(*) as unit_count FROM units WHERE project_id = ?");
        $check_units->execute([$project_id]);
        $result = $check_units->fetch(PDO::FETCH_ASSOC);

        if ($result['unit_count'] > 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Cannot delete project with existing units. Delete units first.'
            ]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
        $stmt->execute([$project_id]);

        echo json_encode([
            'success' => true,
            'message' => 'Project deleted successfully',
            'affected_rows' => $stmt->rowCount(),
            'deleted_by' => $current_user['user_id']
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
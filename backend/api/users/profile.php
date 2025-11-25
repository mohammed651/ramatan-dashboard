<?php
include __DIR__ . '/../../config.php';

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = $_GET['id'] ?? $input['id'] ?? null;

    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User ID is required']);
        exit;
    }

    try {
        $updatable_fields = ['email', 'phone', 'full_name'];
        $update_data = [];
        $update_sql = [];

        foreach ($updatable_fields as $field) {
            if (isset($input[$field])) {
                if ($field == 'email') {
                    $check_stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
                    $check_stmt->execute([$input[$field], $user_id]);
                    if ($check_stmt->fetch()) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Email already exists']);
                        exit;
                    }
                }

                $update_sql[] = "$field = ?";
                $update_data[] = $input[$field];
            }
        }

        // تحديث الباسورد إذا موجود
        if (!empty($input['password'])) {
            $update_sql[] = "password = ?";
            $update_data[] = $input['password'];
        }

        if (empty($update_sql)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            exit;
        }

        $update_data[] = $user_id;
        $sql = "UPDATE users SET " . implode(', ', $update_sql) . " WHERE id = ?";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($update_data);

        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully'
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
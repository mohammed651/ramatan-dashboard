<?php
include __DIR__ . '/../../config.php';

// التأكد من أن المستخدم أدمن
$current_user = requireAdmin();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $required = ['username', 'password', 'email', 'full_name', 'role'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            exit;
        }
    }
    
    // تحقق من قوة الباسورد
    if (strlen($input['password']) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO users (username, password, email, phone, full_name, role, commission_rate) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        // التشفير الأوتوماتيك هنا! 🔐
        $hashed_password = hashPassword($input['password']);
        
        $stmt->execute([
            $input['username'],
            $hashed_password, // الباسورد المشفر
            $input['email'],
            $input['phone'] ?? '',
            $input['full_name'],
            $input['role'],
            $input['commission_rate'] ?? 2.5
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'User added successfully',
            'user_id' => $pdo->lastInsertId(),
            'note' => 'Password was automatically encrypted'
        ]);
    } catch(PDOException $e) {
        if ($e->getCode() == 23000) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>
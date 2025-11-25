<?php
header('Content-Type: application/json');

// إعدادات الاتصال
$host = '127.0.0.1';
$dbname = 'ramatan_db';
$username = 'root';
$password = '';

// بيانات الأدمن (عدل عليها كما تريد)
$admin_data = [
    'username' => 'admin1',
    'password' => '123456',  // الباسورد العادي اللي هتكتبه
    'email' => 'admin@ramatan.com',
    'full_name' => 'مدير النظام',
    'phone' => '01000000001',
    'role' => 'admin',
    'commission_rate' => 0.00
];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // تحقق إذا الأدمن موجود already
    $check_admin = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $check_admin->execute([$admin_data['username'], $admin_data['email']]);
    
    if ($check_admin->fetch()) {
        echo json_encode([
            'success' => false, 
            'message' => 'Admin user already exists'
        ]);
        exit;
    }
    
    // تشفير الباسورد
    $hashed_password = password_hash($admin_data['password'], PASSWORD_BCRYPT);
    
    // إضافة الأدمن
    $stmt = $pdo->prepare("
        INSERT INTO users (username, password, email, phone, full_name, role, commission_rate) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $admin_data['username'],
        $hashed_password,  // الباسورد المشفر
        $admin_data['email'],
        $admin_data['phone'],
        $admin_data['full_name'],
        $admin_data['role'],
        $admin_data['commission_rate']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Admin user created successfully!',
        'admin_info' => [
            'username' => $admin_data['username'],
            'password' => $admin_data['password'],  // الباسورد العادي اللي كتبته
            'email' => $admin_data['email'],
            'note' => 'Password was automatically encrypted in database'
        ]
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create admin user',
        'error' => $e->getMessage()
    ]);
}
?>
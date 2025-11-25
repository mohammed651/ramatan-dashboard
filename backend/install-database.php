<?php
header('Content-Type: application/json');

$host = '127.0.0.1';
$dbname = 'ramatan_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // SQL لإنشاء الجداول
    $sql = "
    -- جدول المستخدمين
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        full_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'sales') NOT NULL DEFAULT 'sales',
        commission_rate DECIMAL(5,2) DEFAULT 2.50,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_username (username),
        INDEX idx_role (role),
        INDEX idx_active (is_active)
    );

    -- جدول المشاريع
    CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        total_units INT DEFAULT 0,
        sold_units INT DEFAULT 0,
        status ENUM('قيد الإنشاء', 'تم التسليم', 'قريباً') DEFAULT 'قيد الإنشاء',
        amenities TEXT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
        INDEX idx_status (status),
        INDEX idx_created_by (created_by)
    );

    -- بيانات تجريبية للمستخدمين
    INSERT IGNORE INTO users (id, username, password, email, phone, full_name, role, commission_rate) VALUES 
    (1, 'admin', '\$2y\$12\$8sA9V7w8c1b2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z', 'admin@ramatan.com', '01000000001', 'مدير النظام', 'admin', 0.00),
    (2, 'ahmed', '\$2y\$12\$a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b', 'ahmed.sales@ramatan.com', '01000000002', 'أحمد محمد', 'sales', 2.50),
    (3, 'sara', '\$2y\$12\$b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c', 'sara.ali@ramatan.com', '01000000003', 'سارة علي', 'sales', 3.00);

    -- بيانات تجريبية للمشاريع
    INSERT IGNORE INTO projects (id, name, location, description, amenities, status, created_by) VALUES 
    (1, 'برج النخيل', 'المدينة الرياضية، القاهرة الجديدة', 'برج سكني فاخر يتكون من 20 طابق', 'مسجد - سبا - جيم - أمن 24 ساعة', 'قيد الإنشاء', 1),
    (2, 'مجمع الرحاب', 'التجمع الخامس، القاهرة', 'مجمع سكني متكامل يضم فيلات وشقق', 'حدائق - ملاهي أطفال - أسواق', 'تم التسليم', 1);
    ";
    
    // تنفيذ SQL
    $pdo->exec($sql);
    
    echo json_encode([
        'success' => true,
        'message' => 'Database tables created successfully!',
        'tables_created' => ['users', 'projects']
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database installation failed',
        'error' => $e->getMessage()
    ]);
}
?>
<?php
header('Content-Type: application/json');

$host = '127.0.0.1';
$dbname = 'ramatan_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // SQL لإنشاء كل الجداول
    $sql = "
    -- جدول الوحدات
    CREATE TABLE IF NOT EXISTS units (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        unit_number VARCHAR(20),
        unit_type ENUM('شقة', 'فيلا', 'دوبلكس', 'تاون هاوس', 'محل تجاري') NOT NULL,
        area DECIMAL(8,2) NOT NULL,
        price DECIMAL(12,2) NOT NULL,
        bedrooms INT DEFAULT 0,
        bathrooms INT DEFAULT 1,
        floor INT DEFAULT 0,
        features TEXT,
        status ENUM('متاحة', 'محجوزة', 'مباعة') DEFAULT 'متاحة',
        images JSON,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
        INDEX idx_project_id (project_id),
        INDEX idx_unit_type (unit_type),
        INDEX idx_status (status),
        INDEX idx_price (price),
        INDEX idx_created_by (created_by)
    );

    -- جدول العمليات
    CREATE TABLE IF NOT EXISTS operations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unit_id INT NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20),
        sales_id INT NOT NULL,
        operation_type ENUM('حجز', 'بيع', 'إلغاء حجز') NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        commission_amount DECIMAL(10,2) DEFAULT 0.00,
        payment_method ENUM('كاش', 'تحويل بنكي', 'شيك', 'تقسيط') DEFAULT 'كاش',
        contract_number VARCHAR(50),
        notes TEXT,
        operation_date DATE NOT NULL,
        next_payment_date DATE,
        status ENUM('مكتمل', 'قيد المراجعة', 'ملغي') DEFAULT 'قيد المراجعة',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT,
        FOREIGN KEY (sales_id) REFERENCES users(id) ON DELETE RESTRICT,
        INDEX idx_unit_id (unit_id),
        INDEX idx_sales_id (sales_id),
        INDEX idx_operation_type (operation_type),
        INDEX idx_operation_date (operation_date),
        INDEX idx_status (status)
    );

    -- جدول المدفوعات
    CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        operation_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method ENUM('كاش', 'تحويل بنكي', 'شيك') NOT NULL,
        receipt_number VARCHAR(50),
        notes TEXT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
        INDEX idx_operation_id (operation_id),
        INDEX idx_payment_date (payment_date),
        INDEX idx_created_by (created_by)
    );

    -- بيانات تجريبية للوحدات
    INSERT IGNORE INTO units (project_id, unit_number, unit_type, area, price, bedrooms, bathrooms, floor, features, status, created_by) VALUES 
    (1, 'A101', 'شقة', 120.00, 1200000.00, 3, 2, 5, 'مكيف - مطبخ مجهز - شرفة - إطلالة على المدينة الرياضية', 'متاحة', 1),
    (1, 'A102', 'شقة', 150.00, 1500000.00, 4, 3, 8, 'مكيف - مطبخ مجهز - شرفة - إطلالة على المدينة الرياضية - غرفة خادمة', 'محجوزة', 1),
    (1, 'A201', 'شقة', 180.00, 2000000.00, 4, 3, 12, 'مكيف - مطبخ مجهز - شرفة - إطلالة بانورامية - غرفة خادمة - دريسينج روم', 'مباعة', 1),
    (2, 'V01', 'فيلا', 250.00, 3500000.00, 5, 4, 0, 'حديقة - جراج لـ3 سيارات - مسبح - غرفة خادمة - غرفة سائق', 'متاحة', 1),
    (2, 'V02', 'فيلا', 300.00, 4200000.00, 6, 5, 0, 'حديقة - جراج لـ4 سيارات - مسبح - غرفة خادمة - غرفة سائق - ساونا', 'مباعة', 1);

    -- بيانات تجريبية للعمليات
    INSERT IGNORE INTO operations (unit_id, customer_name, customer_phone, sales_id, operation_type, amount, commission_amount, payment_method, contract_number, notes, operation_date, status) VALUES 
    (3, 'محمد أحمد', '01112223334', 2, 'بيع', 2000000.00, 50000.00, 'تحويل بنكي', 'CON-2024-001', 'تم البيع بنظام التقسيط على 3 سنوات', '2024-01-15', 'مكتمل'),
    (2, 'أحمد علي', '01113334455', 3, 'حجز', 200000.00, 5000.00, 'كاش', 'RES-2024-001', 'حجز عادي - استلام المتبقي خلال 30 يوم', '2024-01-20', 'قيد المراجعة'),
    (5, 'سلمى محمود', '01114445566', 2, 'بيع', 4200000.00, 105000.00, 'شيك', 'CON-2024-002', 'تم البيع كاش - استلام الوحدة خلال أسبوع', '2024-01-25', 'مكتمل');

    -- بيانات تجريبية للمدفوعات
    INSERT IGNORE INTO payments (operation_id, amount, payment_date, payment_method, receipt_number, notes, created_by) VALUES 
    (1, 500000.00, '2024-01-15', 'تحويل بنكي', 'REC-2024-001', 'الدفعة الأولى - 25% من إجمالي المبلغ', 2),
    (1, 500000.00, '2024-02-15', 'تحويل بنكي', 'REC-2024-002', 'الدفعة الثانية', 2),
    (2, 200000.00, '2024-01-20', 'كاش', 'REC-2024-003', 'مبلغ الحجز الكامل', 3),
    (3, 4200000.00, '2024-01-25', 'شيك', 'REC-2024-004', 'المبلغ الكامل - تم الصرف', 2);

    -- تحديث إحصائيات المشاريع
    UPDATE projects SET total_units = (SELECT COUNT(*) FROM units WHERE project_id = projects.id);
    UPDATE projects SET sold_units = (SELECT COUNT(*) FROM units WHERE project_id = projects.id AND status = 'مباعة');
    ";
    
    // تنفيذ SQL
    $pdo->exec($sql);
    
    echo json_encode([
        'success' => true,
        'message' => 'All database tables created successfully!',
        'tables_created' => ['units', 'operations', 'payments'],
        'sample_data_added' => ['units', 'operations', 'payments']
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database setup failed',
        'error' => $e->getMessage()
    ]);
}
?>
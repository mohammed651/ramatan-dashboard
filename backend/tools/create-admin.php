<?php
header('Content-Type: application/json');

// === CONFIG - عدّل القيم هنا إن احتجت ===
$host = '127.0.0.1';
$dbname = 'ramatan_db';
$username = 'root';
$password = '';

// Admin plain password - غيّره هنا قبل التشغيل لو تريد
$admin_plain_password = '123456';

// Admin data (customize before run)
$admin_data = [
    'username' => 'admin',
    'password' => $admin_plain_password,
    'email' => 'admin@ramatan.com',
    'full_name' => 'مدير النظام',
    'phone' => '01000000001',
    'role' => 'admin',
    'commission_rate' => 0.00
];

// Other demo users (you provided bcrypt hashes earlier; we reuse them)
$demo_users = [
    [
        'username' => 'ahmed',
        'password_hash' => '$2y$12$a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b',
        'email' => 'ahmed.sales@ramatan.com',
        'phone' => '01000000002',
        'full_name' => 'أحمد محمد',
        'role' => 'sales',
        'commission_rate' => 2.50
    ],
    [
        'username' => 'sara',
        'password_hash' => '$2y$12$b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c',
        'email' => 'sara.ali@ramatan.com',
        'phone' => '01000000003',
        'full_name' => 'سارة علي',
        'role' => 'sales',
        'commission_rate' => 3.00
    ],
    [
        'username' => 'mohamed',
        'password_hash' => '$2y$12$c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d',
        'email' => 'mohamed.hassan@ramatan.com',
        'phone' => '01000000004',
        'full_name' => 'محمد حسن',
        'role' => 'sales',
        'commission_rate' => 2.75
    ],
];

// Demo projects (use created_by = admin_id later)
$demo_projects = [
    [
        'name' => 'برج النخيل',
        'location' => 'المدينة الرياضية، القاهرة الجديدة',
        'description' => 'برج سكني فاخر يتكون من 20 طابق، بإطلالة بانورامية على المدينة الرياضية',
        'amenities' => 'مسجد - سبا - جيم - أمن 24 ساعة - مواقف سيارات',
        'status' => 'قيد الإنشاء'
    ],
    [
        'name' => 'مجمع الرحاب',
        'location' => 'التجمع الخامس، القاهرة',
        'description' => 'مجمع سكني متكامل يضم فيلات وشقق بمساحات مختلفة، تصميم عصري وأنيق',
        'amenities' => 'حدائق - ملاهي أطفال - أسواق - مركز تجاري',
        'status' => 'تم التسليم'
    ],
    [
        'name' => 'عقار الشروق',
        'location' => 'مدينة الشروق، القاهرة',
        'description' => 'مجمع متكامل يضم وحدات سكنية وتجارية في موقع متميز بمدينة الشروق',
        'amenities' => 'مركز طبي - مدارس - أسواق - خدمات',
        'status' => 'قريباً'
    ],
];

// Demo units - we'll set project_id and created_by dynamically
$demo_units = [
    ['project_idx'=>0,'unit_number'=>'A101','unit_type'=>'شقة','area'=>120.00,'price'=>1200000.00,'bedrooms'=>3,'bathrooms'=>2,'floor'=>5,'features'=>'مكيف - مطبخ مجهز - شرفة - إطلالة على المدينة الرياضية','status'=>'متاحة'],
    ['project_idx'=>0,'unit_number'=>'A102','unit_type'=>'شقة','area'=>150.00,'price'=>1500000.00,'bedrooms'=>4,'bathrooms'=>3,'floor'=>8,'features'=>'مكيف - مطبخ مجهز - شرفة - إطلالة على المدينة الرياضية - غرفة خادمة','status'=>'محجوزة'],
    ['project_idx'=>0,'unit_number'=>'A201','unit_type'=>'شقة','area'=>180.00,'price'=>2000000.00,'bedrooms'=>4,'bathrooms'=>3,'floor'=>12,'features'=>'مكيف - مطبخ مجهز - شرفة - إطلالة بانورامية - غرفة خادمة - دريسينج روم','status'=>'مباعة'],
    ['project_idx'=>1,'unit_number'=>'V01','unit_type'=>'فيلا','area'=>250.00,'price'=>3500000.00,'bedrooms'=>5,'bathrooms'=>4,'floor'=>0,'features'=>'حديقة - جراج لـ3 سيارات - مسبح - غرفة خادمة - غرفة سائق','status'=>'متاحة'],
    ['project_idx'=>1,'unit_number'=>'V02','unit_type'=>'فيلا','area'=>300.00,'price'=>4200000.00,'bedrooms'=>6,'bathrooms'=>5,'floor'=>0,'features'=>'حديقة - جراج لـ4 سيارات - مسبح - غرفة خادمة - غرفة سائق - ساونا','status'=>'مباعة'],
    ['project_idx'=>2,'unit_number'=>'S101','unit_type'=>'شقة','area'=>90.00,'price'=>800000.00,'bedrooms'=>2,'bathrooms'=>2,'floor'=>3,'features'=>'مطبخ مجهز - شرفة - تكييف','status'=>'متاحة'],
    ['project_idx'=>2,'unit_number'=>'C01','unit_type'=>'محل تجاري','area'=>60.00,'price'=>1200000.00,'bedrooms'=>0,'bathrooms'=>1,'floor'=>1,'features'=>'مدخل رئيسي - واجهة زجاجية - تكييف مركزي','status'=>'متاحة'],
];

// Demo operations (unit_idx refers to $demo_units index, sales_username will be mapped to id)
$demo_operations = [
    ['unit_idx'=>2,'customer_name'=>'محمد أحمد','customer_phone'=>'01112223334','sales_username'=>'ahmed','operation_type'=>'بيع','amount'=>2000000.00,'commission_amount'=>50000.00,'payment_method'=>'تحويل بنكي','contract_number'=>'CON-2024-001','notes'=>'تم البيع بنظام التقسيط على 3 سنوات','operation_date'=>'2024-01-15','status'=>'مكتمل'],
    ['unit_idx'=>1,'customer_name'=>'أحمد علي','customer_phone'=>'01113334455','sales_username'=>'sara','operation_type'=>'حجز','amount'=>200000.00,'commission_amount'=>5000.00,'payment_method'=>'كاش','contract_number'=>'RES-2024-001','notes'=>'حجز عادي - استلام المتبقي خلال 30 يوم','operation_date'=>'2024-01-20','status'=>'قيد المراجعة'],
    ['unit_idx'=>4,'customer_name'=>'سلمى محمود','customer_phone'=>'01114445566','sales_username'=>'ahmed','operation_type'=>'بيع','amount'=>4200000.00,'commission_amount'=>105000.00,'payment_method'=>'شيك','contract_number'=>'CON-2024-002','notes'=>'تم البيع كاش - استلام الوحدة خلال أسبوع','operation_date'=>'2024-01-25','status'=>'مكتمل'],
    ['unit_idx'=>0,'customer_name'=>'خالد عبدالله','customer_phone'=>'01115556677','sales_username'=>'mohamed','operation_type'=>'حجز','amount'=>150000.00,'commission_amount'=>4125.00,'payment_method'=>'تحويل بنكي','contract_number'=>'RES-2024-002','notes'=>'حجز مبدئي - مراجعة العقود الأسبوع القادم','operation_date'=>'2024-02-01','status'=>'قيد المراجعة'],
];

// Demo payments (operation_idx refers to $demo_operations index)
$demo_payments = [
    ['operation_idx'=>0,'amount'=>500000.00,'payment_date'=>'2024-01-15','payment_method'=>'تحويل بنكي','receipt_number'=>'REC-2024-001','notes'=>'الدفعة الأولى - 25% من إجمالي المبلغ','created_by_username'=>'ahmed'],
    ['operation_idx'=>0,'amount'=>500000.00,'payment_date'=>'2024-02-15','payment_method'=>'تحويل بنكي','receipt_number'=>'REC-2024-002','notes'=>'الدفعة الثانية','created_by_username'=>'ahmed'],
    ['operation_idx'=>1,'amount'=>200000.00,'payment_date'=>'2024-01-20','payment_method'=>'كاش','receipt_number'=>'REC-2024-003','notes'=>'مبلغ الحجز الكامل','created_by_username'=>'sara'],
    ['operation_idx'=>2,'amount'=>4200000.00,'payment_date'=>'2024-01-25','payment_method'=>'شيك','receipt_number'=>'REC-2024-004','notes'=>'المبلغ الكامل - تم الصرف','created_by_username'=>'ahmed'],
    ['operation_idx'=>3,'amount'=>150000.00,'payment_date'=>'2024-02-01','payment_method'=>'تحويل بنكي','receipt_number'=>'REC-2024-005','notes'=>'مبلغ الحجز المبدئي','created_by_username'=>'mohamed'],
];

// Helper: execute prepared statement and return lastInsertId or existing id
function findOrInsertUser($pdo, $username, $password_hash, $email, $phone, $full_name, $role, $commission_rate) {
    // check by username or email
    $q = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $q->execute([$username, $email]);
    $row = $q->fetch(PDO::FETCH_ASSOC);
    if ($row) return (int)$row['id'];

    $ins = $pdo->prepare("INSERT INTO users (username, password, email, phone, full_name, role, commission_rate) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $ins->execute([$username, $password_hash, $email, $phone, $full_name, $role, $commission_rate]);
    return (int)$pdo->lastInsertId();
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $pdo->beginTransaction();

    $summary = [
        'admin_created' => false,
        'users_added' => 0,
        'projects_added' => 0,
        'units_added' => 0,
        'operations_added' => 0,
        'payments_added' => 0
    ];

    // 1) Admin: check or create (we hash plaintext admin password)
    $check = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $check->execute([$admin_data['username'], $admin_data['email']]);
    $existing = $check->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $admin_id = (int)$existing['id'];
    } else {
        $hashed = password_hash($admin_data['password'], PASSWORD_BCRYPT);
        $ins = $pdo->prepare("INSERT INTO users (username, password, email, phone, full_name, role, commission_rate) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $ins->execute([$admin_data['username'], $hashed, $admin_data['email'], $admin_data['phone'], $admin_data['full_name'], $admin_data['role'], $admin_data['commission_rate']]);
        $admin_id = (int)$pdo->lastInsertId();
        $summary['admin_created'] = true;
    }

    // 2) Insert other demo users (using provided bcrypt hashes)
    foreach ($demo_users as $u) {
        $id = findOrInsertUser($pdo, $u['username'], $u['password_hash'], $u['email'], $u['phone'], $u['full_name'], $u['role'], $u['commission_rate']);
        if ($id) $summary['users_added']++;
    }

    // fetch map of usernames => ids for users including admin
    $userStmt = $pdo->query("SELECT id, username FROM users WHERE username IN ('admin','ahmed','sara','mohamed')");
    $userMap = [];
    while ($r = $userStmt->fetch(PDO::FETCH_ASSOC)) {
        $userMap[$r['username']] = (int)$r['id'];
    }

    // 3) Insert projects (created_by = admin_id)
    $projectIds = [];
    $projIns = $pdo->prepare("INSERT INTO projects (name, location, description, amenities, status, created_by) VALUES (?, ?, ?, ?, ?, ?)");
    $projSelect = $pdo->prepare("SELECT id FROM projects WHERE name = ?");
    foreach ($demo_projects as $idx => $p) {
        $projSelect->execute([$p['name']]);
        $found = $projSelect->fetch(PDO::FETCH_ASSOC);
        if ($found) {
            $projectIds[$idx] = (int)$found['id'];
            continue;
        }
        $projIns->execute([$p['name'], $p['location'], $p['description'], $p['amenities'], $p['status'], $admin_id]);
        $projectIds[$idx] = (int)$pdo->lastInsertId();
        $summary['projects_added']++;
    }

    // 4) Insert units
    $unitIds = [];
    $unitIns = $pdo->prepare("INSERT INTO units (project_id, unit_number, unit_type, area, price, bedrooms, bathrooms, floor, features, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $unitSelect = $pdo->prepare("SELECT id FROM units WHERE project_id = ? AND unit_number = ?");
    foreach ($demo_units as $i => $u) {
        $pid = $projectIds[$u['project_idx']];
        $unitSelect->execute([$pid, $u['unit_number']]);
        $found = $unitSelect->fetch(PDO::FETCH_ASSOC);
        if ($found) {
            $unitIds[$i] = (int)$found['id'];
            continue;
        }
        $unitIns->execute([$pid, $u['unit_number'], $u['unit_type'], $u['area'], $u['price'], $u['bedrooms'], $u['bathrooms'], $u['floor'], $u['features'], $u['status'], $admin_id]);
        $unitIds[$i] = (int)$pdo->lastInsertId();
        $summary['units_added']++;
    }

    // 5) Insert operations
    $operationIds = [];
    $opIns = $pdo->prepare("INSERT INTO operations (unit_id, customer_name, customer_phone, sales_id, operation_type, amount, commission_amount, payment_method, contract_number, notes, operation_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $opSelect = $pdo->prepare("SELECT id FROM operations WHERE unit_id = ? AND contract_number = ?");
    foreach ($demo_operations as $i => $op) {
        $unit_id = $unitIds[$op['unit_idx']];
        $sales_id = $userMap[$op['sales_username']] ?? null;
        if (!$sales_id) {
            // skip this op if sales user not found
            continue;
        }
        $opSelect->execute([$unit_id, $op['contract_number']]);
        $found = $opSelect->fetch(PDO::FETCH_ASSOC);
        if ($found) {
            $operationIds[$i] = (int)$found['id'];
            continue;
        }
        $opIns->execute([$unit_id, $op['customer_name'], $op['customer_phone'], $sales_id, $op['operation_type'], $op['amount'], $op['commission_amount'], $op['payment_method'], $op['contract_number'], $op['notes'], $op['operation_date'], $op['status']]);
        $operationIds[$i] = (int)$pdo->lastInsertId();
        $summary['operations_added']++;
    }

    // 6) Insert payments
    $payIns = $pdo->prepare("INSERT INTO payments (operation_id, amount, payment_date, payment_method, receipt_number, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $paySelect = $pdo->prepare("SELECT id FROM payments WHERE operation_id = ? AND receipt_number = ?");
    foreach ($demo_payments as $p) {
        $op_idx = $p['operation_idx'];
        $operation_id = $operationIds[$op_idx] ?? null;
        if (!$operation_id) continue;
        $created_by = $userMap[$p['created_by_username']] ?? null;
        if (!$created_by) continue;
        $paySelect->execute([$operation_id, $p['receipt_number']]);
        $found = $paySelect->fetch(PDO::FETCH_ASSOC);
        if ($found) continue;
        $payIns->execute([$operation_id, $p['amount'], $p['payment_date'], $p['payment_method'], $p['receipt_number'], $p['notes'], $created_by]);
        $summary['payments_added']++;
    }

    // 7) Update project stats
    $pdo->exec("UPDATE projects SET total_units = (SELECT COUNT(*) FROM units WHERE project_id = projects.id)");
    $pdo->exec("UPDATE projects SET sold_units = (SELECT COUNT(*) FROM units WHERE project_id = projects.id AND status = 'مباعة')");

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Admin and demo data inserted (idempotent).',
        'admin_id' => $admin_id,
        'summary' => $summary
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    echo json_encode([
        'success' => false,
        'message' => 'Error while inserting demo data',
        'error' => $e->getMessage()
    ]);
}
?>

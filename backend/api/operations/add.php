<?php
include __DIR__ . '/../../config.php';
@include_once __DIR__ . '/../../auth.php'; // non-fatal include if auth is separate

// تأكد المصادقة (Sales أو Admin)
if (function_exists('requireAuth')) {
    $current_user = requireAuth();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$required = ['unit_id', 'customer_name', 'operation_type', 'amount'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit;
    }
}

$unit_id = (int)$input['unit_id'];
$operation_type = $input['operation_type'];
$amount = $input['amount'];

try {
    // Start transaction
    $pdo->beginTransaction();

    // Lock unit row to avoid race conditions
    $check_unit = $pdo->prepare("SELECT id, status, project_id FROM units WHERE id = ? FOR UPDATE");
    $check_unit->execute([$unit_id]);
    $unit = $check_unit->fetch(PDO::FETCH_ASSOC);

    if (!$unit) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Unit not found']);
        exit;
    }

    // Validation: cannot add sale if already sold
    if ($unit['status'] === 'مباعة') {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Unit is already sold']);
        exit;
    }
    // prevent double reservation if already reserved
    if ($operation_type === 'حجز' && $unit['status'] === 'محجوزة') {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Unit is already reserved']);
        exit;
    }

    // compute commission safely
    $sales_user_id = $current_user['user_id'] ?? null;
    if (!$sales_user_id) $sales_user_id = $input['sales_id'] ?? null;

    $get_commission_rate = $pdo->prepare("SELECT commission_rate FROM users WHERE id = ?");
    $get_commission_rate->execute([$sales_user_id]);
    $user_data = $get_commission_rate->fetch(PDO::FETCH_ASSOC);
    $commission_rate = $user_data['commission_rate'] ?? 2.5;
    $commission_amount = ($amount * $commission_rate) / 100;

    // Insert operation
    $stmt = $pdo->prepare("
        INSERT INTO operations (unit_id, customer_name, customer_phone, sales_id, operation_type, amount, commission_amount, payment_method, contract_number, notes, operation_date, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        $unit_id,
        $input['customer_name'],
        $input['customer_phone'] ?? null,
        $sales_user_id,
        $operation_type,
        $amount,
        $commission_amount,
        $input['payment_method'] ?? 'كاش',
        $input['contract_number'] ?? null,
        $input['notes'] ?? '',
        $input['operation_date'] ?? date('Y-m-d'),
        $input['status'] ?? 'قيد المراجعة'
    ]);

    $operation_id = $pdo->lastInsertId();

    // Update unit status depending on operation_type (only change when appropriate)
    $new_unit_status = null;
    if ($operation_type === 'بيع') {
        $new_unit_status = 'مباعة';
    } elseif ($operation_type === 'حجز' && $unit['status'] === 'متاحة') {
        $new_unit_status = 'محجوزة';
    }

    if ($new_unit_status !== null) {
        $update_unit = $pdo->prepare("UPDATE units SET status = ? WHERE id = ?");
        $update_unit->execute([$new_unit_status, $unit_id]);
    }

    // If requested, add initial payment
    if (!empty($input['add_payment']) && $input['add_payment'] === true) {
        $payment_stmt = $pdo->prepare("
            INSERT INTO payments (operation_id, amount, payment_date, payment_method, receipt_number, notes, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $payment_stmt->execute([
            $operation_id,
            $amount,
            $input['operation_date'] ?? date('Y-m-d'),
            $input['payment_method'] ?? 'كاش',
            $input['receipt_number'] ?? null,
            $input['payment_notes'] ?? 'الدفعة الأولى',
            $sales_user_id
        ]);
    }

    // Recompute project aggregates to avoid drift
    $project_id = (int)$unit['project_id'];
    if ($project_id) {
        $update_proj = $pdo->prepare("
            UPDATE projects
            SET total_units = (SELECT COUNT(*) FROM units WHERE project_id = ?),
                sold_units  = (SELECT COUNT(*) FROM units WHERE project_id = ? AND status = 'مباعة')
            WHERE id = ?
        ");
        $update_proj->execute([$project_id, $project_id, $project_id]);
        $project_updated = true;
    } else {
        $project_updated = false;
    }

    $pdo->commit();

    // Return response (shape compatible with original)
    echo json_encode([
        'success' => true,
        'message' => 'Operation added successfully',
        'operation_id' => $operation_id,
        'commission' => [
            'rate' => $commission_rate,
            'amount' => $commission_amount
        ],
        'unit_updated' => [
            'previous_status' => $unit['status'],
            'new_status' => $new_unit_status ?? $unit['status']
        ],
        'project_updated' => $project_updated,
        'sales_person' => $current_user['username'] ?? null
    ]);
    exit;

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log('Error in add operation: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
    exit;
}
?>

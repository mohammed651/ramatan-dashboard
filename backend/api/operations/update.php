<?php
include __DIR__ . '/../../config.php';
@include_once __DIR__ . '/../../auth.php';

if (function_exists('requireAuth')) {
    $current_user = requireAuth();
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$operation_id = $_GET['id'] ?? $input['id'] ?? null;

if (!$operation_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Operation ID is required']);
    exit;
}

try {
    $pdo->beginTransaction();

    // Lock the operation row for update to avoid races
    $stmt = $pdo->prepare("SELECT * FROM operations WHERE id = ? FOR UPDATE");
    $stmt->execute([$operation_id]);
    $op = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$op) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Operation not found']);
        exit;
    }

    $unit_id = (int)$op['unit_id'];
    $old_type = $op['operation_type'];
    $old_status_op = $op['status'];

    // Build update set safely
    $updatable_fields = ['customer_name','customer_phone','operation_type','amount','commission_amount','payment_method','contract_number','notes','operation_date','status'];
    $update_sql = [];
    $update_data = [];
    foreach ($updatable_fields as $f) {
        if (array_key_exists($f, $input)) {
            $update_sql[] = "$f = ?";
            $update_data[] = $input[$f];
        }
    }

    if (empty($update_sql)) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        exit;
    }

    $update_data[] = $operation_id;
    $sql = "UPDATE operations SET " . implode(', ', $update_sql) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($update_data);

    // Reconcile unit status based on remaining operations
    // (consider operations with status != 'ملغي')
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM operations WHERE unit_id = ? AND operation_type = 'بيع' AND status <> 'ملغي'");
    $stmt->execute([$unit_id]);
    $has_sale = (int)$stmt->fetchColumn() > 0;

    if ($has_sale) {
        $new_unit_status = 'مباعة';
    } else {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM operations WHERE unit_id = ? AND operation_type = 'حجز' AND status <> 'ملغي'");
        $stmt->execute([$unit_id]);
        $has_reserve = (int)$stmt->fetchColumn() > 0;
        $new_unit_status = $has_reserve ? 'محجوزة' : 'متاحة';
    }

    // Update unit status if changed
    $stmt = $pdo->prepare("UPDATE units SET status = ? WHERE id = ?");
    $stmt->execute([$new_unit_status, $unit_id]);

    // Recompute project aggregates to avoid drift
    $stmt = $pdo->prepare("SELECT project_id FROM units WHERE id = ?");
    $stmt->execute([$unit_id]);
    $proj = $stmt->fetch(PDO::FETCH_ASSOC);
    $project_updated = false;
    if ($proj && isset($proj['project_id'])) {
        $project_id = (int)$proj['project_id'];
        $stmt = $pdo->prepare("
            UPDATE projects
            SET total_units = (SELECT COUNT(*) FROM units WHERE project_id = ?),
                sold_units  = (SELECT COUNT(*) FROM units WHERE project_id = ? AND status = 'مباعة')
            WHERE id = ?
        ");
        $stmt->execute([$project_id, $project_id, $project_id]);
        $project_updated = true;
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Operation updated successfully',
        'affected_rows' => $stmt->rowCount(),
        'operation_id' => $operation_id,
        'unit_id' => $unit_id,
        'new_unit_status' => $new_unit_status,
        'project_updated' => $project_updated
    ]);
    exit;

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log('Error updating operation (id=' . ($operation_id ?? 'NULL') . '): ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
    exit;
}
?>

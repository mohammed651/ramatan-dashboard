<?php
// Delete operation endpoint - enhanced to keep unit/project consistency
// Keep include paths as in your project structure
include __DIR__ . '/../../config.php';
@include_once __DIR__ . '/../../auth.php'; // include auth if available (no fatal if missing)

// If auth is available and has requireAuth(), enforce it (non-breaking if not present)
if (function_exists('requireAuth')) {
    $current_user = requireAuth();
}

if ($_SERVER['REQUEST_METHOD'] != 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$operation_id = $_GET['id'] ?? null;

if (!$operation_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Operation ID is required']);
    exit;
}

try {
    // Start transaction to ensure atomicity
    $pdo->beginTransaction();

    // 1) Fetch the operation details (to know unit_id and type) BEFORE deleting
    $stmt = $pdo->prepare("SELECT id, unit_id, operation_type, status FROM operations WHERE id = ? FOR UPDATE");
    $stmt->execute([$operation_id]);
    $op = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$op) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Operation not found']);
        exit;
    }

    $unit_id = (int)$op['unit_id'];

    // 2) Delete the operation
    $del = $pdo->prepare("DELETE FROM operations WHERE id = ?");
    $del->execute([$operation_id]);

    // 3) Recompute unit status based on remaining operations for this unit
    // Check for any non-cancelled sale operations
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM operations WHERE unit_id = ? AND operation_type = 'بيع' AND status <> 'ملغي'");
    $stmt->execute([$unit_id]);
    $has_sale = (int)$stmt->fetchColumn() > 0;

    if ($has_sale) {
        $new_status = 'مباعة';
    } else {
        // No sale exists, check for any active reservation
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM operations WHERE unit_id = ? AND operation_type = 'حجز' AND status <> 'ملغي'");
        $stmt->execute([$unit_id]);
        $has_reserve = (int)$stmt->fetchColumn() > 0;
        $new_status = $has_reserve ? 'محجوزة' : 'متاحة';
    }

    // Update unit status only if changed
    $update = $pdo->prepare("UPDATE units SET status = ? WHERE id = ?");
    $update->execute([$new_status, $unit_id]);

    // 4) Recompute project's aggregate fields to avoid drift (safe approach)
    $stmt = $pdo->prepare("SELECT project_id FROM units WHERE id = ?");
    $stmt->execute([$unit_id]);
    $proj = $stmt->fetch(PDO::FETCH_ASSOC);
    $project_updated = false;
    if ($proj && isset($proj['project_id'])) {
        $project_id = (int)$proj['project_id'];
        $stmt = $pdo->prepare("
            UPDATE projects
            SET
                total_units = (SELECT COUNT(*) FROM units WHERE project_id = ?),
                sold_units  = (SELECT COUNT(*) FROM units WHERE project_id = ? AND status = 'مباعة')
            WHERE id = ?
        ");
        $stmt->execute([$project_id, $project_id, $project_id]);
        $project_updated = true;
    }

    $pdo->commit();

    // Keep response shape similar to original but add useful info (doesn't break front-end)
    echo json_encode([
        'success' => true,
        'message' => 'Operation deleted successfully',
        'affected_rows' => $del->rowCount(),
        'unit_id' => $unit_id,
        'new_unit_status' => $new_status,
        'project_updated' => $project_updated
    ]);
    exit;
} catch (Exception $e) {
    // Rollback and log internal error without exposing DB details to client
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Error deleting operation (id=' . ($operation_id ?? 'NULL') . '): ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
    exit;
}
?>

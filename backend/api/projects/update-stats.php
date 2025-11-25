<?php
include __DIR__ . '/../../config.php';

$current_user = requireAdmin();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $project_id = $input['project_id'] ?? null;
    
    if (!$project_id) {
        sendError('Project ID is required', 'MISSING_PROJECT_ID', 400);
    }
    
    try {
        // تحديث total_units
        $update_total = $pdo->prepare("
            UPDATE projects 
            SET total_units = (SELECT COUNT(*) FROM units WHERE project_id = ?)
            WHERE id = ?
        ");
        $update_total->execute([$project_id, $project_id]);
        
        // تحديث sold_units
        $update_sold = $pdo->prepare("
            UPDATE projects 
            SET sold_units = (SELECT COUNT(*) FROM units WHERE project_id = ? AND status = 'مباعة')
            WHERE id = ?
        ");
        $update_sold->execute([$project_id, $project_id]);
        
        sendSuccess([
            'project_id' => $project_id,
            'message' => 'Project statistics updated successfully'
        ]);
        
    } catch(PDOException $e) {
        sendError('Failed to update statistics: ' . $e->getMessage(), 'UPDATE_FAILED', 500);
    }
} else {
    sendError('Method not allowed', 'METHOD_NOT_ALLOWED', 405);
}
?>
<?php
include __DIR__ . '/../../config.php';

// التأكد من أن المستخدم مسجل دخول
$current_user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    
    // إذا كان سالز، نشوف إحصائياته فقط
    if ($current_user['role'] == 'sales') {
        $user_id = $current_user['user_id'];
        
        // إحصائيات الوحدات لكل المشاريع
        $units_stats = $pdo->query("
            SELECT 
                status,
                COUNT(*) as count,
                SUM(price) as total_value
            FROM units 
            GROUP BY status
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        // إحصائيات العمليات للـ sales فقط
        $operations_stats = $pdo->prepare("
            SELECT 
                operation_type,
                COUNT(*) as count,
                SUM(amount) as total_amount,
                SUM(commission_amount) as total_commission
            FROM operations 
            WHERE sales_id = ? AND status = 'مكتمل'
            GROUP BY operation_type
        ");
        $operations_stats->execute([$user_id]);
        $operations_stats_result = $operations_stats->fetchAll(PDO::FETCH_ASSOC);
        
        // إحصائيات المبيعات للـ sales فقط
        $sales_stats = $pdo->prepare("
            SELECT 
                u.full_name as sales_person,
                COUNT(o.id) as operations_count,
                SUM(o.amount) as total_sales,
                SUM(o.commission_amount) as total_commission
            FROM operations o
            LEFT JOIN users u ON o.sales_id = u.id
            WHERE o.sales_id = ? AND o.status = 'مكتمل'
            GROUP BY o.sales_id
        ");
        $sales_stats->execute([$user_id]);
        $sales_stats_result = $sales_stats->fetchAll(PDO::FETCH_ASSOC);
        
    } else {
        // الأدمن يشوف كل الإحصائيات
        $units_stats = $pdo->query("
            SELECT 
                status,
                COUNT(*) as count,
                SUM(price) as total_value
            FROM units 
            GROUP BY status
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        $operations_stats = $pdo->query("
            SELECT 
                operation_type,
                COUNT(*) as count,
                SUM(amount) as total_amount,
                SUM(commission_amount) as total_commission
            FROM operations 
            WHERE status = 'مكتمل'
            GROUP BY operation_type
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        $sales_stats = $pdo->query("
            SELECT 
                u.full_name as sales_person,
                COUNT(o.id) as operations_count,
                SUM(o.amount) as total_sales,
                SUM(o.commission_amount) as total_commission
            FROM operations o
            LEFT JOIN users u ON o.sales_id = u.id
            WHERE o.status = 'مكتمل'
            GROUP BY o.sales_id
            ORDER BY total_sales DESC
        ")->fetchAll(PDO::FETCH_ASSOC);
    }
    
    // 🔥 إحصائيات جديدة: الوحدات المتاحة في كل مشروع
    $available_units_stats = $pdo->query("
        SELECT 
            p.id,
            p.name as project_name,
            p.location,
            p.total_units,
            p.sold_units,
            (p.total_units - p.sold_units) as available_units,
            ROUND((p.sold_units / p.total_units) * 100, 2) as sold_percentage
        FROM projects p
        ORDER BY p.created_at DESC
    ")->fetchAll(PDO::FETCH_ASSOC);
    
    // المشاريع النشطة (للجميع)
    $active_projects = $pdo->query("
        SELECT COUNT(*) as active_projects 
        FROM projects 
        WHERE status != 'تم التسليم'
    ")->fetch(PDO::FETCH_ASSOC);
    
    // إجمالي القيمة السوقية
    $total_market_value = $pdo->query("
        SELECT SUM(price) as total_value 
        FROM units 
        WHERE status IN ('متاحة', 'محجوزة')
    ")->fetch(PDO::FETCH_ASSOC);
    
    // إجمالي المبيعات
    $total_sales = $pdo->query("
        SELECT SUM(amount) as total_sales_amount 
        FROM operations 
        WHERE operation_type = 'بيع' AND status = 'مكتمل'
    ")->fetch(PDO::FETCH_ASSOC);
    
    // عدد العملاء
    $total_customers = $pdo->query("
        SELECT COUNT(DISTINCT customer_phone) as total_customers 
        FROM operations 
        WHERE customer_phone != ''
    ")->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'units_stats' => $units_stats,
            'operations_stats' => $operations_stats_result ?? $operations_stats,
            'sales_stats' => $sales_stats_result ?? $sales_stats,
            'available_units_stats' => $available_units_stats,
            'active_projects' => $active_projects['active_projects'],
            'total_market_value' => $total_market_value['total_value'] ?? 0,
            'total_sales' => $total_sales['total_sales_amount'] ?? 0,
            'total_customers' => $total_customers['total_customers'] ?? 0
        ],
        'user' => [
            'id' => $current_user['user_id'],
            'role' => $current_user['role'],
            'username' => $current_user['username']
        ],
        'company' => 'Ramatan Developments',
        'summary' => [
            'total_units' => array_sum(array_column($units_stats, 'count')),
            'total_operations' => array_sum(array_column($operations_stats_result ?? $operations_stats, 'count')),
            'total_projects' => count($available_units_stats)
        ]
    ]);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
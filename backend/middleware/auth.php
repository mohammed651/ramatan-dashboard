<?php
// Ramatan Developments - Authentication Middleware

function getAuthorizationHeader() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    return $headers;
}

function getBearerToken() {
    $headers = getAuthorizationHeader();
    if (!empty($headers)) {
        if (preg_match('/Bearer\s+(.*)$/i', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function validateToken() {
    $token = getBearerToken();
    
    if (!$token) {
        http_response_code(401);
        echo json_encode([
            'success' => false, 
            'message' => 'Access token required',
            'error_code' => 'MISSING_TOKEN'
        ]);
        exit;
    }
    
    // تحقق من صحة التوكن
    $payload = verifyJWT($token);
    if (!$payload) {
        http_response_code(401);
        echo json_encode([
            'success' => false, 
            'message' => 'Invalid or expired token',
            'error_code' => 'INVALID_TOKEN'
        ]);
        exit;
    }
    
    // تحقق إذا المستخدم لسه نشط
    global $pdo;
    $stmt = $pdo->prepare("SELECT is_active FROM users WHERE id = ?");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || !$user['is_active']) {
        http_response_code(401);
        echo json_encode([
            'success' => false, 
            'message' => 'User account is deactivated',
            'error_code' => 'USER_DEACTIVATED'
        ]);
        exit;
    }
    
    return $payload;
}

// Middleware functions
function requireAuth() {
    return validateToken();
}

function requireAdmin() {
    $user = validateToken();
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false, 
            'message' => 'Admin access required',
            'error_code' => 'ADMIN_REQUIRED'
        ]);
        exit;
    }
    return $user;
}

function requireSales() {
    $user = validateToken();
    if (!in_array($user['role'], ['admin', 'sales'])) {
        http_response_code(403);
        echo json_encode([
            'success' => false, 
            'message' => 'Sales or admin access required',
            'error_code' => 'SALES_ACCESS_REQUIRED'
        ]);
        exit;
    }
    return $user;
}

// Rate Limiting Middleware
function rateLimit($key, $max_attempts = 100, $time_window = 3600) {
    $cache_file = __DIR__ . '/../cache/rate_limit_' . md5($key) . '.json';
    
    if (!file_exists(dirname($cache_file))) {
        mkdir(dirname($cache_file), 0755, true);
    }
    
    $data = [];
    if (file_exists($cache_file)) {
        $data = json_decode(file_get_contents($cache_file), true) ?? [];
    }
    
    $now = time();
    $window_start = $now - $time_window;
    
    // نظف المحاولات القديمة
    $data = array_filter($data, function($timestamp) use ($window_start) {
        return $timestamp > $window_start;
    });
    
    // تحقق إذا تعدى الحد
    if (count($data) >= $max_attempts) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'message' => 'Too many requests. Please try again later.',
            'error_code' => 'RATE_LIMIT_EXCEEDED'
        ]);
        exit;
    }
    
    // سجل المحاولة الجديدة
    $data[] = $now;
    file_put_contents($cache_file, json_encode($data));
    
    return true;
}
?>
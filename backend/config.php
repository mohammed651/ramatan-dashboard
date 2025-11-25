<?php
// Ramatan Developments - Dashboard API Configuration (env-based)

// إزالة كل الـ CORS headers من هنا علشان مايتضاعفوش
// الـ CORS بيكون في الـ .htaccess فقط

header('Content-Type: application/json; charset=utf-8');

// السماح لـ Preflight Requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Simple .env loader (no external dependency)
 * It will read the first existing .env from these candidates:
 *  - project_root/.env  (one level up)
 *  - current_dir/.env
 *
 * Usage: loadEnv(__DIR__ . '/../.env');
 */
function loadEnvFile(...$paths) {
    foreach ($paths as $path) {
        if (!file_exists($path)) continue;
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') === false) continue;
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            // remove optional surrounding quotes
            if ((substr($value, 0, 1) === '"' && substr($value, -1) === '"') ||
                (substr($value, 0, 1) === "'" && substr($value, -1) === "'")) {
                $value = substr($value, 1, -1);
            }
            if (getenv($key) === false) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
        // stop after first successful load
        return;
    }
}

// Try common locations for .env (adjust if your config.php location differs)
loadEnvFile(__DIR__ . '/../.env', __DIR__ . '/.env');

// Read ENV variables (with sensible defaults)
$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'ramatan_db';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';
$jwt_secret_env = getenv('JWT_SECRET') ?: 'Ramatan_Developments_Fallback_ChangeThis';
define('JWT_SECRET', $jwt_secret_env);
define('JWT_ALGORITHM', 'HS256');

try {
    // Use utf8mb4 and set PDO attributes
    $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    // ensure connection uses utf8mb4
    $pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
} catch(PDOException $e) {
    // Never expose DB internals to clients. Log for debugging instead.
    error_log('Ramatan DB Connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ramatan DB Connection failed'
    ]);
    exit;
}

// باقي الكود يفضل كما هو...
// [كل دوال الأمان والـ JWT والوظائف المساعدة]

// وظائف الأمان مع JWT
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    // Correct padding handling for base64url
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $padlen = 4 - $remainder;
        $data .= str_repeat('=', $padlen);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

function generateJWT($user_data) {
    $header = json_encode(['typ' => 'JWT', 'alg' => JWT_ALGORITHM]);
    $payload = json_encode([
        'iss' => 'Ramatan Developments',
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60), // 24 ساعة
        'user_id' => $user_data['id'],
        'username' => $user_data['username'],
        'role' => $user_data['role']
    ]);
    
    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyJWT($jwt) {
    try {
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) != 3) {
            return false;
        }
        
        list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $tokenParts;
        
        // تحقق من التوقيع
        $signature = base64UrlDecode($base64UrlSignature);
        $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
        
        if (!hash_equals($expectedSignature, $signature)) {
            return false;
        }
        
        $payload = json_decode(base64UrlDecode($base64UrlPayload), true);
        
        // تحقق من انتهاء الصلاحية
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    } catch (Exception $e) {
        error_log('verifyJWT exception: ' . $e->getMessage());
        return false;
    }
}

// وظائف الـ Middleware
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
    $cache_dir = __DIR__ . '/cache';
    if (!file_exists($cache_dir)) {
        mkdir($cache_dir, 0755, true);
    }
    
    $cache_file = $cache_dir . '/rate_limit_' . md5($key) . '.json';
    
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

// وظائف التحقق من البيانات
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validatePhone($phone) {
    return preg_match('/^[0-9]{10,15}$/', $phone);
}

function validatePrice($price) {
    return is_numeric($price) && $price > 0;
}

function validateRequired($data, $fields) {
    $errors = [];
    foreach ($fields as $field) {
        if (empty($data[$field])) {
            $errors[] = "Field '$field' is required";
        }
    }
    return $errors;
}

// وظائف التسجيل
function logAction($user_id, $action, $details = '') {
    $log_message = date('Y-m-d H:i:s') . " | User: $user_id | Action: $action | Details: $details" . PHP_EOL;
    $log_file = __DIR__ . '/logs/actions.log';
    
    $log_dir = dirname($log_file);
    if (!file_exists($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    file_put_contents($log_file, $log_message, FILE_APPEND | LOCK_EX);
}

// وظائف الاستجابة
function sendSuccess($data = [], $message = 'Success') {
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data,
        'timestamp' => time()
    ]);
    exit;
}

function sendError($message = 'Error', $error_code = 'GENERAL_ERROR', $status_code = 400) {
    http_response_code($status_code);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'error_code' => $error_code,
        'timestamp' => time()
    ]);
    exit;
}

function getAvailableUnits($project_id) {
    global $pdo;
    $stmt = $pdo->prepare("
        SELECT total_units - sold_units as available_units 
        FROM projects 
        WHERE id = ?
    ");
    $stmt->execute([$project_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result['available_units'] ?? 0;
}

// إعداد المنطقة الزمنية
date_default_timezone_set('Africa/Cairo');

// تعطيل عرض الأخطاء في production (نشغله للتطوير فقط)
// error_reporting(0);
// ini_set('display_errors', 0);

// تفعيل التسجيل في ملفات الـ log
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/php_errors.log');

?>

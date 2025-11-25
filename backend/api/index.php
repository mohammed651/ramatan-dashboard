<?php
include '../config.php';

echo json_encode([
    'success' => true,
    'message' => 'Ramatan Developments API is running',
    'endpoints' => [
        'POST /api/auth/login' => 'User login',
        'GET /api/projects' => 'Get all projects',
        'GET /api/units' => 'Get all units',
        'POST /api/units/add' => 'Add new unit',
        'GET /api/operations' => 'Get all operations',
        'POST /api/operations/add' => 'Add new operation',
        'GET /api/dashboard/stats' => 'Get dashboard statistics',
        'GET /api/users' => 'Get all sales users',
        'POST /api/users/add' => 'Add new user'
    ],
    'company' => 'Ramatan Developments',
    'version' => '1.0'
]);
?>
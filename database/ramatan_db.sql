-- Ramatan Developments Database System
-- Created: 2024
-- Description: نظام إدارة المبيعات والعقارات لشركة رمتان

CREATE DATABASE IF NOT EXISTS ramatan_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE ramatan_db;

-- جدول المستخدمين
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'sales') NOT NULL DEFAULT 'sales',
    commission_rate DECIMAL(5,2) DEFAULT 2.50,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- جدول المشاريع
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    total_units INT DEFAULT 0,
    sold_units INT DEFAULT 0,
    status ENUM('قيد الإنشاء', 'تم التسليم', 'قريباً') DEFAULT 'قيد الإنشاء',
    amenities TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_status (status),
    INDEX idx_created_by (created_by)
);

-- جدول الوحدات
CREATE TABLE units (
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
CREATE TABLE operations (
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
CREATE TABLE payments (
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

-- تحديث إحصائيات المشاريع
UPDATE projects SET total_units = (SELECT COUNT(*) FROM units WHERE project_id = projects.id);
UPDATE projects SET sold_units = (SELECT COUNT(*) FROM units WHERE project_id = projects.id AND status = 'مباعة');

-- عرض رسالة نجاح
SELECT 'Ramatan Developments Database created successfully!' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_projects FROM projects;
SELECT COUNT(*) as total_units FROM units;
SELECT COUNT(*) as total_operations FROM operations;
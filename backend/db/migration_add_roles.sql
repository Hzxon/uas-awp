-- Migration: Add 'partner' and 'superadmin' roles to users table
-- Run this migration to fix the role ENUM constraint

-- Modify the role ENUM to include all role values
ALTER TABLE users MODIFY COLUMN role ENUM('customer', 'admin', 'superadmin', 'partner') NOT NULL DEFAULT 'customer';

-- Verify the change
-- DESCRIBE users;

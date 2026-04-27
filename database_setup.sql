-- MySQL Database Schema for Smart Agriculture Portal
-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS smart_agriculture;
USE smart_agriculture;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    farm_location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- User sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Farm data table (for future expansion)
CREATE TABLE IF NOT EXISTS farm_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    crop_type VARCHAR(50),
    planting_date DATE,
    harvest_date DATE,
    farm_size_acres DECIMAL(10, 2),
    soil_type VARCHAR(50),
    irrigation_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample admin user (password: admin123)
INSERT IGNORE INTO users (username, email, password_hash, full_name) 
VALUES ('admin', 'admin@smartagri.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'System Administrator');

-- Insert sample farmer user (password: farmer123)
INSERT IGNORE INTO users (username, email, password_hash, full_name, farm_location) 
VALUES ('farmer', 'farmer@smartagri.com', 'ef92b778ba7a6c8f2150014a5aa6ccd4b0751908926e3b4e4c8b5b4a5c5c5c5c', 'Sample Farmer', 'California, USA');

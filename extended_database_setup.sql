-- Extended Database Schema for Smart Agriculture Portal
-- Add tables for all menu options

USE smart_agriculture;

-- Crops table for crop management
CREATE TABLE IF NOT EXISTS crops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    crop_type VARCHAR(50) NOT NULL,
    planting_date DATE,
    expected_harvest_date DATE,
    current_stage VARCHAR(50),
    health_status VARCHAR(20) DEFAULT 'Healthy',
    area_acres DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Community posts table
CREATE TABLE IF NOT EXISTS community_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    likes_count INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Community replies table
CREATE TABLE IF NOT EXISTS community_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Marketplace items table
CREATE TABLE IF NOT EXISTS marketplace_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'Seeds', 'Crops', 'Equipment', 'Fertilizer'
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    location VARCHAR(200),
    contact_info VARCHAR(200),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Land details table
CREATE TABLE IF NOT EXISTS land_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    land_name VARCHAR(100),
    total_area_acres DECIMAL(10, 2) NOT NULL,
    soil_type VARCHAR(50),
    soil_ph DECIMAL(3, 1),
    water_source VARCHAR(50),
    irrigation_system VARCHAR(50),
    location VARCHAR(200),
    coordinates_lat DECIMAL(10, 8),
    coordinates_lng DECIMAL(11, 8),
    ownership_type VARCHAR(50), -- 'Owned', 'Rented', 'Leased'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Fertilizer products table
CREATE TABLE IF NOT EXISTS fertilizer_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    type VARCHAR(50), -- 'NPK', 'Organic', 'Liquid', 'Granular'
    npk_ratio VARCHAR(10), -- e.g., '20-20-20'
    description TEXT,
    price_per_kg DECIMAL(10, 2),
    stock_quantity INT DEFAULT 0,
    application_method TEXT,
    suitable_crops TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Fertilizer orders table
CREATE TABLE IF NOT EXISTS fertilizer_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_kg DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Shipped', 'Delivered'
    delivery_address TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATE,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES fertilizer_products(id)
);

-- Government schemes table
CREATE TABLE IF NOT EXISTS government_schemes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scheme_name VARCHAR(200) NOT NULL,
    description TEXT,
    eligibility_criteria TEXT,
    benefits TEXT,
    application_process TEXT,
    deadline DATE,
    contact_info TEXT,
    website VARCHAR(500),
    scheme_type VARCHAR(50), -- 'Subsidy', 'Loan', 'Insurance', 'Training'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User scheme applications table
CREATE TABLE IF NOT EXISTS scheme_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    scheme_id INT NOT NULL,
    application_status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Under Review', 'Approved', 'Rejected'
    application_data TEXT, -- JSON data for application form
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (scheme_id) REFERENCES government_schemes(id) ON DELETE CASCADE
);

-- Orders table (general orders)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_type VARCHAR(50) NOT NULL, -- 'Marketplace', 'Fertilizer', 'Equipment'
    item_details TEXT, -- JSON data for order items
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(20) DEFAULT 'Pending',
    payment_status VARCHAR(20) DEFAULT 'Pending',
    delivery_address TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery DATE,
    tracking_number VARCHAR(100),
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_email BOOLEAN DEFAULT TRUE,
    notification_sms BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(3) DEFAULT 'USD',
    measurement_unit VARCHAR(10) DEFAULT 'metric', -- 'metric', 'imperial'
    theme VARCHAR(20) DEFAULT 'light', -- 'light', 'dark'
    auto_refresh_data BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data for testing

-- Sample crops
INSERT IGNORE INTO crops (user_id, crop_name, crop_type, planting_date, expected_harvest_date, current_stage, health_status, area_acres, notes) VALUES
(1, 'Wheat Field 1', 'Wheat', '2024-01-15', '2024-04-15', 'Growing', 'Healthy', 5.5, 'Good growth observed'),
(1, 'Corn Field A', 'Corn', '2024-02-01', '2024-05-01', 'Seedling', 'Healthy', 3.2, 'Recently planted'),
(2, 'Rice Paddy', 'Rice', '2024-01-20', '2024-04-20', 'Vegetative', 'Healthy', 2.8, 'Irrigation working well');

-- Sample community posts
INSERT IGNORE INTO community_posts (user_id, title, content, category) VALUES
(1, 'Best practices for wheat cultivation', 'I wanted to share some tips for growing wheat that have worked well for me...', 'Crop Management'),
(2, 'New irrigation system installation', 'Just installed a new drip irrigation system and the results are amazing!', 'Equipment'),
(1, 'Organic farming techniques', 'Has anyone tried organic methods? Looking for advice on pest control...', 'Organic Farming');

-- Sample marketplace items
INSERT IGNORE INTO marketplace_items (user_id, title, description, category, price, quantity, unit, location, contact_info) VALUES
(1, 'Premium Wheat Seeds', 'High-quality wheat seeds variety XYZ', 'Seeds', 45.50, 100, 'kg', 'California', 'farmer@email.com'),
(2, 'Organic Fertilizer', '100% organic NPK fertilizer', 'Fertilizer', 25.00, 50, 'kg', 'Texas', 'organic@farm.com'),
(1, 'Used Tractor', 'Well-maintained tractor for sale', 'Equipment', 15000.00, 1, 'piece', 'Florida', '555-0123');

-- Sample fertilizer products
INSERT IGNORE INTO fertilizer_products (name, brand, type, npk_ratio, description, price_per_kg, stock_quantity, application_method, suitable_crops) VALUES
('NPK 20-20-20', 'AgriGrow', 'NPK', '20-20-20', 'Balanced fertilizer for all crops', 2.50, 500, 'Broadcast application', 'Wheat, Corn, Rice'),
('Organic Compost', 'EcoFarm', 'Organic', NULL, '100% organic compost', 1.80, 300, 'Soil mixing', 'All vegetables'),
('Liquid Urea', 'QuickGrow', 'Liquid', '46-0-0', 'Fast-acting nitrogen fertilizer', 3.20, 200, 'Foliar spray', 'Rice, Wheat');

-- Sample government schemes
INSERT IGNORE INTO government_schemes (scheme_name, description, eligibility_criteria, benefits, application_process, deadline, contact_info, website, scheme_type) VALUES
('Crop Insurance Scheme', 'Comprehensive crop insurance for all farmers', 'All farmers with valid land documents', 'Up to 80% crop loss compensation', 'Apply online with land documents', '2024-12-31', '1800-123-4567', 'www.govagri.in/insurance', 'Insurance'),
('Organic Farming Subsidy', 'Financial assistance for organic farming conversion', 'Small and marginal farmers', '50% subsidy on organic inputs', 'Submit organic farming plan', '2024-11-30', 'organic@gov.in', 'www.govagri.in/organic', 'Subsidy'),
('Farm Mechanization Loan', 'Low-interest loans for farm equipment', 'Farmers with credit score above 600', 'Interest rate subsidy of 4%', 'Apply through participating banks', '2024-12-15', 'loan@gov.in', 'www.govagri.in/loan', 'Loan');

-- Sample user settings
INSERT IGNORE INTO user_settings (user_id, notification_email, notification_sms, language, currency, measurement_unit, theme, auto_refresh_data) VALUES
(1, TRUE, FALSE, 'en', 'USD', 'metric', 'light', TRUE),
(2, TRUE, TRUE, 'en', 'USD', 'imperial', 'dark', FALSE);

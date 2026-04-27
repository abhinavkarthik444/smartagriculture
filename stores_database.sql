-- Database tables for stores in marketplace
USE smart_agriculture;

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_name VARCHAR(200) NOT NULL,
    store_type ENUM('government', 'private') NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Seeds', 'Fertilizer', 'Equipment', 'Pesticides', 'Tools'
    description TEXT,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(200),
    website VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    opening_hours VARCHAR(200),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Store products table
CREATE TABLE IF NOT EXISTS store_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL, -- 'kg', 'piece', 'liter', 'bag', etc.
    stock_quantity INT DEFAULT 0,
    min_quantity INT DEFAULT 1,
    description TEXT,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- Store reviews table
CREATE TABLE IF NOT EXISTS store_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (store_id, user_id)
);

-- Insert sample stores
INSERT IGNORE INTO stores (store_name, store_type, category, description, address, city, state, phone, email, opening_hours, rating, is_verified) VALUES
-- Government Stores
('Krishi Vigyan Kendra Store', 'government', 'Seeds', 'Government agricultural store providing certified seeds and farming inputs', 'Main Agricultural Complex, District Center', 'Punjab', 'Punjab', '0181-2201234', 'kvk.punjab@gov.in', '9:00 AM - 5:00 PM (Mon-Sat)', 4.5, TRUE),
('State Agricultural Department', 'government', 'Fertilizer', 'Official government fertilizer distribution center with subsidized rates', 'Secretariat Road, Block A', 'Maharashtra', 'Maharashtra', '022-22894567', 'agri.mah@gov.in', '10:00 AM - 4:00 PM (Mon-Fri)', 4.2, TRUE),
('Cooperative Farm Store', 'government', 'Equipment', 'Government-run cooperative for farming equipment and tools', 'Cooperative Building, Market Road', 'Uttar Pradesh', 'Uttar Pradesh', '0532-2467890', 'cooperative.up@gov.in', '8:00 AM - 6:00 PM (Mon-Sat)', 4.0, TRUE),
('District Seed Corporation', 'government', 'Seeds', 'State-owned seed corporation with quality certified seeds', 'Seed Corporation Office, Industrial Area', 'Madhya Pradesh', 'Madhya Pradesh', '0755-2734567', 'seeds.mp@gov.in', '9:00 AM - 5:30 PM (Mon-Sat)', 4.3, TRUE),

-- Private Stores
('Green Earth Agro Store', 'private', 'Seeds', 'Premium agricultural seeds and organic farming supplies', '123 Main Market, Near Bus Stand', 'Rajasthan', 'Rajasthan', '0141-2789123', 'greenearth@gmail.com', '8:00 AM - 8:00 PM (Daily)', 4.6, TRUE),
('Farmers Choice Fertilizers', 'private', 'Fertilizer', 'Complete range of fertilizers and soil nutrients', '456 Agricultural Street', 'Gujarat', 'Gujarat', '079-2654789', 'farmerschoice@yahoo.com', '7:00 AM - 9:00 PM (Daily)', 4.4, TRUE),
('Modern Farm Equipment', 'private', 'Equipment', 'Latest farming machinery and equipment showroom', '789 Industrial Area', 'Tamil Nadu', 'Tamil Nadu', '044-22456789', 'modernfarm@hotmail.com', '9:00 AM - 7:00 PM (Mon-Sat)', 4.5, TRUE),
('Agri Solutions Pvt Ltd', 'private', 'Pesticides', 'Certified pesticides and crop protection solutions', '321 Business Park', 'Karnataka', 'Karnataka', '080-23456789', 'agrisolutions@gmail.com', '8:30 AM - 6:30 PM (Mon-Sat)', 4.3, TRUE),
('Rural Hardware Store', 'private', 'Tools', 'Hardware and tools for rural and agricultural use', '654 Village Center', 'Bihar', 'Bihar', '0612-3456789', 'ruralhardware@yahoo.com', '7:00 AM - 7:00 PM (Daily)', 4.1, TRUE),
('Organic Farm Supplies', 'private', 'Seeds', 'Specialized organic seeds and natural farming inputs', '987 Organic Market', 'Kerala', 'Kerala', '0484-2345678', 'organicfarm@gmail.com', '9:00 AM - 6:00 PM (Mon-Sat)', 4.7, TRUE);

-- Insert sample products for stores
INSERT IGNORE INTO store_products (store_id, product_name, category, brand, price, unit, stock_quantity, min_quantity, description, is_available) VALUES
-- Government Store Products
(1, 'Wheat Seed - HD 2967', 'Seeds', 'Govt Certified', 45.00, 'kg', 500, 5, 'High yield wheat variety certified by government', TRUE),
(1, 'Rice Seed - Basmati 1121', 'Seeds', 'Govt Certified', 85.00, 'kg', 300, 5, 'Premium basmati rice seeds', TRUE),
(2, 'Urea Fertilizer', 'Fertilizer', 'IFFCO', 6.50, 'kg', 1000, 10, 'Nitrogen fertilizer for crops', TRUE),
(2, 'DAP Fertilizer', 'Fertilizer', 'IFFCO', 12.00, 'kg', 800, 10, 'Di-ammonium phosphate fertilizer', TRUE),
(3, 'Tractor Tire', 'Equipment', 'MRF', 3500.00, 'piece', 20, 1, 'Heavy duty tractor tire', TRUE),
(3, 'Power Tiller', 'Equipment', 'Mahindra', 45000.00, 'piece', 5, 1, 'Mini power tiller for small farms', TRUE),

-- Private Store Products
(5, 'Hybrid Tomato Seeds', 'Seeds', 'Syngenta', 120.00, 'kg', 200, 2, 'High yield hybrid tomato seeds', TRUE),
(5, 'Organic Compost', 'Fertilizer', 'Green Earth', 8.50, 'kg', 300, 5, '100% organic compost', TRUE),
(6, 'NPK 20-20-20', 'Fertilizer', 'Coromandel', 15.00, 'kg', 500, 10, 'Balanced NPK fertilizer', TRUE),
(6, 'Micronutrients', 'Fertilizer', 'BASF', 25.00, 'kg', 150, 5, 'Essential micronutrients', TRUE),
(7, 'Sprayer Pump', 'Equipment', 'Hawkeye', 1200.00, 'piece', 30, 1, 'Manual sprayer pump', TRUE),
(7, 'Drip Irrigation Kit', 'Equipment', 'Jain Irrigation', 2500.00, 'piece', 15, 1, 'Complete drip irrigation set', TRUE),
(8, 'Herbicide', 'Pesticides', 'Bayer', 450.00, 'liter', 50, 1, 'Broad spectrum herbicide', TRUE),
(8, 'Insecticide', 'Pesticides', 'Syngenta', 380.00, 'liter', 40, 1, 'Effective insect control', TRUE),
(9, 'Spade', 'Tools', 'Fiskars', 250.00, 'piece', 100, 1, 'Garden spade for soil work', TRUE),
(9, 'Pruning Shears', 'Tools', 'Fiskars', 180.00, 'piece', 80, 1, 'Professional pruning shears', TRUE),
(10, 'Organic Vegetable Seeds', 'Seeds', 'BioSeed', 95.00, 'kg', 150, 2, 'Certified organic vegetable seeds', TRUE),
(10, 'Bio Fertilizer', 'Fertilizer', 'Organic India', 12.00, 'kg', 200, 5, 'Natural bio-fertilizer', TRUE);

-- Insert sample reviews
INSERT IGNORE INTO store_reviews (store_id, user_id, rating, review_text) VALUES
(1, 1, 5, 'Excellent government store with certified seeds at reasonable prices'),
(1, 2, 4, 'Good quality products, sometimes out of stock'),
(5, 1, 5, 'Best organic seeds in the city! Very helpful staff'),
(5, 2, 4, 'Great variety but prices are a bit high'),
(6, 1, 4, 'Good fertilizer selection, reasonable rates'),
(6, 2, 5, 'Very knowledgeable staff, good advice on fertilizers'),
(7, 1, 5, 'Wide range of equipment, good after-sales service'),
(7, 2, 4, 'Quality products but delivery takes time');

-- Update store ratings based on reviews
UPDATE stores s 
SET rating = (
    SELECT AVG(rating) 
    FROM store_reviews r 
    WHERE r.store_id = s.id
);

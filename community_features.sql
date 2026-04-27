-- Additional tables for community features
USE smart_agriculture;

-- Farmer groups table
CREATE TABLE IF NOT EXISTS farmer_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    description TEXT,
    group_type VARCHAR(50) DEFAULT 'General', -- 'Regional', 'Crop-specific', 'Equipment', 'General'
    created_by INT NOT NULL,
    member_count INT DEFAULT 1,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Group membership table
CREATE TABLE IF NOT EXISTS group_memberships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(20) DEFAULT 'Member', -- 'Admin', 'Moderator', 'Member'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES farmer_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (group_id, user_id)
);

-- Group chat messages table
CREATE TABLE IF NOT EXISTS group_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file', 'system'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES farmer_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Farmer profiles for community
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    bio TEXT,
    expertise TEXT, -- JSON array of expertise areas
    farm_size_acres DECIMAL(10, 2),
    location VARCHAR(200),
    avatar_url VARCHAR(500),
    is_public BOOLEAN DEFAULT TRUE,
    joined_community_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample farmer groups
INSERT IGNORE INTO farmer_groups (group_name, description, group_type, created_by) VALUES
('Wheat Farmers of North India', 'A community for wheat farmers in North India to share best practices, market prices, and weather updates', 'Regional', 1),
('Organic Farming Enthusiasts', 'Share organic farming techniques, certification processes, and market opportunities', 'Crop-specific', 2),
('Small Farm Equipment Owners', 'Discuss equipment maintenance, buying/selling, and rental opportunities for small farms', 'Equipment', 1),
('Maharashtra Farmers Network', 'Connect with farmers from Maharashtra for regional discussions and support', 'Regional', 2),
('Beginner Farmers Support', 'A supportive community for new farmers to learn and ask questions', 'General', 1);

-- Add sample group memberships
INSERT IGNORE INTO group_memberships (group_id, user_id, role) VALUES
(1, 1, 'Admin'), (1, 2, 'Member'),
(2, 2, 'Admin'), (2, 1, 'Member'),
(3, 1, 'Member'), (3, 2, 'Member'),
(4, 2, 'Admin'), (4, 1, 'Member'),
(5, 1, 'Moderator'), (5, 2, 'Member');

-- Add sample group messages
INSERT IGNORE INTO group_messages (group_id, user_id, message, message_type) VALUES
(1, 1, 'Welcome everyone to the Wheat Farmers group! Let''s share our experiences this season.', 'text'),
(1, 2, 'Great to be here! My wheat crop is currently at the tillering stage. How about yours?', 'text'),
(2, 2, 'Hi all organic farmers! Just got my certification approved. Happy to share the process.', 'text'),
(2, 1, 'Congratulations! I''m interested in learning about the certification process.', 'text'),
(3, 1, 'Anyone selling a used rotavator in good condition? Looking to buy one for my 5-acre farm.', 'text'),
(4, 2, 'Monsoon predictions for Maharashtra look good this year. Planning for cotton cultivation.', 'text'),
(5, 1, 'New members welcome! Feel free to ask any questions about farming basics.', 'text'),
(5, 2, 'Don''t hesitate to ask! We were all beginners once.', 'text');

-- Create farmer profiles for existing users
INSERT IGNORE INTO farmer_profiles (user_id, bio, expertise, farm_size_acres, location, is_public) VALUES
(1, 'Experienced farmer specializing in wheat and rice cultivation. Always happy to help fellow farmers!', '["Wheat", "Rice", "Irrigation", "Organic Farming"]', 15.5, 'Punjab, India', TRUE),
(2, 'Organic farming advocate with 8 years of experience. Focus on sustainable agriculture practices.', '["Organic Farming", "Vegetables", "Composting", "Natural Pest Control"]', 8.2, 'Maharashtra, India', TRUE);

-- Update group member counts
UPDATE farmer_groups g 
SET member_count = (
    SELECT COUNT(*) FROM group_memberships gm 
    WHERE gm.group_id = g.id
);

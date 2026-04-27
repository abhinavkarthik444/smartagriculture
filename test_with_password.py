import mysql.connector
from mysql.connector import Error

def test_with_pass123():
    """Test database connection with password 'pass123'"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='pass123'
        )
        
        if connection.is_connected():
            print("✅ Connected to MySQL with password 'pass123'")
            
            cursor = connection.cursor()
            
            # Check if database exists
            cursor.execute("SHOW DATABASES LIKE 'smart_agriculture'")
            result = cursor.fetchone()
            
            if result:
                print("✅ Database 'smart_agriculture' exists!")
                
                # Connect to the specific database
                cursor.execute("USE smart_agriculture")
                
                # Check tables
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()
                print(f"📊 Found {len(tables)} tables:")
                for table in tables:
                    print(f"   - {table[0]}")
                
                # Check users
                cursor.execute("SELECT username, email FROM users")
                users = cursor.fetchall()
                print(f"👥 Found {len(users)} users:")
                for user in users:
                    print(f"   - {user[0]} ({user[1]})")
                
                # Update .env file
                update_env_file('pass123')
                
                cursor.close()
                connection.close()
                print("✅ Database is ready for use!")
                return True
            else:
                print("❌ Database 'smart_agriculture' does not exist yet")
                print("Creating database now...")
                
                # Create database
                cursor.execute("CREATE DATABASE smart_agriculture")
                cursor.execute("USE smart_agriculture")
                
                # Create tables (simplified version)
                cursor.execute("""
                    CREATE TABLE users (
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
                    )
                """)
                
                cursor.execute("""
                    CREATE TABLE user_sessions (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        session_token VARCHAR(255) UNIQUE NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        expires_at TIMESTAMP NOT NULL,
                        is_active BOOLEAN DEFAULT TRUE,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                    )
                """)
                
                cursor.execute("""
                    CREATE TABLE farm_data (
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
                    )
                """)
                
                # Insert sample users
                cursor.execute("""
                    INSERT INTO users (username, email, password_hash, full_name) 
                    VALUES ('admin', 'admin@smartagri.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'System Administrator')
                """)
                
                cursor.execute("""
                    INSERT INTO users (username, email, password_hash, full_name, farm_location) 
                    VALUES ('farmer', 'farmer@smartagri.com', 'ef92b778ba7a6c8f2150014a5aa6ccd4b0751908926e3b4e4c8b5b4a5c5c5c5c', 'Sample Farmer', 'California, USA')
                """)
                
                connection.commit()
                print("✅ Database and tables created successfully!")
                
                cursor.close()
                connection.close()
                update_env_file('pass123')
                return True
                
    except Error as e:
        print(f"❌ Error: {e}")
        return False

def update_env_file(password):
    """Update .env file with the correct MySQL password"""
    try:
        with open('.env', 'r') as f:
            content = f.read()
        
        # Replace the password line
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('DB_PASSWORD='):
                lines[i] = f'DB_PASSWORD={password}'
                break
        
        with open('.env', 'w') as f:
            f.write('\n'.join(lines))
        
        print(f"✅ Updated .env file with password 'pass123'")
        
    except Exception as e:
        print(f"⚠️ Could not update .env file: {e}")

if __name__ == "__main__":
    test_with_pass123()

import mysql.connector
from mysql.connector import Error

def verify_database_with_password(password):
    """Try to connect with a specific password and verify database"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password=password
        )
        
        if connection.is_connected():
            print(f"SUCCESS! Connected with password: '{password}'")
            
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
                update_env_file(password)
                
                cursor.close()
                connection.close()
                return True
            else:
                print("❌ Database 'smart_agriculture' does not exist yet")
                print("You need to create it first using: mysql -u root -p < database_setup.sql")
                
                cursor.close()
                connection.close()
                return False
                
    except Error as e:
        if "Access denied" in str(e):
            print(f"❌ Failed with password: '{password}'")
        else:
            print(f"❌ Error with password '{password}': {e}")
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
        
        print(f"✅ Updated .env file with password")
        
    except Exception as e:
        print(f"⚠️ Could not update .env file: {e}")

if __name__ == "__main__":
    print("Verifying database connection...")
    print("Please enter your MySQL root password when prompted, or press Enter if you don't know it")
    
    import getpass
    password = getpass.getpass("MySQL root password: ")
    
    if password:
        verify_database_with_password(password)
    else:
        print("No password entered. You can:")
        print("1. Try running this script again with your MySQL password")
        print("2. Use MySQL Workbench to connect and verify")
        print("3. Run reset_mysql_password.bat to reset the password")

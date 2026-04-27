import mysql.connector
from mysql.connector import Error

def test_mysql_passwords():
    """Test common MySQL root passwords"""
    passwords = ['', 'root', 'admin', 'password', '123456', 'mysql', 'test']
    
    print("Testing MySQL root passwords...")
    
    for password in passwords:
        try:
            connection = mysql.connector.connect(
                host='localhost',
                user='root',
                password=password
            )
            
            if connection.is_connected():
                print(f"SUCCESS! Password is: '{password}'")
                
                # Check if database exists
                cursor = connection.cursor()
                cursor.execute("SHOW DATABASES LIKE 'smart_agriculture'")
                result = cursor.fetchone()
                
                if result:
                    print("Database 'smart_agriculture' already exists!")
                    cursor.execute("USE smart_agriculture")
                    cursor.execute("SHOW TABLES")
                    tables = cursor.fetchall()
                    print(f"Found {len(tables)} tables")
                else:
                    print("Database 'smart_agriculture' does not exist yet")
                
                cursor.close()
                connection.close()
                
                # Update .env file with correct password
                update_env_file(password)
                return password
                
        except Error as e:
            if "Access denied" in str(e):
                print(f"Failed with password: '{password}'")
            else:
                print(f"Error with password '{password}': {e}")
    
    print("No common password worked. You may need to:")
    print("1. Remember your MySQL installation password")
    print("2. Run reset_mysql_password.bat to reset it")
    return None

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
        
        print(f"Updated .env file with password: '{password}'")
        
    except Exception as e:
        print(f"Could not update .env file: {e}")

if __name__ == "__main__":
    test_mysql_passwords()

import mysql.connector
from mysql.connector import Error

def quick_database_test():
    """Quick test to verify database connection and setup"""
    
    # Try different common usernames and passwords
    credentials = [
        ('root', 'pass123'),
        ('root', ''),
        ('root', 'root'),
        ('root', 'admin'),
        ('mysql', 'pass123'),
        ('mysql', ''),
        ('admin', 'pass123'),
        ('admin', '')
    ]
    
    for user, password in credentials:
        try:
            print(f"Trying {user}/{password}...")
            connection = mysql.connector.connect(
                host='localhost',
                user=user,
                password=password
            )
            
            if connection.is_connected():
                print(f"SUCCESS! Connected as {user}")
                
                cursor = connection.cursor()
                
                # Check databases
                cursor.execute("SHOW DATABASES")
                databases = cursor.fetchall()
                print("Available databases:")
                for db in databases:
                    print(f"  - {db[0]}")
                
                # Check if smart_agriculture exists
                cursor.execute("SHOW DATABASES LIKE 'smart_agriculture'")
                result = cursor.fetchone()
                
                if result:
                    print("Found smart_agriculture database!")
                    cursor.execute("USE smart_agriculture")
                    
                    # Check tables
                    cursor.execute("SHOW TABLES")
                    tables = cursor.fetchall()
                    print(f"Tables in smart_agriculture: {len(tables)}")
                    for table in tables:
                        print(f"  - {table[0]}")
                    
                    # Check users
                    cursor.execute("SELECT username, email FROM users")
                    users = cursor.fetchall()
                    print(f"Users in database: {len(users)}")
                    for user in users:
                        print(f"  - {user[0]}")
                    
                    # Update .env file
                    update_env_file(user, password)
                    
                    cursor.close()
                    connection.close()
                    return True
                else:
                    print("smart_agriculture database not found")
                    cursor.close()
                    connection.close()
                    return False
                
        except Error as e:
            print(f"Failed: {e}")
            continue
    
    print("No working credentials found")
    return False

def update_env_file(user, password):
    """Update .env file with working credentials"""
    try:
        with open('.env', 'r') as f:
            content = f.read()
        
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('DB_USER='):
                lines[i] = f'DB_USER={user}'
            elif line.startswith('DB_PASSWORD='):
                lines[i] = f'DB_PASSWORD={password}'
        
        with open('.env', 'w') as f:
            f.write('\n'.join(lines))
        
        print(f"Updated .env file with {user}/{password}")
        
    except Exception as e:
        print(f"Could not update .env file: {e}")

if __name__ == "__main__":
    quick_database_test()

import mysql.connector
from mysql.connector import Error

def manual_connect():
    """Connect with your actual MySQL password"""
    
    # Enter your actual MySQL password here
    actual_password = "pass123"  # CHANGE THIS to your real password
    
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password=actual_password
        )
        
        if connection.is_connected():
            print(f"Connected successfully!")
            
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
                print("smart_agriculture database found!")
                cursor.execute("USE smart_agriculture")
                
                # Check tables
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()
                print(f"Tables: {len(tables)}")
                for table in tables:
                    print(f"  - {table[0]}")
                
                # Update .env
                update_env_file(actual_password)
                
            else:
                print("Database not found - creating it...")
                cursor.execute("source database_setup.sql")
                
            cursor.close()
            connection.close()
            
    except Error as e:
        print(f"Connection failed: {e}")
        print("Please:")
        print("1. Check your MySQL password")
        print("2. Make sure MySQL is running")
        print("3. Try the reset script")

def update_env_file(password):
    """Update .env file"""
    try:
        with open('.env', 'r') as f:
            content = f.read()
        
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.startswith('DB_PASSWORD='):
                lines[i] = f'DB_PASSWORD={password}'
                break
        
        with open('.env', 'w') as f:
            f.write('\n'.join(lines))
        
        print("Updated .env file")
        
    except Exception as e:
        print(f"Could not update .env file: {e}")

if __name__ == "__main__":
    print("Edit this file and change 'actual_password' to your real MySQL password")
    manual_connect()

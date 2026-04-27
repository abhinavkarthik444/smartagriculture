import mysql.connector
from mysql.connector import Error

def test_database_connection():
    """Test if the smart_agriculture database exists and is accessible"""
    try:
        # First try to connect to MySQL server without specifying database
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password=''  # Try with no password first
        )
        
        if connection.is_connected():
            print("Connected to MySQL server")
            
            cursor = connection.cursor()
            
            # Check if database exists
            cursor.execute("SHOW DATABASES LIKE 'smart_agriculture'")
            result = cursor.fetchone()
            
            if result:
                print("Database 'smart_agriculture' exists!")
                
                # Connect to the specific database
                cursor.execute("USE smart_agriculture")
                
                # Check tables
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()
                print(f"Found {len(tables)} tables:")
                for table in tables:
                    print(f"   - {table[0]}")
                
                # Check users
                cursor.execute("SELECT username, email FROM users")
                users = cursor.fetchall()
                print(f"Found {len(users)} users:")
                for user in users:
                    print(f"   - {user[0]} ({user[1]})")
            else:
                print("Database 'smart_agriculture' does not exist yet")
                print("You need to create it first using the database_setup.sql file")
            
            cursor.close()
            connection.close()
            return True
            
    except Error as e:
        if "Access denied" in str(e):
            print("MySQL requires a password for root user")
            print("You need to:")
            print("1. Find your MySQL root password")
            print("2. Update the password in this script and .env file")
            print("3. Or reset MySQL root password")
        else:
            print(f"Database error: {e}")
        return False

if __name__ == "__main__":
    test_database_connection()

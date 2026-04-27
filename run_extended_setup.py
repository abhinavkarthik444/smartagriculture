import mysql.connector
from mysql.connector import Error

def run_extended_setup():
    """Run the extended database setup"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Abhinav_444',
            database='smart_agriculture'
        )
        
        if connection.is_connected():
            print("Connected to database, running extended setup...")
            
            cursor = connection.cursor()
            
            # Read and execute the SQL file
            with open('extended_database_setup.sql', 'r') as file:
                sql_script = file.read()
            
            # Split the script into individual statements
            statements = sql_script.split(';')
            
            for statement in statements:
                if statement.strip():
                    try:
                        cursor.execute(statement)
                        connection.commit()
                    except Error as e:
                        if "already exists" not in str(e) and "Duplicate" not in str(e):
                            print(f"Error executing statement: {e}")
                            print(f"Statement: {statement[:100]}...")
            
            cursor.close()
            connection.close()
            print("Extended database setup completed successfully!")
            
    except Error as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    run_extended_setup()

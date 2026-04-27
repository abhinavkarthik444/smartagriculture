#!/usr/bin/env python3
"""
Add phone_number and address columns to users table
"""

import mysql.connector
from mysql.connector import Error

def add_profile_columns():
    """Add phone_number and address columns to users table"""
    try:
        # Connect to MySQL database
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root',  # Use the password you set during MySQL setup
            database='smart_agriculture'
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Check if columns already exist
            cursor.execute("SHOW COLUMNS FROM users LIKE 'phone_number'")
            phone_exists = cursor.fetchone()
            
            cursor.execute("SHOW COLUMNS FROM users LIKE 'address'")
            address_exists = cursor.fetchone()
            
            if not phone_exists:
                cursor.execute("ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) NULL AFTER farm_location")
                print("✅ Added phone_number column")
            else:
                print("ℹ️ phone_number column already exists")
            
            if not address_exists:
                cursor.execute("ALTER TABLE users ADD COLUMN address TEXT NULL AFTER phone_number")
                print("✅ Added address column")
            else:
                print("ℹ️ address column already exists")
            
            connection.commit()
            cursor.close()
            connection.close()
            
            print("✅ Database schema updated successfully!")
            
    except Error as e:
        print(f"❌ Error: {e}")
        print("Please check your MySQL connection details and ensure the database exists.")

if __name__ == "__main__":
    add_profile_columns()

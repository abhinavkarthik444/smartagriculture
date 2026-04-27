#!/usr/bin/env python3
"""
Add missing phone_number and address columns to users table
"""

import mysql.connector
from mysql.connector import Error

def add_missing_columns():
    """Add phone_number and address columns to users table"""
    try:
        # Connect to MySQL database using the same connection as app.py
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',  # Empty password as per app.py config
            database='smart_agriculture'
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Check if phone_number column exists
            cursor.execute("SHOW COLUMNS FROM users LIKE 'phone_number'")
            phone_exists = cursor.fetchone()
            
            # Check if address column exists
            cursor.execute("SHOW COLUMNS FROM users LIKE 'address'")
            address_exists = cursor.fetchone()
            
            if not phone_exists:
                cursor.execute("ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) NULL AFTER farm_location")
                print("SUCCESS: Added phone_number column")
            else:
                print("INFO: phone_number column already exists")
            
            if not address_exists:
                cursor.execute("ALTER TABLE users ADD COLUMN address TEXT NULL AFTER phone_number")
                print("SUCCESS: Added address column")
            else:
                print("INFO: address column already exists")
            
            connection.commit()
            cursor.close()
            connection.close()
            
            print("SUCCESS: Database schema updated successfully!")
            return True
            
    except Error as e:
        print(f"ERROR: {e}")
        print("Please check your MySQL connection details.")
        return False

if __name__ == "__main__":
    add_missing_columns()

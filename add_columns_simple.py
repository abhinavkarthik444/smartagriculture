#!/usr/bin/env python3
"""
Add phone_number and address columns to users table using existing connection
"""

import sys
import os

# Add the current directory to Python path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import get_db_connection

def add_profile_columns():
    """Add phone_number and address columns to users table"""
    try:
        connection = get_db_connection()
        if not connection:
            print("ERROR: Could not connect to database")
            return False
            
        cursor = connection.cursor()
        
        # Check if columns already exist
        cursor.execute("SHOW COLUMNS FROM users LIKE 'phone_number'")
        phone_exists = cursor.fetchone()
        
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
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    add_profile_columns()

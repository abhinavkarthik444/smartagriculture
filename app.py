from flask import Flask, request, jsonify, session
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import hashlib
import secrets
from datetime import datetime, timedelta
import os
from functools import wraps

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
CORS(app, supports_credentials=True, 
     origins=['*'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
     expose_headers=['Content-Type', 'Authorization'])

# Database configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'database': 'smart_agriculture',
    'port': int(os.environ.get('DB_PORT', 3306))
}

def get_db_connection():
    """Establish database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Database connection error: {e}")
        return None

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def validate_session(f):
    """Decorator to validate user session"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/register', methods=['POST'])
def register():
    """Register new user"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name', '')
        phone = data.get('phone', '')
        farm_location = data.get('farm_location', '')

        if not username or not email or not password:
            return jsonify({'error': 'Username, email, and password are required'}), 400

        password_hash = hash_password(password)
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", (username, email))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'error': 'Username or email already exists'}), 409

        # Insert new user
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, full_name, phone, farm_location)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (username, email, password_hash, full_name, phone, farm_location))
        
        connection.commit()
        user_id = cursor.lastrowid
        
        cursor.close()
        connection.close()

        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id,
            'username': username
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        password_hash = hash_password(password)
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        
        # Verify user credentials
        cursor.execute("""
            SELECT id, username, email, full_name, farm_location, is_active
            FROM users 
            WHERE username = %s AND password_hash = %s
        """, (username, password_hash))
        
        user = cursor.fetchone()
        
        if not user or not user['is_active']:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Invalid credentials'}), 401

        # Create session
        session['user_id'] = user['id']
        session['username'] = user['username']
        session.permanent = True
        
        cursor.close()
        connection.close()

        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'full_name': user['full_name'],
                'farm_location': user['farm_location']
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """User logout"""
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

# --- CROP MANAGEMENT ENDPOINTS ---

@app.route('/api/crops', methods=['GET'])
@validate_session
def get_crops():
    """Get all crops for the logged-in user"""
    try:
        user_id = session['user_id']
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM crops 
            WHERE user_id = %s 
            ORDER BY created_at DESC
        """, (user_id,))
        
        crops = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'crops': crops}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/crops', methods=['POST'])
@validate_session
def add_crop():
    """Add a new crop"""
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        required_fields = ['crop_name', 'crop_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO crops (user_id, crop_name, crop_type, planting_date, 
                              expected_harvest_date, current_stage, health_status, 
                              area_acres, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, data['crop_name'], data['crop_type'], 
              data.get('planting_date'), data.get('expected_harvest_date'),
              data.get('current_stage', 'Seedling'), data.get('health_status', 'Healthy'),
              data.get('area_acres'), data.get('notes')))
        
        connection.commit()
        crop_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return jsonify({
            'message': 'Crop added successfully',
            'crop_id': crop_id
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- COMMUNITY ENDPOINTS ---

@app.route('/api/community/posts', methods=['GET'])
def get_community_posts():
    """Get all community posts"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT p.*, u.username, u.full_name 
            FROM community_posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        """)
        
        posts = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'posts': posts}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/community/posts', methods=['POST'])
@validate_session
def create_community_post():
    """Create a new community post"""
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        if not data.get('title') or not data.get('content'):
            return jsonify({'error': 'Title and content are required'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO community_posts (user_id, title, content, category)
            VALUES (%s, %s, %s, %s)
        """, (user_id, data['title'], data['content'], data.get('category', 'General')))
        
        connection.commit()
        post_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return jsonify({
            'message': 'Post created successfully',
            'post_id': post_id
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- COMMUNITY GROUPS ENDPOINTS ---

@app.route('/api/community/groups', methods=['GET'])
def get_farmer_groups():
    """Get all farmer groups"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT g.*, u.username as created_by_name, u.full_name as created_by_full_name
            FROM farmer_groups g
            JOIN users u ON g.created_by = u.id
            WHERE g.is_private = FALSE
            ORDER BY g.member_count DESC, g.created_at DESC
        """)
        
        groups = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'groups': groups}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/community/groups', methods=['POST'])
@validate_session
def create_farmer_group():
    """Create a new farmer group"""
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        if not data.get('group_name'):
            return jsonify({'error': 'Group name is required'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        
        # Create group
        cursor.execute("""
            INSERT INTO farmer_groups (group_name, description, group_type, created_by)
            VALUES (%s, %s, %s, %s)
        """, (data['group_name'], data.get('description'), data.get('group_type', 'General'), user_id))
        
        group_id = cursor.lastrowid
        
        # Add creator as admin member
        cursor.execute("""
            INSERT INTO group_memberships (group_id, user_id, role)
            VALUES (%s, %s, 'Admin')
        """, (group_id, user_id))
        
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({
            'message': 'Group created successfully',
            'group_id': group_id
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/community/groups/<int:group_id>/join', methods=['POST'])
@validate_session
def join_farmer_group(group_id):
    """Join a farmer group"""
    try:
        user_id = session['user_id']
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        
        # Check if group exists and is not private
        cursor.execute("SELECT is_private FROM farmer_groups WHERE id = %s", (group_id,))
        group = cursor.fetchone()
        
        if not group:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Group not found'}), 404
        
        if group[0]:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Cannot join private group'}), 403
        
        # Add member
        cursor.execute("""
            INSERT INTO group_memberships (group_id, user_id, role)
            VALUES (%s, %s, 'Member')
        """, (group_id, user_id))
        
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({'message': 'Joined group successfully'}), 200

    except Exception as e:
        if "Duplicate" in str(e):
            return jsonify({'error': 'Already a member of this group'}), 409
        return jsonify({'error': str(e)}), 500

@app.route('/api/community/groups/<int:group_id>/messages', methods=['GET'])
@validate_session
def get_group_messages(group_id):
    """Get messages for a specific group"""
    try:
        user_id = session['user_id']
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        
        # Check if user is a member of the group
        cursor.execute("""
            SELECT COUNT(*) as is_member FROM group_memberships 
            WHERE group_id = %s AND user_id = %s
        """, (group_id, user_id))
        
        membership = cursor.fetchone()
        if not membership or membership['is_member'] == 0:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Not a member of this group'}), 403
        
        # Get messages
        cursor.execute("""
            SELECT m.*, u.username, u.full_name
            FROM group_messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.group_id = %s
            ORDER BY m.created_at ASC
        """, (group_id,))
        
        messages = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'messages': messages}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/community/groups/<int:group_id>/messages', methods=['POST'])
@validate_session
def send_group_message(group_id):
    """Send a message to a group"""
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        if not data.get('message'):
            return jsonify({'error': 'Message is required'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        
        # Check if user is a member
        cursor.execute("""
            SELECT COUNT(*) as is_member FROM group_memberships 
            WHERE group_id = %s AND user_id = %s
        """, (group_id, user_id))
        
        membership = cursor.fetchone()
        if not membership or membership['is_member'] == 0:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Not a member of this group'}), 403
        
        # Send message
        cursor.execute("""
            INSERT INTO group_messages (group_id, user_id, message, message_type)
            VALUES (%s, %s, %s, 'text')
        """, (group_id, user_id, data['message']))
        
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({'message': 'Message sent successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- COMMUNITY MEMBERS ENDPOINTS ---

@app.route('/api/community/members', methods=['GET'])
def get_community_members():
    """Get all community members"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.id, u.username, u.full_name, u.email, u.farm_location,
                   fp.bio, fp.expertise, fp.farm_size_acres, fp.profile_location,
                   fp.joined_community_at
            FROM users u
            LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
            WHERE u.id != %s
            ORDER BY u.username ASC
        """, (session.get('user_id', 0),))
        
        members = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'members': members}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/community/others-crops', methods=['GET'])
def get_others_crops():
    """Get crops planted by other farmers"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.*, u.username, u.full_name, u.farm_location
            FROM crops c
            JOIN users u ON c.user_id = u.id
            WHERE c.user_id != %s
            ORDER BY c.planting_date DESC, c.crop_name ASC
        """, (session.get('user_id', 0),))
        
        crops = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'crops': crops}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/community/profile', methods=['GET'])
@validate_session
def get_community_profile():
    """Get current user's community profile"""
    try:
        user_id = session['user_id']
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.id, u.username, u.full_name, u.email, u.farm_location,
                   fp.bio, fp.expertise, fp.farm_size_acres, fp.location as profile_location,
                   fp.avatar_url, fp.is_public, fp.joined_community_at
            FROM users u
            LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
            WHERE u.id = %s
        """, (user_id,))
        
        profile = cursor.fetchone()
        cursor.close()
        connection.close()

        return jsonify({'profile': profile}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/community/profile', methods=['PUT'])
@validate_session
def update_community_profile():
    """Update user's community profile"""
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        
        # Check if profile exists
        cursor.execute("SELECT id FROM farmer_profiles WHERE user_id = %s", (user_id,))
        profile_exists = cursor.fetchone()
        
        if profile_exists:
            # Update existing profile
            update_fields = []
            values = []
            
            if 'bio' in data:
                update_fields.append("bio = %s")
                values.append(data['bio'])
            if 'expertise' in data:
                update_fields.append("expertise = %s")
                values.append(str(data['expertise']))
            if 'farm_size_acres' in data:
                update_fields.append("farm_size_acres = %s")
                values.append(data['farm_size_acres'])
            if 'location' in data:
                update_fields.append("location = %s")
                values.append(data['location'])
            if 'avatar_url' in data:
                update_fields.append("avatar_url = %s")
                values.append(data['avatar_url'])
            if 'is_public' in data:
                update_fields.append("is_public = %s")
                values.append(data['is_public'])
            
            if update_fields:
                values.append(user_id)
                cursor.execute(f"""
                    UPDATE farmer_profiles 
                    SET {', '.join(update_fields)}
                    WHERE user_id = %s
                """, values)
        else:
            # Create new profile
            cursor.execute("""
                INSERT INTO farmer_profiles (user_id, bio, expertise, farm_size_acres, location, avatar_url, is_public)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (user_id, data.get('bio'), str(data.get('expertise', [])), 
                  data.get('farm_size_acres'), data.get('location'), 
                  data.get('avatar_url'), data.get('is_public', True)))
        
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({'message': 'Profile updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- MARKETPLACE ENDPOINTS ---

@app.route('/api/marketplace/items', methods=['GET'])
def get_marketplace_items():
    """Get all marketplace items"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT mi.*, u.username, u.full_name
            FROM marketplace_items mi
            JOIN users u ON mi.user_id = u.id
            WHERE mi.is_available = TRUE
            ORDER BY mi.created_at DESC
        """)
        
        items = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'items': items}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- PROFILE ENDPOINTS ---

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Get current user profile information"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'User not logged in'}), 401
            
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, username, email, full_name, farm_location, created_at, updated_at
            FROM users 
            WHERE id = %s
        """, (user_id,))
        
        user = cursor.fetchone()
        cursor.close()
        connection.close()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'full_name': user['full_name'] or 'Not specified',
                'farm_location': user['farm_location'] or 'Not specified',
                'phone_number': 'Not specified',
                'address': 'Not specified',
                'created_at': user['created_at'].isoformat() if user['created_at'] else None,
                'updated_at': user['updated_at'].isoformat() if user['updated_at'] else None
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stores', methods=['GET'])
def get_stores():
    """Get all stores with optional filters"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        
        # Get query parameters
        store_type = request.args.get('type')  # 'government' or 'private'
        category = request.args.get('category')
        city = request.args.get('city')
        
        # Build query
        query = "SELECT * FROM stores WHERE 1=1"
        params = []
        
        if store_type:
            query += " AND store_type = %s"
            params.append(store_type)
        
        if category:
            query += " AND category = %s"
            params.append(category)
        
        if city:
            query += " AND city LIKE %s"
            params.append(f"%{city}%")
        
        query += " ORDER BY rating DESC, is_verified DESC, store_name ASC"
        
        cursor.execute(query, params)
        stores = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'stores': stores}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stores/<int:store_id>/products', methods=['GET'])
def get_store_products(store_id):
    """Get products for a specific store"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT sp.*, s.store_name, s.store_type
            FROM store_products sp
            JOIN stores s ON sp.store_id = s.id
            WHERE sp.store_id = %s AND sp.is_available = TRUE
            ORDER BY sp.product_name ASC
        """, (store_id,))
        
        products = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'products': products}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stores/<int:store_id>/reviews', methods=['GET'])
def get_store_reviews(store_id):
    """Get reviews for a specific store"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT sr.*, u.username, u.full_name
            FROM store_reviews sr
            JOIN users u ON sr.user_id = u.id
            WHERE sr.store_id = %s
            ORDER BY sr.created_at DESC
        """, (store_id,))
        
        reviews = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'reviews': reviews}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stores/<int:store_id>/reviews', methods=['POST'])
@validate_session
def add_store_review(store_id):
    """Add a review for a store"""
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        if not data.get('rating') or data.get('rating') < 1 or data.get('rating') > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        
        # Check if store exists
        cursor.execute("SELECT id FROM stores WHERE id = %s", (store_id,))
        if not cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'error': 'Store not found'}), 404
        
        # Add review
        cursor.execute("""
            INSERT INTO store_reviews (store_id, user_id, rating, review_text)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE 
            rating = VALUES(rating),
            review_text = VALUES(review_text),
            created_at = CURRENT_TIMESTAMP
        """, (store_id, user_id, data['rating'], data.get('review_text', '')))
        
        # Update store rating
        cursor.execute("""
            UPDATE stores s 
            SET rating = (
                SELECT AVG(rating) 
                FROM store_reviews r 
                WHERE r.store_id = s.id
            )
            WHERE s.id = %s
        """, (store_id,))
        
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({'message': 'Review added successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stores/categories', methods=['GET'])
def get_store_categories():
    """Get all available store categories"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT DISTINCT category, COUNT(*) as store_count
            FROM stores
            GROUP BY category
            ORDER BY category ASC
        """)
        
        categories = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'categories': categories}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/marketplace/items', methods=['POST'])
@validate_session
def create_marketplace_item():
    """Create a new marketplace item"""
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        required_fields = ['title', 'category', 'price', 'quantity']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO marketplace_items (user_id, title, description, category, 
                                          price, quantity, unit, location, contact_info)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, data['title'], data.get('description'), data['category'],
              data['price'], data['quantity'], data.get('unit', 'kg'),
              data.get('location'), data.get('contact_info')))
        
        connection.commit()
        item_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return jsonify({
            'message': 'Item listed successfully',
            'item_id': item_id
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- LAND DETAILS ENDPOINTS ---

@app.route('/api/land/details', methods=['GET'])
@validate_session
def get_land_details():
    """Get land details for the logged-in user"""
    try:
        user_id = session['user_id']
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM land_details 
            WHERE user_id = %s 
            ORDER BY created_at DESC
        """, (user_id,))
        
        lands = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'lands': lands}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/land/details', methods=['POST'])
@validate_session
def add_land_details():
    """Add land details"""
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        if not data.get('total_area_acres'):
            return jsonify({'error': 'Total area is required'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO land_details (user_id, land_name, total_area_acres, soil_type, 
                                    soil_ph, water_source, irrigation_system, location,
                                    coordinates_lat, coordinates_lng, ownership_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, data.get('land_name'), data['total_area_acres'],
              data.get('soil_type'), data.get('soil_ph'), data.get('water_source'),
              data.get('irrigation_system'), data.get('location'),
              data.get('coordinates_lat'), data.get('coordinates_lng'),
              data.get('ownership_type')))
        
        connection.commit()
        land_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return jsonify({
            'message': 'Land details added successfully',
            'land_id': land_id
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- FERTILIZER SHOP ENDPOINTS ---

@app.route('/api/fertilizer/products', methods=['GET'])
def get_fertilizer_products():
    """Get all fertilizer products"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM fertilizer_products 
            WHERE stock_quantity > 0
            ORDER BY name
        """)
        
        products = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'products': products}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/fertilizer/orders', methods=['POST'])
@validate_session
def create_fertilizer_order():
    """Create a fertilizer order"""
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        required_fields = ['product_id', 'quantity_kg']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        
        # Get product price
        cursor.execute("SELECT price_per_kg FROM fertilizer_products WHERE id = %s", (data['product_id'],))
        product = cursor.fetchone()
        
        if not product:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Product not found'}), 404
        
        total_price = product[0] * data['quantity_kg']
        
        cursor.execute("""
            INSERT INTO fertilizer_orders (user_id, product_id, quantity_kg, total_price, 
                                         delivery_address, notes)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, data['product_id'], data['quantity_kg'], total_price,
              data.get('delivery_address'), data.get('notes')))
        
        connection.commit()
        order_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return jsonify({
            'message': 'Order placed successfully',
            'order_id': order_id,
            'total_price': total_price
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- GOVERNMENT SCHEMES ENDPOINTS ---

@app.route('/api/government/schemes', methods=['GET'])
def get_government_schemes():
    """Get all government schemes with optional filters"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        
        # Get query parameters
        scheme_type = request.args.get('type')  # 'state' or 'central'
        
        # Build query
        query = """
            SELECT gs.*, 
                   (SELECT COUNT(*) FROM scheme_applications sa WHERE sa.scheme_id = gs.id) as applications_count
            FROM government_schemes gs
            WHERE gs.is_active = TRUE
        """
        params = []
        
        if scheme_type:
            query += " AND gs.scheme_type = %s"
            params.append(scheme_type)
        
        query += " ORDER BY gs.deadline ASC, gs.scheme_name ASC"
        
        cursor.execute(query, params)
        schemes = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'schemes': schemes}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/schemes/<int:scheme_id>/apply', methods=['POST'])
@validate_session
def apply_for_scheme():
    """Apply for a government scheme"""
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        scheme_id = data.get('scheme_id')
        if not scheme_id:
            return jsonify({'error': 'Scheme ID is required'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        
        # Check if already applied
        cursor.execute("""
            SELECT id FROM scheme_applications 
            WHERE user_id = %s AND scheme_id = %s
        """, (user_id, scheme_id))
        
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'error': 'Already applied for this scheme'}), 409
        
        cursor.execute("""
            INSERT INTO scheme_applications (user_id, scheme_id, application_data)
            VALUES (%s, %s, %s)
        """, (user_id, scheme_id, str(data.get('application_data', {}))))
        
        connection.commit()
        application_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return jsonify({
            'message': 'Application submitted successfully',
            'application_id': application_id
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- ORDERS ENDPOINTS ---

@app.route('/api/orders', methods=['GET'])
@validate_session
def get_orders():
    """Get all orders for the logged-in user"""
    try:
        user_id = session['user_id']
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM orders 
            WHERE user_id = %s 
            ORDER BY order_date DESC
        """, (user_id,))
        
        orders = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify({'orders': orders}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['POST'])
@validate_session
def create_order():
    """Create a new order"""
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        required_fields = ['order_type', 'item_details', 'total_amount']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO orders (user_id, order_type, item_details, total_amount, 
                              delivery_address, notes)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, data['order_type'], str(data['item_details']), 
              data['total_amount'], data.get('delivery_address'), data.get('notes')))
        
        connection.commit()
        order_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return jsonify({
            'message': 'Order created successfully',
            'order_id': order_id
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- SETTINGS ENDPOINTS ---

@app.route('/api/settings', methods=['GET'])
@validate_session
def get_user_settings():
    """Get user settings"""
    try:
        user_id = session['user_id']
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM user_settings 
            WHERE user_id = %s
        """, (user_id,))
        
        settings = cursor.fetchone()
        
        if not settings:
            # Create default settings
            cursor.execute("""
                INSERT INTO user_settings (user_id) 
                VALUES (%s)
            """, (user_id,))
            connection.commit()
            
            cursor.execute("""
                SELECT * FROM user_settings 
                WHERE user_id = %s
            """, (user_id,))
            settings = cursor.fetchone()
        
        cursor.close()
        connection.close()

        return jsonify({'settings': settings}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/settings', methods=['PUT'])
@validate_session
def update_user_settings():
    """Update user settings"""
    try:
        user_id = session['user_id']
        data = request.get_json()
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor()
        
        # Update settings
        set_clause = ", ".join([f"{key} = %s" for key in data.keys()])
        values = list(data.values()) + [user_id]
        
        cursor.execute(f"""
            UPDATE user_settings 
            SET {set_clause}, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = %s
        """, values)
        
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({'message': 'Settings updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/profile', methods=['PUT'])
@validate_session
def update_user_profile():
    """Update current user profile information"""
    try:
        data = request.get_json()
        user_id = session.get('user_id')
        
        # Get current user data
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT full_name, farm_location 
            FROM users 
            WHERE id = %s
        """, (user_id,))
        
        current_user = cursor.fetchone()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404

        # Update profile fields
        update_fields = []
        values = []
        
        if 'full_name' in data and data['full_name'] != current_user['full_name']:
            update_fields.append("full_name = %s")
            values.append(data['full_name'])
        
        if 'farm_location' in data and data['farm_location'] != current_user['farm_location']:
            update_fields.append("farm_location = %s")
            values.append(data['farm_location'])

        if update_fields:
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            values.append(user_id)
            
            set_clause = ", ".join(update_fields)
            cursor.execute(f"""
                UPDATE users 
                SET {set_clause}
                WHERE id = %s
            """, values)
            
            connection.commit()

        cursor.close()
        connection.close()

        return jsonify({'message': 'Profile updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- AI ASSISTANT ENDPOINTS ---

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """AI Assistant chat endpoint"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Simple AI response logic based on keywords
        response = generate_ai_response(user_message)
        
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_ai_response(message):
    """Generate AI response based on farming-related queries"""
    message_lower = message.lower()
    
    # Debug: Print the message to see what we're receiving
    print(f"AI received message: '{message}'")
    print(f"Lowercase message: '{message_lower}'")
    
    # Crop-related responses - check these first
    if 'wheat' in message_lower:
        return "Wheat requires well-drained soil with pH 6.0-7.0. Plant in October-November for Rabi season. Apply 60kg N, 30kg P2O5, and 30kg K2O per hectare. Harvest in March-April."
    elif 'rice' in message_lower:
        return "Rice needs standing water and warm climate. Maintain 2-5cm water depth. Apply 80kg N, 40kg P2O5, and 40kg K2O per hectare. Transplant 25-30 day old seedlings."
    elif 'cotton' in message_lower:
        return "Cotton requires black soil with good drainage. Sow in May-June for Kharif season. Apply 80kg N, 40kg P2O5, and 40kg K2O per hectare. Harvest in October-November."
    elif any(keyword in message_lower for keyword in ['crop', 'plant', 'seed', 'harvest', 'grow', 'cultivate']):
        return "For crop management, consider soil testing, proper irrigation, balanced fertilizers, and pest control. I can provide specific advice for wheat, rice, cotton, and other crops. Which crop are you interested in?"
    
    # Weather-related responses
    elif 'rain' in message_lower or 'rainfall' in message_lower:
        return "Current rainfall is 12mm. Adequate moisture is good for crop growth. Monitor soil moisture levels and adjust irrigation accordingly."
    elif 'temperature' in message_lower or 'temp' in message_lower:
        return "Current temperature is 30°C. This is optimal for most crops. Ensure proper irrigation during hot periods."
    elif any(keyword in message_lower for keyword in ['weather', 'climate', 'climate']):
        return "Weather conditions are favorable for farming. Monitor daily weather patterns for optimal planting and harvesting times. Current temp is 30°C with 12mm rainfall."
    
    # Fertilizer-related responses
    elif 'urea' in message_lower:
        return "Urea provides 46% nitrogen. Apply 50-60kg per hectare for most crops. Split application is recommended - half at planting, half during active growth."
    elif 'npk' in message_lower:
        return "NPK stands for Nitrogen-Phosphorus-Potassium. Use NPK 20:20:20 for balanced nutrition. Different crops need different ratios during growth stages."
    elif any(keyword in message_lower for keyword in ['fertilizer', 'nutrient', 'fertilize']):
        return "Use NPK 20:20:20 for balanced nutrition. Apply urea for nitrogen, DAP for phosphorus, and MOP for potassium. Soil testing helps determine exact requirements."
    
    # Pest and disease responses
    elif any(keyword in message_lower for keyword in ['pest', 'disease', 'insect', 'fungus', 'pesticide']):
        return "Monitor crops regularly for pests. Use integrated pest management (IPM) with biological controls first. Use chemicals only when necessary and follow safety guidelines."
    
    # Soil-related responses
    elif 'ph' in message_lower:
        return "Maintain soil pH between 6.0-7.0 for optimal nutrient availability. Test soil pH annually and amend with lime if too acidic or sulfur if too alkaline."
    elif any(keyword in message_lower for keyword in ['soil', 'moisture', 'organic']):
        return "Maintain soil pH between 6.0-7.0 for optimal nutrient availability. Add organic matter to improve soil structure and water retention."
    
    # General farming advice
    elif any(keyword in message_lower for keyword in ['help', 'advice', 'tips', 'guide', 'how to']):
        return "I can help with crop selection, soil management, irrigation, fertilization, pest control, and weather-based farming decisions. What specific area would you like guidance on?"
    
    # Market and prices
    elif any(keyword in message_lower for keyword in ['market', 'price', 'sell', 'buy', 'cost']):
        return "Check local market prices before selling. Consider storage costs and market timing. Government schemes like MSP support minimum prices for certain crops."
    
    # Irrigation
    elif any(keyword in message_lower for keyword in ['water', 'irrigation', 'irrigate']):
        return "Proper irrigation is crucial. Most crops need 25-30mm water per week. Drip irrigation is most efficient. Monitor soil moisture to avoid over/under watering."
    
    # Default response
    else:
        return "I'm your AI farming assistant! I can help with crop management (wheat, rice, cotton), weather analysis, soil health, fertilization, pest control, and market information. Try asking about specific crops or farming topics!"

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()}), 200

if __name__ == '__main__':
    print("Starting Smart Agriculture Backend Server...")
    print("Please ensure MySQL is running and the database is set up.")
    app.run(debug=True, host='0.0.0.0', port=5000)

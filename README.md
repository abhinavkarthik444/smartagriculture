# Smart Agriculture Portal

A comprehensive AI-powered farming portal with MySQL database integration for complete agricultural management.

## Features

- **User Authentication**: Secure login and registration system with MySQL database
- **AI Farming Dashboard**: Weather monitoring, crop analysis, and AI assistant
- **Camera Integration**: Real-time crop monitoring and analysis
- **Comprehensive Modules**: Crop Management, Community, Market, Land, Fertilizers, Government Schemes, Orders, Settings, Profile
- **Responsive Design**: Modern UI with smooth transitions and animations
- **Database Integration**: Complete MySQL backend with Flask API

## Setup Instructions

### 1. Database Setup

1. Install MySQL on your system
2. Create the database and tables using the provided SQL script:
   ```bash
   mysql -u root -p < database_setup.sql
   ```

### 2. Python Backend Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configure database connection:
   - Copy `.env.example` to `.env`
   - Update the database credentials in `.env` file

3. Start the Flask backend server:
   ```bash
   python app.py
   ```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

1. Open `index.html` in a web browser
2. The frontend will connect to the backend API for authentication

## Default Users

The database setup includes these sample users:

- **Username**: `vijay`, **Email**: `vnani8219@gmail.com`, **Password**: `pass123`
- **Username**: `abhinav`, **Email**: `abhinavkarthik444@gmail.com`, **Password**: `pass123`

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/health` - Health check

## File Structure

```
Smart-agri-main/
├── app.py                 # Flask backend server
├── database_setup.sql     # MySQL database schema
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── index.html            # Frontend HTML
├── script.js             # Frontend JavaScript
├── style.css             # Frontend styling
├── components/           # Modular components
│   ├── footer.html       # Footer component
│   └── navbar.html       # Navigation component
└── README.md             # This file
```

## Security Features

- Password hashing with SHA-256
- Session-based authentication
- Input validation and sanitization
- CORS configuration for API security

## Troubleshooting

1. **Database Connection Error**: Ensure MySQL is running and credentials in `.env` are correct
2. **CORS Issues**: The backend is configured to allow requests from localhost
3. **Login Issues**: Check if the backend server is running on port 5000

## Credits

Developed by: abhinav karthik and vijay govindu

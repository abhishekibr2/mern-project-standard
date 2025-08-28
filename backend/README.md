# MERN Backend

A professional Express.js backend following Big Tech (Facebook, Amazon, Netflix, Google) industry standards for enterprise-grade applications.

## 🚀 Features

- **Express.js** - Fast, unopinionated web framework
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (RBAC)
- **Input Validation** with express-validator
- **Security Middleware** (Helmet, CORS, Rate Limiting)
- **Logging** with Winston
- **Error Handling** - Centralized error management
- **Health Checks** - Application monitoring endpoints
- **Email Services** - User verification and notifications
- **File Upload** support with Multer
- **Comprehensive Validation** schemas

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── index.js      # Main config
│   │   └── database.js   # Database connection
│   ├── controllers/      # Route controllers (MVC pattern)
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── healthController.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js       # Authentication middleware
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   ├── models/           # Database models
│   │   ├── User.js       # User model with full features
│   │   └── index.js      # Models export
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── users.js      # User management routes
│   │   └── health.js     # Health check routes
│   ├── utils/            # Utility functions
│   │   ├── logger.js     # Winston logger
│   │   ├── jwt.js        # JWT utilities
│   │   ├── email.js      # Email services
│   │   ├── helpers.js    # Helper functions
│   │   └── index.js      # Utils export
│   └── validators/       # Input validation schemas
│       ├── authValidator.js
│       └── userValidator.js
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
├── env.example           # Environment variables template
└── README.md
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mern_app
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "passwordConfirm": "SecurePass123!"
}
```

#### POST `/api/auth/login`
User login
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### POST `/api/auth/logout`
Logout user (requires authentication)

#### POST `/api/auth/refresh-token`
Refresh JWT token using refresh token

#### POST `/api/auth/forgot-password`
Request password reset
```json
{
  "email": "john@example.com"
}
```

#### PATCH `/api/auth/reset-password/:token`
Reset password with token
```json
{
  "password": "NewSecurePass123!",
  "passwordConfirm": "NewSecurePass123!"
}
```

### User Management Endpoints

#### GET `/api/users/me`
Get current user profile (requires authentication)

#### PATCH `/api/users/update-me`
Update current user profile (requires authentication)
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "username": "johnsmith",
  "profile": {
    "bio": "Software Developer",
    "location": "New York"
  }
}
```

#### DELETE `/api/users/delete-me`
Deactivate current user account (requires authentication)

### Admin Endpoints (require admin role)

#### GET `/api/users`
Get all users with pagination and filtering

#### GET `/api/users/stats`
Get user statistics

#### POST `/api/users`
Create new user (admin only)

#### GET `/api/users/:id`
Get user by ID

#### PATCH `/api/users/:id`
Update user by ID

#### DELETE `/api/users/:id`
Delete user by ID

### Health Check Endpoints

#### GET `/api/health`
Basic health check

#### GET `/api/health/detailed`
Detailed health check with dependencies

#### GET `/api/health/ready`
Readiness probe (Kubernetes)

#### GET `/api/health/live`
Liveness probe (Kubernetes)

#### GET `/api/health/metrics`
Application metrics

## 🔐 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** with bcrypt (configurable rounds)
- **Rate Limiting** to prevent abuse
- **CORS** protection
- **Helmet** for security headers
- **Input Validation** and sanitization
- **Account Lockout** after failed login attempts
- **Email Verification** for new accounts
- **Secure Password Requirements**

## 🔧 Configuration

All configuration is centralized in `src/config/index.js`:

- **Database Settings**
- **JWT Configuration**
- **Security Settings**
- **Email Configuration**
- **File Upload Settings**
- **Logging Configuration**

## 📊 Logging

Winston logger with different levels:
- **Error**: Application errors
- **Warn**: Warning messages
- **Info**: General information
- **Debug**: Debug information (development only)

Logs are written to:
- Console (formatted for development)
- Files (JSON format for production)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Environment Variables (Production)
Ensure all required environment variables are set:
- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`

### PM2 (Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name "mern-backend"

# Monitor
pm2 monitor
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
USER node
CMD ["node", "server.js"]
```

## 🔍 Monitoring

The application includes comprehensive health checks:

- **Basic Health**: Server status and uptime
- **Detailed Health**: Database connectivity, memory usage
- **Kubernetes Probes**: Readiness and liveness checks
- **Metrics**: Application performance metrics

## 📝 Code Quality

- **ESLint** configuration for code standards
- **Prettier** for code formatting
- **Consistent file/folder structure**
- **Comprehensive error handling**
- **Input validation and sanitization**
- **Security best practices**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️IBR Infotech following Big Tech industry standards**

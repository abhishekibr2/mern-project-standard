# MERN Stack Documentation Project

A full-stack MERN (MongoDB, Express.js, React, Node.js) application built with FAANG company standards and best practices.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB (local or cloud instance)

### Installation & Setup

1. **Install all dependencies (frontend + backend):**
   ```bash
   npm run install:all
   ```

2. **Start both development servers:**
   ```bash
   npm run dev
   ```

3. **Access your application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📁 Project Structure

```
mern-js-documentation/
├── frontend/          # React application
├── backend/           # Express.js server
├── package.json       # Root package.json with scripts
└── README.md         # This file
```

## 🛠️ Available Scripts

### Installation Scripts
- `npm run install:all` - Install dependencies for both frontend and backend
- `npm run install:frontend` - Install only frontend dependencies
- `npm run install:backend` - Install only backend dependencies

### Development Scripts
- `npm run dev` - Start both frontend and backend development servers
- `npm run dev:frontend` - Start only frontend development server
- `npm run dev:backend` - Start only backend development server

### Build & Production Scripts
- `npm run build` - Build frontend for production
- `npm run start` - Start backend production server

### Utility Scripts
- `npm run test` - Run tests for both frontend and backend
- `npm run lint` - Run linting for both frontend and backend
- `npm run lint:fix` - Fix linting issues automatically
- `npm run clean` - Remove all node_modules and build folders
- `npm run clean:install` - Clean and reinstall all dependencies

## 🔧 Individual Project Scripts

### Frontend (React)
```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Run ESLint
```

### Backend (Express.js)
```bash
cd backend
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm test           # Run tests
npm run lint       # Run ESLint
```

## 🌟 Features

- **Modern React 18** with functional components and hooks
- **TypeScript-ready** architecture
- **Tailwind CSS** for utility-first styling
- **Zustand** for lightweight state management
- **React Query** for server state management
- **JWT Authentication** with refresh tokens
- **Protected Routes** with React Router
- **Form handling** with React Hook Form
- **API integration** with Axios interceptors
- **ESLint & Prettier** for code quality
- **Responsive design** with mobile-first approach

## 🚀 Deployment

### Frontend
```bash
npm run build
# Deploy the 'frontend/build' folder to your hosting service
```

### Backend
```bash
npm run start
# Deploy to your Node.js hosting service (Heroku, Vercel, etc.)
```

## 📝 Environment Variables

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use:**
   - Frontend: Change port in `frontend/package.json` scripts
   - Backend: Change port in `.env` file

2. **MongoDB connection issues:**
   - Ensure MongoDB is running
   - Check connection string in backend `.env`

3. **Dependencies issues:**
   - Run `npm run clean:install` to clean and reinstall

4. **Build errors:**
   - Check Node.js version compatibility
   - Clear cache: `npm cache clean --force`

### Getting Help

- Check the console for error messages
- Review the browser console for frontend issues
- Check the terminal for backend server logs
- Ensure all environment variables are set correctly

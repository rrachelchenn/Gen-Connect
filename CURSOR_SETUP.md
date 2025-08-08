# GenConnect - Cursor Setup Guide

This guide will help you set up GenConnect to work with Cursor IDE.

## Prerequisites

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Cursor IDE** - [Download here](https://cursor.sh/)

## Quick Setup

1. **Clone or open the project in Cursor**
   ```bash
   # If you haven't already, clone the repository
   git clone <your-repo-url>
   cd GenConnect-main
   ```

2. **Install dependencies**
   ```bash
   # Run the setup script (recommended)
   ./setup.sh
   
   # Or manually install dependencies
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

3. **Start the development servers**
   ```bash
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
GenConnect-main/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Application pages
│   │   └── App.tsx         # Main app component
│   └── package.json
├── server/                 # Express backend
│   ├── routes/            # API routes
│   ├── database/          # Database setup and seeding
│   └── index.js           # Server entry point
├── package.json           # Root package.json
└── README.md
```

## Available Scripts

- `npm start` - Start both frontend and backend servers
- `npm run dev` - Same as start (development mode)
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend server
- `npm run build` - Build the React app for production
- `npm run install-deps` - Install all dependencies

## Demo Accounts

Test the application with these pre-seeded demo accounts:

### Senior Citizen (Tutee)
- **Email**: demo.senior@genconnect.com
- **Password**: demo123
- **Name**: Betty Johnson

### College Student (Tutor)
- **Email**: demo.student@genconnect.com
- **Password**: demo123
- **Name**: Alex Chen

## Development Workflow

1. **Frontend Development**: Edit files in `client/src/`
2. **Backend Development**: Edit files in `server/`
3. **Database**: SQLite database is automatically created in `server/database/`

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill processes on ports 3000 and 5000
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5000 | xargs kill -9
   ```

2. **Node modules issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules client/node_modules server/node_modules
   npm run install-deps
   ```

3. **Database issues**
   ```bash
   # Remove database file and restart
   rm -f server/database/genconnect.db
   npm start
   ```

## Features

- 🔐 User Authentication & Roles
- 📚 Reading Library
- 📅 Session Booking System
- 💬 Live Session Interface
- ⭐ Feedback System
- ♿ Accessibility Features

## Tech Stack

- **Frontend**: React 18, TypeScript, React Router
- **Backend**: Node.js, Express, SQLite
- **Real-time**: Socket.IO
- **Authentication**: JWT

## Contributing

1. Make your changes
2. Test locally with `npm start`
3. Commit your changes
4. Push to your repository

## Support

If you encounter any issues:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify both servers are running
4. Check the demo accounts work correctly

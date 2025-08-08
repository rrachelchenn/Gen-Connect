# GenConnect 🧓👩‍🎓

**Connecting senior citizens with college students for live tech tutoring sessions based on curated digital readings.**

GenConnect is a minimum viable product (MVP) that bridges the digital divide by providing personalized tech assistance to seniors through one-on-one tutoring sessions with helpful college students.

## 🎯 Mission

Help senior citizens become more comfortable with technology through accessible, patient, and personalized tutoring sessions while giving college students meaningful volunteer opportunities.

## ✨ Key Features

### 🔐 User Authentication & Roles
- **Two user types**: Senior Citizens (Tutees) and College Students (Tutors)
- Secure signup/login with role-specific onboarding
- Profile management with accessibility in mind

### 📚 Reading Library
- Curated collection of easy-to-understand tech guides
- Topics include: smartphone basics, online shopping, video calling, social media safety, and more
- Difficulty levels: Easy, Medium, Hard
- Search and filter functionality
- Preview content before booking sessions

### 📅 Session Booking System
- Tutees can browse available tutors and book 1:1 sessions
- Select reading topic and preferred session time
- View tutor profiles including college and major
- Session confirmation with email notifications

### 💬 Live Session Interface
- Real-time chat between tutee and tutor
- Side-by-side reading material display
- Integration links for video calling (Google Meet, Zoom)
- Session management tools

### ⭐ Feedback System
- Post-session feedback forms for both parties
- Rating system (1-5 stars)
- "What I learned" reflections
- Tutor recommendations for follow-up resources

### ♿ Accessibility Features
- Large, readable fonts (18px base)
- High contrast color scheme
- Clear, simple navigation
- Senior-friendly UI/UX design
- Keyboard navigation support

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Axios** for API calls
- **Socket.IO Client** for real-time chat
- Custom CSS with accessibility focus

### Backend
- **Node.js** with Express
- **SQLite** database
- **Socket.IO** for real-time communication
- **JWT** authentication
- **bcryptjs** for password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)
- Cursor IDE (recommended) - [Download here](https://cursor.sh/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
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

### Demo Accounts

Test the application with these pre-seeded demo accounts:

#### Senior Citizen (Tutee)
- **Email**: demo.senior@genconnect.com
- **Password**: demo123
- **Name**: Betty Johnson

#### College Student (Tutor)
- **Email**: demo.student@genconnect.com
- **Password**: demo123
- **Name**: Alex Chen

## 📖 Sample Reading Topics

GenConnect includes these pre-loaded reading topics:

1. **Online Grocery Shopping Basics** (Easy)
   - Learn how to order groceries online safely and efficiently

2. **Understanding Gen Z Slang** (Easy)
   - Decode common phrases and expressions used by younger generations

3. **Video Calling Essentials** (Medium)
   - Master Zoom, FaceTime, and other video calling platforms

4. **Social Media Safety** (Medium)
   - Protect yourself while staying connected online

5. **Smartphone Photography Tips** (Easy)
   - Take better photos with your phone

## 🏗️ Project Structure

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

## 🔄 Core User Flows

### For Senior Citizens (Tutees):
1. Sign up with basic info and tech comfort level
2. Browse reading library by topic/difficulty
3. Preview reading content
4. Book session with available tutor
5. Join live session at scheduled time
6. Chat with tutor and discuss reading
7. Provide session feedback

### For College Students (Tutors):
1. Sign up with college and major info
2. Set availability (coming soon)
3. Receive session booking notifications
4. Join live session with tutee
5. Help explain reading content
6. Provide follow-up resources
7. Give feedback on session

## 🎨 Design Philosophy

### Senior-Friendly Design
- **Large fonts**: 18px base font size
- **High contrast**: Dark text on light backgrounds
- **Simple navigation**: Clear, labeled buttons
- **Minimal clutter**: Clean, spacious layouts
- **Consistent patterns**: Familiar UI elements

### Accessibility Features
- Focus indicators for keyboard navigation
- ARIA labels for screen readers
- High contrast mode support
- Clear error messages
- Simple form layouts

## 🚧 Current Limitations & Future Enhancements

### MVP Limitations
- Basic availability system (tutors manually manage)
- Simple chat interface (no file sharing)
- No video calling built-in (uses external links)
- Basic notification system

### Planned Enhancements
- Advanced tutor availability management
- Built-in video calling integration
- File sharing capabilities
- Email notifications for bookings
- Mobile app development
- Advanced matching algorithms
- Group session support

## 🤝 Contributing

This is an MVP project designed for demonstration purposes. For a production version, consider:

1. **Security enhancements**: Rate limiting, input validation, HTTPS
2. **Database optimization**: PostgreSQL, connection pooling
3. **Real-time improvements**: Better error handling, reconnection logic
4. **Testing**: Unit tests, integration tests, E2E tests
5. **Deployment**: Production-ready hosting, environment configurations

## 📞 Support

For technical issues or questions about GenConnect:

1. Check the demo accounts work correctly
2. Ensure all dependencies are installed
3. Verify both frontend and backend servers are running
4. Check browser console for any error messages

## 🏆 MVP Goals Achieved

✅ **User Authentication**: Two-role system with secure login  
✅ **Reading Library**: Browsable content with search/filter  
✅ **Session Booking**: Complete booking flow for tutees  
✅ **Live Sessions**: Real-time chat with reading display  
✅ **Feedback System**: Post-session reviews and ratings  
✅ **Accessibility**: Senior-friendly design throughout  
✅ **Demo Data**: Pre-loaded content and demo accounts  

## 📱 Responsive Design

GenConnect works on:
- Desktop computers (primary target)
- Tablets (senior-friendly large interface)
- Mobile phones (basic functionality)

## 🔧 Development with Cursor IDE

This project has been configured to work seamlessly with Cursor IDE. See `CURSOR_SETUP.md` for detailed setup instructions.

### Quick Cursor Setup:
1. Open the project in Cursor
2. Run `./setup.sh` to install dependencies
3. Run `npm start` to start development servers
4. Access the app at http://localhost:3000

---

**GenConnect** - Bridging generations through technology education 🌉

*Built with ❤️ for senior citizens who want to stay connected in our digital world.*
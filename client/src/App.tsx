import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ReadingLibrary from './pages/ReadingLibrary';
import BookSession from './pages/BookSession';
import LiveSession from './pages/LiveSession';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import BrowseTutors from './pages/BrowseTutors';
import Admin from './pages/Admin';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return !user ? <>{children}</> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/readings" element={
                <PrivateRoute>
                  <ReadingLibrary />
                </PrivateRoute>
              } />
              <Route path="/browse-tutors" element={<BrowseTutors />} />
              <Route path="/book-session/:readingId" element={
                <PrivateRoute>
                  <BookSession />
                </PrivateRoute>
              } />
              <Route path="/book-session" element={
                <PrivateRoute>
                  <BookSession />
                </PrivateRoute>
              } />
              <Route path="/session/:sessionId" element={
                <PrivateRoute>
                  <LiveSession />
                </PrivateRoute>
              } />
              <Route path="/feedback/:sessionId" element={
                <PrivateRoute>
                  <Feedback />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/admin" element={
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

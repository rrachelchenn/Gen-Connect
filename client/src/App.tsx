import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import TutorApplication from './pages/Login'; // Renamed but keeping file for now
import BrowseTutors from './pages/BrowseTutors';
import Lessons from './pages/Lessons';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/apply" element={<TutorApplication />} />
              <Route path="/browse-tutors" element={<BrowseTutors />} />
              <Route path="/lessons" element={<Lessons />} />
              {/* Legacy routes redirect to appropriate pages */}
              <Route path="/login" element={<TutorApplication />} />
              <Route path="/signup" element={<TutorApplication />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

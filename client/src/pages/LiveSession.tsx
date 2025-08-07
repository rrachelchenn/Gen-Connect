import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

interface SessionData {
  id: number;
  tutee_name: string;
  tutor_name: string;
  reading_title: string;
  reading_content: string;
  chat_room_id: string;
  status: string;
}

interface Message {
  message: string;
  sender: string;
  timestamp: Date;
}

const LiveSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const [session, setSession] = useState<SessionData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      fetchSession();
      initializeSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await axios.get(`/api/sessions/${sessionId}`);
      setSession(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const newSocket = io();
    
    newSocket.on('connect', () => {
      newSocket.emit('join-session', sessionId);
    });

    newSocket.on('receive-message', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });

    setSocket(newSocket);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !session) return;

    const messageData = {
      sessionId: session.chat_room_id,
      message: newMessage,
      sender: user?.name || 'Unknown'
    };

    socket.emit('send-message', messageData);
    
    // Add to local messages
    setMessages(prev => [...prev, {
      message: newMessage,
      sender: user?.name || 'Unknown',
      timestamp: new Date()
    }]);
    
    setNewMessage('');
  };

  if (loading) return <div className="loading">Loading session...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!session) return <div className="error-message">Session not found</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Live Session: {session.reading_title}</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>
          Session between {session.tutee_name} and {session.tutor_name}
        </p>
      </div>

      <div className="grid grid-2" style={{ gap: '2rem' }}>
        {/* Reading Content */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>📚 Reading Material</h2>
          <div style={{ 
            maxHeight: '500px', 
            overflowY: 'auto', 
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
              {session.reading_content}
            </p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>💬 Session Chat</h2>
          
          <div className="chat-container">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '1rem' }}>
                  Start your conversation here! Ask questions about the reading or discuss any tech topics.
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`chat-message ${msg.sender === user?.name ? 'own' : 'other'}`}
                  >
                    {msg.sender !== user?.name && (
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                        {msg.sender}
                      </div>
                    )}
                    <div>{msg.message}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.25rem' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="chat-input-container">
              <input
                type="text"
                className="chat-input form-input"
                placeholder="Type your message here..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Session Controls */}
      <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <h3>Session Tools</h3>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="https://meet.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            📹 Start Video Call (Google Meet)
          </a>
          <a 
            href="https://zoom.us/start" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            📹 Start Video Call (Zoom)
          </a>
          <button 
            onClick={() => window.open(`/feedback/${sessionId}`, '_blank')}
            className="btn btn-secondary"
          >
            ✨ End Session & Give Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveSession;
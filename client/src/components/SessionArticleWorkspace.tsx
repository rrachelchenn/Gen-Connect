import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import DiscussionQuestions from './DiscussionQuestions';

interface SessionArticleWorkspaceProps {
  session: {
    id: number;
    reading_id: number;
    reading_title: string;
    session_date: string;
    duration_minutes: number;
    tutee_name?: string;
    tutor_name?: string;
    tutee_id?: number;
    tutor_id?: number;
    zoom_join_url?: string;
  };
  userRole: 'tutor' | 'tutee';
  onClose: () => void;
}

interface Reading {
  id: number;
  title: string;
  content: string;
  discussion_questions?: string;
}

interface SessionNotes {
  session_id: number;
  tutor_notes: string;
  discussion_notes: string;
}

const SessionArticleWorkspace: React.FC<SessionArticleWorkspaceProps> = ({
  session,
  userRole,
  onClose
}) => {
  const [reading, setReading] = useState<Reading | null>(null);
  const [sessionNotes, setSessionNotes] = useState<SessionNotes>({
    session_id: session.id,
    tutor_notes: '',
    discussion_notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaveStatus, setNotesSaveStatus] = useState('');

  useEffect(() => {
    fetchReadingAndNotes();
  }, [session.id]);

  const fetchReadingAndNotes = async () => {
    try {
      setLoading(true);
      
      // Fetch reading content
      const readingResponse = await axios.get(`${API_BASE_URL}/readings/${session.reading_id}`);
      setReading(readingResponse.data);

      // Fetch session notes if user is tutor
      if (userRole === 'tutor') {
        try {
          const notesResponse = await axios.get(`${API_BASE_URL}/discussions/session/${session.id}/notes`);
          if (notesResponse.data) {
            setSessionNotes(prev => ({
              ...prev,
              tutor_notes: notesResponse.data.tutor_notes || '',
              discussion_notes: notesResponse.data.discussion_notes || ''
            }));
          }
        } catch (notesErr) {
          console.log('No existing notes found, starting fresh');
        }
      }
    } catch (error) {
      console.error('Error fetching reading or notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotesChange = (field: keyof SessionNotes, value: string) => {
    setSessionNotes(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear save status when user starts typing
    setNotesSaveStatus('');
  };

  const saveNotes = async () => {
    try {
      setSavingNotes(true);
      
      await axios.post(`${API_BASE_URL}/discussions/session/${session.id}/notes`, {
        tutorNotes: sessionNotes.tutor_notes,
        discussionNotes: sessionNotes.discussion_notes
      });
      
      setNotesSaveStatus('Notes saved!');
      
      // Clear save status after 2 seconds
      setTimeout(() => {
        setNotesSaveStatus('');
      }, 2000);
      
    } catch (error) {
      console.error('Error saving notes:', error);
      setNotesSaveStatus('Failed to save notes. Please try again.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      saveNotes();
    }
  };

  const renderMarkdownContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactElement[] = [];
    
    lines.forEach((line, index) => {
      if (line.trim() === '') {
        elements.push(<br key={`br-${index}`} />);
      } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        const text = line.slice(2, -2);
        elements.push(
          <h4 key={index} style={{ margin: '1.5rem 0 0.5rem 0', color: '#1e40af', fontSize: '1.1rem' }}>
            {text}
          </h4>
        );
      } else {
        const parts = line.split(/(\*\*[^*]+\*\*)/);
        const formattedParts = parts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={`${index}-${partIndex}`}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });
        
        elements.push(
          <p key={index} style={{ margin: '0.5rem 0', lineHeight: 1.6 }}>
            {formattedParts}
          </p>
        );
      }
    });
    
    return elements;
  };

  const openGoogleMeet = () => {
    if (session.zoom_join_url) {
      window.open(session.zoom_join_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="session-workspace-overlay" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000 
      }}>
        <div className="loading">Loading session workspace...</div>
      </div>
    );
  }

  return (
    <div className="session-workspace-overlay" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 1000 
    }}>
      <div style={{
        backgroundColor: 'white',
        width: '95vw',
        height: '95vh',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#1e40af' }}>
              Session: {reading?.title || 'Loading...'}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
              {userRole === 'tutor' ? `Tutoring ${session.tutee_name || 'Student'}` : `Learning with ${session.tutor_name || 'Tutor'}`}
              {' • '}
              {session.duration_minutes} minutes
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {session.zoom_join_url && (
              <button
                onClick={openGoogleMeet}
                className="btn btn-primary"
                style={{ backgroundColor: '#4285f4' }}
              >
                🎥 Join Google Meet
              </button>
            )}
            
            {userRole === 'tutor' && (
              <>
                <button
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="btn btn-outline"
                  style={{ fontSize: '0.9rem' }}
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
                
                {notesSaveStatus && (
                  <span
                    style={{
                      fontSize: '0.9rem',
                      color: notesSaveStatus.includes('Failed') ? '#dc2626' : '#16a34a'
                    }}
                  >
                    {notesSaveStatus}
                  </span>
                )}
              </>
            )}
            
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Side - Article */}
          <div style={{ 
            flex: 1, 
            padding: '2rem', 
            overflow: 'auto',
            borderRight: '1px solid #e5e7eb'
          }}>
            {reading && (
              <>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#1e40af', marginBottom: '1rem' }}>Article Content</h3>
                  <div style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
                    {renderMarkdownContent(reading.content)}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Side - Discussion & Notes */}
          <div style={{ 
            flex: 1, 
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Discussion Questions & Answers */}
            <div style={{ 
              flex: 1, 
              padding: '2rem',
              overflow: 'auto',
              borderBottom: userRole === 'tutor' ? '1px solid #e5e7eb' : 'none'
            }}>
              {reading && reading.discussion_questions && session.tutee_id && (
                <DiscussionQuestions
                  readingId={reading.id}
                  tuteeId={session.tutee_id}
                  questions={JSON.parse(reading.discussion_questions)}
                  readOnly={userRole === 'tutor'}
                />
              )}
              
              {(!reading || !reading.discussion_questions) && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <h3>No Discussion Questions</h3>
                  <p>This reading doesn't have discussion questions yet.</p>
                </div>
              )}
            </div>

            {/* Session Notes (Tutor Only) */}
            {userRole === 'tutor' && (
              <div style={{ 
                height: '300px',
                padding: '2rem',
                backgroundColor: '#f9fafb',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Session Notes</h4>
                
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      Teaching Notes:
                    </label>
                    <textarea
                      value={sessionNotes.tutor_notes}
                      onChange={(e) => handleNotesChange('tutor_notes', e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Track progress, concepts covered, student insights..."
                      className="form-textarea"
                      style={{ flex: 1, fontSize: '0.9rem', resize: 'none' }}
                    />
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      Discussion Notes:
                    </label>
                    <textarea
                      value={sessionNotes.discussion_notes}
                      onChange={(e) => handleNotesChange('discussion_notes', e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Key discussion points, questions asked, follow-up topics..."
                      className="form-textarea"
                      style={{ flex: 1, fontSize: '0.9rem', resize: 'none' }}
                    />
                  </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem', textAlign: 'center' }}>
                  Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to save notes quickly
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionArticleWorkspace;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import DiscussionQuestions from './DiscussionQuestions';
import VideoChat from './VideoChat';

interface SessionWorkspaceProps {
  session: {
    id: number;
    reading_id: number;
    reading_title: string;
    session_date: string;
    duration_minutes: number;
    tutee_name?: string;
    tutor_name?: string;
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

const SessionWorkspace: React.FC<SessionWorkspaceProps> = ({
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

      // Fetch session notes
      const notesResponse = await axios.get(`${API_BASE_URL}/discussions/session/${session.id}/notes`);
      setSessionNotes(notesResponse.data);

    } catch (err: any) {
      console.error('Error fetching session data:', err);
    } finally {
      setLoading(false);
    }
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

    } catch (err: any) {
      console.error('Error saving notes:', err);
      setNotesSaveStatus('Failed to save notes. Please try again.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleNotesChange = (field: 'tutor_notes' | 'discussion_notes', value: string) => {
    setSessionNotes(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear save status when user starts typing
    setNotesSaveStatus('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      saveNotes();
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '400px' }}>
          <div className="loading">Loading session workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div 
        className="session-workspace"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000
        }}
      >
        {/* Header */}
        <div 
          className="session-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc'
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: '#1e40af' }}>
              {reading?.title || 'Session Workspace'}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
              {userRole === 'tutor' ? `Tutoring ${session.tutee_name || 'Student'}` : `Learning with ${session.tutor_name || 'Tutor'}`}
              {' • '}
              {session.duration_minutes} minutes
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {userRole === 'tutor' && (
              <>
                <button
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="btn btn-primary"
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
            
            <button onClick={onClose} className="btn btn-outline">
              End Session
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div 
          style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden'
          }}
        >
          {/* Left Side - Video Chat */}
          <div 
            style={{
              flex: 1,
              borderRight: '1px solid #e5e7eb',
              backgroundColor: '#000',
              position: 'relative'
            }}
          >
            <VideoChat
              session={session}
              userRole={userRole}
              onClose={() => {}} // Don't close the whole session from video
              embedded={true} // New prop to indicate it's embedded
            />
          </div>

          {/* Right Side - Discussion & Notes */}
          <div 
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Top Section - Discussion Questions & Answers */}
            <div 
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '1.5rem',
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              {reading && reading.discussion_questions && (
                <DiscussionQuestions
                  readingId={reading.id}
                  sessionId={session.id}
                  tuteeId={userRole === 'tutee' ? 1 : 1} // TODO: Get actual tutee ID
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

            {/* Bottom Section - Session Notes (Tutor Only) */}
            {userRole === 'tutor' && (
              <div 
                style={{
                  height: '300px',
                  padding: '1.5rem',
                  backgroundColor: '#f9fafb',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Session Notes</h4>
                
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                  {/* Tutor Notes */}
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

                  {/* Discussion Notes */}
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

            {/* Tutee View - Show tutor notes if available */}
            {userRole === 'tutee' && sessionNotes.discussion_notes && (
              <div 
                style={{
                  height: '200px',
                  padding: '1.5rem',
                  backgroundColor: '#f0f9ff',
                  borderTop: '1px solid #e5e7eb'
                }}
              >
                <h4 style={{ marginBottom: '1rem', color: '#1e40af' }}>Discussion Notes</h4>
                <div 
                  style={{
                    height: '120px',
                    overflow: 'auto',
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {sessionNotes.discussion_notes || 'No discussion notes yet.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionWorkspace;

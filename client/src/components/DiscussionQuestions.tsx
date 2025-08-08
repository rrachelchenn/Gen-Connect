import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface DiscussionQuestion {
  question: string;
  index: number;
}

interface DiscussionAnswer {
  id: number;
  question_index: number;
  answer: string;
}

interface DiscussionQuestionsProps {
  readingId: number;
  sessionId?: number; // Present when in a session
  tuteeId: number;
  questions: string[];
  readOnly?: boolean; // For tutors to view answers
}

const DiscussionQuestions: React.FC<DiscussionQuestionsProps> = ({
  readingId,
  sessionId,
  tuteeId,
  questions,
  readOnly = false
}) => {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<{ [key: number]: boolean }>({});
  const [saveStatus, setSaveStatus] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (sessionId) {
      fetchExistingAnswers();
    }
  }, [sessionId]);

  const fetchExistingAnswers = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/discussions/session/${sessionId}/answers`);
      const existingAnswers: { [key: number]: string } = {};
      
      response.data.forEach((answer: DiscussionAnswer) => {
        existingAnswers[answer.question_index] = answer.answer;
      });
      
      setAnswers(existingAnswers);
    } catch (err: any) {
      console.error('Error fetching existing answers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
    
    // Clear save status when user starts typing
    setSaveStatus(prev => ({
      ...prev,
      [questionIndex]: ''
    }));
  };

  const saveAnswer = async (questionIndex: number) => {
    if (!sessionId) {
      // For non-session viewing, just store locally
      return;
    }

    const answer = answers[questionIndex];
    if (!answer || answer.trim() === '') {
      setSaveStatus(prev => ({
        ...prev,
        [questionIndex]: 'Please write an answer before saving.'
      }));
      return;
    }

    try {
      setSaving(prev => ({ ...prev, [questionIndex]: true }));
      
      await axios.post(`${API_BASE_URL}/discussions/session/${sessionId}/answers`, {
        readingId,
        questionIndex,
        answer: answer.trim(),
        tuteeId
      });
      
      setSaveStatus(prev => ({
        ...prev,
        [questionIndex]: 'Saved!'
      }));

      // Clear save status after 2 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({
          ...prev,
          [questionIndex]: ''
        }));
      }, 2000);

    } catch (err: any) {
      console.error('Error saving answer:', err);
      setSaveStatus(prev => ({
        ...prev,
        [questionIndex]: 'Failed to save. Please try again.'
      }));
    } finally {
      setSaving(prev => ({ ...prev, [questionIndex]: false }));
    }
  };

  const handleKeyPress = (questionIndex: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      saveAnswer(questionIndex);
    }
  };

  if (loading) {
    return <div className="loading">Loading discussion questions...</div>;
  }

  return (
    <div className="discussion-questions">
      <h3>Discussion Questions</h3>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        {readOnly 
          ? "Here are the tutee's responses to the discussion questions:"
          : sessionId 
            ? "Share your thoughts on these questions. Your tutor will be able to see your answers during the session."
            : "Think about these questions as you read. You can prepare your thoughts for the session."
        }
      </p>

      <div className="questions-list">
        {questions.map((question, index) => (
          <div key={index} className="question-card" style={{ marginBottom: '2rem' }}>
            <div className="question-header">
              <h4 style={{ color: '#1e40af', marginBottom: '0.5rem' }}>
                Question {index + 1}
              </h4>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                {question}
              </p>
            </div>

            <div className="answer-section">
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                Your Answer:
              </label>
              <textarea
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                onKeyPress={(e) => handleKeyPress(index, e)}
                placeholder={readOnly ? "No answer provided" : "Share your thoughts here..."}
                className="form-textarea"
                rows={4}
                disabled={readOnly}
                style={{
                  marginBottom: '0.75rem',
                  backgroundColor: readOnly ? '#f9fafb' : 'white'
                }}
              />

              {!readOnly && sessionId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => saveAnswer(index)}
                    disabled={saving[index] || !answers[index]?.trim()}
                    className="btn btn-primary"
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                  >
                    {saving[index] ? 'Saving...' : 'Save Answer'}
                  </button>

                  {saveStatus[index] && (
                    <span
                      style={{
                        fontSize: '0.9rem',
                        color: saveStatus[index].includes('Failed') ? '#dc2626' : '#16a34a'
                      }}
                    >
                      {saveStatus[index]}
                    </span>
                  )}
                </div>
              )}

              {!readOnly && !sessionId && answers[index] && (
                <p style={{ fontSize: '0.9rem', color: '#6b7280', fontStyle: 'italic' }}>
                  Your answers will be saved when you book and start a session.
                </p>
              )}

              {!readOnly && sessionId && (
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                  Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to save quickly
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {!readOnly && questions.length > 0 && (
        <div className="discussion-tips" style={{ 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #0ea5e9', 
          borderRadius: '8px', 
          padding: '1rem', 
          marginTop: '2rem' 
        }}>
          <h4 style={{ color: '#0ea5e9', marginBottom: '0.5rem' }}>💡 Discussion Tips</h4>
          <ul style={{ fontSize: '0.9rem', color: '#374151', margin: 0, paddingLeft: '1.5rem' }}>
            <li>Take your time to think through each question thoroughly</li>
            <li>Share personal experiences or examples when relevant</li>
            <li>Don't worry about perfect answers - your thoughts and questions are valuable</li>
            <li>These answers will help your tutor understand your perspective and guide the conversation</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DiscussionQuestions;

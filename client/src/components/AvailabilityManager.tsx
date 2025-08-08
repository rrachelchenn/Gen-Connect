import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './AvailabilityManager.css';

interface TimeSlot {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  topics: string;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const AvailabilityManager: React.FC = () => {
  const { user } = useAuth();
  const [availabilitySlots, setAvailabilitySlots] = useState<TimeSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday by default
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [topics, setTopics] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      fetchAvailability();
    }
  }, [user?.id]);

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(`/api/availability/${user?.id}`);
      setAvailabilitySlots(response.data);
    } catch (error) {
      setError('Failed to fetch availability slots');
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/availability', {
        day_of_week: selectedDay,
        start_time: startTime,
        end_time: endTime,
        topics
      });

      setSuccess('Availability slot added successfully');
      fetchAvailability();
      setTopics('');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to add availability slot');
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    try {
      await axios.delete(`/api/availability/${slotId}`);
      setSuccess('Availability slot deleted successfully');
      fetchAvailability();
    } catch (error) {
      setError('Failed to delete availability slot');
    }
  };

  const groupSlotsByDay = () => {
    const grouped: { [key: number]: TimeSlot[] } = {};
    DAYS_OF_WEEK.forEach((_, index) => {
      grouped[index] = availabilitySlots.filter(slot => slot.day_of_week === index);
    });
    return grouped;
  };

  return (
    <div className="availability-manager">
      <h2>Manage Your Availability</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleAddSlot} className="add-slot-form">
        <div className="form-group">
          <label htmlFor="day">Day:</label>
          <select
            id="day"
            value={selectedDay}
            onChange={(e) => setSelectedDay(parseInt(e.target.value))}
          >
            {DAYS_OF_WEEK.map((day, index) => (
              <option key={day} value={index}>{day}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="startTime">Start Time:</label>
          <select
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          >
            {TIME_SLOTS.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="endTime">End Time:</label>
          <select
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          >
            {TIME_SLOTS.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="topics">Topics (comma-separated):</label>
          <input
            type="text"
            id="topics"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="e.g., smartphones, social media, email"
          />
        </div>

        <button type="submit" className="add-slot-button">
          Add Availability Slot
        </button>
      </form>

      <div className="availability-schedule">
        <h3>Your Current Availability</h3>
        {Object.entries(groupSlotsByDay()).map(([day, slots]) => (
          <div key={day} className="day-schedule">
            <h4>{DAYS_OF_WEEK[parseInt(day)]}</h4>
            {slots.length === 0 ? (
              <p>No availability set</p>
            ) : (
              <ul>
                {slots.map(slot => (
                  <li key={slot.id} className="time-slot">
                    <span>{slot.start_time} - {slot.end_time}</span>
                    {slot.topics && <span className="topics">Topics: {slot.topics}</span>}
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="delete-slot-button"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityManager;

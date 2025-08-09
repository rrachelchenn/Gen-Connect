import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './AvailabilityManager.css';

interface TimeSlot {
  id: number;
  date?: string; // YYYY-MM-DD format (new system)
  day_of_week?: number; // Legacy system (0-6)
  start_time: string;
  end_time: string;
  topics: string;
  is_recurring?: boolean;
  recurring_pattern?: 'weekly' | 'biweekly' | 'monthly';
  recurring_end_date?: string;
}

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const AvailabilityManager: React.FC = () => {
  const { user } = useAuth();
  const [availabilitySlots, setAvailabilitySlots] = useState<TimeSlot[]>([]);
  const [deletedSlotIds, setDeletedSlotIds] = useState<Set<number>>(new Set()); // Track deleted slots
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [topics, setTopics] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringPattern, setRecurringPattern] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [recurringEndDate, setRecurringEndDate] = useState<string>(() => {
    // Default to 3 months from now
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    return threeMonthsLater.toISOString().split('T')[0];
  });
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
        date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        topics,
        is_recurring: isRecurring,
        recurring_pattern: isRecurring ? recurringPattern : undefined,
        recurring_end_date: isRecurring ? recurringEndDate : undefined
      });

      setSuccess(isRecurring ? 
        `Recurring availability slots added successfully (${recurringPattern} until ${recurringEndDate})` :
        'Availability slot added successfully'
      );
      fetchAvailability();
      setTopics('');
      // Clear deleted slots list when adding new ones
      setDeletedSlotIds(new Set());
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to add availability slot');
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    try {
      const response = await axios.delete(`/api/availability/${slotId}`);
      
      if (response.data.demo_mode) {
        setSuccess(`${response.data.message} (Demo mode - slot hidden until database refresh)`);
        // In demo mode, hide the slot client-side since we can't actually delete it
        setDeletedSlotIds(prev => {
          const newSet = new Set(prev);
          newSet.add(slotId);
          return newSet;
        });
      } else {
        setSuccess('Availability slot deleted successfully');
        // Always refresh to get updated data
        fetchAvailability();
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete availability slot';
      setError(errorMessage);
    }
  };

  const groupSlotsByDate = () => {
    const grouped: { [key: string]: TimeSlot[] } = {};
    
    // Filter out deleted slots and sort by date
    const filteredSlots = availabilitySlots.filter(slot => !deletedSlotIds.has(slot.id));
    const sortedSlots = [...filteredSlots].sort((a, b) => {
      // Handle both date-based and legacy day_of_week based slots
      if (a.date && b.date) {
        return a.date.localeCompare(b.date);
      }
      // For legacy slots without dates, sort by day_of_week
      return 0;
    });
    
    sortedSlots.forEach(slot => {
      // Use date if available, otherwise create a key for legacy slots
      const key = slot.date || `legacy-${slot.day_of_week || 'unknown'}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(slot);
    });
    
    return grouped;
  };

  const formatDate = (dateString: string) => {
    // Handle legacy slots
    if (dateString.startsWith('legacy-')) {
      const dayOfWeek = dateString.replace('legacy-', '');
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${days[parseInt(dayOfWeek)] || 'Unknown Day'} (Legacy Schedule)`;
    }
    
    // Handle date-based slots
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getMinDate = () => {
    // Minimum date is today
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="availability-manager">
      <h2>Manage Your Availability</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleAddSlot} className="add-slot-form">
        <div className="form-group">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            min={getMinDate()}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
          />
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

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            Make this recurring
          </label>
        </div>

        {isRecurring && (
          <>
            <div className="form-group">
              <label htmlFor="recurringPattern">Repeat every:</label>
              <select
                id="recurringPattern"
                value={recurringPattern}
                onChange={(e) => setRecurringPattern(e.target.value as 'weekly' | 'biweekly' | 'monthly')}
              >
                <option value="weekly">Week</option>
                <option value="biweekly">2 Weeks</option>
                <option value="monthly">Month</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="recurringEndDate">End recurring on:</label>
              <input
                type="date"
                id="recurringEndDate"
                value={recurringEndDate}
                min={selectedDate}
                onChange={(e) => setRecurringEndDate(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <button type="submit" className="add-slot-button">
          {isRecurring ? 'Add Recurring Slots' : 'Add Availability Slot'}
        </button>
      </form>

      <div className="availability-schedule">
        <h3>Your Current Availability</h3>
        {Object.keys(groupSlotsByDate()).length === 0 ? (
          <p>No availability slots set. Add your first availability slot above.</p>
        ) : (
          Object.entries(groupSlotsByDate()).map(([date, slots]) => (
            <div key={date} className="date-schedule">
              <h4>{formatDate(date)}</h4>
              <ul>
                {slots.map(slot => (
                  <li key={slot.id} className="time-slot">
                    <span className="time-range">{slot.start_time} - {slot.end_time}</span>
                    {slot.topics && <span className="topics">Topics: {slot.topics}</span>}
                    {slot.is_recurring && (
                      <span className="recurring-info">
                        🔄 Recurring {slot.recurring_pattern}
                        {slot.recurring_end_date && ` until ${formatDate(slot.recurring_end_date)}`}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="delete-slot-button"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AvailabilityManager;

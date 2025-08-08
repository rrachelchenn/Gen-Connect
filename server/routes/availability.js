const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const router = express.Router();
const { authenticateToken } = require('./auth');

const dbPath = path.join(__dirname, '../database/genconnect.db');

// Middleware to check if user is a tutor
const isTutor = (req, res, next) => {
  if (req.user.role !== 'tutor') {
    return res.status(403).json({ error: 'Only tutors can manage availability' });
  }
  next();
};

// Get tutor's availability
router.get('/:tutorId', async (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { tutorId } = req.params;

  db.all(
    `SELECT * FROM tutor_availability WHERE tutor_id = ? ORDER BY day_of_week, start_time`,
    [tutorId],
    (err, slots) => {
      db.close();
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch availability' });
      }
      res.json(slots);
    }
  );
});

// Add new availability slot
router.post('/', authenticateToken, isTutor, async (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { day_of_week, start_time, end_time, topics } = req.body;
  const tutorId = req.user.userId;

  // Validate time format and range
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    return res.status(400).json({ error: 'Invalid time format. Use HH:MM format' });
  }

  // Validate day of week
  if (day_of_week < 0 || day_of_week > 6) {
    return res.status(400).json({ error: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' });
  }

  // Check for overlapping slots
  db.get(
    `SELECT * FROM tutor_availability 
     WHERE tutor_id = ? AND day_of_week = ? 
     AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
    [tutorId, day_of_week, start_time, start_time, end_time, end_time],
    (err, overlap) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to check for overlapping slots' });
      }

      if (overlap) {
        db.close();
        return res.status(400).json({ error: 'Time slot overlaps with existing availability' });
      }

      // Insert new availability slot
      db.run(
        `INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, topics) 
         VALUES (?, ?, ?, ?, ?)`,
        [tutorId, day_of_week, start_time, end_time, topics],
        function(err) {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Failed to add availability' });
          }

          db.get(
            'SELECT * FROM tutor_availability WHERE id = ?',
            [this.lastID],
            (err, slot) => {
              db.close();
              if (err) {
                return res.status(500).json({ error: 'Failed to fetch created availability' });
              }
              res.status(201).json(slot);
            }
          );
        }
      );
    }
  );
});

// Update availability slot
router.put('/:slotId', authenticateToken, isTutor, async (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { slotId } = req.params;
  const { day_of_week, start_time, end_time, topics } = req.body;
  const tutorId = req.user.userId;

  // Validate time format and range
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    return res.status(400).json({ error: 'Invalid time format. Use HH:MM format' });
  }

  // Validate day of week
  if (day_of_week < 0 || day_of_week > 6) {
    return res.status(400).json({ error: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' });
  }

  // Check if slot belongs to tutor
  db.get(
    'SELECT * FROM tutor_availability WHERE id = ? AND tutor_id = ?',
    [slotId, tutorId],
    (err, slot) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to verify slot ownership' });
      }

      if (!slot) {
        db.close();
        return res.status(404).json({ error: 'Slot not found or unauthorized' });
      }

      // Check for overlapping slots (excluding current slot)
      db.get(
        `SELECT * FROM tutor_availability 
         WHERE tutor_id = ? AND day_of_week = ? AND id != ?
         AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
        [tutorId, day_of_week, slotId, start_time, start_time, end_time, end_time],
        (err, overlap) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Failed to check for overlapping slots' });
          }

          if (overlap) {
            db.close();
            return res.status(400).json({ error: 'Time slot overlaps with existing availability' });
          }

          // Update slot
          db.run(
            `UPDATE tutor_availability 
             SET day_of_week = ?, start_time = ?, end_time = ?, topics = ?
             WHERE id = ? AND tutor_id = ?`,
            [day_of_week, start_time, end_time, topics, slotId, tutorId],
            (err) => {
              if (err) {
                db.close();
                return res.status(500).json({ error: 'Failed to update availability' });
              }

              db.get(
                'SELECT * FROM tutor_availability WHERE id = ?',
                [slotId],
                (err, updatedSlot) => {
                  db.close();
                  if (err) {
                    return res.status(500).json({ error: 'Failed to fetch updated availability' });
                  }
                  res.json(updatedSlot);
                }
              );
            }
          );
        }
      );
    }
  );
});

// Delete availability slot
router.delete('/:slotId', authenticateToken, isTutor, async (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { slotId } = req.params;
  const tutorId = req.user.userId;

  // Check if slot belongs to tutor
  db.get(
    'SELECT * FROM tutor_availability WHERE id = ? AND tutor_id = ?',
    [slotId, tutorId],
    (err, slot) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to verify slot ownership' });
      }

      if (!slot) {
        db.close();
        return res.status(404).json({ error: 'Slot not found or unauthorized' });
      }

      // Delete slot
      db.run(
        'DELETE FROM tutor_availability WHERE id = ? AND tutor_id = ?',
        [slotId, tutorId],
        (err) => {
          db.close();
          if (err) {
            return res.status(500).json({ error: 'Failed to delete availability' });
          }
          res.json({ message: 'Availability slot deleted successfully' });
        }
      );
    }
  );
});

// Get available slots for a specific day
router.get('/day/:tutorId/:date', async (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { tutorId, date } = req.params;
  const { duration } = req.query; // 20 or 40 minutes

  // Convert date to day of week (0-6) - use explicit time to avoid timezone issues
  const dayOfWeek = new Date(date + 'T00:00:00').getDay();

  // First, get all availability slots for this tutor on this day of the week
  db.all(
    `SELECT ta.* FROM tutor_availability ta
     WHERE ta.tutor_id = ? AND ta.day_of_week = ?
     ORDER BY ta.start_time`,
    [tutorId, dayOfWeek],
    (err, allSlots) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to fetch availability slots' });
      }

      if (allSlots.length === 0) {
        db.close();
        return res.json([]);
      }

      // Now get all booked sessions for this tutor on this specific date
      db.all(
        `SELECT s.session_date, s.duration_minutes FROM sessions s
         WHERE s.tutor_id = ? AND DATE(s.session_date) = DATE(?)
         AND s.status != 'cancelled'`,
        [tutorId, date],
        (err, bookedSessions) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Failed to fetch booked sessions' });
          }

          // Generate available time slots based on availability and duration
          const availableTimeSlots = [];
          
          allSlots.forEach(slot => {
            const slotStart = new Date(`${date}T${slot.start_time}:00`);
            const slotEnd = new Date(`${date}T${slot.end_time}:00`);
            
            // Generate slots based on duration
            const durationMinutes = parseInt(duration) || 20; // default to 20 minutes
            const slotDuration = durationMinutes * 60000; // convert to milliseconds
            
            let currentTime = new Date(slotStart);
            
            while (currentTime.getTime() + slotDuration <= slotEnd.getTime()) {
              const sessionEnd = new Date(currentTime.getTime() + slotDuration);
              
              // Check if this time slot conflicts with any booked sessions
              const hasConflict = bookedSessions.some(booking => {
                const bookingStart = new Date(booking.session_date);
                const bookingDuration = (booking.duration_minutes || 20) * 60000;
                const bookingEnd = new Date(bookingStart.getTime() + bookingDuration);
                
                // Check for overlap
                return (currentTime < bookingEnd && sessionEnd > bookingStart);
              });
              
              if (!hasConflict) {
                availableTimeSlots.push({
                  id: `${slot.id}_${currentTime.getTime()}`,
                  start_time: currentTime.toTimeString().slice(0, 5),
                  end_time: sessionEnd.toTimeString().slice(0, 5),
                  duration_minutes: durationMinutes,
                  topics: slot.topics
                });
              }
              
              // Move to next slot (with 10-minute gap for 20-min sessions, no gap for 40-min sessions)
              const gap = durationMinutes === 20 ? 10 : 0;
              currentTime = new Date(currentTime.getTime() + slotDuration + (gap * 60000));
            }
          });

          db.close();
          res.json(availableTimeSlots);
        }
      );
    }
  );
});

module.exports = router;

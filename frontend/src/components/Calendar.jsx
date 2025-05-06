import React, { useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: null,
    end: null,
  });

  const handleSelectSlot = ({ start, end }) => {
    setSelectedDate({ start, end });
    setShowModal(true);
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.start && newEvent.end) {
      setEvents([...events, newEvent]);
      setNewEvent({
        title: '',
        description: '',
        start: null,
        end: null,
      });
      setShowModal(false);
    }
  };

  return (
    <div className="calendar-container" style={{ height: '80vh', padding: '20px' }}>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        selectable
        onSelectSlot={handleSelectSlot}
        views={['month', 'week', 'day']}
      />

      {showModal && (
        <div className="modal" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}>
          <h2>Add Event</h2>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <textarea
              placeholder="Event Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <div style={{ marginBottom: '10px' }}>
              <label>Start: </label>
              <input
                type="datetime-local"
                onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>End: </label>
              <input
                type="datetime-local"
                onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleAddEvent}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Add Event
            </button>
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar; 
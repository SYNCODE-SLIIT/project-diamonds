import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const EventCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({
    '2024-03-25': [{ id: 1, title: 'Team Meeting', time: '10:00 AM' }],
    '2024-03-28': [{ id: 2, title: 'Project Deadline', time: 'All Day' }],
  });
  const [newEvent, setNewEvent] = useState({ date: '', title: '', time: '' });

  // Month navigation helpers
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Days to fill the calendar grid
    const days = [];
    
    // Pad with previous month's days
    const startingDay = firstDay.getDay();
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDay = new Date(year, month, day);
      days.push(currentDay);
    }
    
    return days;
  };

  // Format date for consistent key and display
  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Check if a date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Add new event
  const handleAddEvent = () => {
    if (newEvent.date && newEvent.title) {
      setEvents(prev => ({
        ...prev,
        [newEvent.date]: [...(prev[newEvent.date] || []), 
          { 
            id: Date.now(), 
            title: newEvent.title, 
            time: newEvent.time || 'All Day' 
          }
        ]
      }));
      // Reset form
      setNewEvent({ date: '', title: '', time: '' });
    }
  };

  // Calendar days
  const calendarDays = generateCalendarDays();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={goToPreviousMonth} 
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button 
          onClick={goToNextMonth} 
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 text-center mb-6">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="font-semibold text-gray-600">{day}</div>
        ))}
        {calendarDays.map((day, index) => (
          <div 
            key={day ? day.toISOString() : `empty-${index}`}
            className={`p-2 border rounded-lg min-h-[100px] relative 
              ${day ? (isToday(day) ? 'bg-blue-100' : 'bg-white') : 'bg-gray-50 text-gray-400'}
            `}
          >
            {day && (
              <>
                <div className="font-semibold">
                  {day.getDate()}
                </div>
                {events[formatDate(day)]?.map(event => (
                  <div 
                    key={event.id} 
                    className="mt-1 p-1 bg-blue-50 text-blue-800 text-xs rounded"
                  >
                    {event.title} - {event.time}
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Event Addition Form */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Add New Event</h3>
        <div className="grid grid-cols-3 gap-4">
          <input 
            type="date" 
            value={newEvent.date}
            onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
            className="border p-2 rounded"
          />
          <input 
            type="text" 
            placeholder="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
            className="border p-2 rounded"
          />
          <input 
            type="time" 
            value={newEvent.time}
            onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
            className="border p-2 rounded"
          />
        </div>
        <button 
          onClick={handleAddEvent}
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add Event
        </button>
      </div>
    </div>
  );
};

export default EventCalendar;
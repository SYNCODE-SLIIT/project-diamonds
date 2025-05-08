import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  RefreshCw
} from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [practiceSessions, setPracticeSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [eventsRes, sessionsRes] = await Promise.all([
        axios.get('http://localhost:4000/api/events/approved'),
        axios.get('http://localhost:4000/api/practices')
      ]);

      setEvents(eventsRes.data);
      setPracticeSessions(sessionsRes.data);
    } catch (error) {
      console.error('Error fetching calendar data', error);
      setError('Failed to load calendar information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getEventsForDate = (dateObj) => {
    // Convert the input date to start of day in local timezone
    const localDate = new Date(dateObj);
    localDate.setHours(0, 0, 0, 0);
    
    // Convert to ISO string and get the date part
    const dateStr = localDate.toISOString().split('T')[0];

    return {
      events: events.filter(ev => {
        if (!ev.eventDate) return false;
        // Convert event date to start of day in local timezone
        const eventDate = new Date(ev.eventDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.toISOString().split('T')[0] === dateStr;
      }),
      practices: practiceSessions.filter(practice => {
        if (!practice.practiceDate) return false;
        // Convert practice date to start of day in local timezone
        const practiceDate = new Date(practice.practiceDate);
        practiceDate.setHours(0, 0, 0, 0);
        return practiceDate.toISOString().split('T')[0] === dateStr;
      })
    };
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const { events: dayEvents, practices: dayPractices } = getEventsForDate(date);
    return (
      <div className="event-indicators">
        {dayEvents.length > 0 && <span className="event-dot" />}
        {dayPractices.length > 0 && <span className="practice-dot" />}
      </div>
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const { events: dayEvents, practices: dayPractices } = getEventsForDate(date);
      if (dayEvents.length > 0 || dayPractices.length > 0) {
        return 'has-event-practice';
      }
    }
    return null;
  };

  const renderEventList = (title, items, Icon, bgColor) => {
    const isEventList = title === 'Upcoming Events';
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className={`${bgColor} text-white p-4 flex items-center`}>
          <Icon className="mr-3" size={24} />
          <h4 className="text-xl font-semibold">{title}</h4>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center p-6">
            <RefreshCw className="animate-spin text-blue-500" size={32} />
          </div>
        ) : error ? (
          <div className="p-4 text-red-600 text-center">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">No {title.toLowerCase()} found</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map(item => {
              const name = isEventList ? item.eventName : item.practiceName;
              const rawDate = isEventList ? item.eventDate : item.practiceDate;
              // Format date in local timezone
              const dateText = rawDate ? new Date(rawDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A';
              
              const timeText = isEventList 
                ? (typeof item.eventTime === 'object' && item.eventTime 
                    ? `${new Date(item.eventTime.startDate).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - ${new Date(item.eventTime.endDate).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}`
                    : item.eventTime)
                : item.practiceTime;
              const location = isEventList ? item.eventLocation : item.practiceLocation;
              const count = isEventList ? item.guestCount : item.maxParticipants;
              return (
                <li key={item._id} className="p-4 hover:bg-gray-50 transition-colors duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-lg font-medium text-gray-800">{name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      <span>{dateText}</span>
                    </div>
                    {timeText && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-5 w-5 mr-2" />
                        <span>{timeText}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{location}</span>
                    </div>
                    {count != null && (
                      <div className="flex items-center text-gray-600">
                        <Users className="h-5 w-5 mr-2" />
                        <span>{isEventList ? `Guests: ${count}` : `Max Participants: ${count}`}</span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center mb-8">
          <CalendarIcon className="mr-3 text-blue-600" size={36} />
          <h2 className="text-3xl font-bold text-gray-800">Calendar Overview</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {renderEventList('Upcoming Events', events, CalendarIcon, 'bg-blue-500')}
          {renderEventList('Practice Sessions', practiceSessions, Clock, 'bg-green-500')}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Monthly Overview</h3>
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-6">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
              <span className="text-sm text-gray-600">Events</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <span className="text-sm text-gray-600">Practices</span>
            </div>
          </div>
          <div className="calendar-container">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              tileClassName={tileClassName}
              className="w-full border-0"
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={fetchData}
            disabled={isLoading}
            className={`
              flex items-center justify-center mx-auto px-4 py-2 rounded-md 
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            <RefreshCw className="mr-2" size={16} />
            {isLoading ? 'Refreshing...' : 'Refresh Calendar'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .has-event-practice {
          font-weight: 600;
        }
        .calendar-container {
          width: 100%;
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .calendar-container .react-calendar {
          width: 100%;
          border: none;
          background: white;
          font-family: 'Inter', sans-serif;
        }
        .calendar-container .react-calendar__navigation {
          margin-bottom: 1rem;
        }
        .calendar-container .react-calendar__navigation button {
          background: white;
          color: #1f2937;
          font-weight: 600;
          font-size: 1.1rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }
        .calendar-container .react-calendar__navigation button:enabled:hover,
        .calendar-container .react-calendar__navigation button:enabled:focus {
          background: #f3f4f6;
          transform: translateY(-1px);
        }
        .calendar-container .react-calendar__month-view__weekdays {
          background: #f9fafb;
          padding: 0.75rem 0;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .calendar-container .react-calendar__month-view__weekdays__weekday {
          font-weight: 600;
          color: #4b5563;
          text-transform: uppercase;
          font-size: 0.875rem;
        }
        .calendar-container .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }
        .calendar-container .react-calendar__tile {
          padding: 1rem 0.5rem;
          background: white;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          position: relative;
          height: 3.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .calendar-container .react-calendar__tile:enabled:hover,
        .calendar-container .react-calendar__tile:enabled:focus {
          background: #f3f4f6;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .calendar-container .react-calendar__tile--now {
          background: #e5e7eb;
          font-weight: 600;
          color: #1f2937;
        }
        .calendar-container .react-calendar__tile--active {
          background: #3b82f6 !important;
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
        }
        .calendar-container .react-calendar__tile--active:enabled:hover,
        .calendar-container .react-calendar__tile--active:enabled:focus {
          background: #2563eb !important;
        }
        .calendar-container .react-calendar__month-view__days__day--neighboringMonth {
          color: #9ca3af;
        }
        .calendar-container .react-calendar__tile abbr {
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
        .calendar-container .react-calendar__tile .event-indicators {
          display: flex;
          gap: 0.25rem;
          margin-top: 0.25rem;
        }
        .calendar-container .react-calendar__tile .event-indicators span {
          width: 0.375rem;
          height: 0.375rem;
          border-radius: 50%;
        }
        .calendar-container .react-calendar__tile .event-indicators .event-dot {
          background: #3b82f6;
        }
        .calendar-container .react-calendar__tile .event-indicators .practice-dot {
          background: #10b981;
        }
      `}</style>
    </div>
  );
};

export default CalendarView;
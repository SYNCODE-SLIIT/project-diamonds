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
    const dateStr = dateObj.toISOString().split('T')[0];
    return {
      events: events.filter(ev =>
        ev.eventDate && new Date(ev.eventDate).toISOString().split('T')[0] === dateStr
      ),
      practices: practiceSessions.filter(practice => 
        practice.practiceDate && new Date(practice.practiceDate).toISOString().split('T')[0] === dateStr
      )
    };
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const { events: dayEvents, practices: dayPractices } = getEventsForDate(date);
    return (
      <div className="flex flex-col items-center">
        {dayEvents.length > 0 && <span className="w-2 h-2 bg-blue-500 rounded-full mb-1" />}
        {dayPractices.length > 0 && <span className="w-2 h-2 bg-green-500 rounded-full" />}
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
              const dateText = rawDate ? new Date(rawDate).toLocaleDateString() : 'N/A';
              const timeText = isEventList ? item.eventTime : item.practiceTime;
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
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
            className="w-full"
          />
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
      `}</style>
    </div>
  );
};

export default CalendarView;
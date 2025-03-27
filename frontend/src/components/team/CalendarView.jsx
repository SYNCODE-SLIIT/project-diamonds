import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  RefreshCw 
} from 'lucide-react';

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [practiceSessions, setPracticeSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [eventsRes, sessionsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/events'),
        axios.get('http://localhost:5000/api/admin/practice-sessions')
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

  const renderEventList = (title, items, Icon, colorClass) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className={`${colorClass} text-white p-4 flex items-center`}>
        <Icon className="mr-3" size={24} />
        <h4 className="text-xl font-semibold">{title}</h4>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center p-6">
          <RefreshCw className="animate-spin text-blue-500" size={32} />
        </div>
      ) : error ? (
        <div className="p-4 text-red-600 text-center">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="p-4 text-gray-500 text-center">
          No {title.toLowerCase()} found
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.map(item => (
            <li 
              key={item._id} 
              className="p-4 hover:bg-gray-50 transition-colors duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-grow">
                  <div className="flex items-center mb-1">
                    <Clock className="mr-2 text-gray-500" size={16} />
                    <span className="font-medium text-gray-800">
                      {new Date(item.eventDate || item.sessionDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 text-gray-500" size={16} />
                    <span className="text-gray-600">
                      {item.eventLocation || item.location}
                    </span>
                  </div>
                  {item.eventName && (
                    <div className="flex items-center mt-1">
                      <Users className="mr-2 text-gray-500" size={16} />
                      <span className="text-gray-600">
                        {item.eventName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center mb-8">
          <CalendarIcon className="mr-3 text-blue-600" size={36} />
          <h2 className="text-3xl font-bold text-gray-800">Calendar Overview</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {renderEventList(
              'Upcoming Events', 
              events, 
              CalendarIcon, 
              'bg-blue-500'
            )}
          </div>
          <div>
            {renderEventList(
              'Practice Sessions', 
              practiceSessions, 
              Clock, 
              'bg-green-500'
            )}
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
    </div>
  );
};

export default CalendarView;
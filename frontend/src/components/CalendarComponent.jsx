import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { fetchEvents, addEvent, deleteEvent } from "../services/calendarApi";

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      const fetchedEvents = await fetchEvents();
      setEvents(
        fetchedEvents.map(event => ({
          id: event._id,
          title: event.title,
          start: event.date,
          extendedProps: { description: event.description }
        }))
      );
    };
    loadEvents();
  }, []);

  const handleEventClick = async (clickInfo) => {
    if (window.confirm(`Delete event: ${clickInfo.event.title}?`)) {
      await deleteEvent(clickInfo.event.id);
      setEvents(events.filter(event => event.id !== clickInfo.event.id));
    }
  };

  const handleDateClick = async (info) => {
    const title = prompt("Enter event title:");
    const description = prompt("Enter event description:");
    const time = prompt("Enter event time:");
    const location = prompt("Enter event location:");
    const eventType = prompt("Enter event type:");

    if (title && description && time && location && eventType) {
      const newEvent = {
        title,
        description,
        date: info.dateStr,
        time,
        location,
        eventType,
        createdBy: "teamManagerId",
        teamMembers: ["teamMemberId1", "teamMemberId2"]
      };
      
      const response = await addEvent(newEvent);
      setEvents([...events, { id: response.event._id, title, start: info.dateStr }]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Team Calendar</h2>
      <div className="flex justify-end mb-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Add Event
        </button>
      </div>
      <div className="border border-gray-200 rounded-lg p-4 shadow-md bg-gray-50">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>
    </div>
  );
};

export default CalendarComponent;

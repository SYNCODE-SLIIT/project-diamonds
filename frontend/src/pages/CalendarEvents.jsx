import React from "react";
import CalendarComponent from "../components/CalendarComponent";

const CalendarEvents = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-700 mb-6">Team Events</h1>
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6">
        <CalendarComponent />
      </div>
    </div>
  );
};

export default CalendarEvents;

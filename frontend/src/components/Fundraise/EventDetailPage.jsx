import React, { useState } from "react";
import { useParams } from "react-router-dom";
import TicketPaymentForm from "../Tickets/TicketPaymentForm"; // Changed import

// You can import this from FundraisePage or define it here for now
const FUNDRAISING_EVENTS = [
  {
    id: 1,
    slug: "annual-gala-fundraiser",
    title: "Annual Gala Fundraiser",
    date: "July 20, 2024",
    location: "Grand Ballroom, Colombo",
    description: "Join us for an inspiring evening of performances, dinner, and giving to support Team Diamonds' mission.",
    imageUrl: "https://images.unsplash.com/photo-1545959570-a94084071b5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: true,
  },
  {
    id: 2,
    slug: "community-dance-a-thon",
    title: "Community Dance-a-thon",
    date: "August 15, 2024",
    location: "City Park",
    description: "Dance for a cause! Bring your friends and family to raise funds for our youth programs.",
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
  {
    id: 3,
    slug: "online-giving-day",
    title: "Online Giving Day",
    date: "September 10, 2024",
    location: "Online",
    description: "Support Team Diamonds from anywhere! Donate online and help us reach our goal in 24 hours.",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
];

const EventDetailPage = () => {
  const { eventSlug } = useParams();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const event = FUNDRAISING_EVENTS.find(e => e.slug === eventSlug);

  if (!event) return <div className="min-h-screen flex items-center justify-center text-2xl">Event not found</div>;

  // Example ticket data for demo
  const eventTicket = {
    price: 10000, // Individual ticket price in LKR
    name: "Individual Ticket"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center">
      <div className="w-full bg-purple-800 text-white py-12 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
        <p className="text-lg max-w-2xl mx-auto">
          {event.description}
        </p>
      </div>
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-8 mt-8 mb-12">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-64 object-cover rounded-xl mb-6"
        />
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-purple-800 mb-2">Event Details</h2>
          <ul className="text-gray-700 text-lg">
            <li><strong>Date:</strong> {event.date}</li>
            <li><strong>Location:</strong> {event.location}</li>
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-bold text-purple-700 mb-2">Tickets</h2>
          <ul className="text-gray-700">
            <li>Individual Ticket: <strong>LKR 10,000</strong></li>
            <li>Table of 10: <strong>LKR 90,000</strong></li>
          </ul>
          <p className="text-gray-600 mt-2">
            For sponsorship or group bookings, please contact <a href="mailto:info@teamdiamonds.org" className="text-purple-700 underline">info@teamdiamonds.org</a>
          </p>
        </div>
        <div className="flex flex-col items-center">
          <button
            onClick={() => setIsPaymentOpen(true)}
            className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 rounded font-bold text-lg shadow mb-4"
          >
            Buy Ticket
          </button>
          <a
            href="/fundraising"
            className="text-purple-700 underline"
          >
            Back to Events
          </a>
        </div>
      </div>
      {isPaymentOpen && (
        <TicketPaymentForm 
          ticket={eventTicket}
          onClose={() => setIsPaymentOpen(false)}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
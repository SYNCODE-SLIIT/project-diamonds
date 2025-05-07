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
  {
    id: 4,
    slug: "charity-fashion-show",
    title: "Charity Fashion Show",
    date: "October 5, 2024",
    location: "Lotus Ballroom, Hilton",
    description: "Experience glamour and giving at our annual fashion show, featuring top designers and performers.",
    imageUrl: "https://images.unsplash.com/photo-1464983953574-0892a716854b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
  {
    id: 5,
    slug: "youth-talent-night",
    title: "Youth Talent Night",
    date: "November 12, 2024",
    location: "Youth Center Auditorium",
    description: "Celebrate the next generation! A showcase of young talent in music, dance, and art.",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
  {
    id: 6,
    slug: "holiday-benefit-concert",
    title: "Holiday Benefit Concert",
    date: "December 18, 2024",
    location: "Majestic Theatre",
    description: "Ring in the holidays with a night of music, joy, and giving back to the community.",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
    price: 1000, // Individual ticket price in LKR
    name: "Individual Ticket"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f3e8ff] to-[#f0fdfa] flex flex-col items-center relative">
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] flex items-center justify-center overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover object-center z-0 scale-105 brightness-80"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a174e]/90 via-[#133b5c]/70 to-[#f4d160]/40 z-10" />
        <div className="relative z-20 flex flex-col items-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4 animate-fade-in-up">{event.title}</h1>
          <p className="text-lg md:text-2xl text-white/90 max-w-2xl mb-6 animate-fade-in-up delay-100">
            {event.description}
          </p>
        </div>
      </section>

      {/* Event Details Card */}
      <section className="w-full flex justify-center z-30 animate-fade-in-up" style={{ marginTop: '4rem' }}>
        <div className="max-w-3xl w-full bg-white/95 rounded-3xl shadow-2xl p-10 mt-0 mb-12 relative border-2 border-[#f4d160] hover:shadow-[#f4d160]/40 transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 flex flex-col items-center justify-center">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-64 object-cover rounded-2xl shadow-lg border-4 border-white mb-6"
              />
              <div className="flex gap-4 mb-4">
                <span className="inline-block bg-[#f4d160]/20 text-[#0a174e] px-4 py-2 rounded-full font-semibold text-base shadow">{event.date}</span>
                <span className="inline-block bg-[#133b5c]/10 text-[#133b5c] px-4 py-2 rounded-full font-semibold text-base shadow">{event.location}</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0a174e] mb-4">Event Details</h2>
              <ul className="text-[#133b5c] text-lg mb-6 space-y-2">
                <li><strong>Date:</strong> {event.date}</li>
                <li><strong>Location:</strong> {event.location}</li>
              </ul>
              <h2 className="text-xl font-bold text-[#f4d160] mb-2">Tickets</h2>
              <ul className="text-[#133b5c] mb-2">
                <li>Individual Ticket: <strong>LKR 1000</strong></li>
              </ul>
              <p className="text-[#0a174e] mt-2 mb-6">
                For sponsorship or group bookings, please contact <a href="mailto:info@teamdiamonds.org" className="text-[#f4d160] underline">info@teamdiamonds.org</a>
              </p>
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => setIsPaymentOpen(true)}
                  className="bg-gradient-to-r from-[#0a174e] to-[#f4d160] hover:from-[#133b5c] hover:to-[#f4d160]/80 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-200 animate-fade-in-up"
                >
                  Buy Ticket
                </button>
                <a
                  href="/fundraising"
                  className="text-[#0a174e] underline text-base hover:text-[#f4d160] transition-colors"
                >
                  Back to Events
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
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
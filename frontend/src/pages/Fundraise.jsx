import React, { useState } from "react";

// Sample fundraising events data
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
  // Add more events as needed
];

const FundraisePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(FUNDRAISING_EVENTS);

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = FUNDRAISING_EVENTS.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEvents(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      {/* Hero Section */}
      <div className="relative bg-purple-800 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Fundraising Events</h1>
        <p className="text-lg max-w-2xl mx-auto">
          Join Team Diamonds at our upcoming fundraising events! Your participation and support help us continue our mission and make a difference in the community.
        </p>
      </div>

      {/* Search/Filter Bar */}
      <div className="bg-white shadow py-6 px-4 flex justify-center">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
          <input
            type="text"
            placeholder="Search events..."
            className="pl-4 pr-4 py-2 w-full border rounded"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded font-semibold"
          >
            Search
          </button>
        </form>
      </div>

      {/* Events Section */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-purple-800 mb-2">Upcoming Events</h2>
          <p className="text-lg text-gray-600 mb-8">Be a part of our journey and help us reach new heights!</p>
          {filteredEvents.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map(event => (
                <div key={event.id} className={`rounded-xl shadow-lg bg-white overflow-hidden flex flex-col ${event.featured ? "border-2 border-purple-700" : ""}`}>
                  <img src={event.imageUrl} alt={event.title} className="h-48 w-full object-cover" />
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 text-purple-700">{event.title}</h3>
                    <div className="text-sm text-gray-500 mb-1">{event.date} | {event.location}</div>
                    <p className="text-gray-700 mb-4 flex-1">{event.description}</p>
                    <a
                      href={event.location === "Online" ? "/donate" : `/events/${event.slug}`}
                      className="inline-block mt-auto bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded font-semibold text-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {event.location === "Online" ? "Donate Now" : "Get Tickets"}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-500">No events found</h3>
              <p className="mt-2 text-gray-400">Try adjusting your search criteria</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilteredEvents(FUNDRAISING_EVENTS);
                }}
                className="mt-4 px-4 py-2 border border-purple-700 text-purple-700 rounded hover:bg-purple-50"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-purple-800 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Support Team Diamonds</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Your contribution helps us continue our mission. Join an event, donate, or start your own fundraiser today!
          </p>
          <a
            href="/donate"
            className="inline-block bg-white text-purple-800 font-bold px-8 py-3 rounded shadow hover:bg-purple-100"
          >
            Donate Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default FundraisePage;
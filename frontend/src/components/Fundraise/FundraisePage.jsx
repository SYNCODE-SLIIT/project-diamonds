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
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f3e8ff] to-[#f0fdfa] relative">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1545959570-a94084071b5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Fundraising Hero"
          className="absolute inset-0 w-full h-full object-cover object-center z-0 scale-105 brightness-80"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a174e]/90 via-[#133b5c]/70 to-[#f4d160]/40 z-10" />
        <div className="relative z-20 flex flex-col items-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4 animate-fade-in-up">Fundraising Events</h1>
          <p className="text-lg md:text-2xl text-white/90 max-w-2xl mb-6 animate-fade-in-up delay-100">
            Join Team Diamonds at our upcoming fundraising events! Your participation and support help us continue our mission and make a difference in the community.
          </p>
        </div>
      </section>

      {/* Search/Filter Bar */}
      <div className="relative z-30 flex justify-center w-full" style={{ marginTop: '2.5rem' }}>
        <div className="bg-white/90 shadow-2xl py-6 px-4 rounded-2xl mx-auto max-w-3xl w-full border border-[#f4d160]" style={{ marginTop: '2.5rem' }}>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search events..."
              className="pl-4 pr-4 py-2 w-full border rounded-lg shadow focus:ring-2 focus:ring-[#f4d160] focus:outline-none text-lg"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#0a174e] to-[#f4d160] hover:from-[#133b5c] hover:to-[#f4d160]/80 text-white px-8 py-2 rounded-lg font-bold shadow transition-all duration-200"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Events Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0a174e] mb-2 text-center">Upcoming Events</h2>
          <p className="text-lg text-[#133b5c] mb-12 text-center">Be a part of our journey and help us reach new heights!</p>
          {filteredEvents.length > 0 ? (
            <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map(event => (
                <div
                  key={event.id}
                  className={`group rounded-3xl shadow-2xl bg-white/95 overflow-hidden flex flex-col border-2 transition-all duration-300 hover:scale-105 hover:shadow-[#f4d160]/40 hover:border-[#f4d160] ${event.featured ? "border-[#f4d160] shadow-[#f4d160]/30" : "border-gray-200"}`}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {event.featured && (
                      <span className="absolute top-4 left-4 bg-gradient-to-r from-[#f4d160] to-[#0a174e] text-[#0a174e] px-4 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">Featured</span>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold mb-2 text-[#133b5c] group-hover:text-[#0a174e] transition-colors">{event.title}</h3>
                    <div className="text-sm text-[#0a174e] mb-1 flex items-center gap-2">
                      <span className="inline-block bg-[#f4d160]/20 text-[#0a174e] px-3 py-1 rounded-full font-semibold mr-2">{event.date}</span>
                      <span className="inline-block bg-[#133b5c]/10 text-[#133b5c] px-3 py-1 rounded-full font-semibold">{event.location}</span>
                    </div>
                    <p className="text-[#133b5c] mb-4 flex-1 mt-2">{event.description}</p>
                    <a
                      href={`/events/${event.slug}`}
                      className="inline-block mt-auto bg-gradient-to-r from-[#0a174e] to-[#f4d160] hover:from-[#133b5c] hover:to-[#f4d160]/80 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 group-hover:scale-105"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get Tickets
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-[#133b5c]">No events found</h3>
              <p className="mt-2 text-[#0a174e]/70">Try adjusting your search criteria</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilteredEvents(FUNDRAISING_EVENTS);
                }}
                className="mt-4 px-4 py-2 border border-[#f4d160] text-[#0a174e] rounded hover:bg-[#f4d160]/10"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-[#0a174e] via-[#133b5c] to-[#f4d160] text-white py-20 animate-fade-in-up">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Support Team Diamonds</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Your contribution helps us continue our mission. Join an event, donate, or start your own fundraiser today!
          </p>
          <a
            href="/donate"
            className="inline-block bg-white text-[#0a174e] font-bold px-10 py-4 rounded-2xl shadow-lg hover:bg-[#f4d160]/30 text-lg transition-all duration-200"
          >
            Donate Now
          </a>
        </div>
      </section>
    </div>
  );
};

export default FundraisePage;
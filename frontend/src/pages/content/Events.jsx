import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCloudUploadAlt } from "react-icons/fa";

const Events = () => {
  const [media, setMedia] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/media")
      .then((res) => res.json())
      .then((data) => setMedia(data))
      .catch((error) => console.error("Error fetching media:", error));
  }, []);

  const upcomingEvents = media.filter((item) => item.category === "upcoming");
  const previousEvents = media.filter((item) => item.category === "previous");
  const otherMedia = media.filter((item) => item.mediaType === "image" || item.mediaType === "video");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4 text-center">Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <div key={event._id} className="bg-gray-50 shadow-md rounded-lg overflow-hidden">
              <img src={`http://localhost:5000/${event.file}`} alt={event.mediaTitle} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-700">{event.mediaTitle}</h3>
                <p className="text-gray-600">{event.description}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-semibold text-gray-800 mt-8 mb-4 text-center">Previous Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {previousEvents.map((event) => (
            <div key={event._id} className="bg-gray-50 shadow-md rounded-lg overflow-hidden">
              <img src={`http://localhost:5000/${event.file}`} alt={event.mediaTitle} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-700">{event.mediaTitle}</h3>
                <p className="text-gray-600">{event.description}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-semibold text-gray-800 mt-8 mb-4 text-center">Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherMedia.map((item) => (
            <div key={item._id} className="bg-gray-50 shadow-md rounded-lg overflow-hidden p-4">
              {item.mediaType === "image" ? (
                <img src={`http://localhost:5000/${item.file}`} alt={item.mediaTitle} className="w-full h-48 object-cover rounded-lg" />
              ) : (
                <video width="100%" controls className="rounded-lg">
                  <source src={`http://localhost:5000/${item.file}`} type="video/mp4" />
                </video>
              )}
              <h3 className="text-xl font-bold text-gray-700 mt-2">{item.mediaTitle}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Link to="/upload" className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition duration-200 flex items-center">
            <FaCloudUploadAlt className="mr-2" /> Upload Media
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Events;
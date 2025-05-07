import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

const AllMedia = () => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Search, filter, and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await axiosInstance.get("/api/media/viewmedia");
        setMediaList(response.data);
      } catch (err) {
        setError("Failed to fetch media.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this media?")) {
      try {
        await axiosInstance.delete(`/api/media/delete/${id}`);
        setMediaList(mediaList.filter((media) => media._id !== id));
      } catch (err) {
        console.error("Error deleting media:", err);
      }
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  // Build category list
  const categories = [
    "All",
    ...Array.from(new Set(mediaList.map((m) => m.category)))
  ];
  // Filter by search and category
  const filteredMedia = mediaList.filter((m) =>
    m.mediaTitle.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "All" || m.category === selectedCategory)
  );
  // Sort based on selected order
  const sortedMedia = [...filteredMedia].sort((a, b) => {
    if (sortOrder === "newest") return new Date(b.uploadDate) - new Date(a.uploadDate);
    if (sortOrder === "oldest") return new Date(a.uploadDate) - new Date(b.uploadDate);
    if (sortOrder === "titleAsc") return a.mediaTitle.localeCompare(b.mediaTitle);
    if (sortOrder === "titleDesc") return b.mediaTitle.localeCompare(a.mediaTitle);
    return 0;
  });

  return (
    <div className="container mx-auto p-6 relative">
      {/* Button at the top right corner */}
      <div className="flex justify-end mb-4">
        <Link
          to="/upload"
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Upload Media
        </Link>
      </div>
      {/* Search, Category Filter, and Sort Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <input
          type="text"
          placeholder="Search by title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded-lg focus:outline-none focus:ring"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded-lg focus:outline-none focus:ring"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded-lg focus:outline-none focus:ring"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="titleAsc">Title A-Z</option>
          <option value="titleDesc">Title Z-A</option>
        </select>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-center">Media Gallery</h1>
      {mediaList.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Latest Upload</h2>
          {mediaList[0].mediaType === "video" ? (
            <video controls preload="metadata" className="w-full h-48 object-cover mb-4">
              <source src={mediaList[0].file} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={mediaList[0].file}
              alt={mediaList[0].mediaTitle}
              className="w-full h-48 object-cover mb-4"
            />
          )}
        </div>
      )}
      {sortedMedia.length === 0 ? (
        <p className="text-center text-gray-600">No media found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sortedMedia.map((media) => (
            <div
              key={media._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105"
            >
              {media.mediaType === "video" ? (
                <video controls preload="metadata" className="w-full h-48 object-cover">
                  <source src={media.file} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={media.file}
                  alt={media.mediaTitle}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-bold">{media.mediaTitle}</h2>
                <p className="text-gray-600 text-sm mt-1">{media.description}</p>
                <p className="mt-2 text-sm">
                  <strong>Category:</strong> {media.category}
                </p>
                <p className="mt-1 text-sm">
                  <strong>Privacy:</strong> {media.privacy}
                </p>
                <p className="mt-1 text-sm">
                  <strong>Tags:</strong>{" "}
                  {Array.isArray(media.tags) ? media.tags.join(", ") : media.tags}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(media.uploadDate).toLocaleString()}
                </p>
                {/* Action Buttons */}
                <div className="mt-4 flex justify-between items-center">
                  <Link
                    to={`/media/edit/${media._id}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <FaEdit /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(media._id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllMedia;

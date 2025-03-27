import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

const AllMedia = () => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      
      <h1 className="text-3xl font-bold mb-6 text-center">Media Gallery</h1>
      {mediaList.length === 0 ? (
        <p className="text-center text-gray-600">No media found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mediaList.map((media) => (
            <div
              key={media._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105"
            >
              <img
                src={media.file}
                alt={media.mediaTitle}
                className="w-full h-48 object-cover"
              />
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

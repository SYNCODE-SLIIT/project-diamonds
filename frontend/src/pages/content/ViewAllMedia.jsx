import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash, FaPlay, FaEye, FaImage } from "react-icons/fa";
// Import all thumbnails
import y1 from "../../assets/thumbnail/y1.png";
import y2 from "../../assets/thumbnail/y2.png";
import y3 from "../../assets/thumbnail/y3.png";
import y4 from "../../assets/thumbnail/y4.png";
import y5 from "../../assets/thumbnail/y5.png";
import y7 from "../../assets/thumbnail/y7.png";
import y8 from "../../assets/thumbnail/y8.png";
import y10 from "../../assets/thumbnail/y10.png";
import y11 from "../../assets/thumbnail/y11.png";
import y12 from "../../assets/thumbnail/y12.png";
import y13 from "../../assets/thumbnail/y13.png";
import y14 from "../../assets/thumbnail/y14.png";
import y15 from "../../assets/thumbnail/y15.png";
import y16 from "../../assets/thumbnail/y16.png";

const AllMedia = () => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Search, filter, and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showCustomThumbnailModal, setShowCustomThumbnailModal] = useState(false);
  const [selectedMediaForThumbnail, setSelectedMediaForThumbnail] = useState(null);

  // Map of all available thumbnails
  const thumbnails = {
    y1, y2, y3, y4, y5, y7, y8, y10, y11, y12, y13, y14, y15, y16
  };

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

  const handleCreateCustomThumbnail = (media) => {
    setSelectedMediaForThumbnail(media);
    setShowCustomThumbnailModal(true);
  };

  const handleCustomThumbnailCreated = async (thumbnailUrl) => {
    try {
      await axiosInstance.put(`/api/media/update/${selectedMediaForThumbnail._id}`, {
        thumbnail: thumbnailUrl
      });
      // Refresh media list
      const response = await axiosInstance.get("/api/media/viewmedia");
      setMediaList(response.data);
      setShowCustomThumbnailModal(false);
      setSelectedMediaForThumbnail(null);
    } catch (err) {
      console.error("Error updating thumbnail:", err);
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
          <div className="relative pb-[56.25%] bg-black rounded-lg overflow-hidden">
            {mediaList[0].mediaType === "video" ? (
              <>
                <img
                  src={mediaList[0].thumbnail ? thumbnails[mediaList[0].thumbnail] : thumbnails.y1}
                  alt={mediaList[0].mediaTitle}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer"
                  onClick={() => setSelectedVideo(mediaList[0])}
                >
                  <FaPlay className="text-white text-4xl" />
                </div>
                <div className="absolute bottom-4 right-4 flex space-x-4">
                  <Link
                    to={`/media/view/${mediaList[0]._id}`}
                    className="bg-white bg-opacity-90 p-2 rounded-full text-green-600 hover:text-green-800"
                    title="View"
                  >
                    <FaEye className="text-xl" />
                  </Link>
                  <Link
                    to={`/media/edit/${mediaList[0]._id}`}
                    className="bg-white bg-opacity-90 p-2 rounded-full text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <FaEdit className="text-xl" />
                  </Link>
                  <button
                    onClick={() => handleCreateCustomThumbnail(mediaList[0])}
                    className="bg-white bg-opacity-90 p-2 rounded-full text-purple-600 hover:text-purple-800"
                    title="Custom Thumbnail"
                  >
                    <FaImage className="text-xl" />
                  </button>
                  <button
                    onClick={() => handleDelete(mediaList[0]._id)}
                    className="bg-white bg-opacity-90 p-2 rounded-full text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <FaTrash className="text-xl" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <img
                  src={mediaList[0].file}
                  alt={mediaList[0].mediaTitle}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-4 right-4 flex space-x-4">
                  <Link
                    to={`/media/view/${mediaList[0]._id}`}
                    className="bg-white bg-opacity-90 p-2 rounded-full text-green-600 hover:text-green-800"
                    title="View"
                  >
                    <FaEye className="text-xl" />
                  </Link>
                  <Link
                    to={`/media/edit/${mediaList[0]._id}`}
                    className="bg-white bg-opacity-90 p-2 rounded-full text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <FaEdit className="text-xl" />
                  </Link>
                  <button
                    onClick={() => handleDelete(mediaList[0]._id)}
                    className="bg-white bg-opacity-90 p-2 rounded-full text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <FaTrash className="text-xl" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {sortedMedia.length === 0 ? (
        <p className="text-center text-gray-600">No media found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedMedia.map((media) => (
            <div
              key={media._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105"
            >
              <div className="relative pb-[56.25%] group">
                {media.mediaType === "video" ? (
                  <>
                    <img
                      src={media.thumbnail ? thumbnails[media.thumbnail] : thumbnails.y1}
                      alt={media.mediaTitle}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => setSelectedVideo(media)}
                    >
                      <FaPlay className="text-white text-4xl" />
                    </div>
                  </>
                ) : (
                  <img
                    src={media.file}
                    alt={media.mediaTitle}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-bold truncate">{media.mediaTitle}</h2>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{media.description}</p>
                <p className="mt-2 text-sm">
                  <strong>Category:</strong> {media.category}
                </p>
                <p className="mt-1 text-sm">
                  <strong>Type:</strong> {media.mediaType}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(media.uploadDate).toLocaleString()}
                </p>
                {/* Action Buttons */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-4">
                    <Link
                      to={`/media/view/${media._id}`}
                      className="text-green-600 hover:text-green-800 text-xl"
                      title="View"
                    >
                      <FaEye />
                    </Link>
                    <Link
                      to={`/media/edit/${media._id}`}
                      className="text-blue-600 hover:text-blue-800 text-xl"
                      title="Edit"
                    >
                      <FaEdit />
                    </Link>
                    {media.mediaType === "video" && (
                      <button
                        onClick={() => handleCreateCustomThumbnail(media)}
                        className="text-purple-600 hover:text-purple-800 text-xl"
                        title="Custom Thumbnail"
                      >
                        <FaImage />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(media._id)}
                    className="text-red-600 hover:text-red-800 text-xl"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full">
            <div className="relative pb-[56.25%]">
              <video
                controls
                autoPlay
                className="absolute top-0 left-0 w-full h-full"
                src={selectedVideo.file}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <button
              onClick={() => setSelectedVideo(null)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Custom Thumbnail Modal */}
      {showCustomThumbnailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <h2 className="text-2xl font-bold mb-4">Create Custom Thumbnail</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Choose one of the following options to create a custom thumbnail:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="https://www.canva.com/create/thumbnails/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border rounded-lg hover:bg-gray-50 text-center"
                >
                  <img
                    src="https://static.canva.com/static/images/canva-logo.svg"
                    alt="Canva"
                    className="h-8 mx-auto mb-2"
                  />
                  <p className="font-medium">Create with Canva</p>
                  <p className="text-sm text-gray-500">Professional design tools</p>
                </a>
                <a
                  href="https://www.photopea.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border rounded-lg hover:bg-gray-50 text-center"
                >
                  <img
                    src="https://www.photopea.com/promo/icon512.png"
                    alt="Photopea"
                    className="h-8 mx-auto mb-2"
                  />
                  <p className="font-medium">Create with Photopea</p>
                  <p className="text-sm text-gray-500">Free online Photoshop alternative</p>
                </a>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">
                  After creating your thumbnail, upload it here:
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleCustomThumbnailCreated(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={() => setShowCustomThumbnailModal(false)}
              className="mt-6 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllMedia;

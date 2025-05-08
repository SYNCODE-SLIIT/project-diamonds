import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { FaCloudUploadAlt } from "react-icons/fa";
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

const EditMedia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState({
    mediaTitle: "",
    description: "",
    category: "",
    thumbnail: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVideo, setIsVideo] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Map of all available thumbnails
  const thumbnails = {
    y1, y2, y3, y4, y5, y7, y8, y10, y11, y12, y13, y14, y15, y16
  };

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await axiosInstance.get(`/api/media/view/${id}`);
        const data = response.data;
        setMedia({
          mediaTitle: data.mediaTitle,
          description: data.description,
          category: data.category,
          thumbnail: data.thumbnail || "",
        });
        setIsVideo(data.mediaType === "video");
        setLoading(false);
      } catch (err) {
        setError("Failed to load media data.");
        setLoading(false);
      }
    };
    fetchMedia();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedia((prevMedia) => ({ ...prevMedia, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setIsVideo(selectedFile.type.startsWith("video/"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("mediaTitle", media.mediaTitle);
      formData.append("description", media.description);
      formData.append("category", media.category);
      if (file) {
        formData.append("file", file);
      }
      if (isVideo && media.thumbnail) {
        formData.append("thumbnail", media.thumbnail);
      }

      await axiosInstance.put(`/api/media/update/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/admin/media");
    } catch (err) {
      console.error("Failed to update media:", err);
      setError("Failed to update media. Please try again.");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Media</h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="mediaTitle"
            value={media.mediaTitle}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg mt-1 focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={media.description}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg mt-1 focus:ring focus:ring-blue-300"
            rows="4"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            name="category"
            value={media.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg mt-1 focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Media File</label>
          <div className="border border-gray-300 p-3 rounded-lg flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100">
            <label className="flex flex-col items-center">
              <FaCloudUploadAlt className="text-gray-500 text-3xl mb-2" />
              <span className="text-gray-600">Choose a new file (optional)</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Preview selected media */}
        {previewUrl && (
          <div className="mb-4">
            {isVideo ? (
              <video
                controls
                src={previewUrl}
                preload="metadata"
                className="w-full h-48 object-contain rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-contain rounded-lg"
              />
            )}
          </div>
        )}

        {/* Thumbnail selection for videos */}
        {isVideo && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Video Thumbnail
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {Object.entries(thumbnails).map(([key, thumbnail]) => (
                <div
                  key={key}
                  className={`relative cursor-pointer border-2 rounded-lg overflow-hidden ${
                    media.thumbnail === key ? "border-blue-500" : "border-transparent"
                  }`}
                  onClick={() => setMedia({ ...media, thumbnail: key })}
                >
                  <img
                    src={thumbnail}
                    alt={`Thumbnail ${key}`}
                    className="w-full h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/media")}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMedia;

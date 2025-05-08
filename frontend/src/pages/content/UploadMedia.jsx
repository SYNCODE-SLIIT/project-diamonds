import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const UploadMedia = () => {
  const [formData, setFormData] = useState({
    mediaTitle: "",
    description: "",
    category: "",
    selectedThumbnail: "",
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const navigate = useNavigate();

  // Map of all available thumbnails
  const thumbnails = {
    y1, y2, y3, y4, y5, y7, y8, y10, y11, y12, y13, y14, y15, y16
  };

  const validateForm = () => {
    if (!formData.mediaTitle.trim()) {
      return "Title is required.";
    }
    if (!formData.description.trim()) {
      return "Description is required.";
    }
    if (!formData.category.trim()) {
      return "Category is required.";
    }
    if (isVideo && !formData.selectedThumbnail) {
      return "Please select a thumbnail for the video.";
    }
    return "";
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith("image/") || selectedFile.type.startsWith("video/")) {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setIsVideo(selectedFile.type.startsWith("video/"));
        setMessage("");
      } else {
        setFile(null);
        setMessage("Invalid file type. Please upload an image or video file.");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      setIsSubmitting(false);
      return;
    }

    if (!file) {
      setMessage("Please select a file.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("mediaTitle", formData.mediaTitle);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("file", file);
      if (isVideo) {
        data.append("thumbnail", formData.selectedThumbnail);
      }

      await axiosInstance.post("/api/media/createmedia", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/admin/media");
      setMessage("Media uploaded successfully!");
      setFormData({ mediaTitle: "", description: "", category: "", selectedThumbnail: "" });
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Error uploading media");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Upload Media</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="mediaTitle"
            placeholder="Title"
            onChange={handleChange}
            value={formData.mediaTitle}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          />
          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            value={formData.description}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          ></textarea>
          <input
            type="text"
            name="category"
            placeholder="Category"
            onChange={handleChange}
            value={formData.category}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          />
          <div className="border border-gray-300 p-3 rounded-lg flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100">
            <label className="flex flex-col items-center">
              <FaCloudUploadAlt className="text-gray-500 text-3xl mb-2" />
              <span className="text-gray-600">Choose an image or video file</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                required
                className="hidden"
              />
            </label>
          </div>

          {/* Preview selected media */}
          {previewUrl && (
            <div className="mt-4">
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
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Video Thumbnail
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                {Object.entries(thumbnails).map(([key, thumbnail]) => (
                  <div
                    key={key}
                    className={`relative cursor-pointer border-2 rounded-lg overflow-hidden ${
                      formData.selectedThumbnail === key ? "border-blue-500" : "border-transparent"
                    }`}
                    onClick={() => setFormData({ ...formData, selectedThumbnail: key })}
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            {isSubmitting ? "Uploading..." : "Upload"}
          </button>
          {message && <p className="text-center text-red-500 font-medium">{message}</p>}
        </form>
        <div className="mt-4">
          <button
            onClick={() => navigate("/admin/media")}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200"
          >
            Go to Media
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadMedia;

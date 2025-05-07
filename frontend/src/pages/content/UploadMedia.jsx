import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { FaCloudUploadAlt } from "react-icons/fa";

const UploadMedia = () => {
  const [formData, setFormData] = useState({
    mediaTitle: "",
    description: "",
    category: "",
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Basic form validation function
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
    return "";
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Allow only video files
      if (selectedFile.type.startsWith("video/")) {
        setFile(selectedFile);
        // generate preview URL
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setMessage("");
      } else {
        setFile(null);
        setMessage("Invalid file type. Please upload a video file.");
      }
    }
  };

  // cleanup blob URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    // Validate required fields
    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      setIsSubmitting(false);
      return;
    }

    if (!file) {
      setMessage("Please select a video file.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = new FormData();
      // Append only the simplified fields
      data.append("mediaTitle", formData.mediaTitle);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("file", file);

      await axiosInstance.post("/api/media/createmedia", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Navigate to admin media page after successful upload
      navigate("/admin/media");
      setMessage("Media uploaded successfully!");
      setFormData({ mediaTitle: "", description: "", category: "" });
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
              <span className="text-gray-600">Choose a video file</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                required
                className="hidden"
              />
            </label>
          </div>
          {/* Preview selected video */}
          {previewUrl && (
            <div className="mt-4">
              <video
                controls
                src={previewUrl}
                preload="metadata"
                className="w-full h-48 object-cover"
              >
                Your browser does not support the video tag.
              </video>
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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { FaCloudUploadAlt } from "react-icons/fa";

const UploadMedia = () => {
  const [formData, setFormData] = useState({
    mediaTitle: "",
    description: "",
    category: "",
    privacy: "public",
    tags: "",
    // Optionally, include uploadedBy if you are passing a user ID from context
  });
  const [file, setFile] = useState(null);
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
      // Allow only image files (PNG or JPEG)
      if (selectedFile.type.startsWith("image/")) {
        setFile(selectedFile);
        setMessage("");
      } else {
        setFile(null);
        setMessage("Invalid file type. Please upload an image file (PNG or JPEG).");
      }
    }
  };

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
      setMessage("Please select an image file.");
      setIsSubmitting(false);
      return;
    }

    // Format tags so that each one starts with a "#"
    let formattedTags = formData.tags;
    if (formattedTags) {
      formattedTags = formattedTags
        .split(",")
        .map((tag) => {
          const trimmedTag = tag.trim();
          return trimmedTag.startsWith("#") ? trimmedTag : "#" + trimmedTag;
        })
        .join(", ");
    }

    try {
      const data = new FormData();
      // Append all fields except tags
      Object.keys(formData).forEach((key) => {
        if (key === "tags") return; // Skip tags for now
        data.append(key, formData[key]);
      });
      // Append formatted tags and file
      data.append("tags", formattedTags);
      data.append("file", file);

      await axiosInstance.post("/api/media/createmedia", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Media uploaded successfully!");
      setFormData({
        mediaTitle: "",
        description: "",
        category: "",
        privacy: "public",
        tags: "",
      });
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
          <select
            name="privacy"
            onChange={handleChange}
            value={formData.privacy}
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="restricted">Restricted</option>
          </select>
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            onChange={handleChange}
            value={formData.tags}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          />
          <div className="border border-gray-300 p-3 rounded-lg flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100">
            <label className="flex flex-col items-center">
              <FaCloudUploadAlt className="text-gray-500 text-3xl mb-2" />
              <span className="text-gray-600">Choose an image file</span>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                required
                className="hidden"
              />
            </label>
          </div>
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

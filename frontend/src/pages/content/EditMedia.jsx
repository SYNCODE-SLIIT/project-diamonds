import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const EditMedia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState({
    mediaTitle: "",
    description: "",
    category: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the existing media data when the component mounts
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await axiosInstance.get(`/api/media/view/${id}`);
        const data = response.data;
        setMedia({
          mediaTitle: data.mediaTitle,
          description: data.description,
          category: data.category,
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load media data.");
        setLoading(false);
      }
    };
    fetchMedia();
  }, [id]);

  // Handle input changes for text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedia((prevMedia) => ({ ...prevMedia, [name]: value }));
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use FormData to support file uploads
      const formData = new FormData();
      formData.append("mediaTitle", media.mediaTitle);
      formData.append("description", media.description);
      formData.append("category", media.category);
      formData.append("file", file);

      await axiosInstance.put(`/api/media/update/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/admin/media"); // Redirect after successful update
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
        <label className="block text-sm font-medium">Title:</label>
        <input
          type="text"
          name="mediaTitle"
          value={media.mediaTitle}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        />

        <label className="block text-sm font-medium mt-3">Description:</label>
        <textarea
          name="description"
          value={media.description}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        ></textarea>

        <label className="block text-sm font-medium mt-3">Category:</label>
        <input
          type="text"
          name="category"
          value={media.category}
          onChange={handleChange}
          className="w-full p-2 border rounded mt-1"
        />

        <label className="block text-sm font-medium mt-3">Select Video File:</label>
        <input
          type="file"
          name="file"
          accept="video/*"
          onChange={handleFileChange}
          className="w-full p-2 border rounded mt-1"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded mt-4"
        >
          Update Media
        </button>
      </form>
    </div>
  );
};

export default EditMedia;

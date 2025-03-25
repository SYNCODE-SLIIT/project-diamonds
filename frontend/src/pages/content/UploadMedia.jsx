import React, { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

const UploadMedia = () => {
  const [formData, setFormData] = useState({
    mediaTitle: "",
    description: "",
    mediaType: "",
    category: "",
    privacy: "public",
    tags: "",
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append("file", file);

    try {
      const res = await fetch("http://localhost:4000/api/media/createmedia", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Failed to upload media");

      alert("Media uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
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
            required 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300" 
          />
          <textarea 
            name="description" 
            placeholder="Description" 
            onChange={handleChange} 
            required 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          ></textarea>
          <select 
            name="mediaType" 
            onChange={handleChange} 
            required 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
          >
            <option value="">Select Media Type</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <div className="border border-gray-300 p-3 rounded-lg flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100">
            <label className="flex flex-col items-center">
              <FaCloudUploadAlt className="text-gray-500 text-3xl mb-2" />
              <span className="text-gray-600">Choose a file</span>
              <input type="file" onChange={handleFileChange} required className="hidden" />
            </label>
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadMedia;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditBlogPost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState({
    title: "",
    content: "",
    category: "",
    publishDate: "",
    featuredImage: ""
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:4000/api/blogposts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        setPost({
          title: data.title || '',
          content: data.content || '',
          category: data.category || '',
          publishDate: data.publishDate ? data.publishDate.slice(0,10) : '',
          featuredImage: data.featuredImage || ''
        });
      } catch (err) {
        setError("Error fetching post");
      }
    };
    fetchPost();
  }, [id]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('title', post.title);
      formData.append('content', post.content);
      formData.append('category', post.category);
      formData.append('publishDate', post.publishDate);
      if (file) formData.append('featuredImage', file);
      const response = await axios.put(
        `http://localhost:4000/api/blogposts/update/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      console.log("Blog post updated successfully:", response?.data);
      navigate("/admin/blog");
      window.location.reload();
    } catch (err) {
      setError("Error updating blog post");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Blog Post</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold">Title</label>
            <input
              type="text"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Content</label>
            <textarea
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Category</label>
            <input
              type="text"
              value={post.category}
              onChange={(e) => setPost({ ...post, category: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Publish Date</label>
            <input
              type="date"
              value={post.publishDate}
              onChange={(e) => setPost({ ...post, publishDate: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Featured Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all duration-300"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBlogPost;

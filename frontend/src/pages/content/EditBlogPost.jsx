import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditBlogPost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState({
    title: "",
    content: "",
    category: "",
    status: "",
    metaDescription: "",
    featuredImage: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:4000/api/blogposts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(response.data);
      } catch (err) {
        setError("Error fetching post");
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:4000/api/blogposts/update/${id}`,
        post,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Blog post updated successfully:", response.data);
      navigate("/blog");
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
            <label className="block text-gray-700 font-semibold">Status</label>
            <input
              type="text"
              value={post.status}
              onChange={(e) => setPost({ ...post, status: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Meta Description</label>
            <input
              type="text"
              value={post.metaDescription}
              onChange={(e) => setPost({ ...post, metaDescription: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold">Featured Image URL</label>
            <input
              type="text"
              value={post.featuredImage}
              onChange={(e) => setPost({ ...post, featuredImage: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
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

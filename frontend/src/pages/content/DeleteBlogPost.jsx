import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const DeleteBlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/api/blogposts/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/blog");
    } catch (err) {
      setError("Error deleting blog post");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-96">
        <h2 className="text-2xl font-semibold text-red-600 text-center">Delete Blog Post</h2>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        <p className="text-center text-gray-700 mt-4">Are you sure you want to delete the post:</p>
        <p className="text-center font-bold text-lg mt-2">{post.title}</p>
        <div className="flex justify-between mt-6">
          <button 
            onClick={() => navigate("/blog")} 
            className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600">
            Cancel
          </button>
          <button 
            onClick={handleDelete} 
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBlogPost;

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const BlogPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:4000/api/blogposts/all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/api/blogposts/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((post) => post._id !== id));
    } catch (error) {
      console.error("Error deleting blog post:", error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/blog/edit/${id}`);
  };

  if (loading) return <p className="text-center text-gray-500 text-lg">Loading blog posts...</p>;
  if (error) return <p className="text-center text-red-500 text-lg">Error: {error}</p>;

  const categories = ["all", ...Array.from(new Set(posts.map(p => p.category)))];
  
  const filteredPosts = posts
    .filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(post =>
      categoryFilter === "all" || post.category === categoryFilter
    )
    .sort((a, b) => {
      const dateA = new Date(a.publishDate);
      const dateB = new Date(b.publishDate);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-end mb-4">
        <Link to="/admin/create-blog-post" className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
          Create Blog Post
        </Link>
      </div>
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Latest Blog Posts</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border p-2 rounded"
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="border p-2 rounded"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span>Sort:</span>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>
      {filteredPosts.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No blog posts found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post._id}
              className="border border-gray-200 rounded-lg shadow-md overflow-hidden bg-white transform transition duration-300 hover:shadow-lg"
            >
              {post.featuredImage && (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                <p className="text-gray-600 mt-2">{post.content.slice(0, 120)}...</p>
                <p className="text-sm text-gray-500 mt-3">
                  By {post.author?.name} • {new Date(post.publishDate).toLocaleDateString()}
                </p>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleEdit(post._id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPosts;

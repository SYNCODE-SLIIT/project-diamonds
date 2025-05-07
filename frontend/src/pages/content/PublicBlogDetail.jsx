import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const PublicBlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axiosInstance.get(`/api/blogposts/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return <p className="text-center py-8">Loading...</p>;
  if (!post) return <p className="text-center py-8">Post not found.</p>;

  const date = new Date(post.publishDate);
  const dateStr = date.toLocaleDateString();

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <p className="text-sm text-gray-500 mb-4">{dateStr} • by {post.author?.name}</p>
          <div className="prose max-w-none">
            <p>{post.content}</p>
          </div>
          <Link to="/blogs" className="mt-6 inline-block text-indigo-600 hover:underline">
            ← Back to Blogs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicBlogDetail; 
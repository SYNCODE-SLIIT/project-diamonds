import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const PublicBlogSlideShow = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/blogposts');
        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching public blog posts:', err);
      }
    };
    fetchPosts();
  }, []);

  if (!posts.length) {
    return <p className="text-center p-8">No blog posts available.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <motion.h2
        className="text-3xl font-bold text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Latest Blog Posts
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => {
          const index = posts.indexOf(post);
          const date = new Date(post.publishDate);
          const dateStr = date.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
          return (
            <motion.div
              key={post._id}
              className="bg-white rounded shadow overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {post.featuredImage && (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <p className="text-sm text-gray-500 uppercase">{dateStr}</p>
                <h3 className="mt-1 text-lg font-semibold text-gray-900">{post.title}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PublicBlogSlideShow; 
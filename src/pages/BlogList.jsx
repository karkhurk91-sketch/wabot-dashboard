
// src/pages/BlogList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await api.get('/api/blogs');
      setBlogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Blog</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {blogs.map(blog => (
          <div key={blog.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            {blog.image_url && <img src={blog.image_url} alt={blog.title} className="w-full h-48 object-cover" />}
            <div className="p-5">
              <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
              <p className="text-gray-600 mb-4">{blog.description || blog.content.substring(0, 100)}...</p>
              <Link to={`/blogs/${blog.slug}`} className="text-green-600 font-medium hover:underline">Read more →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default BlogList;

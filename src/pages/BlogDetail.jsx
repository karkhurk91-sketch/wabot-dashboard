
// src/pages/BlogDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const res = await api.get(`/api/blogs/${slug}`);
      setBlog(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!blog) return <div className="p-6 text-center">Blog not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {blog.image_url && <img src={blog.image_url} alt={blog.title} className="w-full h-64 object-cover rounded-lg mb-6" />}
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <div className="text-gray-500 text-sm mb-6">{new Date(blog.created_at).toLocaleDateString()}</div>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
    </div>
  );
};
export default BlogDetail;

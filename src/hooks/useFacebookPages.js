import { useState, useEffect } from 'react';
import { facebookApi } from '../services/facebook/api';

export const useFacebookPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    facebookApi.getPages()
      .then(res => setPages(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  return { pages, loading };
};
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/bookings').then(res => setBookings(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading bookings...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Confirmed Bookings</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Customer</th>
              <th>Phone</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td className="px-6 py-4">{b.customer_name || '-'}</td>
                <td className="px-6 py-4">{b.customer_phone}</td>
                <td className="px-6 py-4">{b.service}</td>
                <td className="px-6 py-4">{b.booking_date || '-'}</td>
                <td className="px-6 py-4">{b.booking_time || '-'}</td>
                <td className="px-6 py-4">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Bookings;
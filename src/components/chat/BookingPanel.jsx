import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const BookingPanel = ({ leadId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!leadId) return;
    
    setLoading(true);
    api.get(`/api/bookings`, { params: { lead_id: leadId, period: 'monthly' } })
      .then(res => setBookings(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Failed to fetch bookings:', err))
      .finally(() => setLoading(false));
  }, [leadId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (bookings.length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
      <h4 className="font-bold text-orange-900">Upcoming Bookings</h4>
      <div className="mt-2 space-y-2">
        {bookings.map(booking => (
          <div key={booking.id} className="text-sm border-l-2 border-orange-300 pl-2 py-1">
            <div className="font-medium">{booking.service}</div>
            <div className="text-gray-600">
              {booking.booking_date && new Date(booking.booking_date).toLocaleDateString()} 
              {booking.booking_time && ` at ${booking.booking_time}`}
            </div>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingPanel;

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../services/api';

const BookingCalendar = () => {
  const [view, setView] = useState('month'); // month, week, day
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dayBookings, setDayBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, [view, selectedDate]);

  const fetchBookings = async () => {
    setLoading(true);
    let period = 'monthly';
    if (view === 'week') period = 'weekly';
    if (view === 'day') period = 'daily';
    try {
      const res = await api.get(`/api/bookings?period=${period}`);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // When date changes in day view, filter bookings for that date
  useEffect(() => {
    if (view === 'day') {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const filtered = bookings.filter(b => b.booking_date === dateStr);
      setDayBookings(filtered);
    }
  }, [selectedDate, bookings, view]);

  const formatTime = (time) => {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const tileContent = ({ date, view: calendarView }) => {
    if (calendarView !== 'month') return null;
    const dateStr = date.toISOString().split('T')[0];
    const dayBookings = bookings.filter(b => b.booking_date === dateStr);
    if (dayBookings.length === 0) return null;
    return (
      <div className="text-xs bg-blue-100 rounded-full px-1 mt-1">
        {dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}
      </div>
    );
  };

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Calendar</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Week
          </button>
          <button
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Day
          </button>
        </div>
      </div>

      {loading && <div>Loading...</div>}

      {view === 'month' && (
        <div className="bg-white p-4 rounded-lg shadow">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            className="w-full"
          />
        </div>
      )}

      {view === 'week' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-8 border-b">
              <div className="p-2 font-semibold">Time</div>
              {[...Array(7)].map((_, i) => {
                const d = new Date(selectedDate);
                d.setDate(selectedDate.getDate() - selectedDate.getDay() + i);
                return (
                  <div key={i} className="p-2 font-semibold text-center">
                    {d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}
                  </div>
                );
              })}
            </div>
            {timeSlots.map(slot => (
              <div key={slot} className="grid grid-cols-8 border-b">
                <div className="p-2 text-sm">{formatTime(slot)}</div>
                {[...Array(7)].map((_, i) => {
                  const d = new Date(selectedDate);
                  d.setDate(selectedDate.getDate() - selectedDate.getDay() + i);
                  const dateStr = d.toISOString().split('T')[0];
                  const slotBooking = bookings.find(b => b.booking_date === dateStr && b.booking_time === slot);
                  return (
                    <div key={i} className="p-1 text-center text-sm border-l">
                      {slotBooking ? (
                        <div className="bg-blue-100 rounded p-1 text-xs">
                          {slotBooking.customer_name || slotBooking.customer_phone}
                          <br />
                          {slotBooking.service}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'day' && (
        <div className="bg-white rounded-lg shadow">
          <div className="bg-gray-50 px-4 py-2 font-semibold border-b">
            {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="divide-y">
            {timeSlots.map(slot => {
              const booking = dayBookings.find(b => b.booking_time === slot);
              return (
                <div key={slot} className="flex p-3 hover:bg-gray-50">
                  <div className="w-24 font-medium">{formatTime(slot)}</div>
                  <div className="flex-1">
                    {booking ? (
                      <div>
                        <span className="font-medium">{booking.customer_name || booking.customer_phone}</span>
                        <span className="text-gray-500 ml-2">{booking.service}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Available</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
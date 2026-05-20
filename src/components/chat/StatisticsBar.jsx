import React from 'react';

const StatisticsBar = ({ counts, activeFilter, onFilterChange }) => {
  const filters = [
    { key: 'all', label: 'All', count: (counts.open || 0) + (counts.closed || 0) },
    { key: 'assigned_to_me', label: 'My chats', count: 0 }, // you can extend later
    { key: 'unassigned', label: 'Unassigned', count: 0 },
    { key: 'sla_breached', label: 'SLA breached', count: counts.sla_breached || 0 },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-white border-b border-gray-200">
      {filters.map(filter => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            activeFilter === filter.key
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {filter.label}
          {filter.count > 0 && <span className="ml-1 text-xs">({filter.count})</span>}
        </button>
      ))}
    </div>
  );
};

export default StatisticsBar;
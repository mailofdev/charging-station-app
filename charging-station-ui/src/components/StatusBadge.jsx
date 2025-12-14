/**
 * StatusBadge Component
 * 
 * Simple, clean status badge with conditional styling.
 * Green for "Operational", Red for "Maintenance"
 */
const StatusBadge = ({ status }) => {
  // Normalize status to handle case variations
  const normalizedStatus = status?.toLowerCase();
  const isOperational = normalizedStatus === 'operational';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        isOperational
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          isOperational ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;

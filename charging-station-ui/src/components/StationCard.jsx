import StatusBadge from './StatusBadge';

/**
 * StationCard Component
 * 
 * Clean, modern card design for displaying charging stations.
 * Optimized for space efficiency while maintaining visual appeal.
 */
const StationCard = ({ station, onEdit, onDelete }) => {
  // Extract station data - using API field names
  const { stationName, status, locationAddress, locationLink, imageUrl, connectorType } = station;

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden
                 transition-all duration-200 hover:shadow-lg hover:border-blue-300
                 cursor-pointer h-full flex flex-col group"
      onClick={() => onEdit && onEdit(station)}
    >
      {/* Station Image with Delete Button */}
      <div className="relative h-36 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
        {/* Delete Button - Only visible when onDelete is provided (admin mode) */}
        {onDelete && (
          <button
            onClick={(e) => onDelete(station, e)}
            className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1.5 
                     hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100
                     focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Delete station"
            title="Delete station"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
        {imageUrl && imageUrl.trim() !== '' ? (
          <>
            <img
              src={imageUrl}
              alt={stationName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Hide broken image and show placeholder
                e.target.style.display = 'none';
                const container = e.target.parentElement;
                if (container) {
                  const placeholder = container.querySelector('.image-placeholder');
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                  }
                }
              }}
            />
            {/* Placeholder - hidden by default, shown on error */}
            <div className="image-placeholder hidden h-full w-full absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Station Name */}
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {stationName}
        </h3>

        {/* Status and Connector Type */}
        <div className="flex items-center justify-between mb-3">
          <StatusBadge status={status} />
          {connectorType && (
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              {connectorType.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Location */}
        {locationAddress && (
          <div className="mb-3 flex-1">
            <div className="flex items-start text-xs text-gray-600">
              <svg className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-2 leading-relaxed">{locationAddress}</span>
            </div>
          </div>
        )}

        {/* Location Link */}
        {locationLink && (
          <a
            href={locationLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium 
                     mt-auto pt-2 border-t border-gray-100"
          >
            View on Map
            <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};

export default StationCard;

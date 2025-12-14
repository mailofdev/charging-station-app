/**
 * Loader Component
 * 
 * Custom loading spinner with charging station theme.
 * Shows animated lightning bolt to indicate loading state.
 */
const Loader = ({ size = 'md', text, fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center">
      {/* Animated Lightning Bolt */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          className={`${sizeClasses[size]} text-blue-600 animate-pulse`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        {/* Rotating ring around lightning */}
        <div className="absolute inset-0 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      
      {/* Loading Text */}
      {text && (
        <p className={`mt-3 text-gray-600 ${textSizeClasses[size]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default Loader;


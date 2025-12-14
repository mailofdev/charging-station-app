/**
 * Header Component
 * 
 * Clean, minimal fixed header with logo and essential info.
 * Mobile-friendly responsive design.
 * Includes admin mode toggle for demo purposes.
 */
import logo from '../assets/logo.png';
const Header = ({ stats, isAdmin, onToggleAdmin, currentTime }) => {
  // Format time for display - use provided currentTime or current time
  const timeToDisplay = currentTime || new Date();
  const formattedTime = timeToDisplay.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const formattedDate = timeToDisplay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-9rounded-lg flex items-center justify-center">
              <img src={logo} alt="Logo"  />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Admin Mode Toggle */}
            {onToggleAdmin && (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline text-xs text-gray-500">Admin</span>
                <button
                  onClick={onToggleAdmin}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isAdmin ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={isAdmin}
                  aria-label="Toggle admin mode"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAdmin ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                {isAdmin && (
                  <span className="hidden sm:inline text-xs font-medium text-blue-600">ON</span>
                )}
              </div>
            )}

            {/* Stats - Compact */}
            {stats && (
              <div className="hidden sm:flex items-center space-x-4 text-sm">
                <div className="w-px h-6 bg-gray-200"></div>
                <div className="text-right">
                  <div className="text-gray-500 text-xs">Total</div>
                  <div className="font-semibold text-gray-900">{stats.total || 0}</div>
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
                <div className="text-right">
                  <div className="text-gray-500 text-xs">Active</div>
                  <div className="font-semibold text-green-600">{stats.operational || 0}</div>
                </div>
              </div>
            )}

            {/* Time - Updates every second */}
            <div className="text-right">
              <div className="text-xs text-gray-500 hidden sm:block">
                {formattedDate}
              </div>
              <div className="text-sm font-medium text-gray-700 font-mono">{formattedTime}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

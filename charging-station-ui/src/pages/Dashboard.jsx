import { useState, useEffect, useCallback } from 'react';
import StationCard from '../components/StationCard';
import StationForm from '../components/StationForm';
import Header from '../components/Header';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import StationCharts from '../components/StationCharts';
import { getAllStations, createStation, updateStation, deleteStation } from '../services/stationApi';

/**
 * Dashboard Component
 * 
 * Main dashboard page that displays all charging stations.
 * Features:
 * - Fetches and displays stations in card layout
 * - Live refresh of dashboard stats every 1 second
 * - Admin form for creating/updating stations
 * - Loading and error state handling
 * - Pagination for station list
 * - Compact filtering system
 */
const Dashboard = () => {
  // Admin mode state - can be toggled for demo purposes
  const [isAdmin, setIsAdmin] = useState(() => {
    // Check localStorage for saved admin state, default to true for demo
    const saved = localStorage.getItem('adminMode');
    return saved !== null ? saved === 'true' : true;
  });

  // Pagination settings - increased for better UX
  const ITEMS_PER_PAGE = 6;

  // State management
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'list'
  const [stats, setStats] = useState({
    total: 0,
    operational: 0,
    maintenance: 0,
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    pinCode: '',
    connectorType: '',
    status: '',
  });

  /**
   * Fetch stations from API
   * Wrapped in useCallback to prevent unnecessary re-renders
   */
  const fetchStations = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllStations();
      setStations(Array.isArray(data) ? data : []);
      // Reset to first page if current page is out of bounds
      setCurrentPage((prev) => {
        const totalPages = Math.ceil((Array.isArray(data) ? data.length : 0) / ITEMS_PER_PAGE);
        return prev > totalPages && totalPages > 0 ? 1 : prev;
      });
    } catch (err) {
      console.error('Failed to fetch stations:', err);
      // Extract error message from the error object
      const errorMessage = err.message || 'Failed to load charging stations. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Filter stations based on current filter criteria including search
   */
  const getFilteredStations = useCallback(() => {
    return stations.filter((station) => {
      // Search filter - searches across multiple fields
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase().trim();
        const searchableFields = [
          station.stationName || '',
          station.locationAddress || '',
          station.pinCode ? station.pinCode.toString() : '',
          station.connectorType ? station.connectorType.replace(/_/g, ' ') : '',
          station.status || '',
        ].join(' ').toLowerCase();
        
        if (!searchableFields.includes(searchTerm)) {
          return false;
        }
      }
      
      // Filter by pin code - partial match (contains)
      if (filters.pinCode && station.pinCode) {
        const stationPinCode = station.pinCode.toString().toLowerCase();
        const filterPinCode = filters.pinCode.toLowerCase().trim();
        if (!stationPinCode.includes(filterPinCode)) {
          return false;
        }
      } else if (filters.pinCode && !station.pinCode) {
        // If filter has value but station doesn't have pin code, exclude it
        return false;
      }
      
      // Filter by connector type - exact match
      if (filters.connectorType && station.connectorType !== filters.connectorType) {
        return false;
      }
      
      // Filter by status - exact match (case-insensitive)
      if (filters.status && station.status?.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }
      
      return true;
    });
  }, [stations, filters]);

  /**
   * Calculate dashboard statistics based on filtered stations
   * Updates total, operational, and maintenance station counts
   */
  const calculateStats = useCallback(() => {
    const filteredStations = getFilteredStations();
    const total = filteredStations.length;
    const operational = filteredStations.filter(
      (station) => station.status?.toLowerCase() === 'operational'
    ).length;
    const maintenance = filteredStations.filter(
      (station) => station.status?.toLowerCase() === 'maintenance'
    ).length;
    setStats({ total, operational, maintenance });
  }, [getFilteredStations]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // Calculate stats whenever stations change
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  /**
   * Live refresh interval for dashboard stats
   * Refreshes every 1 second and properly cleans up on unmount
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Recalculate stats from current stations state
      calculateStats();
    }, 1000);

    // Cleanup interval on component unmount to prevent memory leaks
    return () => clearInterval(intervalId);
  }, [calculateStats]);

  /**
   * Handle form submission for both create and update
   */
  const handleFormSubmit = async (formData) => {
    try {
      setError(null);
      setSubmitting(true);
      if (editingStation) {
        // Update existing station
        const stationId = editingStation.id || editingStation._id;
        await updateStation(stationId, formData);
      } else {
        // Create new station
        await createStation(formData);
      }
      // Refresh stations list after successful operation
      await fetchStations();
      // Reset form state
      setShowForm(false);
      setEditingStation(null);
    } catch (err) {
      console.error('Failed to save station:', err);
      // Extract error message from the error object
      const errorMessage = err.message || (
        editingStation
          ? 'Failed to update station. Please try again.'
          : 'Failed to create station. Please try again.'
      );
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle edit button click
   * Opens modal with form and station data pre-filled
   */
  const handleEdit = (station) => {
    setEditingStation(station);
    setShowForm(true);
  };

  /**
   * Handle create new station
   * Opens modal with empty form
   */
  const handleCreateNew = () => {
    setEditingStation(null);
    setShowForm(true);
  };

  /**
   * Handle form cancel
   * Closes form and resets editing state
   */
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingStation(null);
  };

  /**
   * Toggle admin mode
   * Saves to localStorage for persistence
   */
  const toggleAdminMode = () => {
    const newAdminState = !isAdmin;
    setIsAdmin(newAdminState);
    localStorage.setItem('adminMode', newAdminState.toString());
  };

  /**
   * Handle page change for pagination
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of content area
    window.scrollTo({ top: 80, behavior: 'smooth' });
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setFilters({
      search: '',
      pinCode: '',
      connectorType: '',
      status: '',
    });
    setCurrentPage(1);
  };

  /**
   * Handle delete button click
   * Opens confirmation dialog
   */
  const handleDeleteClick = (station, e) => {
    e.stopPropagation(); // Prevent card click
    setDeleteConfirm(station);
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      setError(null);
      setDeleting(true);
      const stationId = deleteConfirm.id || deleteConfirm._id;
      await deleteStation(stationId);
      // Refresh stations list after successful deletion
      await fetchStations();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete station:', err);
      const errorMessage = err.message || 'Failed to delete station. Please try again.';
      setError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Handle delete cancel
   */
  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  // Get filtered stations
  const filteredStations = getFilteredStations();

  // Calculate pagination based on filtered stations
  const totalPages = Math.ceil(filteredStations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentStations = filteredStations.slice(startIndex, endIndex);

  // Check if any filters are active
  const hasActiveFilters = filters.search || filters.pinCode || filters.connectorType || filters.status;

  // Loading state
  if (loading) {
    return (
      <>
        <Header stats={stats} isAdmin={isAdmin} onToggleAdmin={toggleAdminMode} />
        <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center px-4">
          <Loader size="lg" text="Loading stations..." />
        </div>
      </>
    );
  }

  return (
    <>
      <Header stats={stats} isAdmin={isAdmin} onToggleAdmin={toggleAdminMode} />
      <div className="min-h-screen bg-gray-50 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Compact Header Bar with Stats, Filters and Actions */}
          {!showForm && (
            <div className="mb-5">
              {/* Title Row */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Charging Stations</h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {hasActiveFilters ? (
                      <>
                        Showing <span className="font-semibold text-gray-700">{filteredStations.length}</span> of{' '}
                        <span className="font-semibold text-gray-700">{stations.length}</span> stations
                      </>
                    ) : (
                      <>{stations.length} {stations.length === 1 ? 'station' : 'stations'} available</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* View Toggle */}
                  <div className="inline-flex items-center bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
                    <button
                      onClick={() => setViewMode('graph')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                        viewMode === 'graph'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      title="Graph View"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="hidden sm:inline">Graph</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                        viewMode === 'list'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      title="List View"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span className="hidden sm:inline">List</span>
                    </button>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={handleCreateNew}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg 
                               hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150 shadow-sm hover:shadow 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Station
                    </button>
                  )}
                </div>
              </div>

              {/* Stats and Filter Row */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Stats Cards - Compact */}
                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
                  <div className="text-xs text-gray-500">Total:</div>
                  <div className="text-sm font-semibold text-gray-900">{stats.total}</div>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
                  <div className="text-xs text-gray-500">Operational:</div>
                  <div className="text-sm font-semibold text-green-600">{stats.operational}</div>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
                  <div className="text-xs text-gray-500">Maintenance:</div>
                  <div className="text-sm font-semibold text-red-600">{stats.maintenance}</div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-6 bg-gray-300"></div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    hasActiveFilters
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                      {[filters.search, filters.pinCode, filters.connectorType, filters.status].filter(Boolean).length}
                    </span>
                  )}
                </button>
              </div>

              {/* Collapsible Filters Panel */}
              {showFilters && (
                <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  {/* Search Bar - Full Width */}
                  <div className="mb-4">
                    <label htmlFor="searchFilter" className="block text-xs font-medium text-gray-700 mb-1.5">
                      Search Stations
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="searchFilter"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                 outline-none transition-colors text-sm"
                        placeholder="Search by name, address, pin code, connector type, or status..."
                      />
                      {filters.search && (
                        <button
                          onClick={() => handleFilterChange('search', '')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          aria-label="Clear search"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      Search across station name, address, pin code, connector type, and status
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Pin Code Filter */}
                    <div>
                      <label htmlFor="filterPinCode" className="block text-xs font-medium text-gray-700 mb-1.5">
                        Pin Code
                      </label>
                      <input
                        type="text"
                        id="filterPinCode"
                        value={filters.pinCode}
                        onChange={(e) => handleFilterChange('pinCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                 outline-none transition-colors text-sm"
                        placeholder="Enter pin code"
                      />
                    </div>

                    {/* Connector Type Filter */}
                    <div>
                      <label htmlFor="filterConnectorType" className="block text-xs font-medium text-gray-700 mb-1.5">
                        Connector Type
                      </label>
                      <select
                        id="filterConnectorType"
                        value={filters.connectorType}
                        onChange={(e) => handleFilterChange('connectorType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                 outline-none transition-colors bg-white text-sm"
                      >
                        <option value="">All Types</option>
                        <option value="TYPE_2_AC">Type 2 (AC)</option>
                        <option value="CCS2_DC">CCS2 (DC Fast)</option>
                        <option value="BHARAT_AC_001">Bharat AC-001</option>
                        <option value="BHARAT_DC_001">Bharat DC-001</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label htmlFor="filterStatus" className="block text-xs font-medium text-gray-700 mb-1.5">
                        Status
                      </label>
                      <select
                        id="filterStatus"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                 outline-none transition-colors bg-white text-sm"
                      >
                        <option value="">All Status</option>
                        <option value="Operational">Operational</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={handleClearFilters}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium mb-1">Error</div>
                  <div>{error}</div>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-4 text-red-600 hover:text-red-800"
                  aria-label="Dismiss error"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* View Mode Content */}
          {viewMode === 'graph' ? (
            /* Graph View - Real-time Charts and Visualizations */
            filteredStations.length > 0 ? (
              <div className="animate-fadeIn">
                {/* Filter Indicator */}
                {hasActiveFilters && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      <span className="text-sm font-medium text-blue-900">
                        Showing filtered data: <span className="font-semibold">{filteredStations.length}</span> of <span className="font-semibold">{stations.length}</span> stations
                      </span>
                    </div>
                    <button
                      onClick={handleClearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
                <StationCharts stations={filteredStations} />
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500 font-medium mb-1">
                  {hasActiveFilters ? 'No stations match your filters' : 'No data to display'}
                </p>
                <p className="text-gray-400 text-sm">
                  {hasActiveFilters 
                    ? 'Try adjusting your filters to see chart data'
                    : 'Charts will appear when stations are available'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg 
                             hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )
          ) : (
            /* List View - Station Cards Grid */
            <div className="animate-fadeIn">
              {filteredStations.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500 font-medium mb-1">
                    {hasActiveFilters ? 'No stations match your filters' : 'No stations found'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {hasActiveFilters 
                      ? 'Try adjusting your filters or clear them to see all stations'
                      : isAdmin 
                        ? 'Create your first charging station to get started' 
                        : 'Stations will appear here once added'}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg 
                               hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentStations.map((station) => (
                      <StationCard
                        key={station.id || station._id || Math.random()}
                        station={station}
                        onEdit={isAdmin ? handleEdit : null}
                        onDelete={isAdmin ? handleDeleteClick : null}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Station Form Modal */}
          <Modal
            isOpen={isAdmin && showForm}
            onClose={submitting ? undefined : handleCancelForm}
            title={editingStation ? 'Edit Station' : 'Create New Station'}
            size="md"
          >
            {submitting ? (
              <div className="py-12">
                <Loader size="md" text={editingStation ? 'Updating station...' : 'Creating station...'} />
              </div>
            ) : (
              <StationForm
                station={editingStation}
                onSubmit={handleFormSubmit}
                onCancel={handleCancelForm}
              />
            )}
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={!!deleteConfirm}
            onClose={deleting ? undefined : handleDeleteCancel}
            title="Delete Station"
            size="sm"
          >
            {deleting ? (
              <div className="py-12">
                <Loader size="md" text="Deleting station..." />
              </div>
            ) : (
              <div className="py-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                      Are you sure you want to delete this station?
                    </h3>
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-medium text-gray-900">{deleteConfirm?.stationName}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg 
                             text-sm font-medium hover:bg-red-700 active:bg-red-800
                             transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Delete Station
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg 
                             text-sm font-medium hover:bg-gray-200 active:bg-gray-300
                             transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

import axios from 'axios';

// Base URL for the API
// Using relative URL - Create React App proxy will forward to http://localhost:5000
const API_BASE_URL = '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Extract error message from API response
 * Handles both response body errors and standard error messages
 */
const extractErrorMessage = (error) => {
  if (error.response) {
    // Server responded with error status
    const errorData = error.response.data;
    
    // Check if error is a string in response body
    if (typeof errorData === 'string') {
      return errorData;
    }
    
    // Check if error has a message property
    if (errorData && errorData.message) {
      return errorData.message;
    }
    
    // Check if error is an object with error property
    if (errorData && errorData.error) {
      return errorData.error;
    }
    
    // Default error message based on status code
    return `Server error: ${error.response.status} ${error.response.statusText}`;
  } else if (error.request) {
    // Request was made but no response received
    return 'No response from server. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

/**
 * Fetch all charging stations from the backend
 * @returns {Promise} Promise that resolves to the stations array
 */
export const getAllStations = async () => {
  try {
    const response = await apiClient.get('/getAllChargingStations');
    return response.data;
  } catch (error) {
    console.error('Error fetching stations:', error);
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

/**
 * Fetch a single station by ID
 * @param {string|number} id - Station ID
 * @returns {Promise} Promise that resolves to the station object
 */
export const getStationById = async (id) => {
  try {
    const response = await apiClient.get(`/GetChargingStationById/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching station:', error);
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

/**
 * Create a new charging station
 * @param {Object} stationData - Station data object
 * @returns {Promise} Promise that resolves to the created station
 */
export const createStation = async (stationData) => {
  try {
    const response = await apiClient.post('/AddChargingStation', stationData);
    return response.data;
  } catch (error) {
    console.error('Error creating station:', error);
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing charging station
 * @param {string|number} id - Station ID
 * @param {Object} stationData - Updated station data (should include id matching URL)
 * @returns {Promise} Promise that resolves to the updated station
 */
export const updateStation = async (id, stationData) => {
  try {
    // Include id in request body to match API requirement
    const dataWithId = {
      ...stationData,
      id: parseInt(id), // Ensure id is a number
    };
    const response = await apiClient.put(`/updateChargingStationById/${id}`, dataWithId);
    return response.data;
  } catch (error) {
    console.error('Error updating station:', error);
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

/**
 * Delete a charging station
 * @param {string|number} id - Station ID
 * @returns {Promise} Promise that resolves when deletion is complete
 */
export const deleteStation = async (id) => {
  try {
    const response = await apiClient.delete(`/deleteChargingStationById/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting station:', error);
    const errorMessage = extractErrorMessage(error);
    throw new Error(errorMessage);
  }
};

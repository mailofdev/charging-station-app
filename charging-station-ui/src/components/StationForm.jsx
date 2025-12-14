import { useState, useEffect } from "react";

/**
 * StationForm Component
 *
 * Clean, simple form for creating and updating charging stations.
 * Minimal design with clear field labels and spacing.
 */
const StationForm = ({ station, onSubmit, onCancel }) => {
  // Form state initialization - matching API field names
  const [formData, setFormData] = useState({
    stationName: "",
    locationAddress: "",
    pinCode: "",
    connectorType: "",
    status: "Operational",
    imageUrl: "",
    locationLink: "",
  });

  // State for image preview
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Pre-fill form when editing (when station prop changes)
  useEffect(() => {
    if (station) {
      setFormData({
        stationName: station.stationName || "",
        locationAddress: station.locationAddress || "",
        pinCode: station.pinCode || "",
        connectorType: station.connectorType || "",
        status: station.status || "Operational",
        imageUrl: station.imageUrl || "",
        locationLink: station.locationLink || "",
      });
      // Set preview if existing image
      if (station.imageUrl) {
        setImagePreview(station.imageUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      // Reset form for new station
      setFormData({
        stationName: "",
        locationAddress: "",
        pinCode: "",
        connectorType: "",
        status: "Operational",
        imageUrl: "",
        locationLink: "",
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [station]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setFormData((prev) => ({
          ...prev,
          imageUrl: base64String, // Store base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      imageUrl: "",
    }));
    // Reset file input
    const fileInput = document.getElementById('imageFile');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Station Name */}
        <div>
          <label
            htmlFor="stationName"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Station Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="stationName"
            name="stationName"
            value={formData.stationName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     outline-none transition-colors text-sm"
            placeholder="Enter station name"
          />
        </div>

        {/* Location Address */}
        <div>
          <label
            htmlFor="locationAddress"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Location Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="locationAddress"
            name="locationAddress"
            value={formData.locationAddress}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     outline-none transition-colors resize-none text-sm"
            placeholder="Enter full address"
          />
        </div>

        {/* Pin Code */}
        <div>
          <label
            htmlFor="pinCode"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Pin Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="pinCode"
            name="pinCode"
            value={formData.pinCode}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     outline-none transition-colors text-sm"
            placeholder="Enter pin code"
          />
        </div>

        {/* Connector Type */}
        <div>
          <label
            htmlFor="connectorType"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Connector Type <span className="text-red-500">*</span>
          </label>
          <select
            id="connectorType"
            name="connectorType"
            value={formData.connectorType}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     outline-none transition-colors bg-white text-sm"
          >
            <option value="">Select connector type</option>
            <option value="TYPE_2_AC">Type 2 (AC)</option>
            <option value="CCS2_DC">CCS2 (DC Fast)</option>
            <option value="BHARAT_AC_001">Bharat AC-001</option>
            <option value="BHARAT_DC_001">Bharat DC-001</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     outline-none transition-colors bg-white text-sm"
          >
            <option value="Operational">Operational</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label
            htmlFor="imageFile"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Station Image
          </label>
          
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-3 relative">
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* File Input */}
          <div className="relative">
            <input
              type="file"
              id="imageFile"
              name="imageFile"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="imageFile"
              className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="w-8 h-8 mb-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-700">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Location Link */}
        <div>
          <label
            htmlFor="locationLink"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Location Link
          </label>
          <input
            type="url"
            id="locationLink"
            name="locationLink"
            value={formData.locationLink}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     outline-none transition-colors text-sm"
            placeholder="https://maps.google.com/..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="flex-1 px-5 py-2.5 bg-blue-600 text-white rounded-lg 
                     text-sm font-medium hover:bg-blue-700 active:bg-blue-800
                     transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {station ? "Update Station" : "Create Station"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg 
                       text-sm font-medium hover:bg-gray-200 active:bg-gray-300
                       transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default StationForm;

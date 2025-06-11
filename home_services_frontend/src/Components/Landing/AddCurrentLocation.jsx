import React, { useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { FaMapMarkerAlt } from 'react-icons/fa';

const AddCurrentLocation = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const locationData = {
            user_id: userId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          const response = await axiosInstance.post('/locations', locationData);
          setSuccess(true);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to save location');
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="location-section">
      <button 
        onClick={getCurrentLocation} 
        disabled={isLoading}
        className="location-button"
      >
        <FaMapMarkerAlt /> {isLoading ? 'Getting Location...' : 'Add Current Location'}
      </button>
      
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">Location saved successfully!</p>}
    </div>
  );
};

export default AddCurrentLocation;
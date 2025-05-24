import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import { FiUserPlus, FiArrowLeft } from 'react-icons/fi';
import SuccessAlert from '../../common/alerts/SuccessAlert';
import ErrorAlert from '../../common/alerts/ErrorAlert';

const CreateTasker = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_id: '',
    country: '',
    city: '',
    cin: '',
    certificate_police: null,
    certificate_police_date: '',
    bio: '',
    experience: '',
    photo: null,
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      }

      const response = await axiosInstance.post('/taskers', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage('Tasker created successfully!');
      setTimeout(() => navigate('/admin/taskers'), 1500);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to create tasker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
      <ErrorAlert
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />

      <div>
        <button 
          onClick={() => navigate('/admin/taskers')}
        >
          <FiArrowLeft /> Back to Taskers
        </button>
        <h1>Create New Tasker</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <label>User ID</label>
            <input
              type="text"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>CIN *</label>
            <input
              type="text"
              name="cin"
              value={formData.cin}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Police Certificate *</label>
            <input
              type="file"
              name="certificate_police"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </div>

          <div>
            <label>Certificate Date *</label>
            <input
              type="date"
              name="certificate_police_date"
              value={formData.certificate_police_date}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div>
            <label>Experience (years)</label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div>
            <label>Profile Photo</label>
            <input
              type="file"
              name="photo"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png"
            />
          </div>

          <div>
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : (
              <>
                <FiUserPlus /> Create Tasker
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTasker;

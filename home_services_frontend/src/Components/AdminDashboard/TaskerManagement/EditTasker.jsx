import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import SuccessAlert from '../../common/alerts/SuccessAlert';
import ErrorAlert from '../../common/alerts/ErrorAlert';
import Loading from '../../common/Loading';

const EditTasker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasker, setTasker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
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
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchTasker = async () => {
      try {
        const response = await axiosInstance.get(`/taskers/${id}`);
        setTasker(response.data);
        setFormData({
          country: response.data.country || '',
          city: response.data.city || '',
          cin: response.data.cin || '',
          certificate_police: null,
          certificate_police_date: response.data.certificate_police_date || '',
          bio: response.data.bio || '',
          experience: response.data.experience || '',
          photo: null,
          status: response.data.status || 'pending'
        });
        setLoading(false);
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Failed to fetch tasker');
        setLoading(false);
      }
    };

    fetchTasker();
  }, [id]);

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

      await axiosInstance.put(`/taskers/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage('Tasker updated successfully!');
      setTimeout(() => navigate('/admin/taskers'), 1500);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update tasker');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

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
        <h1>Edit Tasker: {tasker?.user?.first_name} {tasker?.user?.last_name}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
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
            <label>Police Certificate</label>
            <input
              type="file"
              name="certificate_police"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            {tasker?.certificate_police && (
              <div>
                Current file: {tasker.certificate_police.split('/').pop()}
              </div>
            )}
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
            {tasker?.photo && (
              <div>
                Current photo: {tasker.photo.split('/').pop()}
              </div>
            )}
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
            {loading ? 'Saving...' : (
              <>
                <FiSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTasker;

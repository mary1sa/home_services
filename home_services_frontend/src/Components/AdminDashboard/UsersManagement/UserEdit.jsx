import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import classNames from 'classnames';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiCalendar, FiUpload, FiX } from 'react-icons/fi';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'user',
    city: '',
    country: '',
    bio: '',
    certificate_police_date: '',
    services: [],
    photo: null,
    current_photo: null
  });

  const [files, setFiles] = useState({
    photo: null,
    cin: null,
    certificate_police: null
  });
  const [previews, setPreviews] = useState({
    photo: null,
    cin: null,
    certificate_police: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [availableServices, setAvailableServices] = useState([]);
  const countries = useMemo(() => countryList().getData(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await axiosInstance.get(`/users/${id}`);
        const user = userResponse.data;

        // Fetch available services
        const servicesResponse = await axiosInstance.get('/services');
        setAvailableServices(servicesResponse.data);

        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          password: '',
          phone: user.phone || '',
          address: user.address || '',
          role: user.role || 'user',
          city: user.tasker?.city || '',
          country: user.tasker?.country || '',
          bio: user.tasker?.bio || '',
          certificate_police_date: user.tasker?.certificate_police_date || '',
          services: user.tasker?.services || [],
          photo: null,
          current_photo: user.tasker?.photo || null
        });

        if (user.tasker?.photo) {
          setPreviews(prev => ({
            ...prev,
            photo: `${process.env.REACT_APP_API_URL}/storage/${user.tasker.photo}`
          }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setErrors({ 
          general: err.response?.data?.message || 'Error fetching user data' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleRemoveImage = (fieldName) => {
    setFiles(prev => ({
      ...prev,
      [fieldName]: null
    }));
    setPreviews(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  const handleCountryChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      country: selectedOption ? selectedOption.label : ''
    }));
  };

  const handlePhoneChange = (value, country) => {
    setFormData(prev => ({
      ...prev,
      phone: value, 
      countryCode: country?.countryCode 
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    const file = fileList[0];
    
    setFiles(prev => ({
      ...prev,
      [name]: file
    }));

    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({
          ...prev,
          [name]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleServiceSelect = (e) => {
    const selectedServiceId = e.target.value;
    if (selectedServiceId && !formData.services.some(s => s.id === selectedServiceId)) {
      const selectedService = availableServices.find(s => s.id == selectedServiceId);
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, { 
          id: selectedService.id, 
          name: selectedService.name,
          experience: 0 
        }]
      }));
    }
  };

  const handleServiceExperienceChange = (serviceId, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(service => 
        service.id === serviceId 
          ? { ...service, experience: parseInt(value) || 0 } 
          : service
      )
    }));
  };

  const removeService = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== serviceId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    // Validate services if role is tasker
    if (formData.role === 'tasker' && formData.services.length === 0) {
      setErrors(prev => ({
        ...prev,
        services: ['Please select at least one service']
      }));
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Add all basic fields
      for (const key in formData) {
        if (key !== 'services' && key !== 'current_photo' && formData[key] !== null && formData[key] !== undefined) {
          if (key === 'certificate_police_date' && formData[key]) {
            formDataToSend.append(key, new Date(formData[key]).toISOString());
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      }

      // Add files
      for (const key in files) {
        if (files[key]) {
          formDataToSend.append(key, files[key]);
        }
      }

      // Add services with experience if role is tasker
      if (formData.role === 'tasker') {
        formData.services.forEach((service, index) => {
          formDataToSend.append(`services[${index}][id]`, service.id);
          formDataToSend.append(`services[${index}][experience]`, service.experience);
        });
      }

      const response = await axiosInstance.put(`/users/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage('User updated successfully!');
      setTimeout(() => navigate("/admin/users"), 1500);

    } catch (err) {
      console.error('Update Error:', err);
      
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ 
          general: err.response?.data?.message || 'An error occurred while updating' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCountryOption = countries.find(c => c.label === formData.country) || null;

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (errors.general) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-4xl mx-auto mt-8">
      <p className="font-bold">Error</p>
      <p>{errors.general}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="form-title">Edit User</h1>
        <p className="form-subtitle">Update the user details below</p>
      </div>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>
                    
          <div className="profile-photo-section">
            <div className="profile-photo-container">
              <label htmlFor="photo" className="profile-photo-upload-label">
                {previews.photo ? (
                  <div className="profile-photo-preview-container">
                    <img 
                      src={previews.photo} 
                      alt="Profile preview" 
                      className="profile-photo-preview" 
                    />
                    <button 
                      type="button" 
                      className="profile-photo-remove-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveImage('photo');
                      }}
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <div className="profile-photo-placeholder">
                    <FiUser className="profile-photo-icon" />
                    <span>Upload Photo</span>
                  </div>
                )}
              </label>
              <input
                id="photo"
                type="file"
                name="photo"
                onChange={handleFileChange}
                className="profile-photo-input"
                accept="image/jpeg,image/png"
              />
            </div>
            {errors.photo && <p className="error-text profile-photo-error">{errors.photo}</p>}
          </div>

          <div className="input-grid">
            <div className="input-group">
              <label className="input-label" htmlFor="first_name">
                <FiUser className="input-icon" />
                First Name*
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`input-field ${errors.first_name ? 'input-error' : ''}`}
                required
              />
              {errors.first_name && <p className="error-text">{errors.first_name}</p>}
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="last_name">
                <FiUser className="input-icon" />
                Last Name*
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`input-field ${errors.last_name ? 'input-error' : ''}`}
                required
              />
              {errors.last_name && <p className="error-text">{errors.last_name}</p>}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">
              <FiMail className="input-icon" />
              Email*
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? 'input-error' : ''}`}
              required
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">
              <FiLock className="input-icon" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Leave blank to keep current"
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div className="input-group">
            <label className="input-label">
              <FiPhone className="input-icon" />
              Phone*
            </label>
            <PhoneInput
              country={'us'}
              value={formData.phone}
              onChange={handlePhoneChange}
              inputProps={{
                name: 'phone',
                required: true,
                id: 'phone-input',
                autoComplete: 'tel'
              }}
              containerClass={`phone-input-container ${errors.phone ? 'input-error' : ''}`}
              inputClass="phone-input-field"
              dropdownClass="phone-dropdown"
              enableSearch
              disableSearchIcon
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="address">
              <FiMapPin className="input-icon" />
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input-field"
            />
            {errors.address && <p className="error-text">{errors.address}</p>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="role">
              Role*
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="user">User</option>
              <option value="tasker">Tasker</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <p className="error-text">{errors.role}</p>}
          </div>
        </div>

        {formData.role === 'tasker' && (
          <>
            <div className="form-section">
              <h2 className="section-title">Tasker Details</h2>
              
              <div className="input-grid">
                <div className="input-group">
                  <label className="input-label" htmlFor="city">
                    City*
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`input-field ${errors.city ? 'input-error' : ''}`}
                    required
                  />
                  {errors.city && <p className="error-text">{errors.city}</p>}
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="country">
                    Country
                  </label>
                  <Select
                    id="country"
                    name="country"
                    options={countries}
                    value={selectedCountryOption}
                    onChange={handleCountryChange}
                    classNamePrefix="react-select"
                    className={`country-select ${errors.country ? 'input-error' : ''}`}
                    placeholder="Select a country"
                    isClearable
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        minHeight: '44px',
                        borderColor: errors.country ? '#ef4444' : '#d1d5db',
                        '&:hover': {
                          borderColor: errors.country ? '#ef4444' : '#9ca3af'
                        }
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
                        color: state.isSelected ? 'white' : 'inherit',
                      }),
                      singleValue: (provided, state) => ({
                        ...provided,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }),
                    }}
                    formatOptionLabel={({ label, value }) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          loading="lazy"
                          width="20"
                          src={`https://flagcdn.com/w20/${value.toLowerCase()}.png`}
                          alt={label}
                          style={{ borderRadius: '2px' }}
                        />
                        <span>{label}</span>
                      </div>
                    )}
                  />
                  {errors.country && <p className="error-text">{errors.country}</p>}
                </div>
              </div>

              <div className="input-grid">
                <div className="input-group">
                  <label className="input-label" htmlFor="cin">
                    CIN (ID Document)*
                  </label>
                  <div className="file-upload-wrapper">
                    <label htmlFor="cin" className="file-upload-label">
                      <div className="file-upload-box">
                        {previews.cin ? (
                          <div className="file-preview-container">
                            <img src={previews.cin} alt="CIN preview" className="file-preview-image" />
                            <button 
                              type="button" 
                              className="file-remove-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveImage('cin');
                              }}
                            >
                              <FiX />
                            </button>
                          </div>
                        ) : (
                          <div className="file-upload-placeholder">
                            <FiUpload className="upload-icon" />
                            <span>Upload ID Document</span>
                          </div>
                        )}
                      </div>
                      <input
                        id="cin"
                        type="file"
                        name="cin"
                        onChange={handleFileChange}
                        className="file-input"
                        accept="image/jpeg,image/png,application/pdf"
                        required
                      />
                    </label>
                  </div>
                  {errors.cin && <p className="error-text">{errors.cin}</p>}
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="certificate_police">
                    Police Certificate*
                  </label>
                  <div className="file-upload-wrapper">
                    <label htmlFor="certificate_police" className="file-upload-label">
                      <div className="file-upload-box">
                        {previews.certificate_police ? (
                          <div className="file-preview-container">
                            <img src={previews.certificate_police} alt="Certificate preview" className="file-preview-image" />
                            <button 
                              type="button" 
                              className="file-remove-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveImage('certificate_police');
                              }}
                            >
                              <FiX />
                            </button>
                          </div>
                        ) : (
                          <div className="file-upload-placeholder">
                            <FiUpload className="upload-icon" />
                            <span>Upload Police Certificate</span>
                          </div>
                        )}
                      </div>
                      <input
                        id="certificate_police"
                        type="file"
                        name="certificate_police"
                        onChange={handleFileChange}
                        className="file-input"
                        accept="image/jpeg,image/png,application/pdf"
                        required
                      />
                    </label>
                  </div>
                  {errors.certificate_police && <p className="error-text">{errors.certificate_police}</p>}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="certificate_police_date">
                  <FiCalendar className="input-icon" />
                  Certificate Date*
                </label>
                <input
                  type="date"
                  name="certificate_police_date"
                  value={formData.certificate_police_date}
                  onChange={handleChange}
                  className={`input-field ${errors.certificate_police_date ? 'input-error' : ''}`}
                  required
                />
                {errors.certificate_police_date && <p className="error-text">{errors.certificate_police_date}</p>}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="bio">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="input-field"
                  rows="4"
                />
                {errors.bio && <p className="error-text">{errors.bio}</p>}
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">Services & Experience</h2>
              
              <div className="input-group">
                <label className="input-label">
                  Select Services and Add Experience*
                </label>
                
                <div className="service-selection">
                  <select
                    className="service-dropdown"
                    onChange={handleServiceSelect}
                    value=""
                  >
                    <option value="">Select a service</option>
                    {availableServices
                      .filter(service => !formData.services.some(s => s.id === service.id))
                      .map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="selected-services">
                  {formData.services.map(service => (
                    <div key={service.id} className="service-item">
                      <div className="service-info">
                        <span>{service.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeService(service.id)}
                          className="remove-service"
                        >
                          <FiX />
                        </button>
                      </div>
                      <div className="service-experience">
                        <label>Years of Experience:</label>
                        <input
                          type="number"
                          value={service.pivot.experience}
                          onChange={(e) => handleServiceExperienceChange(service.id, e.target.value)}
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {errors.services && <p className="error-text">{errors.services}</p>}
              </div>
            </div>
          </>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={classNames("submit-button", { "disabled-button": isSubmitting })}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Updating...
              </>
            ) : 'Update User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEdit;
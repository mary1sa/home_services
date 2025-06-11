import React, { useState, useMemo, useEffect } from 'react';
import axiosInstance from '../../../config/axiosInstance';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import classNames from 'classnames';
import { FiUpload, FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiCalendar, FiX } from 'react-icons/fi';

import "./Form.css"

const CreateUser = () => {
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
    services: []
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
  const [availableServices, setAvailableServices] = useState([]);

  const countries = useMemo(() => countryList().getData(), []);

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get('/services');
        setAvailableServices(response.data);
      } catch (err) {
        console.error('Failed to fetch services', err);
      }
    };
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    // Validate services if role is tasker
    if (formData.role === 'tasker' && formData.services.length === 0) {
      setErrors(prev => ({
        ...prev,
        services: ['Please select at least one service']
      }));
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    
    // Add all basic fields
    for (const key in formData) {
      if (key !== 'services' && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    }
    
    // Add files
    for (const key in files) {
      if (files[key]) {
        data.append(key, files[key]);
      }
    }

    // Add services with experience if role is tasker
    if (formData.role === 'tasker') {
      formData.services.forEach((service, index) => {
        data.append(`services[${index}][id]`, service.id);
        data.append(`services[${index}][experience]`, service.experience);
      });
    }

    try {
      const response = await axiosInstance.post('/users', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        navigate('/admin/users');
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error('Error creating user:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCountryOption = countries.find(c => c.label === formData.country) || null;

  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="form-title">Create New User</h1>
        <p className="form-subtitle">Fill in the details below to create a new user account</p>
      </div>
   
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
                id="first_name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`input-field ${errors.first_name ? 'input-error' : ''}`}
                placeholder="Enter first name"
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
                id="last_name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`input-field ${errors.last_name ? 'input-error' : ''}`}
                placeholder="Enter last name"
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
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? 'input-error' : ''}`}
              placeholder="Enter email address"
              required
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">
              <FiLock className="input-icon" />
              Password*
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`input-field ${errors.password ? 'input-error' : ''}`}
              placeholder="Create a password"
              required
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div className="input-group">
            <label className="input-label">
              <FiPhone className="input-icon" />
              Phone*
            </label>
            <PhoneInput
              country={'ma'}
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
              placeholder="Enter phone number"
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="address">
              <FiMapPin className="input-icon" />
              Address
            </label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter street address"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="role">
              Role*
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="user">User</option>
              <option value="tasker">Tasker</option>
              <option value="admin">Admin</option>
            </select>
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
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`input-field ${errors.city ? 'input-error' : ''}`}
                    placeholder="Enter city"
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
                  id="certificate_police_date"
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
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="input-field"
                  rows="4"
                  placeholder="Tell us about yourself and your skills..."
                />
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
                          value={service.experience}
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
                Creating...
              </>
            ) : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;
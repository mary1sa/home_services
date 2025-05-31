import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiPlus } from 'react-icons/fi';
import classNames from 'classnames';

const ServiceCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: ''
  });
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      
     
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category_id', formData.category_id);
    data.append('price', formData.price);
    if (formData.description) data.append('description', formData.description);
    if (image) data.append('image', image);

    try {
      const response = await axiosInstance.post('/services', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        navigate('/admin/services');
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error('Error creating service:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="form-title">Create New Service</h1>
        <p className="form-subtitle">Add a new service to your platform</p>
      </div>
      
      <form onSubmit={handleSubmit} className="service-form">
        <div className="form-section">
          <div className="input-group">
            <label className="input-label" htmlFor="name">
              Service Name*
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'input-error' : ''}`}
              placeholder="Enter service name"
              required
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="category_id">
              Category*
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={`input-field ${errors.category_id ? 'input-error' : ''}`}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="error-text">{errors.category_id}</p>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="price">
              Price*
            </label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`input-field ${errors.price ? 'input-error' : ''}`}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
            {errors.price && <p className="error-text">{errors.price}</p>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="Describe this service..."
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              Service Image
            </label>
            <div className="image-upload-wrapper">
              <label htmlFor="image" className="image-upload-label">
                <div className="image-upload-box">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Service preview" className="image-preview-img" />
                    </div>
                  ) : (
                    <div className="image-upload-placeholder">
                      <FiUpload className="upload-icon" />
                      <span>Upload Service Image</span>
                      <p className="image-upload-hint">JPG, PNG (max 2MB)</p>
                    </div>
                  )}
                </div>
                <input
                  id="image"
                  type="file"
                  name="image"
                  onChange={handleImageChange}
                  className="file-input"
                  accept="image/jpeg,image/png"
                />
              </label>
            </div>
            {errors.image && <p className="error-text">{errors.image}</p>}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/services')}
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
            ) : (
              <>
                <FiPlus className="button-icon" />
                Create Service
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceCreate;
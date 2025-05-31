import React, { useState } from 'react';
import axiosInstance from '../../../config/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiPlus } from 'react-icons/fi';
import classNames from 'classnames';
import './CategoryForm.css';

const CategoryCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (formData.description) data.append('description', formData.description);
    if (image) data.append('image', image);

    try {
      const response = await axiosInstance.post('/categories', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        navigate('/admin/categorys');
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error('Error creating category:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="form-title">Create New Category</h1>
        <p className="form-subtitle">Add a new service category to your platform</p>
      </div>
      
      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-section">
          <div className="input-group">
            <label className="input-label" htmlFor="name">
              Category Name*
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'input-error' : ''}`}
              placeholder="Enter category name"
              required
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
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
              placeholder="Describe this category..."
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              Category Image
            </label>
            <div className="image-upload-wrapper">
              <label htmlFor="image" className="image-upload-label">
                <div className="image-upload-box">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Category preview" className="image-preview-img" />
                    </div>
                  ) : (
                    <div className="image-upload-placeholder">
                      <FiUpload className="upload-icon" />
                      <span>Upload Category Image</span>
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
            onClick={() => navigate('/admin/categories')}
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
                Create Category
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryCreate;
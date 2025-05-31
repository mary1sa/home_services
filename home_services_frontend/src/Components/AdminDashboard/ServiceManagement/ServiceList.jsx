import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import {
  FiEye, FiEdit2, FiTrash2, FiPlus, FiCheck, FiCheckSquare, FiSearch,
  FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiX
} from 'react-icons/fi';
import "./ShowModel.css"
import Loading from '../../common/Loading';
import DeleteConfirmation from '../../common/DeleteConfirmation';
import SuccessAlert from '../../common/alerts/SuccessAlert';
import ErrorAlert from '../../common/alerts/ErrorAlert';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [servicesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Show modal state
  const [showModal, setShowModal] = useState(false);
  const [currentService, setCurrentService] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosInstance.get('/services');
        setServices(response.data);
        setFilteredServices(response.data);
        setTotalPages(Math.ceil(response.data.length / servicesPerPage));
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch services');
        setLoading(false);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchServices();
  }, [navigate, servicesPerPage]);

  useEffect(() => {
    const results = services.filter(service => {
      return searchTerm === '' || 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (service.category && service.category.name.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    
    setFilteredServices(results);
    setTotalPages(Math.ceil(results.length / servicesPerPage));
    setCurrentPage(1); 
  }, [searchTerm, services, servicesPerPage]);

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedServices([]);
    } else {
      setSelectedServices(currentServices.map(service => service.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleServiceSelection = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const confirmSingleDelete = (serviceId) => {
    setDeleteTarget(serviceId);
    setIsBulkDelete(false);
    setShowDeleteModal(true);
  };

  const confirmBulkDelete = () => {
    if (selectedServices.length === 0) return;
    setIsBulkDelete(true);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    try {
      if (isBulkDelete) {
        await Promise.all(
          selectedServices.map(serviceId => 
            axiosInstance.delete(`/services/${serviceId}`)
          )
        );
        const updated = services.filter(service => !selectedServices.includes(service.id));
        setServices(updated);
        setFilteredServices(updated);
        setSelectedServices([]);
        setSelectAll(false);
        setSuccessMessage(`${selectedServices.length} service(s) deleted successfully.`);
      } else {
        await axiosInstance.delete(`/services/${deleteTarget}`);
        const updated = services.filter(service => service.id !== deleteTarget);
        setServices(updated);
        setFilteredServices(updated);
        setSelectedServices(selectedServices.filter(id => id !== deleteTarget));
        setSuccessMessage('Service deleted successfully.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete service(s)';
      setErrorMessage(errMsg);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const openShowModal = (service) => {
    setCurrentService(service);
    setShowModal(true);
  };

  const closeShowModal = () => {
    setShowModal(false);
    setCurrentService(null);
  };

  const truncateDescription = (description, length = 20) => {
    if (!description) return 'No description';
    return description.length > length 
      ? `${description.substring(0, length)}...` 
      : description;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToFirstPage = () => paginate(1);
  const goToLastPage = () => paginate(totalPages);
  const goToNextPage = () => currentPage < totalPages && paginate(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && paginate(currentPage - 1);

  if (loading) return <Loading />;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-list-container">
      {/* Alerts */}
      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
      <ErrorAlert
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />

      <div className="header-section">
        <h1>Service Management</h1>
        <Link to="create" className="create-user-btn">
          <FiPlus className="icon" /> Create New Service
        </Link>
      </div>
      
      <div className="search-filters-container">
        <div className="search-filters">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        {selectedServices.length > 0 && (
          <button 
            onClick={confirmBulkDelete}
            className="bulk-delete-btn"
          >
            <FiTrash2 className="icon" /> Delete Selected ({selectedServices.length})
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <label className="select-all-checkbox">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                  <FiCheckSquare className="checkbox-icon" />
                </label>
              </th>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentServices.length > 0 ? (
              currentServices.map((service) => (
                <tr key={service.id} className={selectedServices.includes(service.id) ? 'selected-row' : ''}>
                  <td>
                    <label className="service-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => toggleServiceSelection(service.id)}
                      />
                      <FiCheck className="checkbox-icon" />
                    </label>
                  </td>
                  <td data-label="ID">#{service.id}</td>
                  <td data-label="Image">
                    <div className="profile-image-container">
                      <img
                        src={
                          service.image
                            ? `http://localhost:8000/storage/${service.image}`
                            :  '/anony.jpg'
                        }
                        alt={service.name}
                        className="profile-image"
                      />
                    </div>
                  </td>
                  <td data-label="Name">{service.name}</td>
                  <td data-label="Category">{service.category?.name || 'Uncategorized'}</td>
                  <td data-label="Price">{formatPrice(service.price)}</td>
                  <td data-label="Description">
                    <div 
                      className="description-tooltip" 
                      title={service.description || 'No description'}
                    >
                      {truncateDescription(service.description)}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openShowModal(service)}
                        className="action-btn view-btn"
                        title="View"
                      >
                        <FiEye className="icon" />
                      </button>
                      <Link 
                        to={`/admin/service/${service.id}`} 
                        className="action-btn edit-btn"
                        title="Edit"
                      >
                        <FiEdit2 className="icon" />
                      </Link>
                      <button
                        onClick={() => confirmSingleDelete(service.id)}
                        className="action-btn delete-btn"
                        title="Delete"
                      >
                        <FiTrash2 className="icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-services">
                  No services found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Show Modal */}
      <div className={`show-modal-overlay ${showModal ? 'show-modal-active' : ''}`}>
        <div className="show-modal-content">
          <div className="show-modal-header">
            <h2>{currentService?.name || 'Service Details'}</h2>
            <button 
              onClick={closeShowModal}
              className="show-modal-close"
            >
              <FiX />
            </button>
          </div>
          
          <div className="show-modal-body">
            {currentService && (
              <div className="show-modal-service-details">
                <div className="show-modal-image-container">
                  <img
                    src={
                      currentService.image
                        ? `http://localhost:8000/storage/${currentService.image}`
                         : '/anony.jpg'
                    }
                    alt={currentService.name}
                    className="show-modal-image"
                  />
                </div>
                <div className="show-modal-info">
                  <p><strong>ID:</strong> #{currentService.id}</p>
                  <p><strong>Category:</strong> {currentService.category?.name || 'Uncategorized'}</p>
                  <p><strong>Price:</strong> {formatPrice(currentService.price)}</p>
                  <p><strong>Description:</strong></p>
                  <p className="show-modal-description">
                    {currentService.description || 'No description available'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="show-modal-footer">
            <button 
              onClick={closeShowModal}
              className="show-modal-button show-modal-close-btn"
            >
              Close
            </button>
            {currentService && (
              <Link 
                to={`/admin/service/${currentService.id}`}
                className="show-modal-button show-modal-edit-btn"
                onClick={closeShowModal}
              >
                Edit Service
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {filteredServices.length > servicesPerPage && (
        <div className="pagination-container">
          <nav className="pagination" aria-label="Pagination">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="pagination-button pagination-edge"
              aria-label="First page"
            >
              &laquo;
            </button>
            
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="pagination-button"
              aria-label="Previous page"
            >
              &lsaquo;
            </button>

            <div className="pagination-numbers">
              {currentPage > 2 && (
                <button 
                  onClick={() => paginate(1)}
                  className={`pagination-number ${currentPage === 1 ? 'active' : ''}`}
                >
                  1
                </button>
              )}
              
              {currentPage > 3 && (
                <span className="pagination-ellipsis">&hellip;</span>
              )}
              
              {currentPage > 1 && (
                <button 
                  onClick={() => paginate(currentPage - 1)}
                  className="pagination-number"
                >
                  {currentPage - 1}
                </button>
              )}
              
              <button className="pagination-number active" aria-current="page">
                {currentPage}
              </button>
              
              {currentPage < totalPages && (
                <button 
                  onClick={() => paginate(currentPage + 1)}
                  className="pagination-number"
                >
                  {currentPage + 1}
                </button>
              )}
              
              {currentPage < totalPages - 2 && (
                <span className="pagination-ellipsis">&hellip;</span>
              )}
              
              {currentPage < totalPages - 1 && (
                <button 
                  onClick={() => paginate(totalPages)}
                  className={`pagination-number ${currentPage === totalPages ? 'active' : ''}`}
                >
                  {totalPages}
                </button>
              )}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="pagination-button"
              aria-label="Next page"
            >
              &rsaquo;
            </button>
            
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="pagination-button pagination-edge"
              aria-label="Last page"
            >
              &raquo;
            </button>
          </nav>
        </div>
      )}

      <DeleteConfirmation
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={isBulkDelete ? `${selectedServices.length} services` : 'this service'}
      />
    </div>
  );
};

export default ServiceList;
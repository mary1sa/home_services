import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import {
  FiEye, FiEdit2, FiTrash2, FiUserPlus, FiCheck, FiCheckSquare, FiSearch,
  FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight,
  FiArrowRight,
  FiArrowLeft
} from 'react-icons/fi';

import Loading from '../../common/Loading';
import DeleteConfirmation from '../../common/DeleteConfirmation';
import SuccessAlert from '../../common/alerts/SuccessAlert';
import ErrorAlert from '../../common/alerts/ErrorAlert';

const TaskerList = () => {
  const [taskers, setTaskers] = useState([]);
  const [filteredTaskers, setFilteredTaskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTaskers, setSelectedTaskers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineStatusFilter, setOnlineStatusFilter] = useState('all');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [uniqueCities, setUniqueCities] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [taskersPerPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTaskers = async () => {
      try {
        const response = await axiosInstance.get('/taskers');
        const validTaskers = response.data.filter(tasker => tasker.user !== null);
        setTaskers(validTaskers);
        
        const cities = [...new Set(validTaskers
          .map(tasker => tasker.city)
          .filter(city => city !== null)
        )];
        setUniqueCities(cities);
        setFilteredTaskers(validTaskers);
        setTotalPages(Math.ceil(validTaskers.length / taskersPerPage));
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch taskers');
        setLoading(false);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchTaskers();
  }, [navigate, taskersPerPage]);

  useEffect(() => {
    const results = taskers.filter(tasker => {
      if (!tasker.user) return false;
      
      const matchesSearch = searchTerm === '' || 
        (tasker.user.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tasker.user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tasker.user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tasker.city?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesOnlineStatus = onlineStatusFilter === 'all' || 
        (onlineStatusFilter === 'online' && tasker.user.is_online) || 
        (onlineStatusFilter === 'offline' && !tasker.user.is_online);
      
      const matchesApprovalStatus = approvalStatusFilter === 'all' || 
        (tasker.status?.toLowerCase() === approvalStatusFilter.toLowerCase());
      
      const matchesCity = cityFilter === 'all' || 
        (tasker.city?.toLowerCase() === cityFilter.toLowerCase());

      return matchesSearch && matchesOnlineStatus && matchesApprovalStatus && matchesCity;
    });
    
    setFilteredTaskers(results);
    setTotalPages(Math.ceil(results.length / taskersPerPage));
    setCurrentPage(1); 
  }, [searchTerm, onlineStatusFilter, approvalStatusFilter, taskers, cityFilter, taskersPerPage]);

 
  const indexOfLastTasker = currentPage * taskersPerPage;
  const indexOfFirstTasker = indexOfLastTasker - taskersPerPage;
  const currentTaskers = filteredTaskers.slice(indexOfFirstTasker, indexOfLastTasker);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTaskers([]);
    } else {
      setSelectedTaskers(currentTaskers.map(tasker => tasker.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleTaskerSelection = (taskerId) => {
    if (selectedTaskers.includes(taskerId)) {
      setSelectedTaskers(selectedTaskers.filter(id => id !== taskerId));
    } else {
      setSelectedTaskers([...selectedTaskers, taskerId]);
    }
  };

  const confirmSingleDelete = (taskerId) => {
    setDeleteTarget(taskerId);
    setIsBulkDelete(false);
    setShowDeleteModal(true);
  };

  const confirmBulkDelete = () => {
    setIsBulkDelete(true);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    if (isBulkDelete) {
      try {
        await Promise.all(
          selectedTaskers.map(taskerId => axiosInstance.delete(`/taskers/${taskerId}`))
        );
        const updated = taskers.filter(tasker => !selectedTaskers.includes(tasker.id));
        setTaskers(updated);
        setFilteredTaskers(updated);
        setSelectedTaskers([]);
        setSelectAll(false);
        setSuccessMessage(`${selectedTaskers.length} tasker(s) deleted successfully.`);
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to delete taskers';
        setErrorMessage(errMsg);
      }
    } else {
      try {
        await axiosInstance.delete(`/taskers/${deleteTarget}`);
        const updated = taskers.filter(tasker => tasker.id !== deleteTarget);
        setTaskers(updated);
        setFilteredTaskers(updated);
        setSelectedTaskers(selectedTaskers.filter(id => id !== deleteTarget));
        setSuccessMessage('Tasker deleted successfully.');
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to delete tasker';
        setErrorMessage(errMsg);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    }
  };


  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToFirstPage = () => paginate(1);
  const goToLastPage = () => paginate(totalPages);
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      paginate(currentPage + 1);
    }
  };
  const goToPrevPage = () => {
    if (currentPage > 1) {
      paginate(currentPage - 1);
    }
  };

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
        <h1>Tasker Management</h1>
        <Link to="create" className="create-user-btn">
          <FiUserPlus className="icon" /> Create New Tasker
        </Link>
      </div>
      
      <div className="search-filters-container">
        <div className="search-filters">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search taskers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={onlineStatusFilter}
              onChange={(e) => setOnlineStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Online Statuses</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select
              value={approvalStatusFilter}
              onChange={(e) => setApprovalStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Approval Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        {selectedTaskers.length > 0 && (
          <button 
            onClick={confirmBulkDelete}
            className="bulk-delete-btn"
          >
            <FiTrash2 className="icon" /> Delete Selected ({selectedTaskers.length})
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
              <th>Profile</th>
              <th>Email</th>
              <th>City</th>
              <th>Status</th>
              <th>Is Online</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTaskers.length > 0 ? (
              currentTaskers.map((tasker) => (
                <tr key={tasker.id} className={selectedTaskers.includes(tasker.id) ? 'selected-row' : ''}>
                  <td>
                    <label className="user-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedTaskers.includes(tasker.id)}
                        onChange={() => toggleTaskerSelection(tasker.id)}
                      />
                      <FiCheck className="checkbox-icon" />
                    </label>
                  </td>
                  <td data-label="ID">
                    <div className="profile-image-container">
                      <img
                        src={
                          tasker.photo
                            ? `http://localhost:8000/storage/${tasker.photo}`
                            : '/anony.jpg'
                        }
                        alt={`${tasker.user?.first_name || 'Unknown'} ${tasker.user?.last_name || 'User'}`}
                        className="profile-image"
                      />
                      <div className="user-info">
                        <div className="name-container">
                          <span className="user-name">
                            {tasker.user?.first_name || 'Unknown'} {tasker.user?.last_name || 'User'}
                          </span>
                        </div>
                        <span className="user-id">ID: #{tasker.id}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td data-label="Email">{tasker.user?.email || 'No email'}</td>
                  <td data-label="City">{tasker.city || 'Unknown'}</td>
                  <td data-label="Status">
                    <span className={`status-badge ${tasker.status?.toLowerCase() || 'unknown'}`}>
                      {tasker.status || 'Unknown'}
                    </span>
                  </td>
                  <td data-label="Status" className="capitalize">
                    <span className={`status ${tasker.user?.is_online ? 'online' : 'offline'}`}>
                      {tasker.user?.is_online ? 'online' : 'offline'}
                    </span>
                  </td>
                  
                  <td>
                    <div className="action-buttons">
                      <Link 
                        to={`${tasker.id}`} 
                        className="action-btn view-btn"
                        title="View"
                      >
                        <FiEye className="icon" />
                      </Link>
                      <Link 
                        to={`${tasker.id}/edit`} 
                        className="action-btn edit-btn"
                        title="Edit"
                      >
                        <FiEdit2 className="icon" />
                      </Link>
                      <button
                        onClick={() => confirmSingleDelete(tasker.id)}
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
                <td colSpan="7" className="no-users">
                  No taskers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredTaskers.length > taskersPerPage && (
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
        itemName={isBulkDelete ? `${selectedTaskers.length} taskers` : 'this tasker'}
      />
    </div>
  );
};

export default TaskerList;
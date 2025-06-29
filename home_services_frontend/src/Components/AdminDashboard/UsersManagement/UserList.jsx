import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import {
  FiEye, FiEdit2, FiTrash2, FiUserPlus, FiCheck, FiCheckSquare, FiSearch,
  FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight,
  FiArrowRight,
  FiArrowLeft
} from 'react-icons/fi';
import './UserList.css';
import Loading from '../../common/Loading';
import DeleteConfirmation from '../../common/DeleteConfirmation';
import SuccessAlert from '../../common/alerts/SuccessAlert';
import ErrorAlert from '../../common/alerts/ErrorAlert';    

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  
  const [currentPage, setCurrentPage] = useState(4);
  const [usersPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const [successMessage, setSuccessMessage] = useState(null); 
  const [errorMessage, setErrorMessage] = useState(null);     

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const response = await axiosInstance.get('/users');
        setCurrentUser(response.data);
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/users');
        setUsers(response.data);
        setFilteredUsers(response.data);
        setTotalPages(Math.ceil(response.data.length / usersPerPage));
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchUsers();
  }, [navigate, usersPerPage]);

  useEffect(() => {
    const results = users.filter(user => {
      const matchesSearch = searchTerm === '' ||
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'online' && user.is_online) ||
        (statusFilter === 'offline' && !user.is_online);

      return matchesSearch && matchesRole && matchesStatus;
    });

    setFilteredUsers(results);
    setTotalPages(Math.ceil(results.length / usersPerPage));
    setCurrentPage(1); 
  }, [searchTerm, roleFilter, statusFilter, users, usersPerPage]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const confirmSingleDelete = (userId) => {
    setDeleteTarget(userId);
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
          selectedUsers.map(userId => axiosInstance.delete(`users/${userId}`))
        );
        const updated = users.filter(user => !selectedUsers.includes(user.id));
        setUsers(updated);
        setFilteredUsers(updated);
        setSelectedUsers([]);
        setSelectAll(false);
        setSuccessMessage(`${selectedUsers.length} user(s) deleted successfully.`);
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to delete users';
        setErrorMessage(errMsg);
      }
    } else {
      try {
        await axiosInstance.delete(`users/${deleteTarget}`);
        const updated = users.filter(user => user.id !== deleteTarget);
        setUsers(updated);
        setFilteredUsers(updated);
        setSelectedUsers(selectedUsers.filter(id => id !== deleteTarget));
        setSuccessMessage('User deleted successfully.');
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to delete user';
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

  const uniqueRoles = [...new Set(users.map(user => user.role))];

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
        <h1>User Management</h1>
        <Link to="/admin/users/create" className="create-user-btn">
          <FiUserPlus className="icon" /> Create New User
        </Link>
      </div>

      <div className="search-filters-container">
        <div className="search-filters">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <button onClick={confirmBulkDelete} className="bulk-delete-btn">
            <FiTrash2 className="icon" /> Delete Selected ({selectedUsers.length})
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
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.id} className={selectedUsers.includes(user.id) ? 'selected-row' : ''}>
                  <td>
                    <label className="user-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                      <FiCheck className="checkbox-icon" />
                    </label>
                  </td>
                  <td data-label="ID">
                    <div className="profile-image-container">
                      <img
                        src={
                         user.photo
                            ? `http://localhost:8000/storage/${user.photo}`
                            : '/anony.jpg'
                        }
                        alt={`${user.first_name || 'Unknown'} ${user?.last_name || 'User'}`}
                        className="profile-image"
                      />
                      <div className="user-info">
                        <div className="name-container">
                          <span className="user-name">
                            {user?.first_name || 'Unknown'} {user?.last_name || 'User'}
                          </span>
                        </div>
                        <span className="user-id">ID: #{user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>{user.email}</td>
                  <td className="capitalize">{user.role}</td>
                  <td className="capitalize">
                    <span className={`status ${user.is_online ? 'online' : 'offline'}`}>
                      {user.is_online ? 'online' : 'offline'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`${user.id}`} className="action-btn view-btn" title="View">
                        <FiEye className="icon" />
                      </Link>
                      <Link to={`${user.id}/edit`} className="action-btn edit-btn" title="Edit">
                        <FiEdit2 className="icon" />
                      </Link>
                      <button
                        onClick={() => confirmSingleDelete(user.id)}
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
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
{filteredUsers.length > usersPerPage && (
  <div className="pagination-container">
    <nav className="pagination" aria-label="Pagination">
 
      <button
        onClick={() => paginate(1)}
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
        onClick={() => paginate(totalPages)}
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
        itemName={isBulkDelete ? `${selectedUsers.length} users` : 'this user'}
      />
    </div>
  );
};

export default UserList;
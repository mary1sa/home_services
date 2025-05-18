import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import { FiEye, FiEdit2, FiTrash2, FiUserPlus, FiCheck, FiCheckSquare, FiSearch } from 'react-icons/fi';
import './UserList.css';

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
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const response = await axiosInstance.get('/user');
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
  }, [navigate]);

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
  }, [searchTerm, roleFilter, statusFilter, users]);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
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

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/users/${userId}`);
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        setSelectedUsers(selectedUsers.filter(id => id !== userId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected users?`)) {
      try {
        await Promise.all(
          selectedUsers.map(userId => 
            axiosInstance.delete(`/users/${userId}`)
          )
        );
        const updatedUsers = users.filter(user => !selectedUsers.includes(user.id));
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        setSelectedUsers([]);
        setSelectAll(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete users');
      }
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // const isAdmin = currentUser?.role === 'admin';
  const uniqueRoles = [...new Set(users.map(user => user.role))];

  return (
    <div className="user-list-container">
      <h1>User Management</h1>
      
      <div className="search-and-create">
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
        
        <div className="action-bar">
          
            <Link to="/users/create" className="create-user-btn">
              <FiUserPlus className="icon" /> Create New User
            </Link>
         
          
          {selectedUsers.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="bulk-delete-btn"
            >
              <FiTrash2 className="icon" /> Delete Selected ({selectedUsers.length})
            </button>
          )}
        </div>
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
            {filteredUsers.map((user) => (
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
                <td data-label="ID">{user.id}</td>
<td data-label="Name">{user.first_name} {user.last_name}</td>
<td data-label="Email">{user.email}</td>
                <td data-label="Role" className="capitalize">{user.role}</td>
                <td data-label="Status" className="capitalize">
                  <span  className={`status ${user.is_online ? 'online' : 'offline'}`}>
                    {user.is_online ? 'online' : 'offline'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <Link 
                      to={`${user.id}`} 
                      className="action-btn view-btn"
                      title="View"
                    >
                      <FiEye className="icon" />
                    </Link>
                   
                      <>
                        <Link 
                          to={`${user.id}/edit`} 
                          className="action-btn edit-btn"
                          title="Edit"
                        >
                          <FiEdit2 className="icon" />
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="action-btn delete-btn"
                          title="Delete"
                        >
                          <FiTrash2 className="icon" />
                        </button>
                      </>
                  
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axiosInstance';
import { FiEye, FiEdit2, FiTrash2, FiUserPlus, FiCheck, FiCheckSquare, FiSearch } from 'react-icons/fi';
import Loading from '../../common/Loading';
// import './UserList.css'; 

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTaskers = async () => {
      try {
        const response = await axiosInstance.get('/taskers');
        setTaskers(response.data);
        const cities = [...new Set(response.data.map(tasker => tasker.city))];
setUniqueCities(cities);
        setFilteredTaskers(response.data);
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
  }, [navigate]);

  useEffect(() => {
    const results = taskers.filter(tasker => {
      // Search term matching
      const matchesSearch = searchTerm === '' || 
        tasker.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tasker.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tasker.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tasker.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Online status matching
      const matchesOnlineStatus = onlineStatusFilter === 'all' || 
        (onlineStatusFilter === 'online' && tasker.user.is_online) || 
        (onlineStatusFilter === 'offline' && !tasker.user.is_online);
      
      // Approval status matching
      const matchesApprovalStatus = approvalStatusFilter === 'all' || 
        tasker.status.toLowerCase() === approvalStatusFilter.toLowerCase();
      
const matchesCity = cityFilter === 'all' || 
  tasker.city.toLowerCase() === cityFilter.toLowerCase();

return matchesSearch && matchesOnlineStatus && matchesApprovalStatus && matchesCity;    });
    
    setFilteredTaskers(results);
  }, [searchTerm, onlineStatusFilter, approvalStatusFilter, taskers,cityFilter]);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTaskers([]);
    } else {
      setSelectedTaskers(filteredTaskers.map(tasker => tasker.id));
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

  const handleDelete = async (taskerId) => {
    if (window.confirm('Are you sure you want to delete this tasker?')) {
      try {
        await axiosInstance.delete(`/taskers/${taskerId}`);
        const updatedTaskers = taskers.filter(tasker => tasker.id !== taskerId);
        setTaskers(updatedTaskers);
        setFilteredTaskers(updatedTaskers);
        setSelectedTaskers(selectedTaskers.filter(id => id !== taskerId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete tasker');
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTaskers.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedTaskers.length} selected taskers?`)) {
      try {
        await Promise.all(
          selectedTaskers.map(taskerId => 
            axiosInstance.delete(`/taskers/${taskerId}`)
          )
        );
        const updatedTaskers = taskers.filter(tasker => !selectedTaskers.includes(tasker.id));
        setTaskers(updatedTaskers);
        setFilteredTaskers(updatedTaskers);
        setSelectedTaskers([]);
        setSelectAll(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete taskers');
      }
    }
  };

  if (loading) return <Loading/>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-list-container">
      
        <div className="header-section">
<h1>Tasker Management</h1>
          <Link to="/taskers/create" className="create-user-btn">
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
              onClick={handleBulkDelete}
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
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>City</th>
              <th>Status</th>
              <th>Is Online</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTaskers.map((tasker) => (
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
                <td data-label="ID"><div className="profile-image-container">
    <img
      src={
       tasker.photo
          ? `http://localhost:8000/storage/${tasker.photo}`
          : '/anony.jpg'
      }
      alt={`${tasker.first_name} ${tasker.last_name}`}
      className="profile-image"
    />
    <div className="user-info">
      <div className="name-container">
        <span className="user-name">
{tasker.user.first_name} {tasker.user.last_name}        </span>
      </div>
      <span className="user-id">ID: #{tasker.id}</span>
    </div>
  </div></td>
                <td data-label="Name">{tasker.user.first_name} {tasker.user.last_name}</td>
                <td data-label="Email">{tasker.user.email}</td>
                <td data-label="City">{tasker.city}</td>
                <td data-label="Status">
                  <span className={`status-badge ${tasker.status.toLowerCase()}`}>
                    {tasker.status}
                  </span>
                </td>
                <td data-label="Status" className="capitalize">
                  <span className={`status ${tasker.user.is_online ? 'online' : 'offline'}`}>
                    {tasker.user.is_online ? 'online' : 'offline'}
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
                      onClick={() => handleDelete(tasker.id)}
                      className="action-btn delete-btn"
                      title="Delete"
                    >
                      <FiTrash2 className="icon" />
                    </button>
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

export default TaskerList;
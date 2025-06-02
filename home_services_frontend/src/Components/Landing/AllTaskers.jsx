import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axiosInstance from '../../config/axiosInstance';
import { FaThumbsUp, FaThumbsDown, FaHeart, FaRegHeart } from 'react-icons/fa';

const AllTaskers = () => {
  const navigate = useNavigate();
  const [taskers, setTaskers] = useState([]);
  const [filteredTaskers, setFilteredTaskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likesData, setLikesData] = useState({});
  const [panierItems, setPanierItems] = useState([]);
  const [services, setServices] = useState([]);
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState({
    service: '',
    city: ''
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch panier items
        const panierResponse = await axiosInstance.get('/paniers');
        setPanierItems(panierResponse.data.map(item => item.tasker_id));

        // Fetch all taskers
        const taskersResponse = await axiosInstance.get('/taskers');
        setTaskers(taskersResponse.data);
        setFilteredTaskers(taskersResponse.data);

        // Fetch likes for each tasker
        const likesPromises = taskersResponse.data.map(tasker => 
          fetchTaskerLikes(tasker.id)
        );
        const likesResults = await Promise.all(likesPromises);
        
        const initialLikesData = {};
        taskersResponse.data.forEach((tasker, index) => {
          initialLikesData[tasker.id] = likesResults[index];
        });
        setLikesData(initialLikesData);

        // Fetch services
        const servicesResponse = await axiosInstance.get('/services');
        setServices(servicesResponse.data);

        // Fetch cities
        const citiesResponse = await axiosInstance.get('/cities');
        setCities(citiesResponse.data);

      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    let result = [...taskers];
    
    if (filters.service) {
      result = result.filter(tasker => 
        tasker.services.some(service => service.id.toString() === filters.service)
      );
    }
    
    if (filters.city) {
      result = result.filter(tasker => 
        tasker.city.toLowerCase() === filters.city.toLowerCase()
      );
    }
    
    setFilteredTaskers(result);
  }, [filters, taskers]);

  const fetchTaskerLikes = async (taskerId) => {
    try {
      const response = await axiosInstance.get(`/taskers/${taskerId}/likes`);
      return {
        likes: response.data.likes_count,
        dislikes: response.data.dislikes_count,
        userLike: response.data.user_like
      };
    } catch (error) {
      console.error(`Error fetching likes for tasker ${taskerId}:`, error);
      return {
        likes: 0,
        dislikes: 0,
        userLike: null
      };
    }
  };

  const handleLike = async (taskerId, isLike) => {
    try {
      const current = likesData[taskerId] || { likes: 0, dislikes: 0, userLike: null };
      const isSameVote = current.userLike?.is_like === isLike;
      
      setLikesData(prev => {
        const newData = { ...prev };
        const current = newData[taskerId] || { likes: 0, dislikes: 0, userLike: null };
        
        if (isSameVote) {
          newData[taskerId] = {
            ...current,
            likes: isLike ? current.likes - 1 : current.likes,
            dislikes: isLike ? current.dislikes : current.dislikes - 1,
            userLike: null
          };
        } else {
          const wasOppositeVote = current.userLike?.is_like === !isLike;
          
          newData[taskerId] = {
            ...current,
            likes: isLike 
              ? (wasOppositeVote ? current.likes + 1 : current.likes + 1)
              : (wasOppositeVote ? current.likes - 1 : current.likes),
            dislikes: isLike 
              ? (wasOppositeVote ? current.dislikes - 1 : current.dislikes)
              : (wasOppositeVote ? current.dislikes + 1 : current.dislikes + 1),
            userLike: isSameVote ? null : { is_like: isLike }
          };
        }
        
        return newData;
      });

      await axiosInstance.post(`/taskers/${taskerId}/like`, {
        is_like: isSameVote ? null : isLike
      });
      
      const updatedLikes = await fetchTaskerLikes(taskerId);
      setLikesData(prev => ({
        ...prev,
        [taskerId]: updatedLikes
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      const originalLikes = await fetchTaskerLikes(taskerId);
      setLikesData(prev => ({
        ...prev,
        [taskerId]: originalLikes
      }));
    }
  };

  const togglePanier = async (taskerId) => {
    try {
      const isInPanier = panierItems.includes(taskerId);
      
      if (isInPanier) {
        await axiosInstance.delete(`/paniers/${taskerId}`);
        setPanierItems(prev => prev.filter(id => id !== taskerId));
      } else {
        await axiosInstance.post('/paniers', { tasker_id: taskerId });
        setPanierItems(prev => [...prev, taskerId]);
      }
    } catch (error) {
      console.error('Error updating panier:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      service: '',
      city: ''
    });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="taskers-list-page">
      <h1>All Available Taskers</h1>

      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="service">Filter by Service:</label>
          <select 
            id="service" 
            name="service" 
            value={filters.service}
            onChange={handleFilterChange}
          >
            <option value="">All Services</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="city">Filter by City:</label>
          <select 
            id="city" 
            name="city" 
            value={filters.city}
            onChange={handleFilterChange}
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={clearFilters}
          className="clear-filters-btn"
        >
          Clear Filters
        </button>
      </div>

      <div className="results-count">
        {filteredTaskers.length} taskers found
      </div>

      {filteredTaskers.length > 0 ? (
        <div className="taskers-container">
          <Swiper
            modules={[Navigation, Pagination]}
            slidesPerView={1}
            spaceBetween={20}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
          >
            {filteredTaskers.map((tasker) => {
              const taskerLikes = likesData[tasker.id] || { likes: 0, dislikes: 0, userLike: null };
              const isLiked = taskerLikes.userLike?.is_like === true;
              const isDisliked = taskerLikes.userLike?.is_like === false;
              const isInPanier = panierItems.includes(tasker.id);
              
              return (
                <SwiperSlide key={tasker.id}>
                  <div className="tasker-card">
                    <div className="card-header">
                      {tasker.photo && (
                        <img
                          src={`${process.env.REACT_APP_API_URL}/storage/${tasker.photo}`}
                          alt={`${tasker.user?.first_name} ${tasker.user?.last_name}`}
                          className="tasker-image"
                        />
                      )}
                      <button 
                        onClick={() => togglePanier(tasker.id)}
                        className="panier-heart"
                        aria-label={isInPanier ? "Remove from panier" : "Add to panier"}
                      >
                        {isInPanier ? (
                          <FaHeart className="heart-icon filled" />
                        ) : (
                          <FaRegHeart className="heart-icon" />
                        )}
                      </button>
                    </div>

                    <div className="tasker-user-info">
                      <h3>{tasker.user?.first_name} {tasker.user?.last_name}</h3>
                      <div className="tasker-location">
                        <p><strong>Location:</strong> {tasker.city}, {tasker.country}</p>
                      </div>
                      <div className="tasker-services">
                        <p><strong>Services:</strong></p>
                        <ul>
                          {tasker.services?.map(service => (
                            <li key={service.id}>{service.name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <p className="tasker-bio">{tasker.bio || 'No bio available'}</p>
                    <p className="tasker-experience">Experience: {tasker.experience || '0'} years</p>
                    
                    <div className="like-dislike-container">
                      <div className="like-dislike-buttons">
                        <button 
                          onClick={() => handleLike(tasker.id, true)}
                          className={`like-button ${isLiked ? 'active' : ''}`}
                          aria-label="Like"
                        >
                          <FaThumbsUp />
                        </button>
                        <span className="like-count">{taskerLikes.likes}</span>
                        
                        <button 
                          onClick={() => handleLike(tasker.id, false)}
                          className={`dislike-button ${isDisliked ? 'active' : ''}`}
                          aria-label="Dislike"
                        >
                          <FaThumbsDown />
                        </button>
                        <span className="dislike-count">{taskerLikes.dislikes}</span>
                      </div>
                    </div>
                    
                    <button 
                      className="view-button"
                      onClick={() => navigate(`/taskers/${tasker.id}`)}
                    >
                      View Profile
                    </button>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      ) : (
        <div className="no-taskers">
          <p>No taskers match your filters</p>
          <button onClick={clearFilters}>Clear filters</button>
        </div>
      )}
    </div>
  );
};

export default AllTaskers;
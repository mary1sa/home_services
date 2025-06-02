import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axiosInstance from '../../config/axiosInstance';
import './ServiceCategory.css';
import { FaThumbsUp, FaThumbsDown, FaHeart, FaRegHeart } from 'react-icons/fa';

const TaskersService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [taskers, setTaskers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likesData, setLikesData] = useState({});
  const [panierItems, setPanierItems] = useState([]);

  // Fetch panier items on component mount
  useEffect(() => {
    const fetchPanier = async () => {
      try {
        const response = await axiosInstance.get('/paniers');
        setPanierItems(response.data.map(item => item.tasker_id));
      } catch (error) {
        console.error('Error fetching panier:', error);
      }
    };
    fetchPanier();
  }, []);

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

  useEffect(() => {
    const fetchServiceTaskers = async () => {
      try {
        const response = await axiosInstance.get(`/services/${id}/taskers`);
        setService(response.data.service);
        setTaskers(response.data.taskers);
        
        const likesPromises = response.data.taskers.map(tasker => 
          fetchTaskerLikes(tasker.id)
        );
        const likesResults = await Promise.all(likesPromises);
        
        const initialLikesData = {};
        response.data.taskers.forEach((tasker, index) => {
          initialLikesData[tasker.id] = likesResults[index];
        });
        
        setLikesData(initialLikesData);
      } catch (error) {
        console.error('Error fetching service taskers:', error);
        setError('Failed to load taskers');
        setTaskers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceTaskers();
  }, [id]);

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
        // Remove from panier
        await axiosInstance.delete(`/paniers/${taskerId}`);
        setPanierItems(prev => prev.filter(id => id !== taskerId));
      } else {
        // Add to panier
        await axiosInstance.post('/paniers', { tasker_id: taskerId });
        setPanierItems(prev => [...prev, taskerId]);
      }
    } catch (error) {
      console.error('Error updating panier:', error);
      // Optionally show error message to user
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="category-services-page">
      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back to Services
      </button>

      {service && (
        <div className="category-header">
          <h1>Available Taskers for {service.name}</h1>
          {service.description && <p>{service.description}</p>}
          {service.price && <p className="service-price">Price: ${service.price}</p>}
        </div>
      )}

      {taskers.length > 0 ? (
        <div className="services-container">
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
            {taskers.map((tasker) => {
              const taskerLikes = likesData[tasker.id] || { likes: 0, dislikes: 0, userLike: null };
              const isLiked = taskerLikes.userLike?.is_like === true;
              const isDisliked = taskerLikes.userLike?.is_like === false;
              const isInPanier = panierItems.includes(tasker.id);
              
              return (
                <SwiperSlide key={tasker.id}>
                  <div className="service-card">
                    <div className="card-header">
                      {tasker.profile_picture && (
                        <img
                          src={`${process.env.REACT_APP_API_URL}/storage/${tasker.profile_picture}`}
                          alt={tasker.name}
                          className="service-image"
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
                      <h3>{tasker.user.first_name} {tasker.user.last_name}</h3>
                      <div className="tasker-contact-info">
                        <p><strong>Email:</strong> {tasker.user.email}</p>
                        <p><strong>Phone:</strong> {tasker.user.phone}</p>
                      </div>
                    </div>
                    <p className="service-description">{tasker.bio || 'No bio available'}</p>
                    <p className="service-price">Rating: {tasker.rating || 'Not rated'}</p>
                    
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
                      className="book-button"
                      onClick={() => navigate(`/book/${id}/tasker/${tasker.id}`)}
                    >
                      Book This Tasker
                    </button>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      ) : (
        <div className="no-services">
          <p>No taskers available for this service</p>
        </div>
      )}
    </div>
  );
};

export default TaskersService;
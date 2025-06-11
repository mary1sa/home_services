import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useGeolocated } from "react-geolocated";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "leaflet/dist/leaflet.css";
import axiosInstance from '../../config/axiosInstance';
import { FaThumbsUp, FaThumbsDown, FaHeart, FaRegHeart, FaFilter, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import "./AllTaskers.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Geolocation hook
  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
  });

  const likeSound = useRef(null);
  const dislikeSound = useRef(null);
  const favoriteSound = useRef(null);

  useEffect(() => {
    likeSound.current = new Audio('/sounds/like.WAV');
    dislikeSound.current = new Audio('/sounds/dislike.WAV');
    favoriteSound.current = new Audio('/sounds/favorite.WAV');
    
    likeSound.current.volume = 0.5;
    dislikeSound.current.volume = 0.5;
    favoriteSound.current.volume = 0.5;

    return () => {
      likeSound.current = null;
      dislikeSound.current = null;
      favoriteSound.current = null;
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [panierRes, taskersRes, servicesRes, citiesRes] = await Promise.all([
          axiosInstance.get('/paniers'),
          axiosInstance.get('/taskers'),
          axiosInstance.get('/services'),
          axiosInstance.get('/cities')
        ]);

        setPanierItems(panierRes.data.map(item => item.tasker_id));
        setTaskers(taskersRes.data);
        setFilteredTaskers(taskersRes.data);
        setServices(servicesRes.data);
        setCities(citiesRes.data);

        const likesResults = await Promise.all(
          taskersRes.data.map(tasker => fetchTaskerLikes(tasker.id))
        );
        
        const initialLikesData = {};
        taskersRes.data.forEach((tasker, index) => {
          initialLikesData[tasker.id] = likesResults[index];
        });
        setLikesData(initialLikesData);

      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load data. Please refresh the page.');
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
        tasker.services?.some(service => service.id.toString() === filters.service)
      );
    }
    
    if (filters.city) {
      result = result.filter(tasker => 
        tasker.city?.toLowerCase() === filters.city.toLowerCase()
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

  const playSound = (soundRef) => {
    if (soundEnabled && soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  const handleLike = async (taskerId, isLike) => {
    try {
      if (isLike) {
        playSound(likeSound);
      } else {
        playSound(dislikeSound);
      }
      
      const current = likesData[taskerId] || { likes: 0, dislikes: 0, userLike: null };
      const isSameVote = current.userLike?.is_like === isLike;
      
      setLikesData(prev => ({
        ...prev,
        [taskerId]: {
          likes: isSameVote ? current.likes - (isLike ? 1 : 0) : current.likes + (isLike ? 1 : 0),
          dislikes: isSameVote ? current.dislikes - (isLike ? 0 : 1) : current.dislikes + (isLike ? 0 : 1),
          userLike: isSameVote ? null : { is_like: isLike }
        }
      }));

      await axiosInstance.post(`/taskers/${taskerId}/like`, {
        is_like: isSameVote ? null : isLike
      });
      
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
      playSound(favoriteSound);
      
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
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      service: '',
      city: ''
    });
  };

  const toggleMobileFilters = () => setShowMobileFilters(!showMobileFilters);

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const handleLocationClick = (tasker) => {
    if (tasker.latitude && tasker.longitude) {
      setSelectedLocation({
        tasker: {
          lat: parseFloat(tasker.latitude),
          lng: parseFloat(tasker.longitude),
          name: `${tasker.user?.first_name} ${tasker.user?.last_name}`
        },
        user: coords ? {
          lat: coords.latitude,
          lng: coords.longitude,
          name: "Your Location"
        } : null
      });
      setShowMap(true);
    }
  };

  const closeMap = () => {
    setShowMap(false);
    setSelectedLocation(null);
  };

  const renderLocation = (tasker) => {
    if (!tasker.latitude || !tasker.longitude) {
      return (
        <div className="location">
          <FaMapMarkerAlt className="location-icon" />
          <span className="city">{tasker.city}</span>
          {tasker.country && <span className="country">, {tasker.country}</span>}
        </div>
      );
    }

    return (
      <div 
        className="location clickable"
        onClick={() => handleLocationClick(tasker)}
        title="View location on map"
      >
        <FaMapMarkerAlt className="location-icon" />
        <span className="city">{tasker.city}</span>
        {tasker.country && <span className="country">, {tasker.country}</span>}
        <span className="coordinates">(View on map)</span>
      </div>
    );
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading taskers...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  return (
    <div className="all-taskers-container">
      <div className="page-header">
        <h1>Find Your Perfect Tasker</h1>
        <div className="header-controls">
          <button 
            className="mobile-filter-toggle"
            onClick={toggleMobileFilters}
          >
            {showMobileFilters ? <FaTimes /> : <FaFilter />}
            Filters
          </button>
          <button 
            className={`sound-toggle ${soundEnabled ? 'on' : 'off'}`}
            onClick={toggleSound}
            aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      <div className={`filters-section ${showMobileFilters ? 'mobile-visible' : ''}`}>
        <div className="filter-group-tasker">
          <label htmlFor="service">Service Needed</label>
          <select
            id="service"
            name="service"
            className='select-tasker'
            value={filters.service}
            onChange={handleFilterChange}

          >
            <option value="">All Services</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group-tasker">
          <label htmlFor="city">Location</label>
          <select
            id="city"
            name="city"
            className='select-tasker'
            value={filters.city}
            onChange={handleFilterChange}
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          <button onClick={clearFilters} className="clear-filters">
            Clear All
          </button>
        </div>
      </div>

      <div className="results-summary">
        <p>{filteredTaskers.length} {filteredTaskers.length === 1 ? 'Tasker' : 'Taskers'} Available</p>
      </div>

      {filteredTaskers.length > 0 ? (
        <div className="taskers-grid">
          <Swiper
            modules={[Navigation, Pagination]}
            slidesPerView={1}
            spaceBetween={20}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 }
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
                    <div className="card-media">
                      {tasker.photo ? (
                        <img
                          src={`${process.env.REACT_APP_API_URL}/storage/${tasker.photo}`}
                          alt={`${tasker.user?.first_name} ${tasker.user?.last_name}`}
                          className="tasker-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {tasker.user?.first_name?.charAt(0)}{tasker.user?.last_name?.charAt(0)}
                        </div>
                      )}
                      <button 
                        onClick={() => togglePanier(tasker.id)}
                        className={`favorite-btn ${isInPanier ? 'active' : ''}`}
                      >
                        {isInPanier ? <FaHeart /> : <FaRegHeart />}
                      </button>
                    </div>

                    <div className="card-content">
                      <h3 className="tasker-name">{tasker.user?.first_name} {tasker.user?.last_name}</h3>
                      
                      <div className="tasker-meta">
                        {renderLocation(tasker)}
                        <div className="experience">
                          {tasker.experience || '0'} year{tasker.experience !== 1 ? 's' : ''} experience
                        </div>
                      </div>

                      {tasker.bio && (
                        <p className="bio">{tasker.bio.substring(0, 100)}{tasker.bio.length > 100 ? '...' : ''}</p>
                      )}

                      {tasker.services?.length > 0 && (
                        <div className="services">
                          <h4>Services Offered</h4>
                          <div className="service-tags">
                            {tasker.services.slice(0, 3).map(service => (
                              <span key={service.id} className="service-tag">
                                {service.name}
                              </span>
                            ))}
                            {tasker.services.length > 3 && (
                              <span className="more-tag">+{tasker.services.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="card-footer">
                        <div className="rating">
                          <button
                            onClick={() => handleLike(tasker.id, true)}
                            className={`like-btn ${isLiked ? 'active' : ''}`}
                          >
                            <FaThumbsUp />
                            <span>{taskerLikes.likes}</span>
                          </button>
                          <button
                            onClick={() => handleLike(tasker.id, false)}
                            className={`dislike-btn ${isDisliked ? 'active' : ''}`}
                          >
                            <FaThumbsDown />
                            <span>{taskerLikes.dislikes}</span>
                          </button>
                        </div>

                        <button
                          className="view-profile-btn"
                          onClick={() => navigate(`/taskers/${tasker.id}`)}
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      ) : (
        <div className="no-results">
          <div className="no-results-content">
            <h3>No taskers match your filters</h3>
            <p>Try adjusting your search criteria</p>
            <button onClick={clearFilters}>Clear All Filters</button>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMap && selectedLocation && (
        <div className="map-modal">
          <div className="map-modal-content">
            <button className="close-map-btn" onClick={closeMap}>
              &times;
            </button>
            <h3>{selectedLocation.tasker.name}'s Location</h3>
            
            {!isGeolocationAvailable && (
              <div className="geo-warning">
                Geolocation is not available in your browser
              </div>
            )}
            
            {isGeolocationAvailable && !isGeolocationEnabled && (
              <div className="geo-warning">
                Geolocation is not enabled. Please enable it to see your location.
              </div>
            )}

            <div className="map-container">
              <MapContainer
                center={[selectedLocation.tasker.lat, selectedLocation.tasker.lng]}
                zoom={13}
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Tasker's Marker */}
                <Marker 
                  position={[selectedLocation.tasker.lat, selectedLocation.tasker.lng]}
                >
                  <Popup>
                    <div className="map-popup">
                      <FaMapMarkerAlt className="popup-icon" />
                      <strong>{selectedLocation.tasker.name}</strong>
                      <div className="popup-coordinates">
                        Latitude: {selectedLocation.tasker.lat.toFixed(4)}, 
                        Longitude: {selectedLocation.tasker.lng.toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
                
                {/* User's Marker */}
                {selectedLocation.user && (
                  <Marker 
                    position={[selectedLocation.user.lat, selectedLocation.user.lng]}
                    icon={userLocationIcon}
                  >
                    <Popup>
                      <div className="map-popup">
                        <FaMapMarkerAlt className="popup-icon user" />
                        <strong>Your Location</strong>
                        <div className="popup-coordinates">
                          Latitude: {selectedLocation.user.lat.toFixed(4)}, 
                          Longitude: {selectedLocation.user.lng.toFixed(4)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
            <div className="map-actions">
              <button 
                className="directions-btn"
                onClick={() => window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.tasker.lat},${selectedLocation.tasker.lng}&origin=${selectedLocation.user?.lat},${selectedLocation.user?.lng}`,
                  '_blank'
                )}
                disabled={!selectedLocation.user}
              >
                Get Directions (Google Maps)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTaskers;
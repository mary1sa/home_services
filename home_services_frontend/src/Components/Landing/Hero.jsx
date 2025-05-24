import React, { useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import Loading from '../common/Loading';
import "./Hero.css";

const Hero = ({ company, cities, services, homeContent }) => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [filteredTaskers, setFilteredTaskers] = useState([]);
  const [filtering, setFiltering] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedCity || !selectedService) return;

    setFiltering(true);
    try {
      const res = await axiosInstance.get('/taskers');
      const validTaskers = res.data.filter(tasker =>
        tasker.user &&
        tasker.city?.toLowerCase() === selectedCity.toLowerCase() &&
        tasker.services?.some(s => s.id.toString() === selectedService)
      );
      setFilteredTaskers(validTaskers);
    } catch (err) {
      console.error('Failed to fetch taskers', err);
    } finally {
      setFiltering(false);
    }
  };

  return (
    <>
      <section id="hero" className="hero-section">
        <div className="hero-content">
          <h1>{company?.name || 'Our Services'}</h1>

          <form onSubmit={handleSearch} className="search-form">
            <div className="form-group">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                required
              >
                <option value="">Select City</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                required
              >
                <option value="">Select Service</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.price}€)
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="search-button">
              {filtering ? 'Searching...' : 'Find Taskers'}
            </button>
          </form>
        </div>

        <div className="hero-image">
          <img
            src={
              homeContent?.image
                ? `${process.env.REACT_APP_API_URL}/storage/${homeContent.image}`
                : "homeimg.jpeg"
            }
            alt="Hero"
            loading="lazy"
          />
        </div>
      </section>

      {filtering ? (
        <Loading />
      ) : (
        filteredTaskers.length > 0 ? (
          <div className="tasker-list">
            <h2>Available Taskers in {selectedCity}</h2>
            <ul className="taskers-grid">
              {filteredTaskers.map(tasker => (
                <li key={tasker.id} className="tasker-card">
                  <img
                    src={
                      tasker.photo
                        ? `${process.env.REACT_APP_API_URL}/storage/${tasker.photo}`
                        : "/anony.jpg"
                    }
                    alt="Tasker"
                    className="tasker-photo"
                  />
                  <div>
                    <h3>{tasker.user?.first_name} {tasker.user?.last_name}</h3>
                    <p>Email: {tasker.user?.email}</p>
                    <p>City: {tasker.city}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : selectedCity && selectedService ? (
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>
            No taskers found for this filter.
          </p>
        ) : null
      )}
    </>
  );
};

export default Hero;
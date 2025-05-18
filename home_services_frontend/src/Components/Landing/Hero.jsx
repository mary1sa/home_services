import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import Loading from '../common/Loading';
import "./Hero.css"; 

const Hero = () => {
  const [content, setContent] = useState(null);
  const [company, setCompany] = useState(null);
  const [cities, setCities] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, companyRes, citiesRes, servicesRes] = await Promise.all([
          axiosInstance.get('/contents'),
          axiosInstance.get('/companies/1'),
          axiosInstance.get('cities'),
          axiosInstance.get('/services')
        ]);

        const section = contentRes.data.find(
          item => item.section_name === 'home' && item.status === 'active'
        );
        
        setContent(section);
        setCompany(companyRes.data);
        setCities(citiesRes.data);
        setServices(servicesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!selectedCity || !selectedService) return;
    window.location.href = `/taskers?city=${selectedCity}&service=${selectedService}`;
  };

  if (loading) {
    return <Loading />;
  }

  return (
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
            Find Taskers
          </button>
        </form>
      </div>
      
      <div className="hero-image">
        <img 
          src={content?.image 
            ? `${process.env.REACT_APP_API_URL}/storage/${content.image}` 
            : "homeimg.jpeg"} 
          alt="Hero" 
          loading="lazy"
        />
      </div>
    </section>
  );
};

export default Hero;
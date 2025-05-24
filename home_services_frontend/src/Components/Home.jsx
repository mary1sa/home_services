import React, { useEffect, useState } from 'react';
import Navbar from './Landing/Navbar';
import Hero from './Landing/Hero';
import About from './Landing/About';
import Services from './Landing/Services';
import Reviews from './Landing/Reviews';
import Footer from './Landing/Footer';
import axiosInstance from './../config/axiosInstance';
import Loading from './common/Loading';
import "./Landing/Landing.css";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharedData, setSharedData] = useState({
    company: null,
    cities: [],
    services: [],
    reviews: [],
    homeContent: null,
    footerContent: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          contentRes, 
          companyRes, 
          citiesRes, 
          servicesRes, 
          reviewsRes
        ] = await Promise.all([
          axiosInstance.get('/contents'),
          axiosInstance.get('/companies/1'),
          axiosInstance.get('/cities'),
          axiosInstance.get('/services'),
          axiosInstance.get('/company-reviews')
        ]);

        const homeContent = contentRes.data.find(
          item => item.section_name === 'home' && item.status === 'active'
        );
        
        const footerContent = contentRes.data.find(
          item => item.section_name === 'footer' && item.status === 'active'
        );

        setSharedData({
          company: companyRes.data,
          cities: citiesRes.data,
          services: servicesRes.data,
          reviews: reviewsRes.data,
          homeContent,
          footerContent: footerContent || { content: "Default footer content" }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="landing-page">
      <Navbar company={sharedData.company} />
      <main>
        <Hero 
          company={sharedData.company} 
          cities={sharedData.cities} 
          services={sharedData.services}
          homeContent={sharedData.homeContent}
        />
        <About company={sharedData.company} />
        <Services services={sharedData.services} />
        <Reviews reviews={sharedData.reviews} />
      </main>
      <Footer 
        company={sharedData.company} 
        footerContent={sharedData.footerContent} 
      />
    </div>
  );
};

export default Home;
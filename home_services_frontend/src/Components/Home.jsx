import React from 'react';
import Navbar from './Landing/Navbar';
import Hero from './Landing/Hero';
import About from './Landing/About';
import Services from './Landing/Services';
import Reviews from './Landing/Reviews';
import Footer from './Landing/Footer';
import "./Landing/Landing.css";

const Home = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Reviews />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
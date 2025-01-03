import React from 'react';
import './ServicePage.css';
import image1 from '../../../Images/service doctor -1.jpg'
import image2 from '../../../Images/service image -2.jpg'
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';

const ServicePage = () => {
  return (
    <div className="service-page">
        <Navbar/>
      <header className="service-header">
        <h1>
          Our <span className="highlight">Company</span>,
        </h1>
        <h2>Service</h2>
      </header>

      <div className="service-content">
        <div className="service-left">
          <img
            src={image1} 
            alt="Doctor"
            className="service-image"
          />
        </div>

        <div className="service-right">
          <p>
            Search for doctors based on <span className="highlight">specialty</span>,{' '}
            <span className="highlight">location</span>, and <span className="highlight">availability</span>. Connect
            with specialists in various fields like Cardiology, Dermatology, Pediatrics, etc.
          </p>
          <p>
            Book appointments online with <span className="highlight">just a few clicks</span>. View doctors'
            real-time availability and choose your <span className="highlight">preferred time</span> slot.
          </p>
        </div>
      </div>

      <Footer/>
    </div>
  );
};

export default ServicePage;

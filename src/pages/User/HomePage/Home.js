import React, { useState, useEffect } from 'react';
import './Home.css';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import doctor1 from '../../../Images/pixelcut-export.png';
import doctor2 from '../../../Images/doctor-herp.jpg';
import doctor3 from '../../../Images/doc-3.jpeg';
import doctorpatient from '../../../Images/service doctor -1.jpg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import SubNavbar from '../../../components/SubNavBar/SubNavbar';
import api from '../../../services/api'

const Home = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const [currentImage, setCurrentImage] = useState(0);
  const [location, setLocation] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('doctors/getdoctors/');
        setDoctors(response.data);

        // Extract unique locations
        const uniqueLocations = [...new Set(response.data.map((doctor) => {
          const locationParts = doctor.clinic_address.split(',');
          return locationParts[0].trim(); // Take the first part and remove any extra spaces
        }))];
        setLocations(uniqueLocations);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  const handleSearch = () => {
    if (!location && !userLocation) {
      handleUseCurrentLocation();
      return;
    }

    if (userLocation) {
      console.log('userlocation , ' , userLocation)
      findNearestDoctors();
      return;
    }

    const results = doctors.filter((doctor) =>
      doctor.full_name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
      doctor.specialty.toLowerCase().includes(searchKeyword.toLowerCase()) &&
      doctor.clinic_address.toLowerCase().includes(location.toLowerCase())
    );

    setFilteredDoctors(results);

    navigate('/doctorlist', { state: { location, keyword: searchKeyword, results } });
  };

  const findNearestDoctors = async () => {
    try {
      const response = await api.get('doctors/nearest/', {
        params: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
      });
      setFilteredDoctors(response.data);
    
      const results = response.data.filter((doctor) =>
        doctor.full_name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
        doctor.specialty.toLowerCase().includes(searchKeyword.toLowerCase()) 
      );

      navigate('/doctorlist', { state: { location: 'Current Location', keyword: '', results: results } });
    } catch (error) {
      console.error('Error fetching nearest doctors:', error);
      setErrorMessage('Failed to fetch nearest doctors. Please try again later.');
    }
  };

  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setLocation('Current Location');
        
      },
      (error) => {
        console.error('Geolocation error:', error);
        setErrorMessage('Location access denied. Please enable location to find nearest doctors.');
      }
    );
  };

  const images = [doctor1, doctor2, doctor3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="home-container">
      <Navbar />
      <SubNavbar />

      <div
        className="hero-section"
        style={{ backgroundImage: `url(${images[currentImage]})` }}
      >
        <div className="hero-content">
          <h1>Find Your Personal <span>Doctor</span> Anytime!</h1>

          {/* Search Section */}
          <div className="home-search-section">
            {/* Location Dropdown */}
            <select 
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 15px',
                border: 'none',
                backgroundColor: '#f0f4f8',
                color: '#333',
                fontSize: '1rem',
                outline: 'none',
                width:'30%',
              }}
              className="home-location-select"
              value={location}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue === "Current Location") {
                  handleUseCurrentLocation();
                } else {
                  setLocation(selectedValue);
                }
              }}
            >
              <option value="">Location</option>
              <option value="Current Location">Use My Current Location</option>
              {locations.map((loc, index) => (
                <option key={index} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <input
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 15px',
                border: 'none',
                backgroundColor: '#f0f4f8',
                color: '#333',
                fontSize: '1rem',
                outline: 'none',
                width: '100%',
                margin: '0px',
                height: '100%',
              }}
              type="text"
              placeholder="Search for doctor, specialty, etc."
              className="home-search-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />

            {/* Search Button */}
            <button
              className="home-search-button"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="info-section">
        <div className="info-text">
          <h2>We connect you with the best <span>Doctors</span> for your health needs.</h2>
          <button className="book-now-btn" onClick={()=>{
              navigate('/doctorlist')
            }}>Book Now</button>
        </div>
        <div className="info-image">
          <img src={doctorpatient} alt="Doctor and Patient" />
        </div>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <Footer />
    </div>
  );
};

export default Home;

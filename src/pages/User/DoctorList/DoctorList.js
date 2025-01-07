import React, { useState, useEffect } from 'react';
import AppointmentModal from '../Appointment/AppointmentModal';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import defaultProfileIcon from '../../../Images/profile-icon.png';
import VerifiedBadge from '../../../Images/Verified.png'
import DoctorIcon from '../../../Images/doctor-icon.jpg'
import FilterIcon from '../../../Images/filter.svg'
import './DoctorList.css';
import { useAuth } from '../../../contexts/AuthContext';
import { containerClasses } from '@mui/material';
import { useLocation } from 'react-router-dom';
import api from '../../../services/api'

const DoctorList = () => {
  const auth = useAuth();
  const userId = auth.auth.user.id;
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [appointmentDoctorId, setAppointmentDoctorId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [locations, setLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [doctorQualifications, setDoctorQualifications] = useState([]);
  const [doctorSpecialty , setDoctorSpeciality] = useState([])
  const location = useLocation();
  const { location: searchLocation, keyword, results } = location.state || {};
  const [loc , setLoc] = useState('')
  const [sortOption, setSortOption] = useState('');



  useEffect(() => {
    if (results) {
      console.log('result :' , results)
      setDoctors(results);
      setFilteredDoctors(results)
      const uniqueQualifications = new Set(results.map(doctor => doctor.qualification)); 
      setDoctorQualifications(Array.from(uniqueQualifications));

      const uniqueSpeciality = new Set(results.map(doctor => doctor.specialty)); 
      setDoctorSpeciality(Array.from(uniqueSpeciality));

      const uniqueLocations = [...new Set(results.map((doctor) => {
        const locationParts = doctor.clinic_address.split(',');
        return locationParts[0].trim(); // Take the first part and remove any extra spaces
      }))];
      setLocations(uniqueLocations);
      setLoading(false);
    }else{

    

    const fetchDoctors = async () => {
      try {
        const response = await api.get('doctors/getdoctors/');
        setDoctors(response.data);
        setFilteredDoctors(response.data);
        const uniqueQualifications = new Set(response.data.map(doctor => doctor.qualification)); 
        setDoctorQualifications(Array.from(uniqueQualifications));

        const uniqueSpeciality = new Set(response.data.map(doctor => doctor.specialty)); 
        setDoctorSpeciality(Array.from(uniqueSpeciality));

        const uniqueLocations = [...new Set(response.data.map((doctor) => {
          const locationParts = doctor.clinic_address.split(',');
          return locationParts[0].trim(); // Take the first part and remove any extra spaces
        }))];
        setLocations(uniqueLocations);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setErrorMessage('Failed to fetch doctors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }
  }, []);

  useEffect(() => {
    let results = doctors;
  
    // Apply location filter
    if (locationFilter) {
 
      if (locationFilter === 'nearest') {
        findNearestDoctors()
        
      }else{
        results = doctors.filter((doctor) =>
          doctor.clinic_address.toLowerCase().includes(locationFilter.toLowerCase())
        );
      }
    }
  
    // Apply other filters
    results = results.filter((doctor) =>
      (!qualificationFilter || doctor.qualification === qualificationFilter) &&
      (!specialtyFilter || doctor.specialty === specialtyFilter) &&
      (!genderFilter || doctor.gender === genderFilter) &&
      (doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.qualification.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  
    // Apply sorting
    if (sortOption === 'experienceDesc') {
      results.sort((a, b) => b.experience - a.experience);
    } else if (sortOption === 'experienceAsc') {
      results.sort((a, b) => a.experience - b.experience);
    }
  
    setFilteredDoctors(results);

    
  }, [searchTerm, locationFilter, qualificationFilter, specialtyFilter, doctors, genderFilter, sortOption]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const toggleExpandCard = (index) => {
    setExpandedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const findNearestDoctors = async () => {
    if (!userLocation) {
      try {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          try {
            const response = await api.get('doctors/nearest/', {
              params: { latitude, longitude },
            });
            console.log(response.data , 'response')
            setFilteredDoctors(response.data);
            setDoctors(response.data)
          } catch (error) {
            console.error('Error fetching nearest doctors:', error);
            setErrorMessage('Failed to fetch nearest doctors. Please try again later.');
          }
        }, (error) => {
          console.error('Geolocation error:', error);
          setErrorMessage('Location access denied. Please enable location to find nearest doctors.');
        });
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMessage('Failed to retrieve your location.');
      }
    }
  };

  const addToMyDoctors = async (doctorId) => {
    try {
      const response = await api.post(
        'accounts/add-to-my-doctors/',
        { doctor_id: doctorId, userId: userId }
      );
      setSuccessMessage(response.data.message);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Error adding doctor to My Doctors:', error);
      setErrorMessage('Failed to add doctor. Please try again later.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setLoc('Current Location');
        
      },
      (error) => {
        console.error('Geolocation error:', error);
        setErrorMessage('Location access denied. Please enable location to find nearest doctors.');
      }
    );
  };

  if (loading) return <p>Loading doctors...</p>;

  return (
    <div>
      <Navbar />
      <div className='search-section'>

        <div className="verification-badge-list">
            <img src={VerifiedBadge} alt="Verified" className="badge-icon" />
            <span>All Doctors verified by admin</span>
        </div>

     
        <div className="search-bar">
              <input
                type="text"
                placeholder="Search by name, specialty, or qualification"
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
        </div>

        <div className="verification-doctor-list">
          <img src={DoctorIcon} alt='doctor icon' className='doctor-icon'/>

        </div>
      </div>

      
      
      <div className="doctor-list-container">

        <div className="doctor-list">
          <h2>Your Doctors</h2>

          <div className="filter-section">
            <div className='filter-icon'>
            <svg className='icon' viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12l8-8V0H0v4l8 8v8l4-4v-4z"/>
              </svg>
              <h4>Filter Here</h4>
              
            </div>
            
          
            <div className="filter-group">
              <select
                onChange={(e) => {
                  const value = e.target.value;
                  setLocationFilter(value);
                }}
                value={locationFilter}
              >
                <option value="">Location</option>
                <option value="nearest">Nearest</option>
                {locations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select 
                onChange={(e) => setQualificationFilter(e.target.value)} 
                value={qualificationFilter}
              >
                <option value="">Qualification</option>
                {doctorQualifications.map((qualification) => ( 
                  <option key={qualification} value={qualification}>{qualification}</option> 
                ))} 
              </select>
            </div>

            <div className="filter-group">
              <select 
                onChange={(e) => setSpecialtyFilter(e.target.value)} 
                value={specialtyFilter}
              >
                <option value="">Specialty</option>
                {doctorSpecialty.map((specialty) => ( 
                  <option key={specialty} value={specialty}>{specialty}</option> 
                ))} 
              </select>
            </div>

            <div className="filter-group">
              <select 
                onChange={(e) => setGenderFilter(e.target.value)} 
                value={genderFilter}
              >
                <option value="">Gender</option>
                
                <option key="Male" value='Male'>Male</option> 
                <option key="Male" value='Female'>Female</option> 
                
              </select>
            </div>

            <div className="filter-group">
              <select onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
                <option value="">Sort By</option>
                <option value="experienceDesc">Experience: High to Low</option>
                <option value="experienceAsc">Experience: Low to High</option>
              </select>
            </div>
          </div>


          {successMessage && <p className="success-message">{successMessage}</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="doctor-cards">
            {filteredDoctors.map((doctor, index) => (
              <div key={index} className="doctor-card">
                <div className="doctor-header" onClick={() => toggleExpandCard(index)}>
                  <div className="doctor-info-list">
                    <p style={{color:'rebeccapurple', fontSize: 'large'}}>{doctor.distance ? `KM : ${doctor.distance}` : '' }</p>
                    <img
                      src={ doctor.profile_picture ? `https://findmydoctor.xyz${doctor.profile_picture}` : defaultProfileIcon}
                      alt={doctor.full_name}
                      className="doctor-image"
                    />
                    <h3>Dr. {doctor.full_name}</h3>
                    <p>Qualification: {doctor.qualification}</p>
                    <p>Specialty: {doctor.specialty}</p>
                  </div>
                  <button className="expand-button">
                    {expandedCards[index] ? '▲' : '▼'}
                  </button>
                </div>

                {expandedCards[index] && (
                  <div className='section-doctor-details'>
                    <div className="doctor-details">
                      <div className='doctor-details-in'>
                        <p>Email: {doctor.email}</p>
                        <p>Phone: {doctor.phone}</p>
                        <p>Gender: {doctor.gender}</p>
                      </div>

                      <div className='doctor-details-in'>
                        <p>Experience: {doctor.experience} years</p>
                        <p>Hospital: {doctor.hospital}</p>
                        <div style={{marginTop:'5px' , border: '0.05px solid black', padding: '6px'}}>
                          <h5>Clinic Address</h5>
                          <p style={{width:'300px'}}> {doctor.clinic_address || 'N/A'}</p>
                        </div>
                      </div>
    
                      
                    </div>
                    <div className="doctor-actions">
                    <button
                      className="appointment-btn"
                      onClick={() => setAppointmentDoctorId(doctor.id)}
                    >
                      Take Appointment
                    </button>
                    <button
                      className="add-doctor-btn"
                      onClick={() => addToMyDoctors(doctor.id)}
                    >
                      Add to My Doctors
                    </button>
                  </div>
                </div>
                )}
              </div>
            ))}
            </div>
        </div>

        {appointmentDoctorId && (
          <AppointmentModal
            doctorId={appointmentDoctorId}
            closeModal={() => setAppointmentDoctorId(null)}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DoctorList;
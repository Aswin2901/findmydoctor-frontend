import React, { useState, useEffect } from 'react';
import './MyDoctorsPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import defaultProfilePic from '../../../Images/profile-icon.png'
import { useAuth } from '../../../contexts/AuthContext';

const MyDoctorsPage = () => {
    const navigate = useNavigate();
    const auth = useAuth()
    const userId = auth.auth.user.id
    const [favoriteDoctors, setFavoriteDoctors] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavoriteDoctors = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/accounts/${userId}/favorites`);
                setFavoriteDoctors(response.data);
            } catch (error) {
                console.error("Error fetching favorite doctors:", error);
                setError(error.response.data.error);
            }
        };

        if (userId) {
            fetchFavoriteDoctors();
        }
    }, [userId]);

    const handleRemoveDoctor = async (FavId) => {
        console.log('doctor id ::::', FavId);
        if (window.confirm("Are you sure you want to remove this doctor from your favorites?")) {
            try {
                const response = await axios.delete(`http://localhost:8000/accounts/remove_fav/${FavId}/`);
                console.log('response:', response.data);
    
                if(response.data.data){
                    setFavoriteDoctors(response.data.data);

                }else{
                    setFavoriteDoctors([])
                }
                
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setError('Doctor not found.');
                } else {
                    console.error("Error removing doctor:", error);
                    setError("Failed to remove doctor.");
                }
            }
        }
    };
    const handleAddDoctor = () => {
        navigate('/doctorlist');
    };

    return (
        <div className="my-doctors-page">
            {error && <p className="error-message">{error}</p>}
            
            <h2>My Favorite Doctors</h2>
            <table className="doctor-table">
                <thead>
                    <tr>
                        <th>Profile Picture</th>
                        <th>Name</th>
                        <th>Specialty</th>
                        <th>Phone</th>
                        <th>Hospital</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {favoriteDoctors.map((doctor) => (
                        <tr key={doctor.id}>
                            <td>
                                <img
                                    src={doctor.imageUrl || defaultProfilePic}
                                    alt={doctor.name}
                                    className="doctor-avatar"
                                />
                            </td>
                            <td className="doctor-name">{doctor.full_name}</td>
                            <td className="doctor-specialty">{doctor.specialty}</td>
                            <td className='doctor-phone'>{doctor.phone}</td>
                            <td className="doctor-hospital">{doctor.hospital}</td>
                            {console.log('fav id :' , doctor.fav_id)}
                            <td>
                                <button onClick={() => handleRemoveDoctor(doctor.fav_id)} className="remove-button">
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button onClick={handleAddDoctor} className="add-button">
                Add Doctor
            </button>
        </div>
    );
};

export default MyDoctorsPage;

import React, { useState, useEffect } from 'react';
import './ChatPage.css';
import ChatArea from '../../../components/Chat/ChatArea/ChatArea';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api'

function ChatPage() {
    const [doctors, setDoctors] = useState([]);
    const [activeDoctorId, setActiveDoctorId] = useState(null);
    const [loading, setLoading] = useState(true);  // Loading state
    const [error, setError] = useState(null);  
    const auth = useAuth()
    const userId = auth.auth.user.id

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get(
                    `appointments/patients/${userId}/doctors/`
                );
                setDoctors(response.data);
            } catch (error) {
                console.error('Error fetching doctors:', error);
                setError('Failed to load doctors.');
            } finally {
                setLoading(false);  // Hide loading after fetch is complete
            }
        };
        fetchDoctors();
    }, [userId]);

    return (
        <div className="chat-page">
            <div className="doctor-list">
                <h3>Your Doctors</h3>
                {loading ? (
                    <p>Loading...</p>  // Show loading text while fetching data
                ) : error ? (
                    <p className="error-message">{error}</p>  // Display error message if any
                ) : doctors.length > 0 ? (
                    <ul>
                        {doctors.map((doctor) => (
                            <li
                                key={doctor.id}
                                onClick={() => setActiveDoctorId(doctor.id)}
                                className={activeDoctorId === doctor.id ? 'active' : ''}
                            >
                                {doctor.full_name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No doctors found. You may not have any appointments yet.</p>
                )}
            </div>
            <div className="chat-window">
                {activeDoctorId ? (
                    <ChatArea chatRecipientId={activeDoctorId} />
                ) : (
                    <p>Select a doctor to start chatting.</p>
                )}
            </div>
        </div>
    );
}

export default ChatPage;

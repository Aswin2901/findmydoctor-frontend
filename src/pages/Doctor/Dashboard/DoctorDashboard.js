import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './DoctorDashboard.css';
import Footer from '../../../components/Footer/Footer';
import DoctorNav from '../DoctorNav/DoctorNav';
import { useAuth } from '../../../contexts/AuthContext';
import AppointmentManagement from '../AppointmentManagement/AppointmentManagement'; 
import AppointmentHistory from '../AppointmentHistory/AppointmentHistory';
import Calendar from 'react-calendar';
import ChatArea from '../../../components/Chat/ChatArea/ChatArea';
import Notifications from '../../../components/Notification/Notifications';
import DoctorProfile from '../DoctorProfile/DoctorProfile';

function DoctorDashboard() {
    const [isVerified, setIsVerified] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [activeMenu, setActiveMenu] = useState('dashboard'); 
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();
    const auth = useAuth();
    const [ doctorId , setdoctorId ] = useState(auth.auth.user.id)
    const user = JSON.parse(localStorage.getItem("user"));
    const location = useLocation()

    useEffect(() => {
        // Set activeMenu from location state if available
        if (location.state?.activeMenu) {
            setActiveMenu(location.state.activeMenu);
        }
    }, [location.state]);
    



    useEffect(() => {
        console.log('DOCTOR ID : ' , auth.auth.user.id)
        setdoctorId(auth.auth.user.id);
        async function checkVerification() {
            console.log('state docotor id :' , doctorId)
            try {
                const response = await axios.get(`http://127.0.0.1:8000/doctors/verification/${doctorId}/`);
                setIsVerified(response.data.is_verified);
                setFormSubmitted(response.data.form_submitted);
            } catch (error) {
                console.error('Error checking verification:', error);
            }
        }
        checkVerification();

        async function fetchAppointments() {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/appointments/history/${doctorId}/`);
                // Assuming the response contains an array of appointments
                setAppointments(response.data.slice(0, 2)); // Get only the latest two appointments
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        }

        fetchAppointments();
    }, [doctorId]);


    const handleLogout = () => {
        const confirmLogout = window.confirm('Are you sure you want to log out?');
        if (confirmLogout) {
            localStorage.clear(); 
            navigate('/'); 
        }
    };

    if (isVerified === null) {
        return <p>Loading...</p>;
    }

    if (!formSubmitted) {
        return (
            <div className="verification-message">
                <h2>Please complete your profile verification</h2>
                <button className="verification-button" onClick={() => navigate('/profilevarification')}>
                    Go to Verification
                </button>
            </div>
        );
    }

    if (!isVerified) {
        return (
            <div className="verification-message">
                <h2>Verification Pending</h2>
                <p>Your verification is under review. You will be notified once it is approved.</p>
            </div>
        );
    }

    return (
        <div className="content-body">
            <DoctorNav />
            <div className="doctor-dashboard">
                {/* Sidebar */}
                <aside className="dashboard-sidebar">
                    <ul className="sidebar-menu">
                        <li 
                            className={`menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`} 
                            onClick={() => setActiveMenu('dashboard')}
                        >
                            Dashboard
                        </li>
                        <li 
                            className={`menu-item ${activeMenu === 'appointmentManagement' ? 'active' : ''}`} 
                            onClick={() => setActiveMenu('appointmentManagement')}
                        >
                            Slot Management
                        </li>
                        <li 
                            className={`menu-item ${activeMenu === 'notifications' ? 'active' : ''}`} 
                            onClick={() => setActiveMenu('notifications')}
                        >
                            Notifications
                        </li>
                        <li 
                            className={`menu-item ${activeMenu === 'appointmentHistory' ? 'active' : ''}`} 
                            onClick={() => setActiveMenu('appointmentHistory')}
                        >
                            Appointment History
                        </li>
                        <li 
                            className={`menu-item ${activeMenu === 'chats' ? 'active' : ''}`} 
                            onClick={() => setActiveMenu('chats')}
                        >
                            Chats
                        </li>
                        <li className={`menu-item ${activeMenu === 'profile' ? 'active' : ''}`}
                        onClick={()=>{setActiveMenu('profile')}}
                        >
                            Profile
                        </li>
                        <li className="menu-item logout" onClick={handleLogout}>Logout</li>
                    </ul>
                </aside>

                {/* Main Content */}
                <main className="dashboard-main-content">
                    {activeMenu === 'dashboard' && (
                        <div>
                            <header className="dashboard-header">
                                <div className="welcome-section">
                                    <h1>Welcome to Find My Doctor</h1>
                                    <p>We are committed to delivering exceptional care and making a difference in the lives of our patients. We’re excited to have you on board!</p>
                                </div>
                                
                            </header>

                            <div className="dashboard-content">
                                <div className="categories">
                                    <div className="category-card" onClick={() => setActiveMenu('appointmentHistory')}>New Appointment</div>
                                    <div className="category-card">Total Appointment</div>
                                </div>

                                <div className="appointments-section">
                                    <div className="calendar">
                                        <h4>Calendar</h4>
                                        <div>
                                            <Calendar/>
                                        </div>
                                    </div>
                                    <div className="my-appointments">
                                        <h4>My Appointments</h4><br/>
                                        {appointments.length > 0 ? (
                                            appointments.map((appointment) => (
                                                <div key={appointment.id} className="appointment-card">
                                                    <p><strong>Patient:</strong> {appointment.patient_name}</p>
                                                    <p><strong>Date:</strong> {appointment.date}</p>
                                                    <p><strong>Time:</strong> {appointment.time}</p>
                                                    <p><strong>Status:</strong> {appointment.status}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No appointments found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeMenu === 'appointmentManagement' && <AppointmentManagement />}
                    {activeMenu === 'notifications' && <Notifications userId={doctorId} role={user.role} /> }
                    {activeMenu === 'appointmentHistory' && <AppointmentHistory doctorId={doctorId} />}
                    {activeMenu === 'chats' && <ChatArea userType="doctor" />}
                    {activeMenu === 'profile' && <DoctorProfile/>}
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default DoctorDashboard;

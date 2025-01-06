import React, { useEffect, useState } from 'react';
import './NotificationPage.css';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';

const NotificationPage = () => {
  const auth = useAuth()
  const userId = auth.auth.user.id
  
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (userId){
          const response = await api.get(`accounts/get-notification/${userId}/`);
          setNotifications(response.data);
        }
        
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`notifications/mark-as-read/${notificationId}/`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div>
        <Navbar/>
    
        <div className="notification-page">
        <h2>Notifications</h2>
        <div className="notification-list">
            {notifications.map((notif) => (
            <div
                key={notif.id}
                className={`notification-card ${notif.is_read ? 'read' : ''}`}
            >
                <p><strong>{notif.notification_type === 'new' ? 'New Appointment Scheduled!' : notif.notification_type === 'cancelled' ? 'Appointment Cancelled!' : 'Appointment Rescheduled!'}</strong></p>
                <p>{notif.message}</p>
                <p><strong>Doctor:</strong> {notif.doctor_name}</p>
                {!notif.is_read && (
                <button
                    onClick={() => markAsRead(notif.id)}
                    className="mark-as-read-btn"
                >
                    Mark as Read
                </button>
                )}
            </div>
            ))}
        </div>
        </div><br/><br/><br/><br/><br/>
        <Footer/>
    </div>
  );
};

export default NotificationPage;
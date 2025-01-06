import React, { useEffect, useState } from 'react';
import './DoctorNotification.css';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';

const DoctorNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const auth = useAuth()
    const doctorId = auth.auth.user.id
    

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get(`doctors/get-notifications/${doctorId}`);
                setNotifications(response.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.patch(`doctors/mark-as-read/${notificationId}/`);
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === notificationId ? { ...notif, doctor_is_read: true } : notif
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <div className="notifications-container">
            <h2>Notifications</h2>
            <div className="notifications-list">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`notification-card ${
                            notif.doctor_is_read ? 'read' : 'unread'
                        }`}
                    >
                        <p><strong>{notif.type}</strong></p>
                        <p>{notif.doctor_message}</p>
                        {!notif.doctor_is_read && (
                            <button
                                className="mark-as-read-btn"
                                onClick={() => handleMarkAsRead(notif.id)}
                            >
                                Mark as Read
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorNotifications;
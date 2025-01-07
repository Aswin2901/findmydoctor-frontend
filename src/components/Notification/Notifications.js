import React, { useEffect, useState } from "react";
import "./Notifications.css"; // Import the CSS file for styles
import api from '../../services/api'

const Notifications = ({ userId, role }) => {
    const [notifications, setNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [notificationsPerPage] = useState(5);
    const [error, setError] = useState(null);
    const [newNotification, setNewNotification] = useState(null);

    console.log('role' , role)
    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            setError("Access token not found. Please log in.");
            return;
        }

        const socket = new WebSocket(
            `wss://findmydoctor.xyz/ws/notifications/${userId}/?token=${token}&role=${role}`
        );

        socket.onopen = () => {
            console.log("WebSocket connection opened for notifications.");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "old_notifications") {
                console.log('data :' ,data.data)
                setNotifications(data.data);
            } else if (data.type === "new_notification") {
                setNotifications((prevNotifications) => [
                    data.notification, 
                    ...prevNotifications, 
                ]);
            }
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed.");
        };

        return () => {
            socket.close();
        };
    }, [userId]);

    const markAsRead = async (index, notificationId) => {
        try {
            const response = await api.patch(
                `appointments/notifications/${notificationId}/mark-as-read/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            );
    
            if (response.status === 200) {
                setNotifications((prev) =>
                    prev.map((notif, i) =>
                        i === index ? { ...notif, is_read: true } : notif
                    )
                );
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const closeAlert = () => {
        setNewNotification(null);
    };

    const markAlertAsRead = () => {
        setNewNotification({ ...newNotification, is_read: true });
        closeAlert();
    };

    // Pagination logic
    const indexOfLastNotification = currentPage * notificationsPerPage;
    const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
    const currentNotifications = notifications.slice(
        indexOfFirstNotification,
        indexOfLastNotification
    );

    const totalPages = Math.ceil(notifications.length / notificationsPerPage);

    return (
        <div className="notifications-container">
            <h3>Notifications</h3>
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

            {newNotification && (
                <div className="notification-alert">
                    <h4>New Notification</h4>
                    <p>
                        {role === "doctor"
                            ? newNotification.doctor_message
                            : newNotification.patient_message}
                    </p>
                    <div className="alert-buttons">
                        <button onClick={closeAlert}>Close</button>
                        <button onClick={markAlertAsRead}>Mark as Read</button>
                    </div>
                </div>
            )}

            {notifications.length === 0 ? (
                <p>No notifications yet.</p>
            ) : (
                <>
                    <ul className="notifications-list">
                        {currentNotifications.map((notif, index) => (
                            <li
                                key={index}
                                className={`notification-item ${
                                    notif.is_read ? "read" : "unread"
                                }`}
                            >
                                {console.log('notification ' , notif.doctor_message)}
                                <h4>{notif.type}</h4>
                                <p>
                                    {role === "doctor"
                                        ? notif.doctor_message
                                        : notif.patient_message}
                                </p>
                                {/* <small>
                                    {new Date(notif.created_at).toLocaleString()}
                                </small> */}
                                {!notif.is_read && (
                                    <button
                                        className="mark-read-button"
                                        onClick={() => markAsRead(index, notif.id)}
                                    >
                                        Mark as Read
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="pagination">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                className={`page-button ${
                                    currentPage === i + 1 ? "active" : ""
                                }`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Notifications;

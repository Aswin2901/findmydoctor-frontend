import React, { useState, useEffect } from "react";
import "./DoctorNav.css";
import logo from "../../../Images/icon.svg";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const DoctorNav = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const isAuthenticated = auth.auth.is_authenticated;
    const user = auth.auth.user;

    const [userId, setUserId] = useState(user?.id || null);
    const [notifications, setNotifications] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [alertBox, setAlertBox] = useState({
        isVisible: false,
        message: "",
        notificationId: null,
    });

    // Update userId dynamically when `user` changes
    useEffect(() => {
        if (user) {
            setUserId(user.id);
        }
    }, [user]);

    // WebSocket connection for notifications
    useEffect(() => {
        if (isAuthenticated && userId) {
            const token = localStorage.getItem("access_token");
            const role = JSON.parse(localStorage.getItem("user"))?.role || "doctor";
    
            if (!token) {
                console.error("Access token not found. Please log in.");
                return;
            }
    
            const socket = new WebSocket(
                `https://findmydoctor.xyz/ws/notifications/${userId}/?token=${token}&role=${role}`
            );
    
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("WebSocket Message Received:", data);
    
                if (data.type === "old_notifications") {
                    setNotifications(data.data);
                    setUnreadCount(data.data.filter((notif) => !notif.is_read).length);
                } else if (data.type === "new_notification") {
                    console.log("New Notification Received:", data.notification);
                    setNotifications((prevNotifications) => [
                        data.notification,
                        ...prevNotifications,
                    ]);
                    setUnreadCount((prevCount) => prevCount + 1);
    
                    setAlertBox({
                        isVisible: true,
                        message: data.notification.doctor_message || "New Notification",
                        notificationId: data.notification.id,
                    });
                }
            };
    
            socket.onclose = () => console.log("WebSocket disconnected");
            socket.onerror = (error) => console.error("WebSocket error", error);
    
            return () => {
                socket.close();
            };
        }
    }, [isAuthenticated, userId]);

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    const handleReadIt = () => {
        navigate('/doctordashboard', { state: { activeMenu: 'notifications' } })
        setAlertBox({ isVisible: false, message: "", notificationId: null });
    };

    const handleCloseAlert = () => {
        setAlertBox({ isVisible: false, message: "", notificationId: null });
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <img src={logo} alt="Find My Doctor Logo" />
                <span>
                    FIND <span className="highlight">MY</span> DOCTOR
                </span>
            </div>
            <div className="navbar-links">
                <div className="navbar-notification">
                    <div className="notification-button" onClick={toggleDropdown}>
                        <i className="fa fa-bell"></i>
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </div>
                    {isDropdownOpen && (
                        <div className="notification-dropdown">
                            {notifications.length > 0 ? (
                                notifications
                                    .slice(0, 3)
                                    .map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`notification-item ${
                                                notif.is_read ? "read" : "unread"
                                            }`}
                                        >
                                            <p>
                                                <strong>{notif.type}</strong>
                                            </p>
                                            <p>{notif.doctor_message}</p>
                                        </div>
                                    ))
                            ) : (
                                <p className="no-notifications">No new notifications</p>
                            )}
                            <div className="view-all">
                                <button
                                    onClick={() => navigate('/doctordashboard', { state: { activeMenu: 'notifications' } })}
                                >
                                    View All
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="navbar-user-icon">
                    {isAuthenticated ? (
                        <button onClick={() => navigate("/doctor/profile")}>
                            <i className="fa fa-user"></i>
                        </button>
                    ) : (
                        <button onClick={() => navigate("/")}>Login</button>
                    )}
                </div>
            </div>
            {alertBox.isVisible && (
                <div className="custom-alert-box">
                    <p className="alert-message">{alertBox.message}</p>
                    <div className="alert-buttons">
                        <button className="alert-read-btn" onClick={handleReadIt}>
                            Read It
                        </button>
                        <button className="alert-close-btn" onClick={handleCloseAlert}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default DoctorNav;

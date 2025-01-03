import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../../Images/icon.svg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const Navbar = () => {
    const navigate = useNavigate();
    const auth = useAuth();
    const isAuthenticated = auth.auth.is_authenticated;
    const user = auth.auth.user;

    // State for userId
    const [userId, setUserId] = useState(user?.id || null);

    // Notifications state
    const [notifications, setNotifications] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // State for custom alert box
    const [alertBox, setAlertBox] = useState({ isVisible: false, message: "", notificationId: null });

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

            if (!token) {
                console.error("Access token not found. Please log in.");
                return;
            }

            const socket = new WebSocket(
                `ws://127.0.0.1:8000/ws/notifications/${userId}/?token=${token}`
            );

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "old_notifications") {
                    setNotifications(data.data);
                    setUnreadCount(data.data.filter((notif) => !notif.is_read).length);
                } else if (data.type === "new_notification") {
                    setNotifications((prevNotifications) => [
                        data.notification,
                        ...prevNotifications,
                    ]);
                    setUnreadCount((prevCount) => prevCount + 1);

                    // Show custom alert box for the new notification
                    setAlertBox({
                        isVisible: true,
                        message: data.notification.patient_message,
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

    // Toggle notification dropdown
    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    // Handle "Read It" button action
    const handleReadIt = () => {
        navigate("/profile", { state: { section: "notification" } });
        setAlertBox({ isVisible: false, message: "", notificationId: null });
    };

    // Handle "Close" button action
    const handleCloseAlert = () => {
        setAlertBox({ isVisible: false, message: "", notificationId: null });
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo" onClick={()=>{
                navigate('/home')
            }}>
                <img src={logo} alt="Find My Doctor Logo" />
                <span>
                    FIND <span className="highlight">MY</span> DOCTOR
                </span>
            </div>
            <div className="navbar-links">            
                {isAuthenticated && (
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
                                                className={`notification-item ${notif.is_read ? "read" : "unread"}`}
                                            >
                                                <p>
                                                    <strong>{notif.type}</strong>
                                                </p>
                                                <p>{notif.patient_message}</p>
                                            </div>
                                        ))
                                ) : (
                                    <p className="no-notifications">No new notifications</p>
                                )}
                                <div className="view-all">
                                    <button
                                        onClick={() =>
                                            navigate("/profile", { state: { section: "notification" } })
                                        }
                                    >
                                        View All
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div className="navbar-user-icon">
                    {isAuthenticated ? (
                        <button onClick={() => navigate("/profile")}>
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

export default Navbar;
import React from 'react';
import './AdminNav.css';
import logo from '../../../Images/icon.svg';

const AdminNav = () => {
    // for git issue i am adding a commant 

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <img src={logo} alt="Find My Doctor Logo" />
                <span>FIND <span className="highlight">MY</span> DOCTOR</span>
            </div>
        </nav>
    );
};

export default AdminNav;

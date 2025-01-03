import React from 'react';
import './Footer.css';
import { FaInstagram, FaLinkedin, FaTwitter, FaEnvelope, FaGlobe } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-text">
                    <h2>
                        READY FOR YOUR <span className="highlight">NEXT</span> STEP
                        <br /> TOWARDS BETTER <span className="highlight">HEALTH</span>?
                    </h2>
                </div>
                <div className="footer-icons">
                    <FaGlobe className="footer-icon" />
                    <FaInstagram className="footer-icon" />
                    <FaLinkedin className="footer-icon" />
                    <FaTwitter className="footer-icon" />
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-email">
                    <FaEnvelope className="email-icon" /> info@findmydoctor.com
                </div>
                <div className="footer-links">
                    <a href="/privacy">privacy policy</a>
                    <a href="/terms">terms & conditions</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

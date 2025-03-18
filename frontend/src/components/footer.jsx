// components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content container">
        <div className="footer-section">
          <h3 className="footer-title">About Us</h3>
          <p className="footer-text">
            Dedicated to preserving and promoting the brilliance of dance through 
            performances, education, and community programs that inspire and transform lives.
          </p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/events">Performances</Link></li>
            <li><Link to="/education">Classes & Workshops</Link></li>
            <li><Link to="/community">Community Programs</Link></li>
            <li><Link to="/about">Our History</Link></li>
            <li><Link to="/donate">Support Us</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Contact Us</h3>
          <ul className="footer-contact">
            <li>
              <i className="fas fa-map-marker-alt"></i>
              <span>123 Dance Avenue, New York, NY 10001</span>
            </li>
            <li>
              <i className="fas fa-phone"></i>
              <span>(212) 555-0123</span>
            </li>
            <li>
              <i className="fas fa-envelope"></i>
              <span>info@dancestudio.org</span>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Newsletter</h3>
          <p className="footer-text">
            Stay updated with our latest performances and events.
          </p>
          <form className="footer-form">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="footer-input" 
              required 
            />
            <button type="submit" className="footer-button">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>&copy; {currentYear} Dance Studio. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/accessibility">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
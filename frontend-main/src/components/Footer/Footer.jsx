import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./style.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container01">
        <div className="footer-top">
          <div className="footer-logo">
            <h2>ShopZone</h2>
            <p>Your one-stop shop for the best deals!</p>
          </div>

          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/seller/signup" className="sell-link">Sell With Us</Link></li>
            </ul>
          </div>

          <div className="footer-social">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
            </div>
          </div>
        </div>

        <hr />

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ShopZone. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
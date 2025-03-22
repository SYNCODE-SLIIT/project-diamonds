import React from 'react';
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa';
import '../styles/Footer.css';
import logo from '../assets/Realistic_Golden_Logo_Mockup.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black text-white py-10 font-custom">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row justify-between mb-16">
          {/* Logo column */}
          <div className="mb-8 md:mb-0">
            <div className="text-7xl font-bold mb-6">
              <img src = {logo}  alt="Logo" className="h-35" />
            </div>
          </div>
          
          {/* Navigation links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-6">
            <div>
              <ul className="space-y-4 text-2xl md:text-3xl font-bold">
                <li><a href="/visit" className="hover:text-gray-300">VISIT</a></li>
                <li><a href="/blog" className="hover:text-gray-300">BLOG</a></li>
                <li><a href="/shop" className="hover:text-gray-300">SHOP</a></li>
              </ul>
            </div>
            
            <div>
              <ul className="space-y-4 text-2xl md:text-3xl font-bold">
                <li><a href="/rentals" className="hover:text-gray-300">RENTALS</a></li>
                <li><a href="/careers" className="hover:text-gray-300">CAREERS</a></li>
                <li><a href="/press" className="hover:text-gray-300">PRESS</a></li>
              </ul>
            </div>
            
            <div>
              <ul className="space-y-4 text-2xl md:text-3xl font-bold">
                <li><a href="/faqs" className="hover:text-gray-300">FAQS</a></li>
                <li><a href="/contact" className="hover:text-gray-300">CONTACT</a></li>
              </ul>
            </div>
          </div>
          
          {/* Newsletter signup */}
          <div className="mt-8 md:mt-0">
            <h3 className="text-base mb-4">Sign up for our newsletter</h3>
            <div className="flex">
              <input 
                type="email" 
                placeholder="E-MAIL ADDRESS" 
                className="bg-black border border-white px-4 py-2 w-full text-white"
              />
              <button className="bg-white text-black px-4 py-2 font-bold whitespace-nowrap">
                SIGN UP
              </button>
            </div>
            
            {/* Social media links */}
            <div className="mt-6">
              <h3 className="text-base mb-4">Follow us</h3>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/team_diamonds__?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="text-2xl hover:text-gray-300">
                  <FaInstagram />
                </a>
                <a href="https://www.facebook.com/profile.php?id=100085976169239" className="text-2xl hover:text-gray-300">
                  <FaFacebook />
                </a>
                <a href="https://www.tiktok.com/@team.diamonds.official?_t=ZS-8uokajXeeHP&_r=1" className="text-2xl hover:text-gray-300">
                  <FaTiktok />
                </a>
                <a href="https://youtube.com/@teamdiamondsmanagement?si=24nuW9ZX8jbByWG1" className="text-2xl hover:text-gray-300">
                  <FaYoutube />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom footer */}
        <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between text-xs text-gray-400">
          <div>
            © {currentYear} Team Diamonds, Inc. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/consumer-information" className="hover:text-white">Consumer Information</a>
            <a href="/privacy-policy" className="hover:text-white">Privacy Policy</a>
            <a href="/terms" className="hover:text-white">Terms & Conditions</a>
            <a href="/credits" className="hover:text-white">Site Credits</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
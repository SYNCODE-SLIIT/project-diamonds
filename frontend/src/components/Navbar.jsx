import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Realistic_Golden_Logo_Mockup.png';
import ourStory from '../assets/our-story-background.png';
import community from '../assets/community-background.png';
import perfomances from '../assets/performances-background.png';
import training from '../assets/training-background.png';
import classes from '../assets/classes-background.png';
import give from '../assets/give-background.png';


const Navbar = () => {
  const [dropdown, setDropdown] = useState(null);

  const menuItems = [
    {
      title: 'OUR STORY',
      submenu: [
        { name: 'OUR FOUNDER', description: 'Learn about our visionary founder.' },
        { name: 'OUR HISTORY', description: 'Explore our milestones.' },
        { name: 'OUR PEOPLE', description: 'Meet our dedicated team.' },
        { name: 'OUR COMPANIES', description: 'Discover our brand network.' },
      ],
      image: ourStory,
    },
    {
      title: 'PERFORMANCES',
      submenu: [
        { name: 'Upcoming Shows', description: 'Book tickets for upcoming events.' },
        { name: 'Past Performances', description: 'Explore our event history.' },
        { name: 'Tickets', description: 'Purchase tickets online.' },
      ],
      image: perfomances,
    },
    {
      title: 'TRAINING',
      submenu: [
        { name: 'Workshops', description: 'Join our in-depth workshops.' },
        { name: 'Online Classes', description: 'Learn from anywhere.' },
        { name: 'Certifications', description: 'Get certified with us.' },
      ],
      image: training,
    },
    {
      title: 'COMMUNITY',
      submenu: [
        { name: 'Outreach Programs', description: 'Give back to the community.' },
        { name: 'Events', description: 'Join local events.' },
        { name: 'Volunteer', description: 'Be a part of our mission.' },
      ],
      image: community,
    },
    {
      title: 'CLASSES',
      submenu: [
        { name: 'Ballet', description: 'Master the elegance of ballet.' },
        { name: 'Hip-Hop', description: 'Learn energetic moves.' },
        { name: 'Contemporary', description: 'Express through dance.' },
        { name: 'Jazz', description: 'Blend styles with jazz.' },
      ],
      image: classes,
    },
    {
      title: 'GIVE',
      submenu: [
        { name: 'Donate', description: 'Support our mission.' },
        { name: 'Sponsorship', description: 'Partner with us.' },
        { name: 'Fundraising', description: 'Join our fundraising events.' },
      ],
      image: give,
    },
  ];

  return (
    <nav className="bg-transparent text-white fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <img src={logo} alt="Diamonds Logo" className="h-20 w-auto" />

        {/* Navbar Items */}
        <ul className="flex space-x-8 ml-auto">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="relative group"
              onMouseEnter={() => setDropdown(index)}
              onMouseLeave={() => setDropdown(null)}
            >
              <button className="px-4 py-2 text-lg font-semibold hover:bg-gray-800 transition duration-300">
                {item.title}
              </button>
            </li>
          ))}
        </ul>

        {/* Right Side Icons */}
        <div className="flex space-x-6 ml-auto">
          <i className="fa-solid fa-search text-lg cursor-pointer"></i>
          <i className="fa-solid fa-calendar-alt text-lg cursor-pointer"></i>
          <button className="px-4 py-2 bg-blue-500 rounded-full hover:bg-blue-600 transition">
            Login
          </button>
        </div>
      </div>

      {/* Fixed Position Dropdown - Separate from the navbar items */}
      {dropdown !== null && (
        <div
          className="fixed left-0 w-full bg-black bg-opacity-80"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${menuItems[dropdown].image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "500px",
            top: "88px", // Adjust based on your navbar height
          }}
          onMouseEnter={() => setDropdown(dropdown)}
          onMouseLeave={() => setDropdown(null)}
        >
          <div className="max-w-6xl mx-auto px-8 py-12 flex">
            {/* Left Side - Main Categories */}
            <div className="w-1/3 border-r border-gray-700 pr-8">
              <h2 className="text-3xl font-bold mb-8">{menuItems[dropdown].title}</h2>
              <ul className="text-left space-y-6">
                {menuItems[dropdown].submenu.map((submenuItem, subIndex) => (
                  <li key={subIndex} className="transition-all duration-300">
                    <Link 
                      to={`/${submenuItem.name.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="text-3xl font-semibold hover:text-gray-300 block font-natamedium"
                    >
                      {submenuItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Right Side - Featured Content */}
            <div className="w-2/3 pl-12">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-medium mb-4">FEATURED</h3>
                  <ul className="space-y-3">
                    <li><Link to="/" className="hover:text-gray-300">Latest News</Link></li>
                    <li><Link to="/" className="hover:text-gray-300">Upcoming Events</Link></li>
                    <li><Link to="/" className="hover:text-gray-300">Special Programs</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-4">HIGHLIGHTS</h3>
                  <ul className="space-y-3">
                    <li><Link to="/" className="hover:text-gray-300">Season Preview</Link></li>
                    <li><Link to="/" className="hover:text-gray-300">Media Gallery</Link></li>
                    <li><Link to="/" className="hover:text-gray-300">Resources</Link></li>
                  </ul>
                </div>
              </div>
              
              {/* Call to Action */}
              <div className="mt-12 border-t border-gray-700 pt-6">
                <h3 className="text-xl font-medium mb-4">DISCOVER MORE</h3>
                <p className="text-gray-300 mb-4">Experience the world of dance with us.</p>
                <Link 
                  to="/" 
                  className="inline-block px-6 py-2 border border-white hover:bg-white hover:text-black transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
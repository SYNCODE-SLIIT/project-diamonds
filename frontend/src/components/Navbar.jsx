import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Realistic_Golden_Logo_Mockup.png';
import ourStory from '../assets/our-story-background.png';
import community from '../assets/community-background.png';
import perfomances from '../assets/performances-background.png';
import training from '../assets/training-background.png';
import classes from '../assets/classes-background.png';
import give from '../assets/give-background.png';
import '../styles/DropdownMenu.css';


const dropdownStyles = [
  { left: "0px" },   // OUR STORY
  { left: "-50px" }, // PERFORMANCES
  { left: "-100px" }, // TRAINING
  { left: "-150px" }, // COMMUNITY
  { left: "-200px" }, // CLASSES
  { left: "-250px" }, // GIVE
];

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

              {dropdown === index && (
  <div
    className="absolute top-full left-0 w-screen bg-black bg-opacity-80"
    style={{
      ...dropdownStyles[index],
      backgroundImage: `url(${item.image})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      minHeight: "300px", // Ensures full height
    }}
    onMouseEnter={() => setDropdown(index)}
    onMouseLeave={() => setDropdown(null)}
  >
    <div className="max-w-6xl mx-auto px-6 py-4">
      <ul className="text-left space-y-4 text-white text-2xl font-semibold">
        {item.submenu.map((submenuItem, subIndex) => (
          <li key={subIndex}>
            <Link to={`/${submenuItem.name.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-gray-300">
              {submenuItem.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
)}

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
    </nav>
  );
};

export default Navbar;

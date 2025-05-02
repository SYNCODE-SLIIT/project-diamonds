import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/DropdownMenu.css';
import assets from '../assets/assets.js';

const Navbar = () => {
  const [dropdown, setDropdown] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const timeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleMouseEnter = (index) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setIsLeaving(false);
    }
    setDropdown(index);
  };

  const handleMouseLeave = () => {
    setIsLeaving(true);
    timeoutRef.current = setTimeout(() => {
      setDropdown(null);
      setActiveSubmenu(null);
    }, 300);
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setIsLeaving(false);
    }
  };

  // Track mouse movements over the dropdown
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dropdownRef.current && isLeaving) {
        const rect = dropdownRef.current.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          setIsLeaving(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isLeaving]);

  const menuItems = [
    {
      title: 'OUR STORY',
      submenu: [
        { 
          name: 'OUR FOUNDER', 
          description: 'Learn about our visionary founder.',
          bulletPoints: [
            'Established in 2001 with a vision for excellence',
            'Award-winning choreographer and performer',
            'Built a legacy of artistic innovation',
            'Committed to community outreach',
            'Pioneered unique teaching methodologies'
          ]
        },
        { 
          name: 'OUR HISTORY', 
          description: 'Explore our milestones.',
          bulletPoints: [
            '20+ years of artistic excellence',
            'Over 200 original productions',
            'International tours across 15 countries',
            'Celebrated milestones and achievements',
            'Evolution of our creative vision'
          ]
        },
        { 
          name: 'OUR PEOPLE', 
          description: 'Meet our dedicated team.',
          bulletPoints: [
            'World-class artistic directors',
            'Industry-recognized performers',
            'Dedicated administrative staff',
            'Experienced technical crew',
            'Passionate volunteer network'
          ]
        },
        { 
          name: 'ACHIEVEMENTS', 
          description: 'Discover our brand network.',
          bulletPoints: [
            'National arts excellence awards',
            'International recognition for innovation',
            'Educational outreach accolades',
            'Media spotlights and features',
            'Artistic influence and impact'
          ]
        },
        { 
          name: 'OUR PARTNERS', 
          description: 'Discover our brand network.',
          bulletPoints: [
            'Corporate sponsorship opportunities',
            'Educational institution collaborations',
            'Community organization partnerships',
            'Media and broadcasting alliances',
            'Foundations and grant relationships'
          ]
        },
      ],
      image: assets.navbar_ourStory,
    },
    {
      title: 'PERFORMANCES',
      submenu: [
        { 
          name: 'Upcoming Shows', 
          description: 'Book tickets for upcoming events.',
          bulletPoints: [
            'Spring showcase - April 2025',
            'Summer outdoor performances',
            'Special guest collaborations',
            'Family-friendly shows',
            'Exclusive members-only events'
          ]
        },
        { 
          name: 'Past Performances', 
          description: 'Explore our event history.',
          bulletPoints: [
            'Archive of previous productions',
            'Historical performance highlights',
            'Notable guest appearances',
            'Award-winning shows',
            'Performance evolution through the years'
          ]
        },
        { 
          name: 'Tickets', 
          description: 'Purchase tickets online.',
          bulletPoints: [
            'Convenient online booking system',
            'Season ticket packages available',
            'Group rates and discounts',
            'VIP and premium seating options',
            'Accessibility accommodations'
          ]
        },
      ],
      image: assets.navbar_performances,
    },
    {
      title: 'JOIN US',
      submenu: [
        { 
          name: 'Why Join?', 
          description: 'Join our in-depth workshops.',
          bulletPoints: [
            'Professional development opportunities',
            'Network with industry professionals',
            'Access to exclusive resources',
            'Performance opportunities',
            'Personal growth and artistic expression'
          ]
        },
        { 
          name: 'Audition Process', 
          description: 'Learn from anywhere.',
          bulletPoints: [
            'Audition preparation workshops',
            'Submission guidelines and requirements',
            'What to expect during auditions',
            'Feedback and follow-up process',
            'Timelines and important dates'
          ]
        },
        { 
          name: 'Training & Development', 
          description: 'Get certified with us.',
          bulletPoints: [
            'Comprehensive skills development',
            'Personalized training tracks',
            'Technical and artistic advancement',
            'Mentorship opportunities',
            'Professional certification programs'
          ]
        },
        { 
          name: 'Apply Now', 
          description: 'Get certified with us.',
          bulletPoints: [
            'Online application process',
            'Required documentation',
            'Application deadlines',
            'Interview preparation tips',
            'Next steps after submission'
          ]
        },
      ],
      image: assets.navbar_joinUs,
    },
    {
      title: 'COMMUNITY',
      submenu: [
        { 
          name: 'Social Media', 
          description: 'Give back to the community.',
          bulletPoints: [
            'Follow us on Instagram and Facebook',
            'Twitter updates for latest news',
            'YouTube channel with performance highlights',
            'LinkedIn professional network',
            'Join our online community forums'
          ]
        },
        {
          name: 'Merchandise',
          description: 'Show your support and represent the team.',
          bulletPoints: [
            'Exclusive Team T-shirts and Hoodies',
            'Custom Team Hats and Beanies',
            'Limited Edition Mugs and Water Bottles',
            'Phone Cases with Team Logo',
            'Stickers and Pins for your collection'
          ]
        },
        { 
          name: 'Feedback', 
          description: 'Join local events.',
          bulletPoints: [
            'Share your experience with us',
            'Performance evaluation surveys',
            'Program improvement suggestions',
            'Testimonial opportunities',
            'Community input sessions'
          ]
        },
        { 
          name: 'FAQ', 
          description: 'Be a part of our mission.',
          bulletPoints: [
            'Common questions answered',
            'Information about our programs',
            'Ticketing and attendance policies',
            'Membership and participation details',
            'Contact information for further inquiries'
          ]
        },
      ],
      image: assets.navbar_community,
    },
    {
      title: 'GALLERY',
      submenu: [
        { 
          name: 'Photos', 
          description: 'Master the elegance of ballet.',
          bulletPoints: [
            'Performance photo collections',
            'Behind-the-scenes galleries',
            'Historical archives',
            'Rehearsal documentation',
            'Special events and milestones'
          ]
        },
        { 
          name: 'Blogs', 
          description: 'Learn energetic moves.',
          bulletPoints: [
            'Artist spotlights and interviews',
            'Creative process insights',
            'Technical tips and information',
            'Industry trends and analysis',
            'Personal stories from our community'
          ]
        },
        { 
          name: 'Press Features', 
          description: 'Express through dance.',
          bulletPoints: [
            'Media coverage and reviews',
            'Magazine and newspaper features',
            'Television appearances',
            'Radio interviews and podcasts',
            'Digital media presence'
          ]
        },
      ],
      image: assets.navbar_gallery,
    },
    {
      title: 'GIVE',
      submenu: [
        { 
          name: 'Donate', 
          description: 'Support our mission.',
          bulletPoints: [
            'One-time donation options',
            'Monthly giving programs',
            'Legacy and planned giving',
            'In-kind donation opportunities',
            'Tax benefits information'
          ]
        },
        { 
          name: 'Sponsorship', 
          description: 'Partner with us.',
          bulletPoints: [
            'Corporate sponsorship packages',
            'Event-specific sponsorships',
            'Season sponsorship opportunities',
            'Benefits and recognition levels',
            'Success stories from current sponsors'
          ]
        },
        { 
          name: 'Fundraising', 
          description: 'Join our fundraising events.',
          bulletPoints: [
            'Annual gala information',
            'Benefit performances',
            'Community fundraising drives',
            'Auction and special events',
            'Volunteer fundraising opportunities'
          ]
        },
      ],
      image: assets.navbar_give,
    },
    isLoggedIn && {
      title: 'MY EVENTS',
      submenu: [
        { 
          name: 'EVENTS', 
          description: 'Manage your upcoming and past events.',
          bulletPoints: [
            'View and manage upcoming events',
            'Edit event details and schedule',
            'Check attendee registrations',
            'Review and archive past events'
          ]
        },
        { 
          name: 'EVENT REQUESTS', 
          description: 'Create and manage event requests.',
          bulletPoints: [
            'Submit a new event request',
            'Track approval status',
            'Update or cancel pending requests',
            'View request history'
          ]
        },
        { 
          name: 'EVENT DASHBOARD', 
          description: 'Analyze event performance and insights.',
          bulletPoints: [
            'View event attendance analytics',
            'Track ticket sales and revenue',
            'Monitor marketing effectiveness',
            'Generate reports on event success'
          ]
        },
        { 
          name: 'EVENT FEEDBACK & REVIEWS', 
          description: 'Gather insights to enhance future events.',
          bulletPoints: [
            'Collect attendee reviews and ratings',
            'Analyze feedback trends',
            'Improve future event planning',
            'Showcase positive testimonials'
          ]
        }
      ],
      image: assets.navbar_events,
    },
  ].filter(Boolean);

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        ease: "easeOut" 
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.2,
        ease: "easeIn" 
      }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: i => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  const bulletPointVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: i => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  return (
    <>
      {/* Fixed Position Dropdown */}
      <AnimatePresence>
        {dropdown !== null && (
          <motion.div
            ref={dropdownRef}
            className="fixed left-0 top-0 w-full bg-opacity-80 z-40"
            style={{
              height: "75vh",
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${menuItems[dropdown].image})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleMouseLeave}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="pt-20"> 
              <div className="max-w-6xl mx-auto px-8 py-6 flex">
                
                <div className="w-1/3 border-r border-gray-700 pr-8 pt-8">
                  <motion.h2 
                    className=" submenu-item text-2xl font-bold mb-8 text-white"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {menuItems[dropdown].title}
                  </motion.h2>
                  <ul className="text-left space-y-1">
                    {menuItems[dropdown].submenu.map((submenuItem, subIndex) => (
                      <motion.li 
                        key={subIndex} 
                        className="submenu-item transition-all duration-300"
                        onMouseEnter={() => setActiveSubmenu(subIndex)}
                        custom={subIndex}
                        variants={listItemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <Link 
                          to={`/${submenuItem.name.toLowerCase().replace(/\s+/g, '-')}`} 
                          className={`text-2xl font-medium text-white hover:text-white block py-3 px-4 border-l-2 relative group transition-all duration-300 ${
                            activeSubmenu === subIndex 
                              ? "border-white text-white bg-black bg-opacity-40" 
                              : "border-transparent text-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{submenuItem.name}</span>
                            <motion.span 
                              className="transform transition-transform duration-300"
                              animate={{ 
                                x: activeSubmenu === subIndex ? 5 : 0
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-4 w-4" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </motion.span>
                          </div>
                        </Link>
                        <div className="h-px bg-gray-700 w-full mt-1 opacity-40"></div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                
                {/* Right Side - Dynamic Bullet Points */}
                <div className="w-2/3 pl-12 relative">
                  <div className="absolute inset-0 bg-opacity-70 backdrop-blur-sm transition-all duration-500"></div>
                  
                  <AnimatePresence mode="wait">
                    {activeSubmenu !== null ? (
                      <motion.div 
                        key={`submenu-${activeSubmenu}`}
                        className="relative z-10 pt-10 mt-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                      > 
                        <motion.h3 
                          className="text-3xl font-bold mb-2 text-white"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {menuItems[dropdown]?.submenu[activeSubmenu]?.name}
                        </motion.h3>
                        <motion.p 
                          className="text-xl text-gray-300 mb-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          {menuItems[dropdown]?.submenu[activeSubmenu]?.description}
                        </motion.p>
                        
                        <ul className="space-y-2 pl-5">
                          {menuItems[dropdown]?.submenu[activeSubmenu]?.bulletPoints.map((point, idx) => (
                            <motion.li 
                              key={idx} 
                              className="flex items-start"
                              custom={idx}
                              variants={bulletPointVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <span className="text-yellow-400 mr-3 mt-1 text-2xl">•</span>
                              <span className="text-gray-100 text-lg font-medium">{point}</span>
                            </motion.li>
                          ))}
                        </ul>
                        
                        <motion.div 
                          className="mt-6 pt-4 border-t border-gray-700"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          <Link 
                            to={`/${menuItems[dropdown]?.submenu[activeSubmenu]?.name.toLowerCase().replace(/\s+/g, '-')}`} 
                            className="inline-block px-6 py-3 text-lg text-white hover:bg-white hover:text-black transition-all duration-300 rounded-xl"
                          >
                            Learn More
                          </Link>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="default-content"
                        className="relative z-10 pt-20 mt-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.h3 
                          className="text-3xl font-medium mb-6 text-white"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          DISCOVER {menuItems[dropdown]?.title}
                        </motion.h3>
                        <motion.p 
                          className="text-xl text-gray-300 mb-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          
                        </motion.p>
                        <div className="grid grid-cols-2 gap-8">
                          {/* Featured and Highlights sections would go here */}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
      <motion.nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-black' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="w-full px-6 py-4 flex justify-between items-center">
          {/* Left side: Logo and nav items - Now aligned to the far left */}
          <div className="flex items-center space-x-8 pl-4">
            {/* Logo with subtle animation */}
            <Link to="/">
            <motion.img 
              src={assets.logo2} 
              alt="Diamonds Logo" 
              className="h-20 w-auto" 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            />
            </Link>

            {/* Navbar Items */}
            <ul className="flex space-x-6">
              {menuItems.map((item, index) => (
                <motion.li
                  key={index}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }}
                >
                  <motion.button 
                    className="px-4 py-2 text-lg font-semibold hover:bg-gray-800 hover:bg-opacity-70 rounded-lg transition duration-300 text-amber-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.title}
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          </div>

          
          {/* Right side icons - Now aligned to the far right */}
          <div className="flex space-x-8 pr-4">
            {/* Icons with animations */}
            {[
              { icon: "fa-solid fa-search", delay: 0.2 },
              { icon: "fa-solid fa-calendar-alt", delay: 0.3 },
              { icon: "fa-solid fa-ticket", delay: 0.4 },
              { icon: "fa-solid fa-user", delay: 0.5 }
            ].map((item, index) => (
              <motion.button 
                key={index}
                className="text-2xl text-white hover:text-gray-300 transition"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: item.delay }}
                whileHover={{ 
                  scale: 1.15, 
                  rotate: [0, -5, 5, -5, 0],
                  transition: { duration: 0.4 } 
                }}
                whileTap={{ scale: 0.9 }}
                onClick={
                  item.icon === "fa-solid fa-user"
                    ? () => {
                        const token = localStorage.getItem("token");
                        if (token) {
                          navigate("/organizer-profile");
                        } else {
                          navigate("/login");
                        }
                      }
                    : undefined
                }
              >
                <i className={item.icon}></i>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;
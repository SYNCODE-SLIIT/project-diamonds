import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import assets from '../assets/assets.js';

const Home = () => {
  // State for slideshow
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      type: 'image',
      src: assets.slideImage1,
      title: 'Welcome to Team Diamonds',
      subtitle: 'Where passion meets performance'
    },
    {
      type: 'image',
      src: assets.slideImage2,
      title: 'Excellence in Motion',
      subtitle: 'Creating unforgettable experiences'
    },
    {
      type: 'video',
      src: assets.slideVideo1,
      title: 'The Diamond Experience',
      subtitle: 'Witness the magic unfold'
    }
  ];

  // Events data
  const events = [
    {
      image: assets.event1,
      date: 'Apr 15, 2025',
      venue: 'Grand Palace',
      name: 'Spring Showcase',
      description: 'An evening of spectacular performances highlighting our newest choreography.'
    },
    {
      image:  assets.event2,
      date: 'May 20, 2025',
      venue: 'City Center',
      name: 'Urban Rhythms Festival',
      description: 'Join us for an explosive night of contemporary dance and music.'
    },
    {
      image:  assets.event3,
      date: 'Jun 8, 2025',
      venue: 'Lakeside Arena',
      name: 'Summer Extravaganza',
      description: 'Our annual summer event featuring guest performers and special surprises.'
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      image: assets.testimonial1,
      name: 'Imasha Ranasinghe',
      role: 'Corporate Client',
      quote: 'Project Diamonds transformed our company gala into an unforgettable experience. Their energy and professionalism were outstanding!'
    },
    {
      image: assets.testimonial2,
      name: 'Avindhya Bandara',
      role: 'Team Member',
      quote: "Being part of Project Diamonds has been life-changing. The training, the performances, the community - it's all exceptional."
    },
    {
      image: assets.testimonial3,
      name: 'Kavishka Jayakody',
      role: 'Event Organizer',
      quote: 'Working with Project Diamonds is always a pleasure. They consistently deliver beyond expectations and are incredibly reliable.'
    }
  ];

  // Gallery images
  const galleryImages = [assets.gallery1, assets.gallery2, assets.gallery3, assets.gallery4];


  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Load social media embed scripts
  useEffect(() => {
    // Function to load script
    const loadScript = (src, id) => {
      return new Promise((resolve, reject) => {
        // Check if script already exists
        if (document.getElementById(id)) {
          resolve();
          return;
        }
        
        // Create script element
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.async = true;
        
        // Set up resolution/rejection
        script.onload = resolve;
        script.onerror = reject;
        
        // Add to document
        document.body.appendChild(script);
      });
    };
    
    // Load all necessary scripts
    Promise.all([
      loadScript('https://www.instagram.com/embed.js', 'instagram-script'),
      loadScript('https://www.tiktok.com/embed.js', 'tiktok-script')
    ]).catch(error => console.error('Error loading social media scripts:', error));
    
    // Cleanup function
    return () => {
      const instagramScript = document.getElementById('instagram-script');
      const tiktokScript = document.getElementById('tiktok-script');
      
      if (instagramScript) document.body.removeChild(instagramScript);
      if (tiktokScript) document.body.removeChild(tiktokScript);
    };
  }, []);

  return (
    
    <div className="flex flex-col min-h-screen">
      {/* Background with fixed height that covers the entire page */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-top -z-10"
      ></div>
      
      {/* Content container */}
      <div className="flex flex-col min-h-screen">
        {/* Navbar at top */}
        <Navbar />
        
        {/* Main content area that grows to push footer down */}
        <div className="flex-grow">
          {/* 1. Slideshow Hero Section - UPDATED */}
          <section className="relative h-screen w-full overflow-hidden">
            {slides.map((slide, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <div className="relative w-full h-full object-cover z-20">
                  {slide.type === 'image' ? (
                    <img 
                      src={slide.src} 
                      alt={slide.title}
                      className="w-full h-full object-cover z-10"
                      onError={(e) => {
                        console.error(`Error loading image for slide ${index}:`, e);
                        e.target.src = assets.slideImage1; 
                      }} 
                    />
                  ) : (
                    <video 
                      src={slide.src} 
                      className="w-full h-full object-cover"
                      autoPlay 
                      muted 
                      loop
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-black opacity-50 z-15"></div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 z-20">
  <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">{slide.title}</h1>
  <p className="text-xl md:text-2xl text-center max-w-3xl">{slide.subtitle}</p>
</div>
                </div>
              </div>
            ))}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
              {slides.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-3 w-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-gray-400'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </section>


{/* 2. About Section - FAQ with Image */}
<section className="py-20 px-4 md:px-8 bg-white">
  <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-start ">
    <div className="rounded-lg overflow-hidden shadow-xl h-full">
      <img 
        src={assets.about} 
        alt="Project Diamonds Team" 
        className="w-full h-full object-cover"
      />
    </div>
    
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">About Team Diamonds</h2>
      <p className="text-lg text-gray-600 mb-8">
        Team Diamonds is a collective of passionate performers dedicated to pushing the boundaries of artistic expression. Founded in 2022, our team brings together diverse talents to create mesmerizing performances.
      </p>
      
      <div className="space-y-4">
        {/* FAQ Item 1 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            onClick={() => {
              const content = document.getElementById('faq-1');
              const isOpen = content.style.maxHeight !== '0px' && content.style.maxHeight;
              content.style.maxHeight = isOpen ? '0px' : '300px';
            }}
          >
            <h3 className="text-lg font-medium text-gray-800">Who are Team Diamonds?</h3>
            <svg 
              className="h-5 w-5 text-indigo-500 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div 
            id="faq-1"
            className="max-h-0 overflow-hidden transition-all duration-300"
            style={{ maxHeight: '0px' }}
          >
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-600">
                Team Diamonds is a passionate group of performers dedicated to delivering breathtaking dance performances. The team consists of talented dancers from diverse backgrounds who come together to create visually stunning and emotionally impactful performances.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Item 2 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            onClick={() => {
              const content = document.getElementById('faq-2');
              const isOpen = content.style.maxHeight !== '0px' && content.style.maxHeight;
              content.style.maxHeight = isOpen ? '0px' : '300px';
            }}
          >
            <h3 className="text-lg font-medium text-gray-800">When was Team Diamonds founded?</h3>
            <svg 
              className="h-5 w-5 text-indigo-500 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div 
            id="faq-2"
            className="max-h-0 overflow-hidden transition-all duration-300"
            style={{ maxHeight: '0px' }}
          >
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-600">
                Team Diamonds was founded in 2022 by Avinaash Dias at SLIIT. Since then, the team has grown into a recognized name in the performance industry, known for its high-energy and creative choreography.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Item 3 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            onClick={() => {
              const content = document.getElementById('faq-3');
              const isOpen = content.style.maxHeight !== '0px' && content.style.maxHeight;
              content.style.maxHeight = isOpen ? '0px' : '300px';
            }}
          >
            <h3 className="text-lg font-medium text-gray-800">What types of performances does the team specialize in?</h3>
            <svg 
              className="h-5 w-5 text-indigo-500 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div 
            id="faq-3"
            className="max-h-0 overflow-hidden transition-all duration-300"
            style={{ maxHeight: '0px' }}
          >
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-600">
                The team specializes in a variety of dance styles, including contemporary, hip-hop, cultural fusion, and thematic performances. Whether it's a high-energy routine or a storytelling piece, Team Diamonds brings versatility and passion to every stage.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Item 4 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            onClick={() => {
              const content = document.getElementById('faq-4');
              const isOpen = content.style.maxHeight !== '0px' && content.style.maxHeight;
              content.style.maxHeight = isOpen ? '0px' : '300px';
            }}
          >
            <h3 className="text-lg font-medium text-gray-800">What kind of events does Team Diamonds perform at?</h3>
            <svg 
              className="h-5 w-5 text-indigo-500 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div 
            id="faq-4"
            className="max-h-0 overflow-hidden transition-all duration-300"
            style={{ maxHeight: '0px' }}
          >
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-600">
                Team Diamonds performs at various events, including corporate functions, weddings, private parties, cultural festivals, music video productions, and charity events. The team customizes performances to suit the occasion and audience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

          {/* 3. Featured Events Section */}
          <section className="py-20 px-4 md:px-8 bg-gray-100">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Upcoming Events</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {events.map((event, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
                    <div className="relative">
                      <img 
                        src={event.image} 
                        alt={event.name} 
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute top-0 right-0 bg-black bg-opacity-75 text-white p-3 rounded-bl-lg">
                        <div className="text-sm font-semibold">{event.date}</div>
                        <div className="text-xs">{event.venue}</div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-800">{event.name}</h3>
                      <p className="text-gray-600 mb-4">{event.description}</p>
                      <button className="text-blue-600 font-semibold hover:text-blue-800 transition">
                        Learn more →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg">
                  View All Upcoming Shows
                </button>
              </div>
            </div>
          </section>

          {/* 4. Highlight Section */}
          <section className="relative h-96 md:h-[700px]">
            <img 
              src={assets.slideImage2} 
              alt="Project Diamonds Highlight" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black opacity-50 "></div>
            <div className="absolute inset-0  flex flex-col items-center justify-center text-white p-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Experience the Extraordinary</h2>
              <p className="text-lg md:text-xl text-center max-w-3xl">
                Team Diamonds creates unique moments that transcend ordinary performances. 
                Our signature blend of artistry, innovation, and precision delivers unforgettable 
                experiences for audiences of all kinds.
              </p>
            </div>
          </section>

          {/* 5. Training Section */}
          <section className="py-20 px-4 md:px-8 bg-white">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center p-10">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <video 
                  src={assets.slideVideo1} 
                  className="w-full h-full object-cover"
                  controls
                  poster={assets.slideImage1}
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">World-Class Training</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Excellence doesn't happen by accident. At Team Diamonds, we maintain a rigorous 
                  training regimen that develops not just technical skills, but also creativity, 
                  adaptability, and teamwork. Our training program is designed to bring out the best 
                  in each performer while strengthening our collective artistic vision.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg">
                  Learn More
                </button>
              </div>
            </div>
          </section>

          {/* 6. Testimonials Section */}
          <section className="py-20 px-4 md:px-8 bg-gray-100 ">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">What People Say</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-lg">
                    <div className="flex items-center mb-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h3 className="font-bold text-gray-800">{testimonial.name}</h3>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="text-6xl text-blue-200 absolute top-0 left-0">"</span>
                      <p className="text-gray-600 relative z-10 pl-6 pt-4">
                        {testimonial.quote}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 7. Call-to-Action Section */}
          <section className="py-20 px-4 md:px-8 bg-blue-700 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Make Your Event Spectacular?</h2>
              <p className="text-xl mb-8">
                Whether you're looking to book Project Diamonds for your next event or interested in joining our team,
                we'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition shadow-lg">
                  Book Us Now
                </button>
                <button className="bg-transparent hover:bg-blue-800 border-2 border-white font-bold py-3 px-8 rounded-lg transition shadow-lg">
                  Join Our Team
                </button>
              </div>
            </div>
          </section>

          {/* 8. Gallery & Social Media Section */}
          <section className="py-20 px-4 md:px-8 bg-white">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Gallery & Social Media</h2>
              
              {/* Gallery */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                {galleryImages.map((image, index) => (
                  <div key={index} className="overflow-hidden rounded-lg shadow-lg">
                    <img 
                      src={image} 
                      alt={`Gallery image ${index + 1}`} 
                      className="w-full h-64 object-cover hover:scale-110 transition duration-500"
                    />
                  </div>
                ))}
              </div>
              
              {/* Social Media Feeds */}
              <div>
                <h3 className="text-2xl font-bold mb-8 text-center text-gray-800">Follow Us</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Instagram Feed */}
                  <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                    <h4 className="font-bold mb-4 flex items-center text-gray-800">
                      <svg className="w-6 h-6 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
                      </svg>
                      Instagram
                    </h4>
                    <div className="instagram-container w-full h-106 bg-gray-200 rounded overflow-hidden">
                      <iframe
                        src="https://www.instagram.com/team_diamonds__/embed"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        allowtransparency="true"
                        className="w-full h-full"
                      ></iframe>
                    </div>
                    <a
                      href="https://www.instagram.com/team_diamonds__"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center mt-4 text-blue-600 font-semibold hover:text-blue-800"
                    >
                      Follow us on Instagram
                    </a>
                  </div>

                  {/* YouTube Feed */}
                  <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                    <h4 className="font-bold mb-4 flex items-center text-gray-800">
                      <svg className="w-6 h-6 mr-2 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      YouTube
                    </h4>
                    <div className="youtube-container w-full h-96 bg-gray-200 rounded overflow-hidden">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src="https://www.youtube.com/embed?listType=user_uploads&list=Teamdiamondsmanagement" 
                        title="YouTube Channel Videos" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                    <a
                      href="https://www.youtube.com/@Teamdiamondsmanagement/videos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center mt-4 text-blue-600 font-semibold hover:text-blue-800"
                    >
                      Watch More on YouTube
                    </a>
                  </div>

                  {/* TikTok Feed */}
                  <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                    <h4 className="font-bold mb-4 flex items-center text-gray-800">
                      <svg className="w-6 h-6 mr-2 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                      TikTok
                    </h4>
                    <div className="tiktok-container w-full h-96 bg-gray-200 rounded overflow-hidden">
                      <iframe
                        src="https://www.tiktok.com/embed/v2/@team.diamonds.official"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allowFullScreen
                        allow="encrypted-media"
                        className="w-full h-full"
                      ></iframe>
                    </div>
                    <a
                      href="https://www.tiktok.com/@team.diamonds.official"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center mt-4 text-blue-600 font-semibold hover:text-blue-800"
                    >
                      Follow us on TikTok
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        {/* Footer at bottom */}
        <Footer />
      </div>
    </div>
  );
};

export default Home;
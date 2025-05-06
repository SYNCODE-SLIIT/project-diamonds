import React, { useState, useEffect, useRef } from "react";
import assets from "../assets/assets.js";
import { 
  Instagram, 
  Facebook, 
  Linkedin, 
  ChevronLeft, 
  ChevronRight, 
  Quote,
  Award,
  GraduationCap,
  ArrowRight,
  ExternalLink 
} from "lucide-react";
import { FaTiktok } from 'react-icons/fa';

const OurFounderPage = () => {
  // For hero slideshow carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    assets.avinaash1,
    assets.avinaash2,
    assets.avinaash4
  ];

  // For image slider section
  const [currentSliderImage, setCurrentSliderImage] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2022);
  const sliderImages = [
    assets.gallery1,
    assets.gallery2,
    assets.gallery3,
    assets.gallery4,
    assets.avinaash1,
    assets.avinaash2
  ];

  // Origin story content for each year
  const yearStories = {
    2022: {
      title: "International Expansion",
      paragraphs: [
        "After consolidating the company's success in Sri Lanka, Avinaash expanded Diamond Dance Company's reach internationally. The team participated in dance festivals across Asia, showcasing the unique fusion of traditional Sri Lankan dance with contemporary styles. This year marked a significant milestone when the company performed at the World Dance Congress in Singapore, earning accolades for cultural innovation.",
        "In addition to performances, 2022 saw the launch of Diamond Dance Academy, offering structured training programs for aspiring dancers of all ages. The academy became the first in Sri Lanka to offer certified courses in both traditional and contemporary dance forms, with specialized programs for professional development.",
        "By the end of 2022, the company had grown to 25 full-time dancers and expanded its repertoire to include elaborate productions that combined dance, theatre, and multimedia elements, further cementing its reputation as Sri Lanka's premier dance company."
      ]
    },
    2023: {
      title: "Digital Transformation",
      paragraphs: [
        "In 2023, Avinaash led Diamond Dance Company through a digital transformation, launching an online platform that brought Sri Lankan dance to global audiences. The company's virtual performances and masterclasses reached over 50,000 dance enthusiasts worldwide, creating new revenue streams and educational opportunities.",
        "This year also saw the company collaborate with international music producers to create original scores that blend traditional Sri Lankan rhythms with contemporary electronic music, resulting in the acclaimed production 'Rhythms of Ceylon' that toured five countries in Southeast Asia.",
        "Under Avinaash's direction, the company established partnerships with major international dance institutions, creating exchange programs that brought foreign dance techniques to Sri Lanka while exporting local expertise abroad."
      ]
    },
    2024: {
      title: "Community Impact",
      paragraphs: [
        "Building on previous successes, 2024 is focused on community impact through the 'Dance for All' initiative. Avinaash has implemented scholarship programs for underprivileged youth, providing free professional dance training to 50 talented students from across Sri Lanka.",
        "The company plans to establish regional dance centers in five major cities outside Colombo, democratizing access to quality dance education throughout the island. Each center will offer specialized programs tailored to regional dance traditions while maintaining the company's signature fusion approach.",
        "Industry recognition reaches new heights as Diamond Dance Company receives government funding to represent Sri Lankan culture at global events, with performances scheduled at major international venues including the Sydney Opera House and Lincoln Center."
      ]
    },
    2025: {
      title: "Future Vision",
      paragraphs: [
        "Looking ahead to 2025, Avinaash envisions expanding the company's influence as a cultural institution. Plans include establishing Sri Lanka's first Museum of Dance, documenting and preserving the rich history of traditional dance forms while showcasing contemporary innovations.",
        "The company will launch an international festival of dance in Colombo, bringing together performers from around the world for collaborative projects, workshops, and performances that position Sri Lanka as a global dance hub.",
        "Avinaash's ultimate goal is to establish a full degree-granting dance conservatory by 2025, offering internationally recognized qualifications and creating sustainable career paths for dancers in Sri Lanka, forever changing the landscape of performing arts education in the region."
      ]
    }
  };

  useEffect(() => {
    // Auto-rotate hero carousel
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSliderImage((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSliderImage((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section 
        className="relative h-screen bg-cover bg-center flex flex-col items-center justify-center overflow-hidden"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${assets.founder2})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        {/* Text in bottom left corner */}
        <div className="absolute bottom-32 left-20 z-10 text-left">
          <h2 className="text-white text-5xl font-light tracking-widest opacity-90">Founder</h2>
          <h1 className="text-white text-6xl font-light tracking-wider mt-2 drop-shadow-lg">
            AVINAASH DIAS
          </h1>
        </div>
        
        {/* Carousel */}
        <div className="relative w-[500px] h-[500px] mt-36 overflow-hidden shadow-2xl rounded-2xl">
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img 
                src={slide} 
                alt={`Avinaash Dias ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Biography + Social Media Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-8">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-2/3">
              <h2 className="text-4xl font-bold mb-8 text-gray-800 border-b border-red-500 pb-2 inline-block">
                Biography
              </h2>
              <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                <p>
                  Avinaash Dias is the visionary founder of Diamond Dance Company, a premier dance collective that has transformed the Sri Lankan dance landscape since its inception. With over 15 years of professional dance experience spanning multiple continents and genres, Avinaash has established himself as one of the most innovative choreographers in South Asia.
                </p>
                <p>
                  His journey began in Colombo, where his natural talent and dedication quickly set him apart. After formal training in both classical and contemporary techniques, Avinaash expanded his horizons by studying under renowned dance masters in New York and London, bringing global perspectives back to his homeland.
                </p>
                <p>
                  Beyond his technical expertise, Avinaash is known for his unique ability to fuse traditional Sri Lankan dance elements with contemporary global styles, creating signature performances that honor cultural heritage while pushing artistic boundaries.
                </p>
              </div>
            </div>
            
            <div className="lg:w-1/3 bg-gray-50 p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Connect</h3>
              <div className="space-y-6">
                {[
                  { icon: <Instagram size={24} />, name: "Instagram", handle: "@avinaash.dias", color: "hover:text-pink-600" },
                  { icon: <Facebook size={24} />, name: "Facebook", handle: "Avinaash Dias", color: "hover:text-blue-600" },
                  { icon: <FaTiktok size={22} />, name: "TikTok", handle: "@avinaashdias", color: "hover:text-black" },
                  { icon: <Linkedin size={24} />, name: "LinkedIn", handle: "Avinaash Dias", color: "hover:text-blue-700" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="flex items-center gap-4 p-3 rounded-lg transition-all duration-300 hover:bg-white hover:shadow-md group"
                  >
                    <div className={`text-gray-600 transition-colors duration-300 ${social.color} group-hover:scale-110`}>
                      {social.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{social.name}</p>
                      <p className="text-sm text-gray-500">{social.handle}</p>
                    </div>
                    <ExternalLink size={16} className="ml-auto text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education & Awards Section */}
      <section className="py-20 bg-gradient-to-r from-red-900 to-red-700">
        <div className="container mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Education Column */}
            <div>
              <div className="flex items-center mb-8">
                <GraduationCap size={28} className="text-white mr-3" />
                <h2 className="text-3xl font-bold text-white">Education</h2>
              </div>
              
              <div className="space-y-6">
                {[
                  {
                    degree: "Master of Fine Arts in Dance",
                    institution: "Royal Academy of Dance, London",
                    years: "2015-2017",
                    logo: "https://placekitten.com/80/80" // Placeholder, replace with actual logo
                  },
                  {
                    degree: "Bachelor of Performing Arts",
                    institution: "University of Visual & Performing Arts, Colombo",
                    years: "2010-2014",
                    logo: "https://placekitten.com/81/81" // Placeholder, replace with actual logo
                  },
                  {
                    degree: "Contemporary Dance Certificate",
                    institution: "Alvin Ailey American Dance Theater, New York",
                    years: "2018",
                    logo: "https://placekitten.com/82/82" // Placeholder, replace with actual logo
                  }
                ].map((edu, index) => (
                  <div key={index} className="flex bg-white p-5 rounded-lg shadow-sm">
                    <div className="mr-4 flex-shrink-0">
                      <img src={edu.logo} alt={edu.institution} className="w-16 h-16 rounded-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500 mt-1">{edu.years}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Awards Column */}
            <div>
              <div className="flex items-center mb-8">
                <Award size={28} className="text-amber-300 mr-3" />
                <h2 className="text-3xl font-bold text-white">Awards</h2>
              </div>
              
              <div className="space-y-6">
                {[
                  {
                    title: "National Dance Excellence Award",
                    organization: "Ministry of Cultural Affairs",
                    year: "2022",
                    icon: "🏆"
                  },
                  {
                    title: "Choreographer of the Year",
                    organization: "South Asian Dance Alliance",
                    year: "2021",
                    icon: "🌟"
                  },
                  {
                    title: "Innovation in Dance",
                    organization: "International Arts Festival",
                    year: "2020",
                    icon: "✨"
                  },
                  {
                    title: "Youth Mentor Recognition",
                    organization: "Colombo Arts Council",
                    year: "2019",
                    icon: "🎭"
                  }
                ].map((award, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <span className="text-4xl mr-4">{award.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{award.title}</h3>
                        <p className="text-gray-600">{award.organization}</p>
                        <p className="text-sm text-gray-500 mt-1">{award.year}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quotes & Photos Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row">
            {/* Left side - Images */}
            <div className="md:w-1/2 grid grid-cols-2 gap-4 p-4">
              <div className="overflow-hidden rounded-lg shadow-lg">
                <img 
                  src={assets.avinaash3} 
                  alt="Avinaash Dias" 
                  className="w-full h-80 object-cover transform hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="overflow-hidden rounded-lg shadow-lg">
                <img 
                  src={assets.avinaash4} 
                  alt="Avinaash Dias performing" 
                  className="w-full h-80 object-cover transform hover:scale-105 transition-transform duration-500" 
                />
              </div>
            </div>
            
            {/* Right side - Quote */}
            <div className="md:w-1/2 flex items-center justify-center p-8 mt-8 md:mt-0 md:ml-4">
              <div className="text-center">
                <Quote size={48} className="text-red-500/50 mx-auto mb-6" />
                <p className="text-white text-xl md:text-2xl font-medium italic leading-relaxed mb-6">
                  "Dance is the hidden language of the soul. Through movement, we speak what words cannot express – emotions that transcend cultural boundaries and connect us all."
                </p>
                <p className="text-white/80 font-light tracking-wider">AVINAASH DIAS</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How He Founded the Team */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 pointer-events-none"></div>
        <div className="container mx-auto px-8 relative z-10">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">The Origin Story</h2>
          
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md relative">
            {/* Decorative element */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-purple-500"></div>
            
            {/* Year buttons */}
            <div className="flex justify-center mb-8 space-x-4">
              {[2022, 2023, 2024, 2025].map((year) => (
                <button
                  key={year}
                  className={`px-6 py-2 rounded-full transition-all duration-300 
                    ${year === selectedYear ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-red-600 mb-4">{yearStories[selectedYear].title}</h3>
              
              {yearStories[selectedYear].paragraphs.map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-6">
                  {index === 0 && <span className="text-xl font-semibold text-red-600 mr-2">{selectedYear}:</span>}
                  {paragraph}
                </p>
              ))}
            </div>
            
            {/* Timeline dots */}
            <div className="flex justify-between mt-12 relative">
              <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
              {[2022, 2023, 2024, 2025].map((year, index) => (
                <div 
                  key={index} 
                  className="relative z-10 flex flex-col items-center cursor-pointer"
                  onClick={() => setSelectedYear(year)}
                >
                  <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    year === selectedYear ? 'bg-red-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                  }`}></div>
                  <span className={`text-xs mt-2 font-medium ${
                    year === selectedYear ? 'text-red-600' : 'text-gray-600'
                  }`}>{year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Image Slider Section */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Performance Highlights</h2>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Main Image */}
            <div className="relative h-96 overflow-hidden rounded-xl shadow-2xl">
              <img 
                src={sliderImages[currentSliderImage]} 
                alt={`Slide ${currentSliderImage + 1}`} 
                className="w-full h-full object-cover"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            
            {/* Navigation Buttons */}
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300"
            >
              <ChevronRight size={24} />
            </button>
            
            {/* Indicator dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {sliderImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSliderImage(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSliderImage ? "bg-white w-6" : "bg-white/30"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* His Vision for the Team */}
      <section className="py-24 bg-black relative overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-purple-900/20 pointer-events-none"></div>
        
        <div className="container mx-auto px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 text-white inline-block relative">
              Vision & Beyond
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-red-500 to-amber-500"></span>
            </h2>
            
            <div className="space-y-6 text-white/90 text-lg leading-relaxed">
              <p>
                "Diamond Dance Company will continue to push boundaries and redefine what dance means in Sri Lanka. My vision extends beyond performances to establishing the country's first comprehensive dance academy that bridges traditional heritage with global contemporary movements."
              </p>
              
              <p>
                "We aim to be a cultural ambassador for Sri Lanka on the world stage while nurturing the next generation of dancers who will carry this art form forward. Our focus on excellence, innovation, and community impact will remain at the heart of everything we do."
              </p>
              
              <p className="font-medium text-2xl mt-12 text-white">
                "Through movement, we tell stories. Through stories, we change lives."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurFounderPage; 
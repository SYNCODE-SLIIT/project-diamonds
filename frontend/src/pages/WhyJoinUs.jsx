import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import assets from '../assets/assets.js';

const WhyJoinUs = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        // calculate scroll position offset by navbar height
        const headerOffset = 100; // adjust if navbar height changes
        const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [hash]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-[70vh] flex items-center justify-center bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${assets.slideImage2})`,
        }}
      >
        <div className="container mx-auto px-8 text-center text-white z-10">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Unleash Your Brilliance — Dance with Team Diamonds
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-4xl mx-auto mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            World-class training, a close-knit creative family, and the stage-time you've been dreaming of.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/register/member/application" className="bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold py-3 px-8 rounded-full hover:from-red-700 hover:to-pink-700 transition duration-300 shadow-lg inline-block">
              Apply Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800 relative">
            Why Join Team Diamonds?
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-red-500 to-pink-500"></span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center p-4">
                <img src={assets.about} alt="Professional Training" className="h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-800">Professional-grade Training</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-600">In-depth workshops & masterclasses led by touring pros and industry choreographers.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-600">Daily technique labs refine posture, precision, and versatility.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center p-4">
                <img src={assets.gallery1} alt="Career Growth" className="h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-800">Career & Network Growth</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-600">Back-stage seminars on contracts, casting calls, and audition strategy.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-600">Direct networking with agents, festival directors, and brand partners.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-r from-amber-500 to-red-600 flex items-center justify-center p-4">
                <img src={assets.slideImage1} alt="Performance Opportunities" className="h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-800">Performance Opportunities</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-600">Guaranteed spots in quarterly showcases, music-video shoots, and national tours.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-600">Collaborations with live bands and visual-media artists.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center p-4">
                <img src={assets.gallery2} alt="Exclusive Resources" className="h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-800">Exclusive Resources</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-600">Member-only video library, choreography breakdowns, and conditioning programs.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-600">Early access to costume rentals & rehearsal spaces.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center p-4">
                <img src={assets.gallery3} alt="Personal Growth" className="h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-800">Personal Growth & Well-being</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-600">Structured goal-setting and personalised feedback sessions.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-500 mr-2">•</span>
                    <span className="text-gray-600">A supportive community that celebrates diversity and fosters confidence.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section id="audition-process" className="py-20 px-4 md:px-8 bg-gray-50 relative">
        <div className="container mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800 relative">
            How the Journey Works
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-red-500 to-pink-500"></span>
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 md:left-1/2 transform md:translate-x-[-50%] top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600"></div>
              
              {/* Step 1 */}
              <div className="relative flex md:flex-row flex-col items-center md:items-start mb-16">
                <div className="flex flex-col items-center md:items-end md:w-1/2 md:pr-8 z-10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white font-bold shadow-lg mb-4 md:mb-0">1</div>
                </div>
                <div 
                  className="bg-white p-6 rounded-xl shadow-md md:w-1/2 md:ml-8 z-10 group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden hover:z-50"
                  tabIndex="0" 
                  aria-expanded="false"
                  onClick={(e) => {
                    e.currentTarget.classList.toggle('expanded');
                    document.querySelectorAll('.journey-overlay').forEach(overlay => {
                      overlay.classList.toggle('active');
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.currentTarget.classList.toggle('expanded');
                      document.querySelectorAll('.journey-overlay').forEach(overlay => {
                        overlay.classList.toggle('active');
                      });
                    }
                  }}
                >
                  <div className="transition-all duration-500 group-hover:opacity-50 group-hover:blur-[1px]">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Audition-Preparation Workshops</h3>
                    <p className="text-gray-600">Free online and in-person workshops to prepare you for auditions</p>
                  </div>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-6 group-hover:scale-105">
                    <h3 className="text-xl font-bold mb-3 text-blue-600">Audition-Preparation Workshops</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-pink-500 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm">Free online masterclasses (Zoom / YouTube Live) two weeks before each audition cycle—covering warm-ups, core repertoire and Q&A with current company members.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-pink-500 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm">In-person prep days (optional, low-cost) focus on stamina drills, quick pick-up choreography and mock audition etiquette.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-pink-500 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm">Resource pack: playlist of required music, example combo videos and a printable conditioning plan distributed upon registration.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex md:flex-row flex-col items-center md:items-start mb-16">
                <div className="flex flex-col items-center md:items-end md:w-1/2 md:pr-8 z-10 md:order-1 order-first">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500 text-white font-bold shadow-lg mb-4 md:mb-0">2</div>
                </div>
                <div 
                  className="bg-white p-6 rounded-xl shadow-md md:w-1/2 md:mr-8 z-10 md:order-0 group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden hover:z-50"
                  tabIndex="0" 
                  aria-expanded="false"
                  onClick={(e) => {
                    e.currentTarget.classList.toggle('expanded');
                    document.querySelectorAll('.journey-overlay').forEach(overlay => {
                      overlay.classList.toggle('active');
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.currentTarget.classList.toggle('expanded');
                      document.querySelectorAll('.journey-overlay').forEach(overlay => {
                        overlay.classList.toggle('active');
                      });
                    }
                  }}
                >
                  <div className="transition-all duration-500 group-hover:opacity-50 group-hover:blur-[1px]">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Submission Guidelines & Requirements</h3>
                    <p className="text-gray-600">Prepare and submit your application with required materials</p>
                  </div>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-6 group-hover:scale-105">
                    <h3 className="text-xl font-bold mb-3 text-indigo-600">Submission Guidelines & Requirements</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-pink-500 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm">Online application (PDF or form) due 10 days before the live audition.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-pink-500 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm">Upload: 2-minute introduction video, 3-minute technique reel, headshot + full-body dance photo, and completed medical & consent forms.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-pink-500 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm">File naming convention → "Lastname_Firstname_TeamDiamonds2025".</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-pink-500 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm">Pay one-time LKR 2,000 audition fee (waivers available).</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex md:flex-row flex-col items-center md:items-start mb-16">
                <div className="flex flex-col items-center md:items-end md:w-1/2 md:pr-8 z-10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-500 text-white font-bold shadow-lg mb-4 md:mb-0">3</div>
                </div>
                <div 
                  className="bg-white p-6 rounded-xl shadow-md md:w-1/2 md:ml-8 z-10 group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden hover:z-50"
                  tabIndex="0" 
                  aria-expanded="false"
                  onClick={(e) => {
                    e.currentTarget.classList.toggle('expanded');
                    document.querySelectorAll('.journey-overlay').forEach(overlay => {
                      overlay.classList.toggle('active');
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.currentTarget.classList.toggle('expanded');
                      document.querySelectorAll('.journey-overlay').forEach(overlay => {
                        overlay.classList.toggle('active');
                      });
                    }
                  }}
                >
                  <div className="transition-all duration-500 group-hover:opacity-50 group-hover:blur-[1px]">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">What to Expect During Auditions</h3>
                    <p className="text-gray-600">The audition process from check-in to callback</p>
                  </div>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-6 group-hover:scale-105">
                    <h3 className="text-xl font-bold mb-3 text-violet-600">What to Expect During Auditions</h3>
                    <p className="text-gray-700 text-sm mb-2">Check-in / warm-up ➜ Technique class ➜ Style combo ➜ Cuts & callbacks ➜ Short interview.</p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-pink-500 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm">Panels look for musicality, retention speed, teamwork and attitude—more than flash tricks.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-pink-500 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm">Wear dark solid colours; no jewellery; hair off face.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-pink-500 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm">Bring soft-soled shoes plus sneakers for hip-hop round.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-pink-500 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm">Callbacks may include partnering and improv prompts.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex md:flex-row flex-col items-center md:items-start">
                <div className="flex flex-col items-center md:items-end md:w-1/2 md:pr-8 z-10 md:order-1 order-first">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500 text-white font-bold shadow-lg mb-4 md:mb-0">4</div>
                </div>
                <div 
                  className="bg-white p-6 rounded-xl shadow-md md:w-1/2 md:mr-8 z-10 md:order-0 group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden hover:z-50"
                  tabIndex="0" 
                  aria-expanded="false"
                  onClick={(e) => {
                    e.currentTarget.classList.toggle('expanded');
                    document.querySelectorAll('.journey-overlay').forEach(overlay => {
                      overlay.classList.toggle('active');
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.currentTarget.classList.toggle('expanded');
                      document.querySelectorAll('.journey-overlay').forEach(overlay => {
                        overlay.classList.toggle('active');
                      });
                    }
                  }}
                >
                  <div className="transition-all duration-500 group-hover:opacity-50 group-hover:blur-[1px]">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Feedback & Follow-Up</h3>
                    <p className="text-gray-600">What happens after your audition</p>
                  </div>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center p-6 group-hover:scale-105">
                    <h3 className="text-xl font-bold mb-3 text-purple-600">Feedback & Follow-Up</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-pink-500 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm">Same-day verbal tips for those cut in early rounds; directors encourage dancers to ask specific "next-step" questions.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-pink-500 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm">Within 3 weeks every applicant receives an email: "Invited to Audition Stage 2", "Wait-list" or "Not this cycle" with two personalised correction points.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-pink-500 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700 text-sm">Accepted dancers receive a digital welcome pack and must confirm participation within 72 hours.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Full-page overlay when a box is expanded */}
        <div className="journey-overlay fixed inset-0 bg-gray-900/70 opacity-0 pointer-events-none transition-opacity duration-500 z-40"></div>
      </section>

      {/* Training & Development Section */}
      <section id="training-development" className="py-20 px-4 md:px-8 bg-white relative">
        <div className="container mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800 relative">
            Training & Development
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600"></span>
          </h2>

          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-10">
              {/* Left column: Image */}
              <div className="md:w-2/5">
                <div className="rounded-xl overflow-hidden shadow-xl h-full relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 z-10"></div>
                  <img 
                    src={assets.slideImage1} 
                    alt="Professional training sessions" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Right column: Content */}
              <div className="md:w-3/5">
                <p className="text-xl text-gray-700 mb-8">
                  Our professional training programs are designed to transform passionate dancers into exceptional performers through personalized development tracks, technical excellence, and artistic growth.
                </p>
                
                <div className="space-y-8">
                  {/* Item 1 */}
                  <div className="bg-gray-50 rounded-xl p-6 shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Comprehensive Skills Development</h3>
                        <p className="text-gray-600">Structured curricula that cover core technique, conditioning, choreography and performance readiness.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Item 2 */}
                  <div className="bg-gray-50 rounded-xl p-6 shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Personalized Training Tracks</h3>
                        <p className="text-gray-600">Individual learning paths based on each dancer's current level, goals and preferred style.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Item 3 */}
                  <div className="bg-gray-50 rounded-xl p-6 shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-r from-amber-500 to-red-600 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Technical & Artistic Advancement</h3>
                        <p className="text-gray-600">Regular masterclasses, style-specific workshops and creative labs to push both precision and expression.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Item 4 */}
                  <div className="bg-gray-50 rounded-xl p-6 shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Mentorship Opportunities</h3>
                        <p className="text-gray-600">One-on-one guidance from senior company members and visiting industry professionals.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Item 5 */}
                  <div className="bg-gray-50 rounded-xl p-6 shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Professional Certification Programs</h3>
                        <p className="text-gray-600">Optional accreditation tracks that culminate in recognized certificates for teaching, judging or choreography.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx="true">{`
        .expanded {
          transform: scale(1.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          z-index: 50;
        }
        
        .expanded .group-hover\\:opacity-100 {
          opacity: 1 !important;
        }
        
        .expanded .group-hover\\:blur-\\[1px\\] {
          opacity: 0.5;
          filter: blur(1px);
        }
        
        .journey-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }
        
        @media (min-width: 768px) {
          .expanded {
            transform: scale(1.15);
            width: 55% !important;
          }
        }
      `}</style>

      {/* Testimonials Section */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800 relative">
            Member Voices
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-red-500 to-pink-500"></span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 p-8 rounded-xl shadow-md relative">
              <div className="text-5xl text-pink-200 absolute top-4 left-4">"</div>
              <div className="relative z-10">
                <p className="text-gray-700 mb-6 pt-4">Team Diamonds pushed my artistry further in six months than the last three years combined.</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-bold text-gray-800">Zara K.</h4>
                    <p className="text-sm text-gray-500">Contemporary</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 p-8 rounded-xl shadow-md relative">
              <div className="text-5xl text-pink-200 absolute top-4 left-4">"</div>
              <div className="relative z-10">
                <p className="text-gray-700 mb-6 pt-4">Landing a national tour through the team's network was huge for my career.</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-bold text-gray-800">Luis D.</h4>
                    <p className="text-sm text-gray-500">Hip-hop</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800 relative">
            Frequently Asked Questions
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-red-500 to-pink-500"></span>
          </h2>

          <div className="max-w-3xl mx-auto">
            <div className="mb-6 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">Do I need prior stage experience?</h3>
                <p className="text-gray-600">Stage credits help, but passion and work ethic matter most.</p>
              </div>
            </div>
            
            <div className="mb-6 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">Is there an age limit?</h3>
                <p className="text-gray-600">Applicants must be 18 – 35.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to sparkle? Spots fill fast—apply today!</h2>
          <Link 
            to="/register/member/application" 
            className="inline-block bg-white text-pink-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition duration-300 shadow-lg"
          >
            Start Application
          </Link>
        </div>
      </section>

      {/* Footer Reminder */}
      <section className="py-6 px-4 md:px-8 bg-gray-800 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>Email: info@teamdiamonds.com</p>
            <p>Studio: 123 Dance Avenue, City Center</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-pink-400 transition duration-300">Instagram</a>
              <a href="#" className="hover:text-pink-400 transition duration-300">Facebook</a>
              <a href="#" className="hover:text-pink-400 transition duration-300">TikTok</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyJoinUs;
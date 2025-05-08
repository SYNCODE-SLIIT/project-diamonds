import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const ApplicationSubmitted = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get the message from location state; fallback to a default message if none is provided
  const message = location.state?.message || 'Your application has been submitted successfully!';

  useEffect(() => {
    // Trigger confetti effect when the component mounts
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleDone = () => {
    navigate('/'); // Redirect to homepage
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-64 bg-white/5 -skew-y-6 transform origin-top-right"></div>
        <div className="absolute bottom-0 right-0 w-full h-64 bg-white/5 skew-y-6 transform origin-bottom-left"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center z-10 border border-white/20"
      >
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl font-extrabold mb-4 text-white"
        >
          Application Submitted Successfully!
        </motion.h1>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            {message}
          </p>
          <p className="text-white/70 mb-8">
            Our team will review your application and get back to you soon. Thank you for your interest in joining our dance community!
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10"
        >
          <button 
            onClick={handleDone} 
            className="py-4 px-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold uppercase rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Return to Homepage
          </button>
        </motion.div>
      </motion.div>

      {/* Decorative dancer silhouette images */}
      <div className="absolute bottom-0 left-0 w-40 h-40 opacity-20 z-0">
        <img src="/images/dancer-silhouette-1.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
      </div>
      <div className="absolute top-0 right-0 w-40 h-40 opacity-20 z-0">
        <img src="/images/dancer-silhouette-2.png" alt="" className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
      </div>
    </div>
  );
};

export default ApplicationSubmitted;
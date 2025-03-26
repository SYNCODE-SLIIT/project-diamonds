import React, { useRef } from 'react';
import assets from '../assets/assets.js';
import { 
  CalendarCheckIcon, 
  UsersIcon, 
  CheckCircle2Icon, 
  BookOpenIcon, 
  InfoIcon, 
  TrophyIcon 
} from 'lucide-react';
import EventRequestForm from '../components/event/EventRequestForm'; 

const EventBookingPage = () => {
    const bookingFormRef = useRef(null);

    const scrollToBookingForm = () => {
        bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const HeroBanner = () => (
        <div 
        className="relative h-screen bg-cover bg-center flex items-center"
        style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${assets.event_booking})`,
            backgroundOverlay: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3))'
        }}
        >
        <div className="container mx-auto px-6 text-white z-10">
            <div className="max-w-xl">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
                Create Unforgettable Events 
                <br />with Professional Support
            </h1>
            <p className="text-xl mb-8 text-white/80">
                Seamless event planning from start to finish. 
                Let our expert team turn your vision into reality.
            </p>
            <button 
                onClick={scrollToBookingForm}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 transform hover:scale-105"
            >
                Book Now
            </button>
            </div>
        </div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
    );

    const EventBookingGuidelines = () => (
        <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Event Booking Guidelines</h2>
            <div className="space-y-4 text-gray-600">
                <div className="flex items-start space-x-4">
                <CalendarCheckIcon className="w-8 h-8 text-blue-500 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-gray-800">Lead Time Requirements</h3>
                    <p>Submit your event request at least 5 days in advance to ensure availability and proper planning.</p>
                </div>
                </div>
                <div className="flex items-start space-x-4">
                <UsersIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-gray-800">Event Types</h3>
                    <p>We support various events: corporate, private parties, weddings, and special celebrations.</p>
                </div>
                </div>
            </div>
            <div className="mt-8">
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Frequently Asked Questions</h3>
                <div className="space-y-3">
                {[
                    { q: "How quickly will I get a response?", a: "Typically within 24-48 hours after submission." },
                    { q: "Can I modify my booking after submission?", a: "Yes, contact our support team for changes." },
                    { q: "What payment methods do you accept?", a: "We accept credit cards, bank transfers, and PayPal." }
                ].map((faq, index) => (
                    <div key={index} className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">{faq.q}</h4>
                    <p className="text-gray-600">{faq.a}</p>
                    </div>
                ))}
                </div>
            </div>
            </div>
            <div>
            <img 
                src={assets.event1}
                alt="Event Guidelines" 
                className="rounded-xl shadow-lg"
            />
            </div>
        </div>
        </div>
    );

    const EventOrganizerTips = () => (
        <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Tips for Successful Event Planning
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
            {[
                { 
                icon: <CheckCircle2Icon className="w-12 h-12 text-blue-500" />,
                title: "Early Planning",
                description: "Start planning at least 3-6 months in advance for larger events."
                },
                { 
                icon: <BookOpenIcon className="w-12 h-12 text-green-500" />,
                title: "Clear Communication",
                description: "Maintain open communication with vendors and stakeholders."
                },
                { 
                icon: <TrophyIcon className="w-12 h-12 text-purple-500" />,
                title: "Backup Plans",
                description: "Always have contingency plans for unexpected situations."
                }
            ].map((tip, index) => (
                <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-all"
                >
                <div className="flex justify-center mb-4">{tip.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{tip.title}</h3>
                <p className="text-gray-600">{tip.description}</p>
                </div>
            ))}
            </div>
        </div>
        </div>
    );

    return (
        <div>
        <HeroBanner />
        <EventBookingGuidelines />
        <EventOrganizerTips />
        
        <div 
            ref={bookingFormRef} 
            className="px-6 py-16 relative bg-cover bg-center"
            style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${assets.event_booking})`,
            backgroundOverlay: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3))'
            }}
        >
            <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-4">
                Bring Your Vision to Life – Book Your Event Now!
            </h2>
            <p className="text-xl text-white max-w-2xl mx-auto mb-8">
                Ready to create an unforgettable experience? Fill out our event request form 
                and let's make it happen.
            </p>
            </div>
            <div className="container mx-auto">
                <EventRequestForm />
            </div>
        </div>
        </div>
    );
};

export default EventBookingPage;
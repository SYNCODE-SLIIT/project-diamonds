import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Homepage from './pages/Home.jsx';
import AboutUs from './pages/AboutUs';
import Contactus from './pages/Contactus';
import Profile from './pages/Profile';

const App = () => {
  return (
    <div className="px-4 sm:px-0 md:px-0 lg:px-0 mx-auto">
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/aboutUs" element={<AboutUs />} />
        <Route path="/contactUs" element={<Contactus />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
};

export default App;
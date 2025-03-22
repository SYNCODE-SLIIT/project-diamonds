import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/footer.jsx'
import Homepage from './pages/Home.jsx';
import AboutUs from './pages/AboutUs';
import Contactus from './pages/Contactus';
import Profile from './pages/Profile';
import PackageManager from './pages/events/PackageManager';

const App = () => {
  return (
    <div className="px-4 sm:px-0 md:px-0 lg:px-0 mx-auto -z-10">
      <Routes>

        <Route path="/" element={<Homepage />} />
        <Route path="/aboutUs" element={<AboutUs />} />
        <Route path="/contactUs" element={<Contactus />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/packages" element={<PackageManager />} />
      </Routes>
    </div>
  );
};

export default App;
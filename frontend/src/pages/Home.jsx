import React from 'react'
import backgroundImage from '../assets/bg2.jpg';

const Home = () => {
  return (
    <div
      className="w-full h-screen bg-cover bg-center bg-top"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
    </div>
  )
}

export default Home
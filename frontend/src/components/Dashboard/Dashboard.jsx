// ... existing code ...
{/* Top Bar */}
<div className="flex items-center justify-between w-full px-8 py-4 bg-white shadow-sm rounded-b-2xl" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
  <div className="flex items-center gap-4">
    <img
      src="/path/to/profile.jpg"
      alt="Profile"
      className="w-12 h-12 rounded-full object-cover border-2 border-[#f4d160]"
    />
    <div>
      <span className="text-lg font-semibold text-gray-800">Welcome, <span className="text-[#2d5be3]">Praveen Liyanage!</span></span>
      <div className="text-sm text-gray-500">Here's your financial overview</div>
    </div>
  </div>
  <div>
    <button className="text-gray-400 hover:text-[#f4d160] transition-colors">
      <i className="fas fa-bell text-2xl"></i>
    </button>
  </div>
</div>
{/* Main Content */}
<div className="flex flex-col gap-6 px-8 mt-6">
  {/* ...rest of your dashboard... */}
</div>
// ... existing code ...
// import React, { useState } from 'react';

// const RegisterOrganizer = () => {
//   const [formData, setFormData] = useState({
//     fullName: '',
//     organizationName: '',
//     email: '',
//     contactNumber: '',
//     password: ''
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     const response = await fetch('http://localhost:5000/api/auth/register/organizer', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(formData)
//     });
//     const data = await response.json();
//     console.log(data);
//   };

//   return (
//     <div>
//       <h2>Organizer Registration</h2>
//       <form onSubmit={handleRegister}>
//         <input name="fullName" placeholder="Full Name" onChange={handleChange} required />
//         <input name="organizationName" placeholder="Organization Name" onChange={handleChange} />
//         <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
//         <input name="contactNumber" placeholder="Contact Number" onChange={handleChange} />
//         <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
//         <button type="submit">Register Organizer</button>
//       </form>
//     </div>
//   );
// };

// export default RegisterOrganizer;
// import React, { useState } from 'react';

// const CreateMemberAccount = () => {
//   const [password, setPassword] = useState('');
//   // For simplicity, we'll assume the applicationId is passed via a query parameter or stored in local state.
//   // In production, you’d extract this from a token or URL parameter.
//   const applicationId = "APPLICATION_ID_FROM_EMAIL_LINK";

//   const handleAccountCreation = async (e) => {
//     e.preventDefault();
//     const response = await fetch('http://localhost:5000/api/auth/register/member/createAccount', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ applicationId, password })
//     });
//     const data = await response.json();
//     console.log(data);
//   };

//   return (
//     <div>
//       <h2>Create Member Account</h2>
//       <p>Your full name and email have already been captured from your application and cannot be changed.</p>
//       <form onSubmit={handleAccountCreation}>
//         <input 
//           type="password" 
//           placeholder="Enter Password" 
//           onChange={(e) => setPassword(e.target.value)} 
//           required 
//         />
//         <button type="submit">Create Account</button>
//       </form>
//     </div>
//   );
// };

// export default CreateMemberAccount;
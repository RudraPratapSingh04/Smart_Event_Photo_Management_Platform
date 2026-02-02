import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {useState} from 'react'
function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,setError]=useState("")
  const [showOTPInput,setShowOTPInput]=useState(false);
  const [disabled,setDisabled]=useState(false)
  const [errorOTP,setErrorOTP]=useState("")
  const [otp,setOTP]=useState("")
  const Navigate=useNavigate();
  const verify_otp=async(e)=>{
    console.log("Verifying OTP");
    e.preventDefault();
    setError("");
    if(!otp){
      setErrorOTP("OTP is required");
      return
    }
    
    try {
      const response = await fetch("http://localhost:8000/api/verify-otp/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          email: email,
          otp:otp
        }),
      });
      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Sending OTP failed");
      }
      // localStorage.setItem("isLoggedIn", "true");
      // localStorage.setItem("username", username);
      Navigate("/");
    } catch (err) {
      setErrorOTP(err.message);
    }
  }
  const send_otp=async(e)=>{
    e.preventDefault();
    setError("");
    if(!username||!email||!password){
      setError("All fields are required");
      return
    }
    try{
      const response=await fetch("http://localhost:8000/api/send-otp/",{
    method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                username:username,
                password:password,
                email:email,
            }),
        })
          const data = await response.json();
          console.log(data)
        
        if (!response.ok) {
          throw new Error(data.error || data.message || "Sending OTP failed");
        }
        setDisabled(true)
        setShowOTPInput(true);
    } catch(err){
      setError(err.message);
    }
    
   
    
  
};
   return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 p-4">
       <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
         <div className="text-center mb-8">
           <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
             </svg>
           </div>
           <h1 className="text-3xl font-bold text-gray-800 mb-2">
             Create Account
           </h1>
           <p className="text-gray-600">Join us and start sharing</p>
         </div>

         <form className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
             <input
               type="email"
               placeholder="Enter your email"
               disabled={disabled}
               onChange={(e) => setEmail(e.target.value)}
               className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
             <input
               type="text"
               placeholder="Choose a username"
               disabled={disabled}
               onChange={(e) => setUsername(e.target.value)}
               className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
             <input
               type="password"
               disabled={disabled}
               placeholder="Create a password"
               onChange={(e) => setPassword(e.target.value)}
               className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
             />
           </div>

           {error && (
             <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
               <p className="text-red-600 text-sm">{error}</p>
             </div>
           )}

           <button
             className="w-full py-3 rounded-lg bg-purple-600 font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
             onClick={send_otp}
             disabled={disabled}
           >
             Send OTP
           </button>
         </form>

         {!error && showOTPInput && (
           <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
               <p className="text-xs text-gray-500 mb-2">Check your email for the verification code</p>
               <input
                 type="text"
                 placeholder="6-digit code"
                 onChange={(e) => setOTP(e.target.value)}
                 className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition text-center text-lg tracking-widest"
                 maxLength="6"
               />
             </div>

             {errorOTP && (
               <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                 <p className="text-red-600 text-sm">{errorOTP}</p>
               </div>
             )}

             <button 
               className="w-full py-3 rounded-lg bg-green-600 font-semibold text-white hover:bg-green-700 transition"
               onClick={verify_otp}
             >
               Verify & Create Account
             </button>
           </div>
         )}

         <p className="mt-6 text-center text-gray-600">
           Already have an account?{" "}
           <Link to="/" className="font-semibold text-purple-600 hover:text-purple-700">
             Sign in
           </Link>
         </p>
       </div>
     </div>
   );
}

export default Register
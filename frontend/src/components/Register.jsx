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
     <div className="min-h-screen flex items-center justify-center bg-indigo-600">
       <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
         <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
           Hey Champ,Welcome 📸
         </h1>

         <form className="flex flex-col gap-4">
           <input
             type="email"
             placeholder="Email"
             disabled={disabled}
             onChange={(e) => setEmail(e.target.value)}
             className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
           />

           <input
             type="username"
             placeholder="Create Username"
             disabled={disabled}
             onChange={(e) => setUsername(e.target.value)}
             className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
           />
           <input
             type="password"
             disabled={disabled}
             placeholder="Create Password"
             onChange={(e) => setPassword(e.target.value)}
             className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
           />
           {error && (
             <p className="mt-6 text-center text-sm text-gray-600">{error}</p>
           )}

           <button
             className="mt-2 rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 transition"
             onClick={send_otp}
           >
             Send OTP
           </button>
           </form>
         <form className="flex flex-col gap-4">
           {!error && showOTPInput && (
             <input
               type="password"
               placeholder="Enter OTP"
               onChange={(e) => setOTP(e.target.value)}
               className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 mt-4"
             />
           )}
           {!error && showOTPInput && (
             <button className="mt-2 rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 transition"
             onClick={verify_otp}>
               Submit OTP
             </button>
           )}
             {errorOTP && (
             <p className="mt-6 text-center text-sm text-gray-600">{errorOTP}</p>
           )}
            
           
         </form>
         <p className="mt-6 text-center text-sm text-gray-600">
           Already Registered?{" "}
           <Link to="/" className="font-medium text-indigo-600 hover:underline">
             Login here
           </Link>
         </p>
       </div>
     </div>
   );
}

export default Register
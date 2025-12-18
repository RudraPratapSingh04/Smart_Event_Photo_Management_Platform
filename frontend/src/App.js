import React, { useState } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/send-login-otp/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );
      const data = response.json();
      if (response.ok) {
        setSuccess(data.message);
        setUserId(data.user_id);
        setShowOtpInput = true;
      } else {
        setError(data.error || "Failed to Send OTP");
      }
    } catch (err) {
      setError("Try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/verify-login-otp/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, otp_code: otp }),
        }
      );
      const data=await response.json();
      if(response.ok){
        setSuccess('Login successful')
      
      setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
        else{
          setError(data.error || 'Invalid OTP');
        }
      }
      catch(err){
        setError('Network Error.Please try again')
      }
      finally{
        setIsLoading(false);
      }
  };



    const handleResendOtp = async (e) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setIsLoading(true);
          try {
      const response = await fetch(
        "http://localhost:8000/api/resend-login-otp/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );
      const data=await response.json();
      if(response.ok){
        setSuccess('OTP sent successfully')
      
      }
        else{
          setError(data.error || 'Failed to Resend OTP');
        }
      }
      catch(err){
        setError('Network Error.Please try again')
      }
      finally{
        setIsLoading(false);
      }
  };
    

  return (
    <div className="App">
      <div className="login-box">
        <h1>Login</h1>
        {error && <p className="error">{error}</p>}

        {!showOtpInput ? (
          <form onSubmit={handleSendOtp}>
            <div className="login-sub-box">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="login-sub-box">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button type="submit" disabled={isLoading}>
              SEND OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <p className="info">Enter the OTP received on mail</p>
            <div className="otp-box">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                disabled={isLoading}
              />
            </div>
            <button type="submit" disabled={isLoading}>
              Verify Otp
            </button>
            <div className="resend-section">
              <p>Didn't receive OTP</p>
              <button
                type="button"
                className="resend-btn"
                onClick={handleResendOtp}
                disabled={isLoading}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <p className="signup-link">
          Don't have an account <a href="/register">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default App;

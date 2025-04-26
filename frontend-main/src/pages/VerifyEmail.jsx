import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./verify-email.css"; // make sure this file exists

const VerifyEmail = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) return setError("Email not provided");

    try {
      setLoading(true);
      setError("");
      const res = await axios.post("https://etek-nxx9.onrender.com/api/auth/user/verify-mail", {
        email,
        code,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2>Email Verification</h2>
        <p className="instruction">
          A 6-digit verification code has been sent to: <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerify} className="verify-form">
          <label htmlFor="code">Verification Code</label>
          <input
            id="code"
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            maxLength={6}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
      </div>
    </div>
  );
};

export default VerifyEmail;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from React Router

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.text(); // Read response as text
        if (data === "Login Successfully") {
          localStorage.setItem("isLoggedIn", "true"); // Set session flag
        //   navigate("/dashboard"); // Navigate to the dashboard
        } else {
          console.error("Invalid email or password");
        }
      } else {
        console.error("Invalid email or password");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input type="submit" value="Login" />
      </form>
    </>
  );
};

export default LoginScreen;

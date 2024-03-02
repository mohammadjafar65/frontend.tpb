import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom"; // Import useHistory from React Router

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useNavigate(); // Get the history object

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
        // Redirect to the dashboard page using history.push
        history("/dashboard");
      } else {
        // Handle invalid credentials
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

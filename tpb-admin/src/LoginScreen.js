import React, { useState } from "react";
import { useHistory } from "react-router-dom"; // Import useHistory for redirection

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send login credentials to the server for authentication
      const response = await fetch("/api.thepilgrimbeez.com/login", { // Update the endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        // If authentication is successful, redirect to the dashboard page
        history.push("/dashboard");
      } else {
        // Handle authentication failure (e.g., display an error message)
        console.error("Authentication failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };  

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginScreen;

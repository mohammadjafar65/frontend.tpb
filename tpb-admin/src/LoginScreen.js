import React from "react";

const LoginScreen = () => {
  return (
    <>
      <h2>Login</h2>
      <form action="https://api.thepilgrimbeez.com/login" method="post">
        <label for="username">Email:</label>
        <input type="email" id="username" name="username" required />
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required />
        <input type="submit" value="Login" />
      </form>
    </>
  );
};

export default LoginScreen;

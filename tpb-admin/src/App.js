import logo from "./logo.svg";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard.js";
import "./App.css";
import LoginScreen from "./LoginScreen.js";
import { Auth0Provider } from '@auth0/auth0-react';
import Home from "./Home.js";

function App() {
  return (
    <Auth0Provider
      domain="dev-mnnlnnurnq07caty.us.auth0.com"
      clientId="gvoQHZB1BJ7ElsnIp8ZUSDt1qpHk4XIt"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* <Route path="/" component={MaintenancePage} /> */}
            <Route path="/" element={<Home />}></Route>
            <Route path="/dashboard" element={<Dashboard />}></Route>
          </Routes>
        </BrowserRouter>
      </div>
    </Auth0Provider>
  );
}

export default App;

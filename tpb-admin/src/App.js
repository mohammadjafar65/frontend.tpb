import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard.js";
import Visa from "./addVisa.js";
import "./App.css";
import { Auth0Provider } from '@auth0/auth0-react';

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
            {/* <Route path="/" element={<Home />}></Route> */}
            <Route path="/" element={<Dashboard />}></Route>
            <Route path="/visa" element={<Visa />}></Route>
          </Routes>
        </BrowserRouter>
      </div>
    </Auth0Provider>
  );
}

export default App;

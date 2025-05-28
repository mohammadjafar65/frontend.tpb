import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard.js";
// import VendorAddHotel from "./dashboard/add-hotel";
// import AddVisa from "./addVisa.js";
import "./App.css";
import "./styles/index.scss";
import { Auth0Provider } from "@auth0/auth0-react";
import AddPackages from "./add-packages.js";
import UpdatePackages from "./update-packages.js";

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
            <Route path="/add-tour" element={<AddPackages />} />
            <Route path="/update-tour/:packageId" element={<UpdatePackages />} />
            {/* <Route path="/visa" element={<AddVisa />}></Route> */}
            {/* <Route path="vendor-dashboard">
              <Route path="add-hotel" element={<VendorAddHotel />} />
            </Route> */}
          </Routes>
        </BrowserRouter>
      </div>
    </Auth0Provider>
  );
}

export default App;

import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// import UploadComponent from './components/UploadComponent';
// import DisplayComponent from './components/DisplayComponent';
// import MaintenancePage from './components/MaintenancePage';
import HomePage from "./home/homepage";
import AboutPage from "./about/aboutpage";
import ContactPage from "./contact/contactpage";
import TourListPage2 from "./pages/tour/tour-list-v2";
import TourSingleV1Dynamic from "./pages/tour/tour-single";
import "./App.css";
import "./styles/index.scss";
import ComingSoon from "./ComingSoon";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" component={MaintenancePage} /> */}
          {/* <Route path="/" element={<ComingSoon />} /> */}
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/about" element={<AboutPage />}></Route>
          <Route path="/contact" element={<ContactPage />}></Route>
          <Route path="/tour-list-v2" element={<TourListPage2 />} />
          <Route path="/tour-single/:id" element={<TourSingleV1Dynamic />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// import UploadComponent from './components/UploadComponent';
// import DisplayComponent from './components/DisplayComponent';
// import MaintenancePage from './components/MaintenancePage';
import HomePage from "./home/homepage";
// import AddnewPackage from './addnewpackage';
import PackageDetail from "./packagedetail";
import CategoryPackages from "./categorypackages";
import AboutPage from "./about/aboutpage";
import ContactPage from "./contact/contactpage";
import AllPackages from "./allpackages/allpackages";
import TourListPage1 from "./pages/tour/tour-list-v1";
import TourListPage2 from "./pages/tour/tour-list-v2";
import TourListPage3 from "./pages/tour/tour-list-v3";
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
          {/* <Route path="/addnewpackage" element={<AddnewPackage/>}></Route> */}
          <Route path="/package/id/:id" Component={PackageDetail} />
          <Route
            path="/packages/category/:category"
            element={<CategoryPackages />}
          />
          <Route path="/about" element={<AboutPage />}></Route>
          <Route path="/contact" element={<ContactPage />}></Route>
          <Route path="/allpackages" element={<AllPackages />}></Route>
          <Route path="tour-list-v1" element={<TourListPage1 />} />
          <Route path="tour-list-v2" element={<TourListPage2 />} />
          <Route path="tour-list-v3" element={<TourListPage3 />} />
          <Route path="tour-single/:id" element={<TourSingleV1Dynamic />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

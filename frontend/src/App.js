// App.jsx
import React, { useState } from "react";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";

import Header from "./main-components/header/header";
import Footer from "./main-components/footer";
import AuthModal from "./main-components/header/AuthModal";

import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsAndConditions from "./pages/legal/TermsAndConditions";
import HomePage from "./home/homepage";
import AboutPage from "./about/aboutpage";
import ContactPage from "./contact/contactpage";
import TourListPage2 from "./pages/tour/tour-list-v2";
import TourSingleV1Dynamic from "./pages/tour/tour-single";
import BookingPage from "./pages/booking-page";

import "./App.css";
import "./styles/index.scss";

function RootLayout() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <Header setShowAuth={setShowAuth} />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <Outlet />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/tour-list-v2" element={<TourListPage2 />} />
            <Route path="/tour-single/:id" element={<TourSingleV1Dynamic />} />
            <Route path="/booking-page" element={<BookingPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

// src/main-components/header/Header.jsx
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import MainMenu from "./MainMenu";
import MobileMenu from "./MobileMenu";
import useAuth from "../../hooks/useAuth";

const Header = ({ setShowAuth = () => { } }) => {
  const [navbar, setNavbar] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, isAuthed, logout, ready } = useAuth();

  const menuRef = useRef(null);
  const btnRef = useRef(null);

  const changeBackground = () => setNavbar(window.scrollY >= 10);

  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
    return () => window.removeEventListener("scroll", changeBackground);
  }, []);

  // Close when clicking outside or pressing ESC
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target)) return; // click inside
      setMenuOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const initials = (name = "", email = "") => {
    const base =
      (name && name.trim()) ||
      (email && email.split("@")[0].replace(/[._-]+/g, " ")) ||
      "";
    const parts = base
      .split(" ")
      .filter(Boolean)
      .slice(0, 2);
    if (!parts.length) return "U";
    return parts.map((p) => p[0]?.toUpperCase()).join("");
  };

  return (
    <>
      <header className={`header -type-5 ${navbar ? "-header-5-sticky" : ""}`}>
        <div className="header__container container">
          <div className="row justify-between items-center">
            <div className="col-auto mobile-col">
              <div className="d-flex items-center">
                <div className="mr-20 d-flex items-center">
                  {/* Mobile menu/off-canvas */}
                  <div
                    className="offcanvas offcanvas-start mobile_menu-contnet"
                    tabIndex="-1"
                    id="mobile-sidebar_menu"
                    aria-labelledby="offcanvasMenuLabel"
                    data-bs-scroll="true"
                  >
                    <MobileMenu />
                  </div>
                </div>

                <Link to="/" className="header-logo mr-20">
                  <img src="../img/tpb-logo.png" alt="logo" />
                  <img src="../img/tpb-logo.png" alt="logo" />
                </Link>

                <div className="header-menu">
                  <div className="header-menu__content">
                    <MainMenu style="text-dark-1" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-auto">
              <div className="d-flex items-center ml-20 is-menu-opened-hide md:d-none">
                <div className="header__buttons d-flex items-center is-menu-opened-hide">
                  {!ready ? null : !isAuthed ? (
                    <button
                      onClick={() => setShowAuth(true)}
                      className="button h-50 px-30 fw-400 text-14 text-white ml-20 sm:ml-0 bg-blue-1"
                    >
                      Sign In / Register
                    </button>
                  ) : (
                    <div className="relative" ref={menuRef}>
                      {/* Avatar button */}
                      {/* Avatar button */}
                      <button
                        ref={btnRef}
                        onClick={() => setMenuOpen((s) => !s)}
                        className="userbtn d-flex items-center gap-10"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        aria-controls="user-menu"
                        title={user?.name || user?.email}
                      >
                        <span className="avatar">
                          {initials(user?.name, user?.email)}
                        </span>
                        {/* ✅ Show user name with character limit */}
                        {/* <span className="username text-dark-1 text-14 fw-500 max-w-120 truncate hidden sm:inline">
                          {(user?.name || user?.email)?.length > 20
                            ? (user?.name || user?.email).slice(0, 20) + "…"
                            : user?.name || user?.email}
                        </span> */}
                        <i
                          className={`icon-chevron-down text-12 text-dark-1 caret ${menuOpen ? "open" : ""
                            }`}
                        />
                      </button>

                      {/* Dropdown */}
                      <div
                        id="user-menu"
                        role="menu"
                        className={`user-menu ${menuOpen ? "open" : ""}`}
                        aria-labelledby="user-menu"
                      >
                        <div className="px-15 py-12 border-b border-gray-100 flex items-center gap-10 flas">
                          <span className="avatar-sm">
                            {initials(user?.name, user?.email)}
                          </span>
                          <div className="flex flex-col side">
                            <span className="text-14 fw-600 text-dark-1 truncate">
                              {user?.name || "User"}
                            </span>
                            <span className="text-12 text-light-1 truncate">
                              {user?.email}
                            </span>
                          </div>
                        </div>

                        <Link
                          to="/account"
                          className="menu-item"
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                        >
                          View Profile
                        </Link>
                        <button
                          className="menu-item danger"
                          role="menuitem"
                          onClick={async () => {
                            await logout();
                            setMenuOpen(false);
                          }}
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* End col-auto */}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

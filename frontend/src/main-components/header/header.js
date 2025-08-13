// src/main-components/header/Header.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MainMenu from "./MainMenu";
import MobileMenu from "./MobileMenu";
import useAuth from "../../hooks/useAuth"; // <-- adjust path if needed

const Header = ({ setShowAuth }) => {
  const [navbar, setNavbar] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthed, logout, ready } = useAuth();

  const changeBackground = () => setNavbar(window.scrollY >= 10);

  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
    return () => window.removeEventListener("scroll", changeBackground);
  }, []);

  const initials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("");

  return (
    <>
      <header className={`header -type-5 ${navbar ? "-header-5-sticky" : ""}`}>
        <div className="header__container container">
          <div className="row justify-between items-center">
            <div className="col-auto mobile-col">
              <div className="d-flex items-center">
                <div className="mr-20 d-flex items-center">
                  {/* Mobile menu/offcanvas (kept as-is) */}
                  <div
                    className="offcanvas offcanvas-start  mobile_menu-contnet"
                    tabIndex="-1"
                    id="mobile-sidebar_menu"
                    aria-labelledby="offcanvasMenuLabel"
                    data-bs-scroll="true"
                  >
                    <MobileMenu />
                  </div>
                </div>

                <Link to="/" className="header-logo mr-20">
                  <img src="../img/tpb-logo.png" alt="logo icon" />
                  <img src="../img/tpb-logo.png" alt="logo icon" />
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
                  {/* If auth state not loaded yet, show nothing to avoid flicker */}
                  {!ready ? null : !isAuthed ? (
                    <button
                      onClick={() => setShowAuth(true)}
                      className="button h-50 px-30 fw-400 text-14 text-white ml-20 sm:ml-0 bg-blue-1"
                    >
                      Sign In / Register
                    </button>
                  ) : (
                    <div className="relative">
                      {/* Avatar button */}
                      <button
                        onClick={() => setMenuOpen((s) => !s)}
                        onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
                        className="d-flex items-center gap-10"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                      >
                        <span
                          className="flex items-center justify-center"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "rgba(1,93,224,.12)",
                            color: "#015DE0",
                            fontWeight: 600,
                          }}
                          title={user?.name}
                        >
                          {initials(user?.name) || "U"}
                        </span>
                        <span className="text-dark-1 text-14 fw-500">
                          {/* {user?.name} */}
                        </span>
                        <i className="icon-chevron-down text-12 text-dark-1" />
                      </button>

                      {/* Dropdown */}
                      {menuOpen && (
                        <div
                          className="absolute right-0 mt-10 bg-white rounded-8 shadow-2 py-10"
                          style={{ minWidth: 220, zIndex: 1000 }}
                          role="menu"
                        >
                          <div className="px-15 py-5 text-13 text-light-1">
                            {user?.email}
                          </div>
                          <div className="my-5" style={{ height: 1, background: "rgba(0,0,0,.06)" }} />
                          <Link
                            to="/account"
                            className="d-block px-15 py-10 text-dark-1 hover:bg-blue-1-05 hover:text-blue-1"
                            role="menuitem"
                            onClick={() => setMenuOpen(false)}
                          >
                            View Profile
                          </Link>
                          <button
                            className="d-block w-100 text-left px-15 py-10 text-red-1 hover:bg-red-1-05"
                            role="menuitem"
                            onClick={async () => {
                              await logout();
                              setMenuOpen(false);
                            }}
                          >
                            Log Out
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* End col-auto */}
          </div>
        </div>
      </header>

      {/* little styles reused from modal tokens */}
      <style>{`
        .rounded-8 { border-radius: 8px; }
        .shadow-2 { box-shadow: 0 10px 30px rgba(0,0,0,0.12); }
        .text-red-1 { color: #e11d48; }
        .hover\\:bg-red-1-05:hover { background: rgba(225,29,72,.06); }
      `}</style>
    </>
  );
};

export default Header;

// src/main-components/header/Header.jsx
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import MainMenu from "./MainMenu";
import MobileMenu from "./MobileMenu";
import useAuth from "../../hooks/useAuth"; // adjust if needed

const Header = ({ setShowAuth }) => {
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
                        {/* show name if you want:
                        <span className="text-dark-1 text-14 fw-500 max-w-120 truncate">
                          {user?.name || user?.email}
                        </span> */}
                        <i
                          className={`icon-chevron-down text-12 text-dark-1 caret ${
                            menuOpen ? "open" : ""
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
                        <div className="px-15 py-10 text-13 text-light-1 truncate">
                          {user?.email}
                        </div>
                        <div className="menu-sep" />
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

      {/* Component-scoped styles */}
      <style>{`
        /* Avatar/button */
        .avatar{
          width:40px;height:40px;border-radius:9999px;
          display:inline-flex;align-items:center;justify-content:center;
          background:#f5f5f5;color:#EFA852;font-weight:700;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,.06);
        }
        .userbtn{ padding:6px 8px; border-radius:10px; transition:background .12s ease; }
        .userbtn:hover{ background:rgba(0,0,0,.04); }
        .caret{ transition:transform .15s ease; }
        .caret.open{ transform:rotate(180deg); }

        /* Dropdown popover */
        .user-menu{
          position:absolute; right:0; top:calc(100% + 10px);
          min-width:240px; background:#fff; border-radius:12px;
          box-shadow:0 16px 40px rgba(0,0,0,.14), 0 2px 8px rgba(0,0,0,.06);
          border:1px solid rgba(0,0,0,.06);
          opacity:0; transform:scale(.98); pointer-events:none;
          transition:opacity .12s ease, transform .12s ease;
          z-index:1000;
        }
        .user-menu.open{ opacity:1; transform:scale(1); pointer-events:auto; }

        /* little caret tip */
        .user-menu::before{
          content:""; position:absolute; top:-6px; right:18px; width:12px; height:12px;
          background:#fff; transform:rotate(45deg);
          border-left:1px solid rgba(0,0,0,.06);
          border-top:1px solid rgba(0,0,0,.06);
        }

        /* Menu items */
        .menu-item{
          display:block; width:100%; text-align:left;
          padding:10px 15px; font-size:14px; color:#111827;
          background:transparent; border:0; cursor:pointer;
        }
        .menu-item:hover{ background:rgba(59,130,246,.08); color:#2563eb; }
        .menu-item.danger{ color:#e11d48; }
        .menu-item.danger:hover{ background:rgba(225,29,72,.06); }

        .menu-sep{ height:1px; background:rgba(0,0,0,.06); margin:4px 0; }
        .truncate{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .max-w-120{ max-width:120px; }
      `}</style>
    </>
  );
};

export default Header;

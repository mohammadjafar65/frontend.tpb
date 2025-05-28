import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

function Header() {
  const { logout } = useAuth0();

  return (
    <div className="main-header">
      <div className="logo-header">
        <h6>TPB Admin</h6>
        <button
          className="navbar-toggler sidenav-toggler ml-auto"
          type="button"
          data-toggle="collapse"
          data-target="collapse"
          aria-controls="sidebar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <button className="topbar-toggler more">
          <i className="la la-ellipsis-v"></i>
        </button>
      </div>
      <nav className="navbar navbar-header navbar-expand-lg p-0">
        <div className="container-fluid">
          <ul className="navbar-nav topbar-nav ml-auto align-items-center">
            <li className="nav-item dropdown ">
              <a
                className="dropdown-toggle profile-pic flex align-items-center"
                data-toggle="dropdown"
                href="#"
                aria-expanded="false"
              >
                <img
                  src="https://admin.thepilgrimbeez.com/assets/img/profile.jpg"
                  alt="user-img"
                  className="img-circle w-[35px] h-[35px]"
                />
                <span>Admin</span>
              </a>
              <ul className="dropdown-menu dropdown-user">
                <li>
                  <div className="user-box">
                    <div className="u-img">
                      <img src="https://admin.thepilgrimbeez.com/assets/img/profile.jpg" alt="user" />
                    </div>
                    <div className="u-text">
                      <h4>Admin</h4>
                      <p className="text-muted">hello@tpb.com</p>
                    </div>
                  </div>
                </li>
                <div className="dropdown-divider"></div>
                <button
                  onClick={() =>
                    logout({
                      logoutParams: {
                        returnTo: window.location.origin,
                      },
                    })
                  }
                >
                  <i className="fa fa-power-off"></i> Log Out
                </button>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default Header;

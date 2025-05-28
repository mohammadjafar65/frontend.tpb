import React from "react";

function Sidebar() {
    return (
        <div className="sidebar">
            <div className="scrollbar-inner sidebar-wrapper">
                <div className="user">
                    <div className="photo">
                        <img src="https://admin.thepilgrimbeez.com/assets/img/profile.jpg" alt="" />
                    </div>
                    <div className="info">
                        <a
                            className=""
                            data-toggle="collapse"
                            href="#collapseExample"
                            aria-expanded="true"
                        >
                            <span>
                                Juned S
                                <span className="user-level">Administrator</span>
                            </span>
                        </a>
                    </div>
                </div>
                <ul className="nav">
                    <li className="nav-item active">
                        <a href="#">
                            <i className="la la-dashboard"></i>
                            <p>Dashboard</p>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;
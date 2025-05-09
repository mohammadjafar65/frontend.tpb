import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "./dashboard/Header/Header";
import Sidebar from "./dashboard/Sidebar/Sidebar";
import SettingsTabs from "./main-components/add-hotel/components/index";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // import styles
import "./dashboard.css";

function AddPackages() {

  return (
    <>
      <div className="wrapper">
        <Header />
        <Sidebar />
        <div className="main-panel">
          <div className="content">
            <div className="container-fluid">
              <div className="mini_header">
                <h4 className="page-title">Add Tour Package</h4>
                <a href="" className="btn btn-primary">
                  <i className="la la-plus"></i> Add New Package
                </a>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-body">
                      <SettingsTabs />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddPackages;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "./dashboard/Header/Header";
import Sidebar from "./dashboard/Sidebar/Sidebar";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./dashboard.css";

function Dashboard() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const { REACT_APP_API_URL, REACT_APP_UPLOAD_API_URL } = process.env;
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${REACT_APP_API_URL}/packages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPackages(response.data);
      } catch (err) {
        setError(`Error fetching packages: ${err.message}`);
        console.error(err);
      }
      setLoading(false);
    };
    fetchPackages();
  }, []);

  const safeJsonArray = (str) => {
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const handleDeletePackage = async (packageId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this package?"
    );
    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `${REACT_APP_API_URL}/packages/delete/${packageId}`
        );
        if (response.status === 200 || response.status === 204) {
          setPackages((prev) =>
            prev.filter((item) => item.packageId !== packageId)
          );
        }
      } catch (error) {
        console.error("Error deleting package:", error);
        alert("Error deleting package: " + error.message);
      }
    }
  };

  if (loading) return <div>Loading packages...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div className="wrapper">
          <Header />
          <Sidebar />
          <div className="main-panel">
            <div className="content">
              <div className="container-fluid">
                <div className="mini_header d-flex justify-between items-center mb-4">
                  <h4 className="page-title">Dashboard</h4>
                  <a href="/add-hotel" className="btn btn-primary">
                    <i className="la la-plus"></i> Add Tour Package
                  </a>
                </div>
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Packages List</div>
                  </div>
                  <div className="card-body">
                    <table className="table table-hover responsive nowrap">
                      <thead>
                        <tr>
                          <th>Avatar</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Location</th>
                          <th>Price</th>
                          <th>Start Date</th>
                          <th>Duration</th>
                          <th>Slug</th>
                          <th>Group Size</th>
                          <th>Rating</th>
                          <th>Reviews</th>
                          <th>Highlights</th>
                          <th>Included</th>
                          <th>Inclusions</th>
                          <th>Exclusions</th>
                          <th>Info</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packages.map((pkg) => (
                          <tr key={pkg.packageId}>
                            <td>
                              {pkg.avatarImage ? (
                                <img
                                  src={`${REACT_APP_UPLOAD_API_URL}/${pkg.avatarImage}`}
                                  alt="avatar"
                                  width="60"
                                  height="60"
                                />
                              ) : (
                                "No Image"
                              )}
                            </td>
                            <td>{pkg.packageName}</td>
                            <td>{pkg.packageCategory}</td>
                            <td>{pkg.packageLocation}</td>
                            <td>{pkg.packagePrice}</td>
                            <td>{formatDate(pkg.packageDate)}</td>
                            <td>{pkg.packageDurationDate}</td>
                            <td>{pkg.slug}</td>
                            <td>{pkg.groupSize}</td>
                            <td>{pkg.rating}</td>
                            <td>{pkg.reviewCount}</td>
                            <td>
                              {safeJsonArray(pkg.highlights).map((v, i) => (
                                <div key={i}>{v}</div>
                              ))}
                            </td>
                            <td>
                              {safeJsonArray(pkg.included).map((v, i) => (
                                <div key={i}>{v}</div>
                              ))}
                            </td>
                            <td>
                              {safeJsonArray(pkg.inclusions).map((v, i) => (
                                <div key={i}>{v}</div>
                              ))}
                            </td>
                            <td>
                              {safeJsonArray(pkg.exclusions).map((v, i) => (
                                <div key={i}>{v}</div>
                              ))}
                            </td>
                            <td>
                              {safeJsonArray(pkg.additionalInformation).map(
                                (v, i) => (
                                  <div key={i}>{v}</div>
                                )
                              )}
                            </td>
                            <td>
                              <div className="dropdown">
                                <button
                                  className="btn btn-sm btn-icon"
                                  data-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <i className="bx bx-dots-horizontal-rounded"></i>
                                </button>
                                <div className="dropdown-menu">
                                  <Link
                                    className="dropdown-item"
                                    to={`/update-hotel/${pkg.packageId}`}
                                  >
                                    <i className="bx bx-edit mr-2"></i> Edit
                                  </Link>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() =>
                                      handleDeletePackage(pkg.packageId)
                                    }
                                  >
                                    <i className="bx bxs-trash mr-2"></i> Remove
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="LoginScreen">
          <div className="card text-center p-4">
            <img
              src="https://thepilgrimbeez.com/img/tpb-logo.png"
              alt="TPB"
              className="mb-3"
            />
            <h2>Admin Panel Of TPB</h2>
            <button
              onClick={() => loginWithRedirect()}
              className="btn btn-primary mt-2"
            >
              Log In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

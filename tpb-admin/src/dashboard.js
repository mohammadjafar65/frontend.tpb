import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "./dashboard/Header/Header";
import Sidebar from "./dashboard/Sidebar/Sidebar";
import { Link } from "react-router-dom";
import "./dashboard.css";

function Dashboard() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const { REACT_APP_API_URL, REACT_APP_UPLOAD_API_URL } = process.env;

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
      } finally {
        setLoading(false);
      }
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
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        const response = await axios.delete(`${REACT_APP_API_URL}/packages/delete/${packageId}`);
        if (response.status === 200 || response.status === 204) {
          setPackages((prev) => prev.filter((item) => item.packageId !== packageId));
        }
      } catch (error) {
        alert("Error deleting package: " + error.message);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="LoginScreen flex items-center justify-center h-screen">
        <div className="card text-center p-6 shadow-lg bg-white rounded-md">
          <img src="https://thepilgrimbeez.com/img/tpb-logo.png" alt="TPB" className="mb-4 w-24 mx-auto" />
          <h2 className="text-xl font-semibold">Admin Panel Of TPB</h2>
          <button onClick={loginWithRedirect} className="btn btn-primary mt-4">Log In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <Header />
      <Sidebar />
      <div className="main-panel">
        <div className="content p-5">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-bold">Dashboard</h4>
            <Link to="/add-tour" className="btn btn-primary">+ Add Tour Package</Link>
          </div>

          {loading ? (
            <div>Loading packages...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="grid gap-6">
              {packages.map((pkg) => (
                <div key={pkg.packageId} className="bg-white shadow p-3 rounded-lg">
                  <div className="flex flex-col md:flex-row gap-3">
                    <img
                      src={`${REACT_APP_UPLOAD_API_URL}/${pkg.avatarImage}`}
                      alt="avatar"
                      className="w-32 h-32 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{pkg.packageName}</h3>
                          <p className="text-sm text-gray-500">{pkg.packageLocation}</p>
                          <p className="text-sm text-gray-400">Group: {pkg.groupSize} | Price: ₹{pkg.packagePrice}</p>
                          <p className="text-xs text-gray-400">Date: {formatDate(pkg.packageDate)} | Duration: {pkg.packageDurationDate}</p>
                        </div>
                        <div className="text-right">
                          <Link to={`/update-tour/${pkg.packageId}`} className="btn btn-sm btn-outline-primary mr-2">Edit</Link>
                          <button onClick={() => handleDeletePackage(pkg.packageId)} className="btn btn-sm btn-outline-danger">Delete</button>
                        </div>
                      </div>

                      {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-sm text-gray-700">
                        <div>
                          <strong>Highlights:</strong>
                          <ul className="list-disc ml-5">{safeJsonArray(pkg.highlights).map((v, i) => <li key={i}>{v}</li>)}</ul>
                        </div>
                        <div>
                          <strong>Included:</strong>
                          <ul className="list-disc ml-5">{safeJsonArray(pkg.included).map((v, i) => <li key={i}>{v}</li>)}</ul>
                        </div>
                        <div>
                          <strong>Inclusions:</strong>
                          <ul className="list-disc ml-5">{safeJsonArray(pkg.inclusions).map((v, i) => <li key={i}>{v}</li>)}</ul>
                        </div>
                        <div>
                          <strong>Exclusions:</strong>
                          <ul className="list-disc ml-5">{safeJsonArray(pkg.exclusions).map((v, i) => <li key={i}>{v}</li>)}</ul>
                        </div>
                        <div>
                          <strong>Additional Info:</strong>
                          <ul className="list-disc ml-5">{safeJsonArray(pkg.additionalInformation).map((v, i) => <li key={i}>{v}</li>)}</ul>
                        </div>
                        <div>
                          <strong>Category:</strong>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {safeJsonArray(pkg.packageCategory).map((cat, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-200 rounded text-xs">{cat}</span>
                            ))}
                          </div>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

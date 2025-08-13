import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RequireAdmin from "./components/RequireAdmin.jsx";
import NoAccess from "./pages/NoAccess.jsx";
import Dashboard from "./dashboard/index.jsx";
import PackageManagement from "./pages/PackageManagement.jsx";
import AddPackages from "./pages/AddPackages.jsx";
import PackageDetails from "./pages/PackageDetails.jsx";
import EditPackage from "./pages/EditPackage.jsx";
import Continents from "./pages/Continents.jsx";
import Country from "./pages/Country.jsx";
import States from "./pages/States.jsx";
import StateDetails from "./pages/StateDetails.jsx";
import Login from "./pages/Login.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import Users from "./pages/Users.jsx";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/no-access" element={<NoAccess />} />
          <Route path="/users" element={<Navigate to="/admin/users" replace />} />
          <Route
            path="/admin/users"
            element={
              <RequireAdmin>
                <Users />
              </RequireAdmin>
            }
          />
          <Route
            path="/"
            element={
              <RequireAdmin>
                <Dashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/packages"
            element={
              <RequireAdmin>
                <PackageManagement />
              </RequireAdmin>
            }
          />
          <Route
            path="/add-package"
            element={
              <RequireAdmin>
                <AddPackages />
              </RequireAdmin>
            }
          />
          <Route
            path="/packages/edit/:packageId"
            element={
              <RequireAdmin>
                <EditPackage />
              </RequireAdmin>
            }
          />
          <Route
            path="/package/:id"
            element={
              <RequireAdmin>
                <PackageDetails />
              </RequireAdmin>
            }
          />
          <Route
            path="/continents"
            element={
              <RequireAdmin>
                <Continents />
              </RequireAdmin>
            }
          />
          <Route
            path="/countries"
            element={
              <RequireAdmin>
                <Country />
              </RequireAdmin>
            }
          />
          <Route
            path="/states"
            element={
              <RequireAdmin>
                <States />
              </RequireAdmin>
            }
          />
          <Route
            path="/state/:id"
            element={
              <RequireAdmin>
                <StateDetails />
              </RequireAdmin>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

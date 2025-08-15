import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "../dashboard/Header/Header";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import { Link } from "react-router-dom";
import StateCard from "../components/StateCard";
import StateFormModal from "../components/StateFormModal";

const { REACT_APP_API_URL } = process.env;

// === NEW: keep only valid UUID-like strings; drop 0/null/empty ===
const UUIDISH = /^[0-9a-fA-F-]{16,}$/;
const cleanPackageIds = (ids) =>
  (Array.isArray(ids) ? ids : [])
    .map((x) => {
      if (x == null) return "";
      // support {value, label} or {id, ...} or plain string
      if (typeof x === "object") return String(x.value ?? x.id ?? "").trim();
      return String(x).trim();
    })
    .filter((s) => s && UUIDISH.test(s));

function States() {
  const [states, setStates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");

  const BASE = `${REACT_APP_API_URL}`;

  const fetchStates = () => axios.get(`${BASE}/states`);
  const fetchStateById = (id) => axios.get(`${BASE}/states/${id}`);
  const createState = (data) => axios.post(`${BASE}/states/create`, data, { headers: { "Content-Type": "application/json" }});
  const updateState = (id, data) => axios.put(`${BASE}/states/update/${id}`, data, { headers: { "Content-Type": "application/json" }});
  const deleteState = (id) => axios.delete(`${BASE}/states/delete/${id}`);
  const fetchPackages = () => axios.get(`${BASE}/packages`);

  const load = async () => {
    const res = await fetchStates();
    setStates(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  // === CHANGED: sanitize before sending to API ===
  const handleSubmit = async (data) => {
    try {
      // Accept either data.package_ids (array) or data.selectedPackages (objects)
      const raw =
        Array.isArray(data?.package_ids)
          ? data.package_ids
          : Array.isArray(data?.selectedPackages)
          ? data.selectedPackages.map((p) => p.value ?? p.id ?? p)
          : [];

      const payload = {
        ...data,
        // ensure package_ids is a clean array of UUID strings
        package_ids: cleanPackageIds(raw),
      };

      if (editing) {
        await updateState(editing.id, payload);
      } else {
        await createState(payload);
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      console.error("State submit failed:", err);
      alert(err?.response?.data?.error || "Failed to save state");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await deleteState(id);
      load();
    }
  };

  const handleEdit = (state) => {
    setEditing(state);
    setShowForm(true);
  };

  const handleView = (id) => {
    window.location.href = `/add-package?stateId=${id}`;
  };

  const filtered = states.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto ml-64">
        <Header />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-primary">Destination States</h1>
            <button
              onClick={() => {
                // === NEW: ensure a clean create mode ===
                setEditing(null);
                setShowForm(true);
              }}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary"
            >
              + Add New State
            </button>
          </div>

          {/* <input
            type="text"
            placeholder="Search states..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border rounded mb-6 p-2"
          /> */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((state) => (
              <StateCard
                key={state.id}
                state={state}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>

          {showForm && (
            <StateFormModal
              defaultData={editing}
              onClose={() => {
                setShowForm(false);
                setEditing(null);
              }}
              onSubmit={handleSubmit}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default States;
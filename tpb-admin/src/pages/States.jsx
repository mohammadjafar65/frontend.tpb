import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Header from "../dashboard/Header/Header";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import StateCard from "../components/StateCard";
import StateFormModal from "../components/StateFormModal";

const { REACT_APP_API_URL } = process.env;

// keep only UUID-like strings; drop 0/null/empty
const UUIDISH = /^[0-9a-fA-F-]{16,}$/;
const cleanPackageIds = (ids) =>
  (Array.isArray(ids) ? ids : [])
    .map((x) => {
      if (x == null) return "";
      if (typeof x === "object") return String(x.value ?? x.id ?? "").trim();
      return String(x).trim();
    })
    .filter((s) => s && UUIDISH.test(s));

function States() {
  const [states, setStates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // NEW: search + selection
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const BASE = `${REACT_APP_API_URL}`;

  const fetchStates = () => axios.get(`${BASE}/states`);
  const createState = (data) =>
    axios.post(`${BASE}/states/create`, data, { headers: { "Content-Type": "application/json" } });
  const updateState = (id, data) =>
    axios.put(`${BASE}/states/update/${id}`, data, { headers: { "Content-Type": "application/json" } });
  const deleteState = (id) => axios.delete(`${BASE}/states/delete/${id}`);

  const load = async () => {
    const res = await fetchStates();
    setStates(res.data || []);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (data) => {
    try {
      const raw = Array.isArray(data?.package_ids)
        ? data.package_ids
        : Array.isArray(data?.selectedPackages)
        ? data.selectedPackages.map((p) => p.value ?? p.id ?? p)
        : [];

      const payload = { ...data, package_ids: cleanPackageIds(raw) };

      if (editing) await updateState(editing.id, payload);
      else await createState(payload);

      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      console.error("State submit failed:", err);
      alert(err?.response?.data?.error || "Failed to save state");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this state?")) return;
    await deleteState(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    load();
  };

  const handleEdit = (state) => {
    setEditing(state);
    setShowForm(true);
  };

  const handleView = (id) => {
    window.location.href = `/add-package?stateId=${id}`;
  };

  // ------ Search / Filter ------
  const filtered = useMemo(() => {
    const k = query.trim().toLowerCase();
    if (!k) return states;
    return states.filter((s) => String(s.name || "").toLowerCase().includes(k));
  }, [states, query]);

  // ------ Selection helpers ------
  const toggleOne = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const clearSelection = () => setSelectedIds(new Set());

  const filteredIds = useMemo(() => filtered.map((s) => s.id), [filtered]);
  const selectedVisibleCount = useMemo(
    () => filteredIds.filter((id) => selectedIds.has(id)).length,
    [filteredIds, selectedIds]
  );
  const allVisibleSelected = filteredIds.length > 0 && selectedVisibleCount === filteredIds.length;

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        // unselect all visible
        filteredIds.forEach((id) => next.delete(id));
      } else {
        // select all visible
        filteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    if (!window.confirm(`Delete ${ids.length} selected state(s)?`)) return;
    try {
      setBulkDeleting(true);
      await Promise.allSettled(ids.map((id) => deleteState(id)));
      clearSelection();
      load();
    } finally {
      setBulkDeleting(false);
    }
  };

  // master checkbox indeterminate
  const masterRef = useRef(null);
  useEffect(() => {
    if (!masterRef.current) return;
    masterRef.current.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected;
  }, [selectedVisibleCount, allVisibleSelected]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto ml-64">
        <Header />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <h1 className="text-xl font-bold text-primary">Destination States</h1>
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Search */}
              <input
                type="text"
                placeholder="Search states…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full md:w-64 border rounded p-2 text-sm placeholder:text-gray-400"
              />
              <button
                onClick={() => { setEditing(null); setShowForm(true); }}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary"
              >
                + Add New State
              </button>
            </div>
          </div>

          {/* Bulk actions bar */}
          <div className="flex items-center gap-3 mb-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                ref={masterRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllFiltered}
                className="h-4 w-4"
              />
              <span>Select all ({filtered.length})</span>
            </label>

            {selectedIds.size > 0 && (
              <>
                <span className="text-xs text-gray-600">{selectedIds.size} selected</span>
                <button
                  onClick={clearSelection}
                  className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                >
                  Clear selection
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {bulkDeleting ? "Deleting…" : "Delete selected"}
                </button>
              </>
            )}
          </div>

          {/* Grid with per-card checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((state) => (
              <div key={state.id} className="relative">
                <input
                  type="checkbox"
                  className="absolute z-10 top-2 left-2 h-4 w-4 bg-white/90 rounded"
                  checked={selectedIds.has(state.id)}
                  onChange={() => toggleOne(state.id)}
                  onClick={(e) => e.stopPropagation()}
                  title="Select"
                />
                <StateCard
                  state={state}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </div>
            ))}
          </div>

          {showForm && (
            <StateFormModal
              defaultData={editing}
              onClose={() => { setShowForm(false); setEditing(null); }}
              onSubmit={handleSubmit}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default States;

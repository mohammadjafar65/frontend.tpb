import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Header from "../dashboard/Header/Header";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import CountryCard from "../components/CountryCard";
import CountryForm from "../components/CountryForm";

const { REACT_APP_API_URL } = process.env;

function Country() {
  const [countries, setCountries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // NEW: search + selection
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const API = axios.create({ baseURL: `${REACT_APP_API_URL}` });

  const fetchCountries = () => API.get("/countries");
  const addCountry = (data) => API.post("/countries", data);
  const updateCountry = (id, data) => API.put(`/countries/${id}`, data);
  const deleteCountry = (id) => API.delete(`/countries/${id}`);

  const loadCountries = async () => {
    const res = await fetchCountries();
    setCountries(res.data || []);
  };

  useEffect(() => {
    loadCountries();
  }, []);

  const handleAddOrEdit = async (data) => {
    if (editData) await updateCountry(editData.id, data);
    else await addCountry(data);
    setShowForm(false);
    setEditData(null);
    loadCountries();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this country?")) return;
    await deleteCountry(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    loadCountries();
  };

  // ---------- Search / Filter ----------
  const filtered = useMemo(() => {
    const k = query.trim().toLowerCase();
    if (!k) return countries;
    return countries.filter((c) => String(c.name || "").toLowerCase().includes(k));
  }, [countries, query]);

  // ---------- Selection helpers ----------
  const toggleOne = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const clearSelection = () => setSelectedIds(new Set());

  const filteredIds = useMemo(() => filtered.map((c) => c.id), [filtered]);
  const selectedVisibleCount = useMemo(
    () => filteredIds.filter((id) => selectedIds.has(id)).length,
    [filteredIds, selectedIds]
  );
  const allVisibleSelected = filteredIds.length > 0 && selectedVisibleCount === filteredIds.length;

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredIds.forEach((id) => next.delete(id));
      } else {
        filteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    if (!window.confirm(`Delete ${ids.length} selected countr${ids.length === 1 ? "y" : "ies"}?`)) return;
    try {
      setBulkDeleting(true);
      await Promise.allSettled(ids.map((id) => deleteCountry(id)));
      clearSelection();
      loadCountries();
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
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto ml-64">
        <Header />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          {/* Header row */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <h1 className="text-xl font-bold text-primary">Country Management</h1>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search countries…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full md:w-64 border rounded p-2 text-sm placeholder:text-gray-400"
              />
              <button
                onClick={() => { setShowForm(true); setEditData(null); }}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary"
              >
                + Add Country
              </button>
            </div>
          </div>

          {/* Bulk actions */}
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

          {/* Grid with checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((country) => (
              <div key={country.id} className="relative">
                <input
                  type="checkbox"
                  className="absolute z-10 top-2 left-2 h-4 w-4 bg-white/90 rounded"
                  checked={selectedIds.has(country.id)}
                  onChange={() => toggleOne(country.id)}
                  onClick={(e) => e.stopPropagation()}
                  title="Select"
                />
                <CountryCard
                  country={country}
                  onEdit={(data) => { setEditData(data); setShowForm(true); }}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>

          {showForm && (
            <CountryForm
              onClose={() => { setShowForm(false); setEditData(null); }}
              onSubmit={handleAddOrEdit}
              defaultData={editData}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default Country;

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import Header from "../dashboard/Header/Header";
import { Trash, ImageIcon, Eye, Info } from "lucide-react";

function PackageManagement() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name_az"); // name_az | price_low | price_high

  // NEW: selection state
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const navigate = useNavigate();
  const { REACT_APP_API_URL } = process.env;

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${REACT_APP_API_URL}/packages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPackages(response.data || []);
      } catch (err) {
        setError("Error fetching packages: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [REACT_APP_API_URL]);

  const apiDelete = async (id) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${REACT_APP_API_URL}/packages/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      await apiDelete(id);
      setPackages((prev) => prev.filter((item) => item.packageId !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      alert("Error deleting package: " + err.message);
    }
  };

  // bulk delete
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    if (!window.confirm(`Delete ${ids.length} selected package${ids.length > 1 ? "s" : ""}?`)) return;
    try {
      setBulkDeleting(true);
      await Promise.allSettled(ids.map((id) => apiDelete(id)));
      setPackages((prev) => prev.filter((p) => !selectedIds.has(p.packageId)));
      setSelectedIds(new Set());
    } finally {
      setBulkDeleting(false);
    }
  };

  // image util (kept from your original code)
  const getFirstImage = (avatarImage) => {
    try {
      if (!avatarImage) return "https://thepilgrimbeez.com/img/tpb-logo.png";
      const arr = typeof avatarImage === "string" ? JSON.parse(avatarImage) : avatarImage;
      if (Array.isArray(arr) && arr[0]) return arr[0];
      if (typeof arr === "string") return arr;
      return "https://thepilgrimbeez.com/img/tpb-logo.png";
    } catch {
      return "https://thepilgrimbeez.com/img/tpb-logo.png";
    }
  };

  const priceNum = (p) => Number(p?.basePrice ?? p?.price ?? 0);
  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n || 0));

  // filter + sort
  const filteredPackages = useMemo(() => {
    const k = search.trim().toLowerCase();
    const filtered = !k
      ? packages
      : packages.filter((pkg) => String(pkg.packageName || "").toLowerCase().includes(k));
    return [...filtered].sort((a, b) => {
      if (sortBy === "price_low") return priceNum(a) - priceNum(b);
      if (sortBy === "price_high") return priceNum(b) - priceNum(a);
      return String(a.packageName || "").localeCompare(String(b.packageName || ""));
    });
  }, [packages, search, sortBy]);

  // selection helpers
  const toggleOne = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filteredIds = useMemo(() => filteredPackages.map((p) => p.packageId), [filteredPackages]);
  const selectedVisibleCount = useMemo(
    () => filteredIds.filter((id) => selectedIds.has(id)).length,
    [filteredIds, selectedIds]
  );
  const allVisibleSelected = filteredIds.length > 0 && selectedVisibleCount === filteredIds.length;

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) filteredIds.forEach((id) => next.delete(id));
      else filteredIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const masterRef = useRef(null);
  useEffect(() => {
    if (masterRef.current) {
      masterRef.current.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected;
    }
  }, [selectedVisibleCount, allVisibleSelected]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto ml-64">
        <Header />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          {/* Top row */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <h1 className="text-xl font-bold text-primary">Package Management</h1>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search packages by title…"
                className="w-full md:w-72 border px-3 py-2 rounded"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded p-2 text-sm"
              >
                <option value="name_az">Name (A–Z)</option>
                <option value="price_low">Price (Low → High)</option>
                <option value="price_high">Price (High → Low)</option>
              </select>
              <Link to="/add-package" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary">
                + Add Tour Package
              </Link>
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
              <span>Select all ({filteredPackages.length})</span>
            </label>

            {selectedIds.size > 0 && (
              <>
                <span className="text-xs text-gray-600">{selectedIds.size} selected</span>
                <button onClick={clearSelection} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">
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

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
                    <div className="h-9 bg-gray-200 animate-pulse rounded w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredPackages.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-gray-500 bg-white">
              No packages match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => {
                // tags
                let includedItems = [];
                try { includedItems = pkg.included ? JSON.parse(pkg.included) : []; } catch { }
                if (!Array.isArray(includedItems)) includedItems = [];

                const id = pkg.packageId;
                const selected = selectedIds.has(id);

                return (
                  <div key={id} className="relative">
                    {/* per-card checkbox */}
                    <input
                      type="checkbox"
                      className="absolute z-10 top-2 left-2 h-4 w-4 bg-white/90 rounded"
                      checked={selected}
                      onChange={() => toggleOne(id)}
                      onClick={(e) => e.stopPropagation()}
                      title="Select"
                    />

                    <div className="rounded-2xl shadow-md overflow-hidden flex flex-col relative transition-all hover:shadow-xl hover:scale-[1.01] bg-white/80 backdrop-blur-sm border border-gray-200">
                      <CardImage src={getFirstImage(pkg.avatarImage)} price={priceNum(pkg)} formatINR={formatINR} />
                      <div className="p-4 flex flex-col justify-between flex-grow">
                        <div>
                          <h3 className="text-lg font-semibold mb-3 truncate text-gray-900">{pkg.packageName}</h3>
                          <div className="flex flex-wrap gap-2 text-xs mb-3">
                            {includedItems.length
                              ? includedItems.slice(0, 3).map((item, idx) => (
                                <span key={idx} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 shadow-sm">
                                  {item}
                                </span>
                              ))
                              : <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">No items included</span>
                            }
                            {includedItems.length > 3 && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                +{includedItems.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 items-center mt-1">
                          <button
                            onClick={() => navigate(`/package/${id}`)}
                            className="flex items-center gap-1 text-sm px-4 py-1.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition"
                          >
                            <Info className="w-4 h-4" /> View Details
                          </button>

                          <button
                            onClick={async () => {
                              const token = localStorage.getItem("token");
                              const newVisibility = pkg.isVisible ? 0 : 1;
                              await axios.post(`${REACT_APP_API_URL}/packages/toggle-visibility/${id}`,
                                { isVisible: newVisibility },
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                              setPackages(prev =>
                                prev.map(p => p.packageId === id ? { ...p, isVisible: newVisibility } : p)
                              );
                            }}
                            className={`flex items-center gap-1 text-sm px-4 py-1.5 rounded-full border transition ${pkg.isVisible
                                ? "border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white"
                                : "border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                              }`}
                          >
                            <Eye className="w-4 h-4" /> {pkg.isVisible ? "Hide" : "Show"}
                          </button>

                          <button
                            onClick={() => handleDelete(id)}
                            title="Delete Package"
                            className="flex items-center gap-1 text-sm px-4 py-1.5 rounded-full border border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition"
                          >
                            <Trash className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function CardImage({ src, price, formatINR }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);

  return (
    <div className="relative">
      {!loaded && !err && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
      {err ? (
        <div className="h-48 w-full flex items-center justify-center bg-gray-100 text-gray-400">
          <ImageIcon className="w-7 h-7" />
        </div>
      ) : (
        <img
          src={src}
          alt="avatar"
          className={`w-full h-48 object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
        />
      )}
      <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
        {formatINR(price)}
      </div>
    </div>
  );
}

export default PackageManagement;

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../dashboard/Header/Header";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import { ArrowLeft, ExternalLink, ImageIcon, Loader2, Search } from "lucide-react";

const { REACT_APP_API_URL } = process.env;
const BASE = `${REACT_APP_API_URL || ""}`;

/* ---------- utils ---------- */
const safeJSON = (v, f = []) => {
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v ?? "[]"); } catch { return f; }
};
const toIdSet = (src) => {
  const arr = safeJSON(src, src || []);
  const out = new Set();
  (arr || []).forEach((x) => {
    if (x == null) return;
    if (typeof x === "object") out.add(String(x.packageId ?? x.id ?? x.value ?? "").trim());
    else out.add(String(x).trim());
  });
  out.delete("");
  return out;
};
const priceOf = (pkg) =>
  Number(pkg?.basePrice ?? pkg?.packagePrice ?? pkg?.price ?? 0);

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n || 0));

/* ✅ same image resolver you used in PackageManagement */
const FALLBACK_IMG = "https://thepilgrimbeez.com/img/tpb-logo.png";
const getFirstImage = (avatarImage) => {
  try {
    if (!avatarImage) return FALLBACK_IMG;
    const arr = typeof avatarImage === "string" ? JSON.parse(avatarImage) : avatarImage;
    if (Array.isArray(arr) && arr[0]) return arr[0];
    if (typeof arr === "string") return arr;
    return FALLBACK_IMG;
  } catch {
    return FALLBACK_IMG;
  }
};

/* ---------- component ---------- */
export default function StateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stateData, setStateData] = useState(null);
  const [allPackages, setAllPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // UI controls
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("name_az"); // name_az | price_low | price_high

  // fetchers
  const fetchStateById = (sid) => axios.get(`${BASE}/states/${sid}`);
  const fetchPackages = () => axios.get(`${BASE}/packages`);

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    let alive = true;
    try {
      const [stateRes, pkgRes] = await Promise.all([fetchStateById(id), fetchPackages()]);
      if (!alive) return;
      setStateData(stateRes?.data ?? null);
      setAllPackages(pkgRes?.data ?? []);
    } catch (e) {
      console.error(e);
      setErr("Could not load state or packages.");
    } finally {
      if (alive) setLoading(false);
    }
    return () => { alive = false; };
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // derive associated packages
  const associatedPackages = useMemo(() => {
    if (!stateData) return [];
    const ids = toIdSet(stateData.package_ids);
    const filtered = allPackages.filter((pkg) => ids.has(String(pkg.packageId)));
    // filter by query
    const k = q.trim().toLowerCase();
    const searched = !k
      ? filtered
      : filtered.filter((p) =>
          String(p.packageName || "")
            .toLowerCase()
            .includes(k)
        );
    // sort
    const sorted = [...searched].sort((a, b) => {
      if (sortBy === "price_low") return priceOf(a) - priceOf(b);
      if (sortBy === "price_high") return priceOf(b) - priceOf(a);
      // name_az
      return String(a.packageName || "").localeCompare(String(b.packageName || ""));
    });
    return sorted;
  }, [stateData, allPackages, q, sortBy]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/states");
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto ml-64">
          <Header />
          <main className="flex-1 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-56 bg-gray-200 rounded" />
              <div className="h-64 w-full bg-gray-200 rounded" />
              <div className="h-6 w-40 bg-gray-200 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-56 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (err || !stateData) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto ml-64">
          <Header />
          <main className="flex-1 p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              {err || "State not found."}
            </div>
            <button onClick={handleBack} className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4" /> Back to List
            </button>
          </main>
        </div>
      </div>
    );
  }

  const heroUrl = stateData.photo_url || "";
  const hasHero = /^https?:\/\//i.test(heroUrl);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto ml-64">
        <Header />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          <div className="p-2 md:p-6">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-primary">{stateData.name}</h1>
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 bg-white border px-3 py-2 rounded-md hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" /> Back to List
              </button>
            </div>

            {/* Hero */}
            <div className="relative w-full h-64 rounded-xl overflow-hidden mb-6 ring-1 ring-black/5">
              {hasHero ? (
                <>
                  <img src={heroUrl} alt={stateData.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <div className="text-white text-xl font-semibold drop-shadow">{stateData.name}</div>
                  </div>
                  <a
                    href={heroUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 right-3 text-xs underline bg-white/80 hover:bg-white rounded px-2 py-1 inline-flex items-center gap-1"
                  >
                    Open image <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold">
                Associated Packages <span className="text-gray-500 text-sm">({associatedPackages.length})</span>
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search packages…"
                    className="w-56 rounded-md border pl-8 p-2 text-sm placeholder:text-gray-400"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-md p-2 text-sm"
                >
                  <option value="name_az">Name (A–Z)</option>
                  <option value="price_low">Price (Low → High)</option>
                  <option value="price_high">Price (High → Low)</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {associatedPackages.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-gray-500 bg-white">
                No packages linked to this state yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {associatedPackages.map((pkg) => (
                  <PackageCard key={pkg.packageId} pkg={pkg} onOpen={(id) => navigate(`/package/${id}`)} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- Package Card ---------- */
function PackageCard({ pkg, onOpen }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const price = priceOf(pkg);
  const duration = String(pkg.packageDuration || pkg.duration || "").trim();

  const src = imgErr ? FALLBACK_IMG : getFirstImage(pkg.avatarImage);

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden hover:shadow-md transition flex flex-col">
      <div className="relative h-40">
        {!imgLoaded && !imgErr && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
        {/* If the resolved URL still fails (404/403), we show an icon and switch to fallback */}
        {imgErr ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
            <ImageIcon className="w-6 h-6" />
          </div>
        ) : (
          <img
            src={src}
            alt={pkg.packageName}
            className={`w-full h-full object-cover transition-opacity ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgErr(true);
            }}
          />
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        <div className="font-medium line-clamp-2">{pkg.packageName}</div>
        <div className="text-primary font-semibold">
          {price > 0 ? formatINR(price) : "Contact for price"}
        </div>
        {duration && <div className="text-xs text-gray-500">{duration}</div>}
        <button
          onClick={() => onOpen(pkg.packageId)}
          className="mt-3 self-start bg-primary text-white px-3 py-1.5 rounded text-sm hover:opacity-95"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

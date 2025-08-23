import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import { X, Search, Loader2, ExternalLink, ImageIcon } from "lucide-react";

const { REACT_APP_API_URL } = process.env;
const BASE = `${REACT_APP_API_URL || ""}`;

/* utils */
const safeJSON = (v, f = []) => {
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v ?? "[]"); } catch { return f; }
};
const isHttpUrl = (s = "") => /^https?:\/\//i.test(String(s).trim());

export default function CountryForm({ onClose, onSubmit, defaultData }) {
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [availableStates, setAvailableStates] = useState([]); // [{id, name}]
  const [selectedStateIds, setSelectedStateIds] = useState([]); // string IDs
  const [loadingStates, setLoadingStates] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const nameRef = useRef(null);

  /* fetch states (with proper cleanup) */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingStates(true);
        const res = await axios.get(`${BASE}/states`);
        if (!alive) return;
        const rows = (res?.data || []).map((s) => ({
          id: String(s.id),
          name: String(s.name || "").trim(),
        }));
        setAvailableStates(rows);
      } catch (e) {
        console.error("Failed to fetch states", e);
      } finally {
        if (alive) setLoadingStates(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* defaults */
  useEffect(() => {
    setName(defaultData?.name || "");
    setPhotoUrl(defaultData?.photo_url || "");
    setImgOk(true);
    setTimeout(() => nameRef.current?.focus(), 0);
  }, [defaultData]);

  /* when states arrive, map incoming state names/ids to IDs */
  useEffect(() => {
    if (!availableStates.length) return;

    const raw =
      defaultData?.state_ids ??
      defaultData?.states ??
      defaultData?.stateIds ??
      [];

    const arr = safeJSON(raw, []);
    const byName = new Map(
      availableStates.map((s) => [s.name.toLowerCase(), s.id])
    );

    const ids = new Set();
    arr.forEach((x) => {
      if (x == null) return;
      if (typeof x === "object") {
        const id = x.id ?? x.value;
        if (id != null) { ids.add(String(id)); return; }
        const nm = (x.name ?? x.label ?? "").toString().toLowerCase();
        const mapped = byName.get(nm);
        if (mapped) ids.add(String(mapped));
      } else {
        const s = String(x);
        if (/^\d+$/.test(s)) ids.add(s);
        else {
          const mapped = byName.get(s.toLowerCase());
          if (mapped) ids.add(String(mapped));
        }
      }
    });

    setSelectedStateIds(Array.from(ids));
  }, [defaultData, availableStates]);

  /* name collisions: if multiple states share a name, show "Name (#id)" */
  const nameCounts = useMemo(() => {
    const m = new Map();
    availableStates.forEach(({ name }) => {
      const k = name.toLowerCase();
      m.set(k, (m.get(k) || 0) + 1);
    });
    return m;
  }, [availableStates]);
  const labelFor = useCallback((id) => {
    const row = availableStates.find((s) => s.id === id);
    if (!row) return id;
    const count = nameCounts.get(row.name.toLowerCase()) || 0;
    return count > 1 ? `${row.name} (#${id})` : row.name;
  }, [availableStates, nameCounts]);

  /* filtering and selection helpers */
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return availableStates;
    return availableStates.filter((s) => s.name.toLowerCase().includes(k));
  }, [availableStates, q]);

  const setSelected = (updater) =>
    setSelectedStateIds((prev) => Array.from(new Set(updater(prev))));

  const toggleId = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectAllFiltered = () =>
    setSelected((prev) => {
      const set = new Set(prev);
      filtered.forEach((s) => set.add(s.id));
      return Array.from(set);
    });

  const clearSelection = () => setSelectedStateIds([]);
  const clearSearch = () => setQ("");

  /* validation */
  const errors = useMemo(() => {
    const out = {};
    if (name.trim().length < 2) out.name = "Please enter at least 2 characters.";
    if (photoUrl.trim() && !isHttpUrl(photoUrl)) out.photo = "Please use a valid http(s) URL.";
    return out;
  }, [name, photoUrl]);
  const isValid = Object.keys(errors).length === 0;

  /* submit */
  const handleSubmit = useCallback(async () => {
    if (!isValid) return;
    const state_ids = selectedStateIds.map((x) => Number(x));
    const payload = {
      id: defaultData?.id || undefined,
      name: name.trim(),
      photo_url: photoUrl.trim(),
      state_ids,
      // keep this only if your backend still needs names:
      states: state_ids
        .map((n) => String(n))
        .map((sid) => availableStates.find((s) => s.id === sid)?.name)
        .filter(Boolean),
    };
    try {
      setSaving(true);
      const maybe = onSubmit?.(payload);
      if (maybe && typeof maybe.then === "function") await maybe;
    } finally {
      setSaving(false);
    }
  }, [isValid, selectedStateIds, defaultData?.id, name, photoUrl, onSubmit, availableStates]);

  /* keys + click outside */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleSubmit, onClose]);

  const onOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const selectedCount = selectedStateIds.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={onOverlayClick}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">
              {defaultData ? "Edit Country" : "Add New Country"}
            </h2>
            <p className="text-xs text-gray-500">
              Fill in the details below to {defaultData ? "update" : "add"} a country.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid gap-6 md:grid-cols-2">
          {/* Left: image preview */}
          <div className="border rounded-xl overflow-hidden bg-gray-50">
            <div className="relative aspect-video bg-gray-100">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Country cover"
                  className="h-full w-full object-cover"
                  onError={() => setImgOk(false)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}
              {!imgOk && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-red-600 bg-white/70">
                  Couldn’t load preview from this URL
                </div>
              )}
            </div>
            <div className="p-3 text-xs text-gray-600 flex items-center justify-between">
              <span>{selectedCount} state{selectedCount === 1 ? "" : "s"} linked</span>
              {photoUrl && isHttpUrl(photoUrl) && (
                <a href={photoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline hover:no-underline">
                  Open image <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Right: form fields */}
          <div className="space-y-4">
            {/* Country name */}
            <div>
              <label htmlFor="country-name" className="text-sm font-medium">
                Country Name <span className="text-red-600">*</span>
              </label>
              <input
                id="country-name"
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., United Arab Emirates (UAE)"
                className={`mt-1 w-full rounded-lg border p-2.5 text-sm placeholder:text-gray-400 focus-visible:outline-none focus:ring-2 focus:ring-primary ${
                  errors.name ? "border-red-500 ring-red-200" : "border-gray-300"
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Photo URL */}
            <div>
              <label htmlFor="country-photo" className="text-sm font-medium">
                Country Photo URL
              </label>
              <input
                id="country-photo"
                value={photoUrl}
                onChange={(e) => { setImgOk(true); setPhotoUrl(e.target.value); }}
                placeholder="https://…"
                className={`mt-1 w-full rounded-lg border p-2.5 text-sm placeholder:text-gray-400 focus-visible:outline-none focus:ring-2 focus:ring-primary ${
                  errors.photo ? "border-red-500 ring-red-200" : "border-gray-300"
                }`}
              />
              {errors.photo && <p className="mt-1 text-xs text-red-600">{errors.photo}</p>}
            </div>

            {/* States selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select States</label>

              <div className="flex items-center gap-2">
                <div className="relative grow">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search states…"
                    className="w-full rounded-lg border pl-8 p-2.5 text-sm placeholder:text-gray-400 border-gray-300 focus-visible:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {/* <button
                  type="button"
                  onClick={clearSearch}
                  className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                >
                  Clear search
                </button> */}
                {/* <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                >
                  Select all (visible)
                </button> */}
              </div>

              <div className="text-xs text-gray-500">
                {filtered.length} shown • {selectedCount} selected
              </div>

              <div className="max-h-40 overflow-y-auto border rounded p-2">
                {loadingStates ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 p-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading states…
                  </div>
                ) : filtered.length ? (
                  filtered.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm py-1">
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={selectedStateIds.includes(s.id)}
                        onChange={() => toggleId(s.id)}
                      />
                      <span>{labelFor(s.id)}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 p-2">No states match “{q}”.</div>
                )}
              </div>

              {/* Chips */}
              {selectedCount > 0 && (
                <>
                  <div className="flex flex-wrap gap-2 pt-1 max-h-24 overflow-y-auto">
                    {selectedStateIds
                      .map((id) => ({ id, name: labelFor(id) }))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs rounded px-2 py-1"
                        >
                          {s.name}
                          <button
                            type="button"
                            onClick={() => toggleId(s.id)}
                            className="ml-0.5 opacity-70 hover:opacity-100"
                            aria-label={`Remove ${s.name}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-xs underline hover:no-underline"
                    >
                      Clear selection
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-60 disabled:cursor-not-allowed"
            title="Ctrl/Cmd + Enter"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {defaultData ? "Save" : "Add Country"}
          </button>
        </div>
      </div>
    </div>
  );
}

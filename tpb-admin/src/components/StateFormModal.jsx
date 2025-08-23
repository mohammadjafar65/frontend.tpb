import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import PackageMultiSelect from "./PackageMultiSelect";
import { X, ImageIcon, ExternalLink, Loader2, Hash } from "lucide-react";

/* keep only UUID-like strings; drop 0/null/empty; supports {value,id} objects too */
const UUIDISH = /^[0-9a-fA-F-]{16,}$/;
const cleanPackageIds = (ids) =>
  (Array.isArray(ids) ? ids : [])
    .map((x) => {
      if (x == null) return "";
      if (typeof x === "object") return String(x.value ?? x.id ?? "").trim();
      return String(x).trim();
    })
    .filter((s) => s && UUIDISH.test(s));

const isHttpUrl = (s = "") => /^https?:\/\//i.test(String(s).trim());

const StateFormModal = ({ defaultData, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [selectedPackages, setSelectedPackages] = useState([]); // can be strings or objects (multiselect)
  const [imgOk, setImgOk] = useState(true);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({ name: false, photo: false });

  const nameRef = useRef(null);

  useEffect(() => {
    if (defaultData) {
      setName(defaultData.name || "");
      setPhoto(defaultData.photo_url || "");
      let ids = [];
      try {
        ids = Array.isArray(defaultData.package_ids)
          ? defaultData.package_ids
          : JSON.parse(defaultData.package_ids || "[]");
      } catch {
        ids = [];
      }
      setSelectedPackages(ids || []);
    } else {
      setName("");
      setPhoto("");
      setSelectedPackages([]);
    }
    // reset validations/preview flags
    setTouched({ name: false, photo: false });
    setImgOk(true);
    // focus first input on open
    setTimeout(() => nameRef.current?.focus(), 0);
  }, [defaultData]);

  useEffect(() => {
    setImgOk(true); // retry preview when URL changes
  }, [photo]);

  const pkgCount = useMemo(
    () => cleanPackageIds(selectedPackages).length,
    [selectedPackages]
  );

  const errors = useMemo(() => {
    const out = {};
    if (name.trim().length < 2) out.name = "Please enter at least 2 characters.";
    if (photo.trim() && !isHttpUrl(photo)) out.photo = "Use a valid http(s) URL.";
    return out;
  }, [name, photo]);

  const isValid = Object.keys(errors).length === 0;

  const suggestUnsplash = () => {
    if (!name.trim()) return;
    const q = encodeURIComponent(name.trim());
    setPhoto(`https://source.unsplash.com/featured/?${q}`);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const handleSave = useCallback(async () => {
    setTouched({ name: true, photo: true });
    if (!isValid) return;
    const payload = {
      id: defaultData?.id || undefined, // present only when editing
      name: name.trim(),
      photo_url: photo.trim(),
      package_ids: cleanPackageIds(selectedPackages),
    };
    try {
      setSaving(true);
      const maybePromise = onSubmit?.(payload);
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
      }
    } finally {
      setSaving(false);
    }
  }, [defaultData?.id, isValid, name, photo, selectedPackages, onSubmit]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSave();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleSave, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="space-y-0.5">
            <h2 className="text-lg font-semibold">
              {defaultData ? "Edit State" : "Add New State"}
            </h2>
            <p className="text-xs text-gray-500">
              Manage the state’s name, cover image and linked packages.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid gap-5 md:grid-cols-2">
          {/* Left: live preview */}
          <div className="border rounded-xl overflow-hidden bg-gray-50">
            <div className="relative aspect-video bg-gray-100">
              {photo ? (
                <img
                  src={photo}
                  alt="State cover"
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
            <div className="p-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-400" />
                <span className="font-medium truncate">
                  {name || "State name…"}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                <span>{pkgCount} package{pkgCount === 1 ? "" : "s"} linked</span>
                {photo && isHttpUrl(photo) && (
                  <a
                    href={photo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 underline hover:no-underline"
                  >
                    Open image <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="state-name" className="text-sm font-medium">
                State name <span className="text-red-600">*</span>
              </label>
              <input
                id="state-name"
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="e.g., Dubai Emirate"
                className={`mt-1 w-full rounded-lg border p-2.5 text-sm placeholder:text-gray-400 focus-visible:outline-none focus:ring-2 focus:ring-primary ${
                  touched.name && errors.name ? "border-red-500 ring-red-200" : "border-gray-300"
                }`}
              />
              {touched.name && errors.name && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Photo URL */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="state-photo" className="text-sm font-medium">
                  Cover image URL
                </label>
                {/* <button
                  type="button"
                  onClick={suggestUnsplash}
                  className="text-xs underline hover:no-underline"
                  title="Uses Unsplash Source to fetch a themed image"
                >
                  Suggest image
                </button> */}
              </div>
              <input
                id="state-photo"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, photo: true }))}
                placeholder="https://…"
                className={`mt-1 w-full rounded-lg border p-2.5 text-sm placeholder:text-gray-400 focus-visible:outline-none focus:ring-2 focus:ring-primary ${
                  touched.photo && errors.photo ? "border-red-500 ring-red-200" : "border-gray-300"
                }`}
              />
              {/* <p className="mt-1 text-xs text-gray-500">
                Tip: paste an image link or click “Suggest image” (random from Unsplash based on the name).
              </p> */}
              {touched.photo && errors.photo && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.photo}
                </p>
              )}
            </div>

            {/* Packages */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Link packages</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5">
                    {pkgCount} selected
                  </span>
                  {pkgCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedPackages([])}
                      className="text-xs underline hover:no-underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-1">
                {/* This component may emit strings or {value,label} items */}
                <PackageMultiSelect
                  selected={selectedPackages}
                  setSelected={setSelectedPackages}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            title="Ctrl/Cmd + Enter"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {defaultData ? "Save Changes" : "Add State"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StateFormModal;

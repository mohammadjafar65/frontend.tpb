import React, { useMemo, useState, useRef, useEffect } from "react";
import { MapPin, Pencil, Trash, ImageIcon, ExternalLink } from "lucide-react";

/* ---- helpers ---- */
const safeJSON = (v, f = []) => {
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v ?? "[]"); } catch { return f; }
};

function parseStateNames(src) {
  const raw = src ?? [];
  const arr = safeJSON(raw, raw);
  const names = (arr || []).map((x) => {
    if (x == null) return "";
    if (typeof x === "string") return x.trim();
    if (typeof x === "object") {
      return String(x.name ?? x.label ?? x.state_name ?? x.title ?? "").trim();
    }
    return String(x).trim();
  }).filter(Boolean);
  // de-dupe, keep order
  const seen = new Set();
  return names.filter((n) => (seen.has(n) ? false : (seen.add(n), true)));
}

const MAX_CHIPS = 4;

const CountryCard = ({ country, onEdit, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const moreBtnRef = useRef(null);

  const stateNames = useMemo(
    () => parseStateNames(country?.states),
    [country?.states]
  );

  const count = stateNames.length;
  const visible = stateNames.slice(0, MAX_CHIPS);
  const hidden = stateNames.slice(MAX_CHIPS);

  // popover close on outside/esc
  useEffect(() => {
    if (!showAll) return;
    const onKey = (e) => e.key === "Escape" && setShowAll(false);
    const onClick = (e) => {
      if (!moreBtnRef.current) return;
      if (!moreBtnRef.current.parentElement?.contains(e.target)) setShowAll(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [showAll]);

  const handleConfirmDelete = () => {
    onDelete?.(country.id);
    setShowConfirm(false);
  };

  const imageUrl = country?.photo_url || "";
  const canOpenImage = /^https?:\/\//i.test(imageUrl);

  return (
    <div className="group bg-white rounded-2xl shadow-md overflow-hidden transition hover:shadow-lg">
      {/* Banner */}
      <div className="relative h-48 w-full">
        {!imgLoaded && !imgErr && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
        {imgErr ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
            <ImageIcon className="w-8 h-8" />
          </div>
        ) : (
          <img
            loading="lazy"
            src={imageUrl}
            alt={country?.name || "Country image"}
            className={`w-full h-full object-cover transition-opacity ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgErr(true)}
          />
        )}

        {/* Quick actions on hover */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit?.(country)}
            className="p-2 rounded-lg bg-white/90 hover:bg-white shadow"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="p-2 rounded-lg bg-white/90 hover:bg-white shadow text-red-600"
            title="Delete"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary shrink-0" />
          <span className="truncate" title={country?.name}>{country?.name}</span>
        </h2>

        {/* Meta row */}
        <div className="mt-1 text-xs text-gray-500 flex items-center justify-between">
          <span>{count} state{count === 1 ? "" : "s"}</span>
          {canOpenImage && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline hover:no-underline"
            >
              Open image <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* States */}
        <div className="mt-3">
          <div className="text-sm text-gray-600 mb-2">States</div>
          {count > 0 ? (
            <div className="flex flex-wrap gap-2">
              {visible.map((s) => (
                <span
                  key={s}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md"
                  title={s}
                >
                  {s}
                </span>
              ))}
              {hidden.length > 0 && (
                <div className="relative">
                  <button
                    ref={moreBtnRef}
                    onClick={() => setShowAll((v) => !v)}
                    className="text-xs px-2 py-1 rounded-md border bg-white hover:bg-gray-50"
                  >
                    +{hidden.length} more
                  </button>
                  {showAll && (
                    <div className="absolute z-20 mt-2 right-0 w-64 max-h-56 overflow-auto rounded-xl border bg-white shadow-lg p-2">
                      <div className="text-[11px] text-gray-500 px-1 pb-1">
                        All states in {country?.name}
                      </div>
                      {stateNames.map((s) => (
                        <div key={s} className="text-sm px-2 py-1 rounded hover:bg-gray-50">
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">No states selected</span>
          )}
        </div>

        {/* Actions (visible on mobile too) */}
        <div className="mt-4 flex justify-end gap-3 md:hidden">
          <button
            onClick={() => onEdit?.(country)}
            className="flex items-center gap-1 text-primary hover:bg-primaryOpacity hover:text-primary text-sm px-3 py-1 rounded transition"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1 text-red-700 hover:bg-red-100 hover:text-red-800 text-sm px-3 py-1 rounded transition"
          >
            <Trash className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-base font-semibold mb-2">Delete country</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{country?.name}</strong>?
              {count > 0 && <> It is linked to <strong>{count}</strong> state{count === 1 ? "" : "s"}.</>}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryCard;

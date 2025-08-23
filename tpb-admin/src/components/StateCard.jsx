import React, { useMemo, useRef, useEffect, useState } from "react";
import { Trash, Pencil, ImageIcon, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ---- helpers ---- */
const safeJSON = (v, f = []) => {
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v ?? "[]"); } catch { return f; }
};
function parsePackageIds(src) {
  const raw = src ?? [];
  const arr = safeJSON(raw, raw);
  const ids = (arr || []).map((x) => {
    if (x == null) return "";
    if (typeof x === "string") return x.trim();
    if (typeof x === "object") return String(x.id ?? x.value ?? x.pkgId ?? "").trim();
    return String(x).trim();
  }).filter(Boolean);
  // de-dupe
  const seen = new Set();
  return ids.filter((n) => (seen.has(n) ? false : (seen.add(n), true)));
}
const isHttpUrl = (s = "") => /^https?:\/\//i.test(String(s).trim());

const StateCard = ({ state, onEdit, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const pkgIds = useMemo(() => parsePackageIds(state?.package_ids), [state?.package_ids]);
  const pkgCount = pkgIds.length;

  const handleConfirmDelete = () => {
    onDelete?.(state.id);
    setShowConfirm(false);
  };

  const handleView = () => navigate(`/state/${state.id}`);

  // keyboard access: Enter/Space on card
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleView();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, []);

  const imageUrl = state?.photo_url || "";
  const canOpenImage = isHttpUrl(imageUrl);

  return (
    <div
      ref={cardRef}
      tabIndex={0}
      role="button"
      onClick={handleView}
      className="group bg-white rounded-2xl shadow-md overflow-hidden transition hover:shadow-lg ring-1 ring-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Media */}
      <div className="relative">
        {!imgLoaded && !imgErr && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}
        {imgErr ? (
          <div className="h-48 w-full flex items-center justify-center bg-gray-100 text-gray-400">
            <ImageIcon className="w-8 h-8" />
          </div>
        ) : (
          <img
            loading="lazy"
            src={imageUrl}
            alt={state?.name || "State image"}
            className={`w-full h-48 object-cover transition-opacity ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgErr(true)}
          />
        )}

        {/* Quick actions (hover) */}
        <div
          className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit?.(state)}
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

        {/* Gradient title overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h2 className="text-white/95 font-semibold text-lg drop-shadow-sm">
            {state?.name}
          </h2>
        </div>
      </div>

      {/* Body */}
      <div className="p-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm text-gray-600 mb-2">
          {pkgCount === 0 ? "No packages yet" : `${pkgCount} package${pkgCount > 1 ? "s" : ""} available`}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>ID: {String(state?.id ?? "").toString().slice(0, 8)}…</span>
          {canOpenImage && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline hover:no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              Open image <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Footer Actions (visible on mobile too) */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={handleView}
            className="flex items-center gap-1 text-primary bg-gray-100 hover:bg-primaryOpacity hover:text-primary text-sm px-3 py-1 rounded transition"
          >
            View Details
          </button>
          {/* <div className="flex gap-3">
            <button
              onClick={() => onEdit?.(state)}
              className="hidden md:inline-flex items-center gap-1 text-primary hover:bg-primaryOpacity hover:text-primary text-sm px-3 py-1 rounded transition"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="hidden md:inline-flex items-center gap-1 text-red-700 hover:bg-red-100 hover:text-red-800 text-sm px-3 py-1 rounded transition"
            >
              <Trash className="w-4 h-4" /> Delete
            </button>
          </div> */}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold mb-2">Delete state</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{state?.name}</strong>?
              {pkgCount > 0 && <> It currently links to <strong>{pkgCount}</strong> package{pkgCount > 1 ? "s" : ""}.</>}
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

export default StateCard;

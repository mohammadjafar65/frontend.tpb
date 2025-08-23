import React, { useMemo, useState, useRef, useEffect } from "react";
import { Eye, MapPin, Pencil, Trash, ImageIcon, ExternalLink } from "lucide-react";

/* Safe helpers */
const safeJSON = (v, f = []) => {
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v ?? "[]"); } catch { return f; }
};

function parseCountryNames(src) {
  // accepts: ["UAE"], [{name:"UAE"}], JSON string of either, or weird objects
  const raw = src ?? [];
  const arr = safeJSON(raw, raw);
  const names = (arr || []).map((x) => {
    if (x == null) return "";
    if (typeof x === "string") return x;
    if (typeof x === "object") {
      return String(x.name ?? x.label ?? x.country_name ?? x.title ?? "").trim();
    }
    return String(x).trim();
  }).filter(Boolean);
  // de-duplicate while keeping order
  const seen = new Set();
  return names.filter((n) => (seen.has(n) ? false : (seen.add(n), true)));
}

const MAX_CHIPS = 4;

const ContinentCard = ({ continent, onEdit, onDelete, onView }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const moreBtnRef = useRef(null);

  const countries = useMemo(
    () => parseCountryNames(continent?.countries ?? continent?.country_names),
    [continent]
  );

  const count = countries.length;
  const visible = countries.slice(0, MAX_CHIPS);
  const hidden = countries.slice(MAX_CHIPS);

  // close popover on outside click / escape
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
    onDelete?.(continent.id);
    setShowConfirm(false);
  };

  const imageUrl = continent?.photo_url || "";
  const canOpenImage = /^https?:\/\//i.test(imageUrl);

  return (
    <div className="group bg-white rounded-2xl shadow-md overflow-hidden flex flex-col transition hover:shadow-lg relative">
      {/* Media */}
      <div className="relative">
        {/* shimmer */}
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
            alt={continent?.name || "Continent"}
            className={`w-full h-48 object-cover transition-opacity ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgErr(true)}
          />
        )}

        {/* Quick actions (hover) */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
          {onView && (
            <button
              onClick={() => onView(continent)}
              className="p-2 rounded-lg bg-white/90 hover:bg-white shadow"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit?.(continent)}
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

      {/* Content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold tracking-tight">{continent?.name}</h2>

        {/* Meta row */}
        <div className="mt-1 text-xs text-gray-500 flex items-center justify-between">
          <span>{count} countr{count === 1 ? "y" : "ies"}</span>
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

        {/* Chips */}
        {count > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {visible.map((c) => (
              <span
                key={c}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md"
              >
                {c}
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
                      Countries in {continent?.name}
                    </div>
                    {countries.map((c) => (
                      <div
                        key={c}
                        className="text-sm px-2 py-1 rounded hover:bg-gray-50"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions (bottom for non-hover devices) */}
        <div className="mt-4 flex justify-end gap-3 md:hidden">
          <button
            onClick={() => onEdit?.(continent)}
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

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-base font-semibold mb-2">Delete continent</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{continent?.name}</strong>?
              {count > 0 && (
                <> This continent currently links to <strong>{count}</strong> countr{count === 1 ? "y" : "ies"}.</>
              )}
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

export default ContinentCard;

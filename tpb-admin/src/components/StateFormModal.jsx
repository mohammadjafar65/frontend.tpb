import React, { useEffect, useState } from "react";
import PackageMultiSelect from "./PackageMultiSelect";

// keep only UUID-like strings; drop 0/null/empty; supports {value,id} objects too
const UUIDISH = /^[0-9a-fA-F-]{16,}$/;
const cleanPackageIds = (ids) =>
  (Array.isArray(ids) ? ids : [])
    .map((x) => {
      if (x == null) return "";
      if (typeof x === "object") return String(x.value ?? x.id ?? "").trim();
      return String(x).trim();
    })
    .filter((s) => s && UUIDISH.test(s));

const StateFormModal = ({ defaultData, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [selectedPackages, setSelectedPackages] = useState([]); // can be strings or objects (multiselect)

  useEffect(() => {
    if (defaultData) {
      setName(defaultData.name || "");
      setPhoto(defaultData.photo_url || "");
      // defaultData.package_ids might be an array or a JSON string
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
  }, [defaultData]);

  const handleSave = () => {
    const payload = {
      id: defaultData?.id || undefined, // present only when editing
      name,
      photo_url: photo,
      // sanitize before submit -> only UUID strings
      package_ids: cleanPackageIds(selectedPackages),
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {defaultData ? "Edit State" : "Add New State"}
        </h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter state name"
          className="w-full border mb-3 p-2 rounded"
        />

        <input
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          placeholder="Enter state photo url"
          className="w-full border mb-3 p-2 rounded"
        />

        {/* Pass through; this component may emit strings or {value,label} items */}
        <PackageMultiSelect
          selected={selectedPackages}
          setSelected={setSelectedPackages}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            {defaultData ? "Save Changes" : "Add State"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StateFormModal;

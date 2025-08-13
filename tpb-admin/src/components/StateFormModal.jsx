import React, { useEffect, useState } from "react";
import PackageMultiSelect from "./PackageMultiSelect";

const StateFormModal = ({ defaultData, onClose, onSubmit }) => {
    const [name, setName] = useState("");
    const [photo, setPhoto] = useState("");
    const [selectedPackages, setSelectedPackages] = useState([]);

    useEffect(() => {
        if (defaultData) {
            setName(defaultData.name || "");
            setPhoto(defaultData.photo_url || "");
            setSelectedPackages(
                Array.isArray(defaultData.package_ids)
                    ? defaultData.package_ids
                    : JSON.parse(defaultData.package_ids || "[]")
            );
        } else {
            setName("");
            setPhoto("");
            setSelectedPackages([]);
        }
    }, [defaultData]);

    const handleSave = () => {
        onSubmit({
            id: defaultData?.id,  // <-- include id for edit!
            name,
            photo_url: photo,
            package_ids: selectedPackages,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{defaultData ? "Edit State" : "Add New State"}</h2>
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

                <PackageMultiSelect selected={selectedPackages} setSelected={setSelectedPackages} />
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded">{defaultData ? "Save Changes" : "Add State"}</button>
                </div>
            </div>
        </div>
    );
};

export default StateFormModal;
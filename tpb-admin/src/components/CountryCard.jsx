import React, { useState } from "react";
import { Eye, MapPin, Pencil, Trash } from "lucide-react";

const CountryCard = ({ country, onEdit, onDelete }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const states = JSON.parse(country.states || "[]");

    const handleConfirmDelete = () => {
        onDelete(country.id);
        setShowConfirm(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition hover:shadow-lg relative">
            {/* Banner Image */}
            <div className="relative h-48 w-full">
                <img
                    src={country.photo_url}
                    alt={country.name}
                    className="w-full h-full object-cover"
                />
                {/* <div className="absolute top-2 right-2 bg-white/70 p-1 rounded-full">
                    <Eye className="w-4 h-4 text-gray-700" />
                </div> */}
            </div>

            {/* Details */}
            <div className="p-4">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    {country.name}
                </h2>

                <p className="text-sm text-gray-600 mb-1">📍 States</p>
                {states.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                            {states.length > 0 ? states.map((state, idx) => (
                                <span key={idx} className="">{state}</span>
                            )) : <span className="text-gray-400 text-sm">No states selected</span>}
                        </span>
                    </div>
                ) : (
                    <span className="text-gray-400 text-sm">No states selected</span>
                )}

                {/* <p className="text-xs text-gray-400 mb-4">
                    ID: {country.id?.slice(0, 10)}...
                </p> */}

                <div className="flex justify-end gap-4 items-center">
                    <button
                        onClick={() => onEdit(country)}
                        className="flex items-center gap-1 text-primary hover:bg-primaryOpacity hover:text-primary text-sm px-3 py-1 rounded transition"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </button>

                    <button
                        onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-1 text-red-700 hover:bg-red-100 hover:text-red-800 text-sm px-3 py-1 rounded transition"
                    >
                        <Trash className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                        <p className="text-lg font-medium mb-6">
                            Are you sure you want to delete this country <strong>{country.name}</strong>?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CountryCard;

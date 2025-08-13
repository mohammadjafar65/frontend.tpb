import React, { useState } from "react";
import { Eye, MapPin, Pencil, Trash } from "lucide-react";

const ContinentCard = ({ continent, onEdit, onDelete }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleConfirmDelete = () => {
        onDelete(continent.id);
        setShowConfirm(false);
    };
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col transition hover:shadow-lg relative">
            <img src={continent.photo_url} alt={continent.name} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h2 className="text-lg font-bold mb-2">{continent.name}</h2>
                <p className="text-sm text-gray-600">Countries:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {JSON.parse(continent.countries)?.map((c, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">{c}</span>
                    ))}
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <button onClick={() => onEdit(continent)}
                        className="flex items-center gap-1 text-primary hover:bg-primaryOpacity hover:text-primary text-sm px-3 py-1 rounded transition"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit</button>
                    <button onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-1 text-red-700 hover:bg-red-100 hover:text-red-800 text-sm px-3 py-1 rounded transition"
                    >
                        <Trash className="w-4 h-4" />
                        Delete</button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                        <p className="text-lg font-medium mb-6">
                            Are you sure you want to delete this continent <strong>{continent.name}</strong>?
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

export default ContinentCard;

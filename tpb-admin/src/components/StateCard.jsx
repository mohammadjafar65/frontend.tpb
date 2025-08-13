import React, { useState } from "react";
import { Trash, Pencil } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const StateCard = ({ state, onEdit, onDelete }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    const handleConfirmDelete = () => {
        onDelete(state.id);
        setShowConfirm(false);
    };

    const handleView = () => {
        navigate(`/state/${state.id}`);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col transition hover:shadow-lg relative">
            <img src={state.photo_url} className="w-full h-48 object-cover" alt={state.name} />
            <div className="p-4">
                <h2 className="text-lg font-bold text-primary cursor-pointer" onClick={handleView}>
                    {state.name}
                </h2>
                <p className="text-sm text-gray-600 mb-2 mt-2">
                    {JSON.parse(state.package_ids || "[]").length} packages available
                </p>
                <div className="flex justify-between items-center mt-5">
                    <button
                        className="flex items-center gap-1 text-primary bg-gray-100 hover:bg-primaryOpacity hover:text-primary text-sm px-3 py-1 rounded transition"
                        onClick={handleView}
                    >
                        View Details
                    </button>
                    <div className="flex justify-end gap-4 items-center">
                        <button
                            onClick={() => onEdit(state)}
                            className="flex items-center gap-1 text-primary hover:bg-primaryOpacity hover:text-primary text-sm px-3 py-1 rounded transition"
                        >
                            <Pencil className="w-5 h-5" /> Edit
                        </button>
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="flex items-center gap-1 text-red-700 hover:bg-red-100 hover:text-red-800 text-sm px-3 py-1 rounded transition"
                        >
                            <Trash className="w-5 h-5" /> Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                        <p className="text-lg font-medium mb-6">
                            Are you sure you want to delete this state <strong>{state.name}</strong>?
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

export default StateCard;

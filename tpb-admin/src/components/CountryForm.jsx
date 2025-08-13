import React, { useEffect, useState } from "react";
import axios from "axios";

const { REACT_APP_API_URL } = process.env;

const CountryForm = ({ onClose, onSubmit, defaultData }) => {
    const [name, setName] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
    const [states, setStates] = useState([]);
    const [availableStates, setAvailableStates] = useState([]);

    const BASE = `${REACT_APP_API_URL}`;

    useEffect(() => {
        axios.get(`${BASE}/states`) // Adjust to your endpoint
            .then(res => setAvailableStates(res.data))
            .catch(err => console.error("Failed to fetch states", err));
    }, []);

    useEffect(() => {
        if (defaultData) {
            setName(defaultData.name);
            setPhotoUrl(defaultData.photo_url);
            setStates(JSON.parse(defaultData.states || "[]"));
        }
    }, [defaultData]);

    const toggleState = (stateName) => {
        if (states.includes(stateName)) {
            setStates(states.filter((s) => s !== stateName));
        } else {
            setStates([...states, stateName]);
        }
    };

    const handleSubmit = () => {
        onSubmit({ name, photo_url: photoUrl, states });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-2">{defaultData ? "Edit Country" : "Add New Country"}</h2>
                <p className="text-sm text-gray-500 mb-4">Fill in the details below to {defaultData ? "update" : "add"} a country</p>

                <label className="block mb-2 text-sm">Country Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-3 border rounded p-2" placeholder="Enter country name" />

                <label className="block mb-2 text-sm">Country Photo URL</label>
                <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} className="w-full mb-3 border rounded p-2" placeholder="Enter photo URL" />

                {photoUrl && <img src={photoUrl} alt="preview" className="w-full h-40 object-cover rounded mb-4" />}

                <label className="block mb-2 text-sm">Select States</label>
                <div className="max-h-40 overflow-y-auto border p-2 rounded mb-4">
                    {availableStates.map((s) => (
                        <label key={s.id} className="block text-sm">
                            <input
                                type="checkbox"
                                checked={states.includes(s.name)}
                                onChange={() => toggleState(s.name)}
                                className="mr-2"
                            />
                            {s.name}
                        </label>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {states.map((s, i) => (
                        <span key={i} className="bg-blue-100 text-sm px-2 py-1 rounded">
                            {s} <button onClick={() => toggleState(s)}>✕</button>
                        </span>
                    ))}
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded">{defaultData ? "Save" : "Add Country"}</button>
                </div>
            </div>
        </div>
    );
};

export default CountryForm;
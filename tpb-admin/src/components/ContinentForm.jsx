import React, { useEffect, useState } from 'react';
import axios from 'axios';

const { REACT_APP_API_URL } = process.env;

const ContinentForm = ({ onClose, onSubmit, defaultData }) => {
    const [name, setName] = useState('');
    const [photo_url, setPhotoUrl] = useState('');
    const [countries, setCountries] = useState([]);
    const [availableCountries, setAvailableCountries] = useState([]);

    const BASE = `${REACT_APP_API_URL}`;

    useEffect(() => {
        axios.get(`${BASE}/countries`) // Adjust to your actual endpoint
            .then((res) => setAvailableCountries(res.data))
            .catch((err) => console.error('Failed to fetch countries', err));
    }, []);

    useEffect(() => {
        if (defaultData) {
            setName(defaultData.name);
            setPhotoUrl(defaultData.photo_url);
            setCountries(JSON.parse(defaultData.countries || '[]'));
        }
    }, [defaultData]);

    const toggleCountry = (country) => {
        if (countries.includes(country.name)) {
            setCountries(countries.filter(c => c !== country.name));
        } else {
            setCountries([...countries, country.name]);
        }
    };

    const handleSubmit = () => {
        onSubmit({ name, photo_url, countries });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">{defaultData ? 'Edit Continent' : 'Add New Continent'}</h2>
                <input className="w-full mb-3 p-2 border rounded" placeholder="Continent Name" value={name} onChange={e => setName(e.target.value)} />
                <input className="w-full mb-3 p-2 border rounded" placeholder="Continent Photo URL" value={photo_url} onChange={e => setPhotoUrl(e.target.value)} />

                <p className="font-medium text-sm mb-1">Select Countries:</p>
                <div className="max-h-40 overflow-y-auto border p-2 rounded mb-4">
                    {availableCountries.map((country) => (
                        <label key={country.id} className="block text-sm">
                            <input
                                type="checkbox"
                                checked={countries.includes(country.name)}
                                onChange={() => toggleCountry(country)}
                                className="mr-2"
                            />
                            {country.name}
                        </label>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {countries.map((c, i) => (
                        <span key={i} className="bg-blue-200 px-2 py-1 rounded text-sm">
                            {c} <button onClick={() => toggleCountry({ name: c })}>✖</button>
                        </span>
                    ))}
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded">{defaultData ? 'Save Changes' : 'Add Continent'}</button>
                </div>
            </div>
        </div>
    );
};

export default ContinentForm;
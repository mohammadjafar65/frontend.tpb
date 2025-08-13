import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "../dashboard/Header/Header";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import { Link } from "react-router-dom";
import CountryCard from "../components/CountryCard";
import CountryForm from "../components/CountryForm";

const { REACT_APP_API_URL } = process.env;

function Country() {
    const [countries, setCountries] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState(null);

    const API = axios.create({
        baseURL: `${REACT_APP_API_URL}`
    });

    const fetchCountries = () => API.get('/countries');
    const addCountry = (data) => API.post('/countries', data);
    const updateCountry = (id, data) => API.put(`/countries/${id}`, data);
    const deleteCountry = (id) => API.delete(`/countries/${id}`);

    const loadCountries = async () => {
        const res = await fetchCountries();
        setCountries(res.data);
    };

    useEffect(() => {
        loadCountries();
    }, []);

    const handleAddOrEdit = async (data) => {
        if (editData) {
            await updateCountry(editData.id, data);
        } else {
            await addCountry(data);
        }
        setShowForm(false);
        setEditData(null);
        loadCountries();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this country?")) {
            await deleteCountry(id);
            loadCountries();
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-auto ml-64">
                <Header />
                <main className="flex-1 p-6 bg-gray-50 min-h-screen">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-bold text-primary">Country Management</h1>
                        <button onClick={() => setShowForm(true)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary">+ Add Country</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {countries.map((country) => (
                            <CountryCard
                                key={country.id}
                                country={country}
                                onEdit={(data) => {
                                    setEditData(data);
                                    setShowForm(true);
                                }}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    {showForm && (
                        <CountryForm
                            onClose={() => {
                                setShowForm(false);
                                setEditData(null);
                            }}
                            onSubmit={handleAddOrEdit}
                            defaultData={editData}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}

export default Country;

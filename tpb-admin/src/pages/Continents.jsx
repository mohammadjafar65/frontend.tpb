import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "../dashboard/Header/Header";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import { Link } from "react-router-dom";
import ContinentCard from "../components/ContinentCard";
import ContinentForm from "../components/ContinentForm";

const { REACT_APP_API_URL } = process.env;

function Continents() {
    const [continents, setContinents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState(null);

    const API = axios.create({
        baseURL: `${REACT_APP_API_URL}`
    });

    const fetchContinents = () => API.get('/continents');
    const addContinent = (data) => API.post('/continents', data);
    const updateContinent = (id, data) => API.put(`/continents/${id}`, data);
    const deleteContinent = (id) => API.delete(`/continents/${id}`);

    const loadContinents = async () => {
        const res = await fetchContinents();
        setContinents(res.data);
    };

    useEffect(() => {
        loadContinents();
    }, []);

    const handleAddOrEdit = async (data) => {
        if (editData) {
            await updateContinent(editData.id, data);
        } else {
            await addContinent(data);
        }
        setShowForm(false);
        setEditData(null);
        loadContinents();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure to delete?")) {
            await deleteContinent(id);
            loadContinents();
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
                        <h1 className="text-xl font-bold text-primary">Continents</h1>
                        <button onClick={() => setShowForm(true)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary">+ Add Continent</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {continents.map((continent) => (
                            <ContinentCard
                                key={continent.id}
                                continent={continent}
                                onEdit={(data) => {
                                    setEditData(data);
                                    setShowForm(true);
                                }}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    {showForm && (
                        <ContinentForm
                            onClose={() => {
                                setShowForm(false);
                                setEditData(null);
                            }}
                            onSubmit={handleAddOrEdit}
                            defaultData={editData}
                        />
                    )}
                </main>
            </div >
        </div >
    );
}

export default Continents;

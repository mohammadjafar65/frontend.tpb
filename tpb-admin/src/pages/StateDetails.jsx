import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../dashboard/Header/Header";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
const { REACT_APP_API_URL } = process.env;

const StateDetails = () => {
    const { id } = useParams();
    const [stateData, setStateData] = useState(null);
    const [packages, setPackages] = useState([]);
    const navigate = useNavigate();

    const BASE = `${REACT_APP_API_URL}`;

    const fetchStateById = (id) => axios.get(`${BASE}/states/${id}`);
    const fetchPackages = () => axios.get(`${BASE}/packages`);

    const load = async () => {
        const stateRes = await fetchStateById(id);
        setStateData(stateRes.data);

        const allPackages = await fetchPackages();
        const associated = allPackages.data.filter((pkg) =>
            JSON.parse(stateRes.data.package_ids || "[]").includes(pkg.packageId)
        );
        setPackages(associated);
    };

    useEffect(() => {
        load();
    }, [id]);

    if (!stateData) return <div className="p-6">Loading...</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-auto ml-64">
                <Header />
                <main className="flex-1 p-6 bg-gray-50 min-h-screen">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-primary">{stateData.name}</h1>
                            <button
                                onClick={() => (window.location.href = "/states")}
                                className="bg-gray-100 px-4 py-2 rounded"
                            >
                                ← Back to List
                            </button>
                        </div>
                        <img
                            src={stateData.photo_url}
                            alt={stateData.name}
                            className="w-full h-64 object-cover rounded mb-6"
                        />

                        <h2 className="text-xl font-semibold mb-2">Associated Packages</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {packages.map((pkg) => (
                                <div key={pkg.packageId} className="bg-white shadow rounded p-4">
                                    <img
                                        src={pkg.avatarImage}
                                        alt={pkg.packageName}
                                        className="h-40 w-full object-cover rounded"
                                    />
                                    <h3 className="text-md font-semibold mt-2">{pkg.packageName}</h3>
                                    <p className="text-primary font-bold">₹ {pkg.packagePrice}</p>
                                    <p className="text-xs text-gray-500">{pkg.packageDuration}</p>
                                    <button
                                        onClick={() => navigate(`/package/${pkg.packageId}`)}
                                        className="mt-2 bg-primary text-white px-4 py-1 rounded text-sm"
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StateDetails;
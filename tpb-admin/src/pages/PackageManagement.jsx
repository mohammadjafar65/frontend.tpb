import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "../dashboard/Header/Header";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import { Link } from "react-router-dom";
import { Trash } from 'lucide-react';

function PackageManagement() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const { REACT_APP_API_URL } = process.env;

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${REACT_APP_API_URL}/packages`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPackages(response.data);
            } catch (err) {
                setError("Error fetching packages: " + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, [REACT_APP_API_URL]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this package?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${REACT_APP_API_URL}/packages/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPackages((prev) => prev.filter((item) => item.packageId !== id));
        } catch (err) {
            alert("Error deleting package: " + err.message);
        }
    };

    // Util to safely get image URL from avatarImage JSON/string
    const getFirstImage = (avatarImage) => {
        try {
            if (!avatarImage) return "https://thepilgrimbeez.com/img/tpb-logo.png";
            const arr = typeof avatarImage === "string" ? JSON.parse(avatarImage) : avatarImage;
            if (Array.isArray(arr) && arr[0]) return arr[0];
            if (typeof arr === "string") return arr;
            return "https://thepilgrimbeez.com/img/tpb-logo.png";
        } catch {
            return "https://thepilgrimbeez.com/img/tpb-logo.png";
        }
    };

    const filteredPackages = packages.filter((pkg) =>
        pkg.packageName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-auto ml-64">
                <Header />
                <main className="flex-1 p-6 bg-gray-50 min-h-screen">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-bold text-primary">Package Management</h1>
                        <Link to="/add-package" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary">
                            + Add Tour Package
                        </Link>
                    </div>

                    <input
                        type="text"
                        placeholder="Search packages by title..."
                        className="w-full mb-4 border px-4 py-2 rounded shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {loading ? (
                        <p>Loading packages...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPackages.map((pkg) => {
                                // Safely parse included items for package chips
                                let includedItems = [];
                                try {
                                    includedItems = pkg.included ? JSON.parse(pkg.included) : [];
                                } catch { /* ignore */ }
                                if (!Array.isArray(includedItems)) includedItems = [];

                                return (
                                    <div
                                        key={pkg.packageId}
                                        className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col transition hover:shadow-lg relative"
                                    >
                                        <div className="relative">
                                            <img
                                                src={getFirstImage(pkg.avatarImage)}
                                                alt="avatar"
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="absolute top-2 right-2 bg-white text-black text-xs font-semibold px-2 py-1 rounded-full shadow">
                                                ₹{pkg.basePrice || 0}
                                            </div>
                                        </div>

                                        <div className="p-4 flex flex-col justify-between flex-grow">
                                            <div>
                                                <h3 className="text-base font-bold mb-1">{pkg.packageName}</h3>
                                                {/* Included tags */}
                                                <div className="flex flex-wrap gap-1 text-xs mb-4 mt-4">
                                                    {includedItems.length
                                                        ? includedItems.slice(0, 4).map((item, idx) => (
                                                            <span key={idx} className="bg-primaryOpacity text-primary px-2 py-1 rounded-full">{item}</span>
                                                        ))
                                                        : <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">No items included</span>
                                                    }
                                                    {includedItems.length > 4 && (
                                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                                            +{includedItems.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center mt-3">
                                                <button
                                                    onClick={() => navigate(`/package/${pkg.packageId}`)}
                                                    className="flex items-center gap-1 text-primary bg-gray-100 hover:bg-primaryOpacity hover:text-primary text-sm px-3 py-1 rounded transition"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pkg.packageId)}
                                                    title="Delete Package"
                                                    className="flex items-center gap-1 text-red-700 hover:bg-red-100 hover:text-red-800 text-sm px-3 py-1 rounded transition"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default PackageManagement;

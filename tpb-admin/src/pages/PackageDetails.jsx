import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import Header from "../dashboard/Header/Header";
import toast from "react-hot-toast";

const TABS = [
    { key: "details", label: "Details", icon: "\u2139\ufe0f" },
    { key: "included", label: "What's Included", icon: "\u2705" },
    { key: "itinerary", label: "Itinerary", icon: "\ud83d\uddd3\ufe0f" },
    { key: "photos", label: "Photos", icon: "\ud83d\uddbc\ufe0f" },
    { key: "terms", label: "Policies & Terms", icon: "\ud83d\udcc4" }
];

const safeParse = (val, fallback = []) => {
    try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
};

const getAllImages = (imgField) => {
    if (!imgField) return [];
    try {
        if (typeof imgField === "string") {
            const arr = JSON.parse(imgField);
            return Array.isArray(arr) ? arr : [arr];
        }
        if (Array.isArray(imgField)) return imgField;
        return [imgField];
    } catch {
        return [];
    }
};

const formatDate = (date) => {
    if (!date) return "-";
    try {
        return new Date(date).toLocaleDateString("en-IN", {
            year: "numeric", month: "short", day: "numeric"
        });
    } catch {
        return date;
    }
};

const PackageDetails = () => {
    const { id } = useParams();
    const [pkg, setPkg] = useState(null);
    const [activeTab, setActiveTab] = useState("details");

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/packages/id/${id}`).then((res) => {
            setPkg(res.data);
        });
    }, [id]);

    const included = pkg ? safeParse(pkg.included) : [];
    const itinerary = pkg ? safeParse(pkg.itinerary) : [];
    const gallery = pkg ? safeParse(pkg.gallery) : [];
    const packageCategory = pkg ? safeParse(pkg.packageCategory) : [];
    const avatarImages = pkg ? getAllImages(pkg.avatarImage) : [];
    const bannerImages = pkg ? getAllImages(pkg.bannerImage) : [];
    const featuredImage = pkg?.featuredImage || "";

    // Fallback logo
    const fallbackImg = "https://thepilgrimbeez.com/img/tpb-logo.png";

    if (!pkg) return <div className="p-6">Loading...</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-auto ml-64">
                <Header />
                <main className="flex-1 p-6 bg-gray-50 min-h-screen">
                    <div className="min-h-screen bg-gray-50 p-4">
                        <div className="bg-gradient-to-br from-primary to-primaryOpacity p-6 rounded-3xl text-white shadow-xl">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start gap-4">
                                    <Link
                                        to="/packages"
                                        className="text-black bg-white/20 hover:bg-white/30 p-2 rounded-full"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </Link>
                                    <div>
                                        <p className="text-sm opacity-90 text-black">Package Details</p>
                                        <h1 className="text-2xl font-bold text-black">{pkg.packageName}</h1>
                                        <div className="flex flex-wrap gap-2 mt-2">

                                        </div>
                                        <div className="mt-2 bg-white text-black font-semibold px-4 py-1 inline-block rounded-full">
                                            From ₹{pkg.basePrice || 0}/- <span className="text-xs">(per person)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Link
                                        to={`/packages/edit/${pkg.packageId}`}
                                        className="bg-white text-black px-4 py-2 rounded shadow hover:shadow-md"
                                    >
                                        Edit Package
                                    </Link>
                                    <Link
                                        to="#"
                                        onClick={async () => {
                                            try {
                                                const response = await axios.post(`${process.env.REACT_APP_API_URL}/packages/duplicate/${pkg.packageId}`);
                                                const newId = response.data.newPackageId;
                                                toast.success("Package duplicated successfully");
                                                window.location.href = `/packages/edit/${newId}`;
                                            } catch (err) {
                                                toast.error("Failed to duplicate package");
                                            }
                                        }}
                                        className="bg-black text-white px-4 py-2 rounded shadow hover:shadow-md"
                                    >
                                        Duplicate Package
                                    </Link>
                                </div>
                            </div>

                            <div className="flex gap-4 text-sm">
                                <div className="bg-white/20 px-3 py-1 rounded-full text-black">{pkg.packageDuration || "-"}</div>
                                <div className="bg-white/20 px-3 py-1 rounded-full text-black">{gallery.length} Photos</div>
                                {packageCategory.map((cat, idx) => (
                                    <span key={idx} className="bg-white/30 text-black px-3 py-1 rounded-full text-xs font-semibold">
                                        {cat}
                                    </span>
                                ))}
                                {/* {pkg.stateName && (
                                    <span className="bg-white/30 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                        {pkg.stateName}
                                    </span>
                                )}
                                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs">
                                    Start: {formatDate(pkg.start_date)}
                                </span>
                                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs">
                                    End: {formatDate(pkg.end_date)}
                                </span> */}
                            </div>
                        </div>

                        <div className="flex gap-3 my-6 border-b">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-t-lg font-medium transition-all duration-300 ${activeTab === tab.key
                                        ? "text-primary border-b-2 border-primary"
                                        : "text-gray-500"
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white rounded-xl shadow p-6">
                            {activeTab === "details" && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-primary">Package Overview</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* <div>
                                            <span className="font-semibold text-gray-600">Start Date:</span>{" "}
                                            {formatDate(pkg.start_date)}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-600">End Date:</span>{" "}
                                            {formatDate(pkg.end_date)}
                                        </div> */}
                                        {/* <div>
                                            <span className="font-semibold text-gray-600">Category:</span>{" "}
                                            {packageCategory.length ? packageCategory.join(", ") : "-"}
                                        </div> */}
                                        {/* <div>
                                            <span className="font-semibold text-gray-600">State:</span>{" "}
                                            {pkg.stateName || "-"}
                                        </div> */}
                                    </div>
                                    <p className="mb-6">{pkg.packageDescription}</p>
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-purple-700 mb-1">Special Instructions</h4>
                                        <p className="bg-purple-50 p-3 rounded text-sm">
                                            {pkg.specialInstructions || "No special instructions provided."}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-primary mb-1">Things to Maintain</h4>
                                        <p className="bg-green-50 p-3 rounded text-sm">
                                            {pkg.thingsToMaintain || "No maintenance instructions provided."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === "included" && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-primary">What's Included</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {included.length > 0 ? included.map((item, i) => (
                                            <div key={i} className="bg-primaryOpacity px-3 py-2 rounded text-primary text-sm">
                                                ✅ {item}
                                            </div>
                                        )) : <p className="text-gray-500 col-span-4">No included items listed.</p>}
                                    </div>
                                </div>
                            )}

                            {activeTab === "itinerary" && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-primary">Itinerary</h3>
                                    {itinerary.length > 0 ? itinerary.map((day, i) => (
                                        <div key={i} className="mb-6">
                                            <h4 className="font-bold text-md mb-2 text-primary">Day {i + 1}: {day.dayTitle}</h4>
                                            <div className="text-sm mb-2" dangerouslySetInnerHTML={{ __html: day.dayDetails }} />
                                            <div className="flex gap-2 flex-wrap">
                                                {(Array.isArray(day.photos) ? day.photos : []).map((url, j) => (
                                                    <img
                                                        key={j}
                                                        src={url || fallbackImg}
                                                        alt={`Day${i + 1} Photo${j + 1}`}
                                                        className="w-28 h-20 object-cover rounded shadow"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )) : <p>No itinerary days provided.</p>}
                                </div>
                            )}

                            {activeTab === "photos" && (
                                <div className="space-y-8">
                                    <h3 className="text-xl font-semibold text-primary mb-2">Photos</h3>

                                    {/* Avatar Images */}
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">Avatar Image(s)</h4>
                                        {avatarImages.length > 0 ? (
                                            <div className="flex gap-3 flex-wrap">
                                                {avatarImages.map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={img || fallbackImg}
                                                        alt={`Avatar ${idx + 1}`}
                                                        className="rounded-xl shadow w-32 h-32 object-cover"
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No avatar image provided.</p>
                                        )}
                                    </div>

                                    {/* Banner Images */}
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">Banner Image(s)</h4>
                                        {bannerImages.length > 0 ? (
                                            <div className="flex gap-3 flex-wrap">
                                                {bannerImages.map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={img || fallbackImg}
                                                        alt={`Banner ${idx + 1}`}
                                                        className="rounded-xl shadow w-full max-w-xs max-h-60 object-cover"
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No banner image provided.</p>
                                        )}
                                    </div>

                                    {/* Featured Image */}
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">Featured Image</h4>
                                        {featuredImage ? (
                                            <img
                                                src={featuredImage}
                                                alt="Featured"
                                                className="rounded-xl shadow w-full max-h-60 object-cover"
                                            />
                                        ) : (
                                            <p className="text-gray-500 text-sm">No featured image provided.</p>
                                        )}
                                    </div>

                                    {/* Gallery Images */}
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">Gallery Images</h4>
                                        {gallery.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {gallery.map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img || fallbackImg}
                                                        alt={`Gallery ${i + 1}`}
                                                        className="rounded-xl shadow object-cover h-40 w-full"
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No gallery images uploaded.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "terms" && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-primary">Policies & Terms</h3>
                                    <div className="mb-4">
                                        <h4 className="font-semibold">Conditions of Travel</h4>
                                        <p className="bg-gray-50 p-3 rounded text-sm">
                                            {pkg.conditionsOfTravel || "No conditions specified."}
                                        </p>
                                    </div>
                                    <div className="mb-4">
                                        <h4 className="font-semibold">Policies</h4>
                                        <p className="bg-gray-50 p-3 rounded text-sm">
                                            {pkg.policies || "No policies specified."}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Terms and Conditions</h4>
                                        <p className="bg-gray-50 p-3 rounded text-sm">
                                            {pkg.terms || "No terms and conditions specified."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PackageDetails;
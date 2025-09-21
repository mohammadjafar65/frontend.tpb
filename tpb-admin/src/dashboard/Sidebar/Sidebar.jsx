import React from "react";
import { House, Globe, Map, MapPin, Package, ChevronRight, User, ListOrdered } from 'lucide-react';
import { Link, useLocation } from "react-router-dom";

const menuItems = [
    { name: "Dashboard", icon: <House className="w-5 h-5" />, path: "/" },
    { name: "Continents", icon: <Globe className="w-5 h-5" />, path: "/continents" },
    { name: "Countries", icon: <Map className="w-5 h-5" />, path: "/countries" },
    { name: "States", icon: <MapPin className="w-5 h-5" />, path: "/states" },
    { name: "Packages", icon: <Package className="w-5 h-5" />, path: "/packages" },
    { name: "Users", icon: <User />, path: "/admin/users" },
    // { name: "Hotels", icon: <FaHotel />, path: "/hotels" },
    // { name: "Enquiries", icon: <FaRegEnvelope />, path: "/enquiries" },
    { name: "Bookings", icon: <ListOrdered />, path: "/bookings" }
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <div className="h-screen w-64 bg-white border-r shadow-sm fixed left-0 top-0 z-50 flex flex-col">
            <div className="h-16 flex items-center px-6 border-b">
                <div className="text-primary font-bold text-lg">
                    <span className="bg-primary text-white px-2 py-1 rounded-full mr-2">TPB</span>
                    The Pilgrim Beez
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center relative gap-3 px-4 py-2 rounded-lg hover:bg-primary-100 text-sm font-medium ${location.pathname === item.path
                            ? "bg-primaryOpacity text-primary"
                            : "text-gray-700"
                            }`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        {item.name}
                        <span className="absolute right-1"><ChevronRight className="w-5 h-5" /></span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
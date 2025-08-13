import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "../dashboard/Header/Header";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import { Link } from "react-router-dom";

function Dashboard() {

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-auto ml-64">
                <Header />
                <main className="flex-1 p-6 bg-gray-50 min-h-screen">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-bold text-primary">Dashboard</h1>
                        {/* <Link to="/add-package" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary">
                            + Add Tour Package
                        </Link> */}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;

import React, { useEffect, useState } from "react";
import axios from "axios";
const { REACT_APP_API_URL } = process.env;

const PackageMultiSelect = ({ selected, setSelected }) => {
    const [options, setOptions] = useState([]);
    const [query, setQuery] = useState("");

    const BASE = `${REACT_APP_API_URL}`;

    const fetchPackages = () => axios.get(`${BASE}/packages`);

    useEffect(() => {
        fetchPackages().then((res) => setOptions(res.data));
    }, []);

    const toggle = (pkg) => {
        if (selected.includes(pkg.packageId)) {
            setSelected(selected.filter((id) => id !== pkg.packageId));
        } else {
            setSelected([...selected, pkg.packageId]);
        }
    };

    return (
        <div className="border rounded p-2">
            <input
                type="text"
                placeholder="Search packages..."
                className="w-full border-b mb-2 p-1"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <div className="max-h-40 overflow-y-auto">
                {options
                    .filter((pkg) => pkg.packageName.toLowerCase().includes(query.toLowerCase()))
                    .map((pkg) => (
                        <label key={pkg.packageId} className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={selected.includes(pkg.packageId)}
                                onChange={() => toggle(pkg)}
                            />
                            {pkg.packageName}
                        </label>
                    ))}
            </div>
        </div>
    );
};

export default PackageMultiSelect;
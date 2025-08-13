import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AddPackages from "./AddPackages";
import axios from "axios";
import toast from "react-hot-toast";

const { REACT_APP_API_URL } = process.env;

function safeParse(val, fallback = []) {
    try {
        if (!val) return fallback;
        const parsed = JSON.parse(val);
        return parsed;
    } catch {
        return fallback;
    }
}

function EditPackage() {
    const { packageId } = useParams();
    const navigate = useNavigate();

    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const response = await axios.get(
                    `${REACT_APP_API_URL}/packages/id/${packageId}`
                );
                const data = response.data;

                // Parse multi-select fields for continents/countries/states
                const continents = safeParse(data.continent_ids).map(id => ({
                    value: id,
                    label: "" + id, // You may want to map the id to the name if available!
                }));
                const countries = safeParse(data.country_ids).map(id => ({
                    value: id,
                    label: "" + id,
                }));
                const states = safeParse(data.state_ids).map(id => ({
                    value: id,
                    label: "" + id,
                }));

                // Parse category and other JSON fields
                const packageCategory = safeParse(data.packageCategory).map(val => ({
                    value: val,
                    label: val,
                }));

                setInitialData({
                    formFields: {
                        packageName: data.packageName,
                        packageCategory,
                        packageLocation: data.packageLocation,
                        basePrice: data.basePrice,
                        packageDate: data.packageDate,
                        packageDuration: data.packageDuration,
                        packageDescription: data.packageDescription,
                        slug: data.slug,
                        rating: data.rating,
                        reviewCount: data.reviewCount,
                        startDate: data.start_date || "",
                        // Multi-selects
                        continent_ids: continents,
                        country_ids: countries,
                        state_ids: states,
                    },
                    photos: {
                        avatar: Array.isArray(safeParse(data.avatarImage)) ? safeParse(data.avatarImage) : [data.avatarImage || ""],
                        bannerImage: Array.isArray(safeParse(data.bannerImage)) ? safeParse(data.bannerImage) : [data.bannerImage || ""],
                        featuredImage: data.featuredImage,
                        gallery: safeParse(data.gallery),
                    },
                    itinerary: safeParse(data.itinerary),
                    selectedIncluded: safeParse(data.included),
                    additionalDetails: {
                        specialInstructions: data.specialInstructions || "",
                        conditionsOfTravel: data.conditionsOfTravel || "",
                        thingsToMaintain: data.thingsToMaintain || "",
                        policies: data.policies || "",
                        terms: data.terms || "",
                    },
                });

                setLoading(false);
            } catch (err) {
                toast.error("Failed to load package data");
                navigate("/packages");
            }
        };

        fetchPackage();
    }, [packageId, navigate]);

    if (loading) return <div className="p-10 text-center">Loading package data...</div>;

    return (
        <AddPackages
            mode="edit"
            packageId={packageId}
            initialData={initialData}
        />
    );
}

export default EditPackage;
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../dashboard/Header/Header";
import Sidebar from "../dashboard/Sidebar/Sidebar";
import "../App.css";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs"
import { ArrowLeft } from 'lucide-react';


const animatedComponents = makeAnimated();
const tabs = [
  { label: "Basic Info", icon: "📄" },
  { label: "Photos", icon: "🖼️" },
  // { label: "Destination", icon: "🌍" },
  { label: "Itinerary", icon: "🗓️" },
  { label: "Included", icon: "✅" },
  { label: "Details", icon: "📑" },
];

const { REACT_APP_API_URL } = process.env;

function AddPackages({ mode = "create", packageId, initialData }) {

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const includedOptions = ["Meals", "Tickets", "Transfers", "Guide", "Insurance", "Hotel", "Breakfast"];
  const [selectedIncluded, setSelectedIncluded] = useState([]);
  const [newIncluded, setNewIncluded] = useState("");
  const urlParams = new URLSearchParams(window.location.search);
  const stateId = urlParams.get("stateId");
  const [continents, setContinents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  const [photos, setPhotos] = useState({
    avatar: [""],
    bannerImage: [""],
    featuredImage: "",
    gallery: [""],
  });

  const [categoryOptions, setCategoryOptions] = useState([
    { value: "Most Popular Tours", label: "Most Popular Tours" },
    { value: "Adventure", label: "Adventure" },
    { value: "Dubai Tours", label: "Dubai Tours" },
    { value: "Honeymoon", label: "Honeymoon" },
    { value: "Family", label: "Family" },
  ]);

  const [itinerary, setItinerary] = useState([
    { dayTitle: "", dayDetails: "", photos: [""] },
  ]);

  const [additionalDetails, setAdditionalDetails] = useState({
    specialInstructions: "",
    conditionsOfTravel: "",
    thingsToMaintain: "",
    policies: "",
    terms: "",
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      packageName: "",
      packageCategory: [],
      packageLocation: "",
      basePrice: "",
      packageDate: "",
      packageDuration: "",
      packageDescription: "",
      country: "",
      slug: "",
      groupSize: "",
      rating: "",
      reviewCount: "",
      // startDate: "",
    },
  });

  const [endDate, setEndDate] = useState("");
  const packageDuration = watch("packageDuration");
  const startDate = watch("startDate");

  useEffect(() => {
    // Only run if both startDate and packageDuration exist
    if (!startDate || !packageDuration) {
      setEndDate("");
      return;
    }
    // Parse "2 Days 1 Night" -> 2 days
    const dayMatch = packageDuration.match(/(\d+)\s*Day/i);
    let days = dayMatch ? parseInt(dayMatch[1], 10) : 1;
    if (isNaN(days)) days = 1;
    // End Date = Start Date + (days-1)
    const end = dayjs(startDate).add(days - 1, "day").format("YYYY-MM-DD");
    setEndDate(end);
  }, [packageDuration, startDate]);

  const watchedPackageName = watch("packageName");
  useEffect(() => {
    if (watchedPackageName) {
      const slugified = watchedPackageName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slugified);
    }
  }, [watchedPackageName, setValue]);

  const nextTab = () => activeTab < tabs.length - 1 && setActiveTab(activeTab + 1);
  const prevTab = () => activeTab > 0 && setActiveTab(activeTab - 1);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const { formFields, photos, itinerary, selectedIncluded, additionalDetails } = initialData;

      Object.entries(formFields).forEach(([key, value]) => setValue(key, value));
      setPhotos(photos);
      setItinerary(itinerary);
      setSelectedIncluded(selectedIncluded);
      setAdditionalDetails(additionalDetails);
    }
  }, [mode, initialData, setValue]);

  const handleAdditionalChange = (field, value) => {
    setAdditionalDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSinglePhotoChange = (name, value) => {
    setPhotos((prev) => ({ ...prev, [name]: value }));
  };

  // Handle change for multiple avatar or banner images
  const handleMultiPhotoChange = (type, index, value) => {
    const updated = [...photos[type]];
    updated[index] = value;
    setPhotos((prev) => ({ ...prev, [type]: updated }));
  };

  const addMultiPhoto = (type) => {
    setPhotos((prev) => ({ ...prev, [type]: [...prev[type], ""] }));
  };

  const removeMultiPhoto = (type, index) => {
    const updated = [...photos[type]];
    updated.splice(index, 1);
    setPhotos((prev) => ({ ...prev, [type]: updated }));
  };


  const handleGalleryChange = (index, value) => {
    const updated = [...photos.gallery];
    updated[index] = value;
    setPhotos((prev) => ({ ...prev, gallery: updated }));
  };

  const addGalleryImage = () => setPhotos((prev) => ({ ...prev, gallery: [...prev.gallery, ""] }));
  const removeGalleryImage = (index) => {
    const updated = [...photos.gallery];
    updated.splice(index, 1);
    setPhotos((prev) => ({ ...prev, gallery: updated }));
  };

  const handleItineraryChange = (index, field, value) => {
    const updated = [...itinerary];
    updated[index][field] = value;
    setItinerary(updated);
  };

  const handlePhotoChange = (dayIndex, photoIndex, value) => {
    const updated = [...itinerary];
    updated[dayIndex].photos[photoIndex] = value;
    setItinerary(updated);
  };

  const addPhoto = (dayIndex) => {
    const updated = [...itinerary];
    updated[dayIndex].photos.push("");
    setItinerary(updated);
  };

  const removePhoto = (dayIndex, photoIndex) => {
    const updated = [...itinerary];
    updated[dayIndex].photos.splice(photoIndex, 1);
    setItinerary(updated);
  };

  const addDay = () => setItinerary([...itinerary, { dayTitle: "", dayDetails: "", photos: [""] }]);
  const removeDay = (index) => {
    const updated = [...itinerary];
    updated.splice(index, 1);
    setItinerary(updated);
  };

  const onSubmit = async (data) => {
    if (submitting) return;
    setSubmitting(true);

    const form = new FormData();
    form.append("avatar", JSON.stringify(photos.avatar));
    form.append("bannerImage", JSON.stringify(photos.bannerImage));
    form.append("featuredImage", photos.featuredImage);
    form.append("gallery", JSON.stringify(photos.gallery));
    form.append("itinerary", JSON.stringify(itinerary));
    form.append("included", JSON.stringify(selectedIncluded));
    form.append("specialInstructions", additionalDetails.specialInstructions);
    form.append("conditionsOfTravel", additionalDetails.conditionsOfTravel);
    form.append("thingsToMaintain", additionalDetails.thingsToMaintain);
    form.append("policies", additionalDetails.policies);
    form.append("terms", additionalDetails.terms);
    // form.append("start_date", data.startDate);
    // form.append("end_date", endDate);
    form.append("basePrice", data.basePrice);
    // form.append("state_id", selectedState ? selectedState.value : "");

    if (stateId) {
      form.append("state_id", stateId);
    }

    Object.entries(data).forEach(([key, val]) => {
      if (key === "packageCategory") {
        form.append("packageCategory", JSON.stringify(val.map((c) => c.value)));
      } else if (Array.isArray(val)) {
        form.append(key, JSON.stringify(val.map((v) => v.value || v)));
      } else {
        form.append(key, val);
      }
    });

    try {
      if (mode === "edit") {
        await axios.post(`${REACT_APP_API_URL}/packages/update/${packageId}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Package updated successfully!");
      } else {
        await axios.post(`${REACT_APP_API_URL}/packages/create`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Package created successfully!");
      }

      navigate("/packages");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit package.");
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
            <h1 className="text-xl font-bold text-primary flex items-center">
              <Link to="/packages" className="text-primary pr-3"><ArrowLeft /></Link>
              {mode === "edit" ? "Edit Package" : "Add New Package"}
            </h1>
          </div>

          <div className="card relative">
            <div className="card-body">
              <div className="">
                <Toaster />

                <div className="flex flex-wrap gap-2 mb-6">
                  {tabs.map((tab, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${activeTab === idx
                        ? "bg-white border-blue-500 text-blue-600 shadow-sm"
                        : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Form */}
                <form>
                  {activeTab === 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

                      <div className="flex gap-4">
                        <div className="mb-4 w-[50%]">
                          <label className="block font-medium text-sm text-gray-700 mb-1">
                            Package Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register("packageName", { required: true })}
                            placeholder="Enter package title"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>

                        <div className="mb-4 w-[50%]">
                          <label className="block font-medium text-sm text-gray-700 mb-1">
                            Package Duration (e.g., 2 Days 1 Night) <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register("packageDuration", { required: true })}
                            placeholder="e.g., 2 Days 1 Night"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                      </div>

                      {/* <div className="flex gap-4 mb-4">
                        <div className="mb-4 w-[50%]">
                          <label className="block font-medium text-sm text-gray-700 mb-1">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            {...register("startDate", { required: true })}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                        <div className="mb-4 w-[50%]">
                          <label className="block font-medium text-sm text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={endDate}
                            readOnly
                            className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                            tabIndex={-1}
                          />
                        </div>
                      </div> */}

                      <div className="mb-4">
                        <label className="block font-medium text-sm text-gray-700 mb-1">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          {...register("packageDescription", { required: true })}
                          placeholder="Enter package description"
                          className="w-full p-3 border border-gray-300 rounded-md h-28 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>

                      <div className="flex gap-4 mb-4">
                        <div className="mb-4 w-[50%]">
                          <label className="block font-medium text-sm text-gray-700 mb-1">
                            Package Price (Per Person) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">₹</span>
                            <input
                              {...register("basePrice", { required: true })}
                              type="number"
                              className="w-full pl-8 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        {/* Package Category */}
                        <div className="mb-4 w-[50%]">
                          <label className="block font-medium text-sm text-gray-700 mb-1">
                            Package Category <span className="text-red-500">*</span>
                          </label>
                          <Controller
                            name="packageCategory"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                isMulti
                                options={categoryOptions}
                                components={animatedComponents}
                                placeholder="Select Categories"
                                className="react-select-container"
                                classNamePrefix="react-select"
                                onChange={(val) => field.onChange(val)}
                              />
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowAddCategory(true)}
                            className="text-sm text-blue-600 underline mt-2"
                          >
                            + Add New Category
                          </button>

                          {showAddCategory && (
                            <div className="flex gap-2 mt-2">
                              <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md w-full"
                                placeholder="New category name"
                              />
                              <button
                                type="button"
                                className="bg-primary text-white px-3 py-1 rounded-md"
                                onClick={() => {
                                  const newOption = {
                                    value: newCategory,
                                    label: newCategory,
                                  };
                                  if (!categoryOptions.find((c) => c.value === newCategory)) {
                                    setCategoryOptions((prev) => [...prev, newOption]);
                                    setValue("packageCategory", [
                                      ...getValues("packageCategory"),
                                      newOption,
                                    ]);
                                  }
                                  setNewCategory("");
                                  setShowAddCategory(false);
                                }}
                              >
                                Add
                              </button>
                            </div>
                          )}
                        </div>
                        {/* <div className="mb-4 w-[50%]">
                          <label className="block font-medium text-sm text-gray-700 mb-1">
                            Children Price (Per Child) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">₹</span>
                            <input
                              {...register("childrenPrice", { required: true })}
                              type="number"
                              className="w-full pl-8 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="0"
                            />
                          </div>
                        </div> */}
                      </div>

                      {/* <p className="text-xs text-gray-500 mt-1">Either base price or pricing options must be provided</p> */}
                    </div>
                  )}

                  {activeTab === 1 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h2 className="text-xl font-semibold mb-6">Main Photos</h2>

                      {/* Avatar Images */}
                      <div className="mb-4">
                        <label className="block font-medium mb-2">Avatar Images (multiple allowed)</label>
                        {photos.avatar.map((url, idx) => (
                          <div key={idx} className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Enter avatar image URL"
                              value={url}
                              onChange={e => handleMultiPhotoChange("avatar", idx, e.target.value)}
                              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                              type="button"
                              onClick={() => removeMultiPhoto("avatar", idx)}
                              className="text-red-500 hover:text-red-700 text-xl"
                              disabled={photos.avatar.length === 1}
                              title="Remove"
                            >🗑️</button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addMultiPhoto("avatar")}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm mt-2"
                        >
                          <span className="text-xl">➕</span>
                          <span>Add Avatar Image</span>
                        </button>
                      </div>

                      {/* Banner Images */}
                      <div className="mb-4">
                        <label className="block font-medium mb-2">Banner Images (multiple allowed)</label>
                        {photos.bannerImage.map((url, idx) => (
                          <div key={idx} className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Enter banner image URL"
                              value={url}
                              onChange={e => handleMultiPhotoChange("bannerImage", idx, e.target.value)}
                              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                              type="button"
                              onClick={() => removeMultiPhoto("bannerImage", idx)}
                              className="text-red-500 hover:text-red-700 text-xl"
                              disabled={photos.bannerImage.length === 1}
                              title="Remove"
                            >🗑️</button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addMultiPhoto("bannerImage")}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm mt-2"
                        >
                          <span className="text-xl">➕</span>
                          <span>Add Banner Image</span>
                        </button>
                      </div>

                      {/* Featured Image */}
                      <div className="mb-4">
                        <label className="block font-medium mb-1">Featured Image URL</label>
                        <input
                          type="text"
                          placeholder="Enter featured image URL"
                          value={photos.featuredImage}
                          onChange={(e) => handleSinglePhotoChange("featuredImage", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>

                      {/* Gallery Images (unchanged) */}
                      <div className="mb-4">
                        <label className="block font-medium mb-2">Gallery Image URLs</label>
                        {photos.gallery.map((url, idx) => (
                          <div key={idx} className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Enter gallery image URL"
                              value={url}
                              onChange={(e) => handleGalleryChange(idx, e.target.value)}
                              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              className="text-red-500 hover:text-red-700 text-xl"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addGalleryImage}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm mt-2"
                        >
                          <span className="text-xl">➕</span>
                          <span>Add Gallery Image</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 2 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h2 className="text-xl font-semibold mb-6">Day Description</h2>

                      {itinerary.map((day, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-4 rounded-lg mb-6 border relative"
                        >
                          <h3 className="font-semibold mb-4">Day {index + 1}</h3>

                          {/* Remove Day */}
                          {itinerary.length > 1 && (
                            <button
                              onClick={() => removeDay(index)}
                              className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xl"
                            >
                              🗑️
                            </button>
                          )}

                          {/* Day Title */}
                          <div className="mb-4">
                            <label className="block font-medium mb-1">Day Title</label>
                            <input
                              type="text"
                              placeholder={`Day ${index + 1} Title`}
                              value={day.dayTitle}
                              onChange={(e) =>
                                handleItineraryChange(index, "dayTitle", e.target.value)
                              }
                              className="w-full p-3 border border-gray-300 rounded-md"
                            />
                          </div>

                          {/* Day Details */}
                          <div className="mb-4">
                            <label className="block font-medium mb-1">Day Details</label>
                            <ReactQuill
                              theme="snow"
                              value={day.dayDetails}
                              onChange={(value) =>
                                handleItineraryChange(index, "dayDetails", value)
                              }
                            />
                          </div>

                          {/* Photos */}
                          <div className="mb-4">
                            <label className="block font-medium mb-1">Photos</label>

                            {day.photos.map((url, photoIdx) => (
                              <div key={photoIdx} className="flex items-center gap-2 mb-2">
                                <input
                                  type="text"
                                  placeholder={`Photo URL ${photoIdx + 1}`}
                                  value={url}
                                  onChange={(e) =>
                                    handlePhotoChange(index, photoIdx, e.target.value)
                                  }
                                  className="w-full p-3 border border-gray-300 rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() => removePhoto(index, photoIdx)}
                                  className="text-red-500 hover:text-red-700 text-lg"
                                >
                                  ❌
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addPhoto(index)}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm mt-2"
                            >
                              <span className="text-xl">➕</span>
                              <span>Add Photo</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Another Day */}
                      <button
                        type="button"
                        onClick={addDay}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm"
                      >
                        <span className="text-lg">➕</span>
                        Add Another Day
                      </button>
                    </div>
                  )}

                  {activeTab === 3 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h2 className="text-xl font-semibold mb-6">What's Included</h2>
                      <div className="mb-3">
                        <label className="block font-medium text-gray-700 mb-1">Add Included Item</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newIncluded}
                            onChange={(e) => setNewIncluded(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const cleaned = newIncluded.trim();
                                if (cleaned && !selectedIncluded.includes(cleaned)) {
                                  setSelectedIncluded([...selectedIncluded, cleaned]);
                                }
                                setNewIncluded("");
                              }
                            }}
                            className="w-full p-3 border border-gray-300 rounded-md"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const cleaned = newIncluded.trim();
                              if (cleaned && !selectedIncluded.includes(cleaned)) {
                                setSelectedIncluded([...selectedIncluded, cleaned]);
                              }
                              setNewIncluded("");
                            }}
                            className="px-4 bg-blue-600 text-white rounded-md"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Predefined Suggestions */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {includedOptions.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              if (!selectedIncluded.includes(item)) {
                                setSelectedIncluded([...selectedIncluded, item]);   // ← FIXED
                              }
                            }}
                            className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded-full"
                          >
                            + {item}
                          </button>
                        ))}
                      </div>

                      {/* Selected Tags */}
                      {selectedIncluded.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {selectedIncluded.map((item) => (
                            <div
                              key={item}
                              className="flex items-center bg-primaryOpacity text-primary px-3 py-1 rounded-full text-sm"
                            >
                              {item}
                              <button
                                type="button"
                                onClick={() => setSelectedIncluded([...selectedIncluded.filter((i) => i !== item)])}
                                className="ml-2 text-green-500 hover:text-primary"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 4 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h2 className="text-xl font-semibold mb-6">Additional Information</h2>

                      {/* Special Instructions */}
                      <div className="mb-6">
                        <label className="block font-medium mb-1">Special Instructions</label>
                        <ReactQuill
                          theme="snow"
                          value={additionalDetails.specialInstructions}
                          onChange={(value) => handleAdditionalChange("specialInstructions", value)}
                          placeholder="Enter any special instructions"
                        />
                      </div>

                      {/* Conditions of Travel */}
                      <div className="mb-6">
                        <label className="block font-medium mb-1">Conditions of Travel</label>
                        <ReactQuill
                          theme="snow"
                          value={additionalDetails.conditionsOfTravel}
                          onChange={(value) => handleAdditionalChange("conditionsOfTravel", value)}
                          placeholder="Enter conditions of travel"
                        />
                      </div>

                      {/* Things to Maintain */}
                      <div className="mb-6">
                        <label className="block font-medium mb-1">Things to Maintain</label>
                        <ReactQuill
                          theme="snow"
                          value={additionalDetails.thingsToMaintain}
                          onChange={(value) => handleAdditionalChange("thingsToMaintain", value)}
                          placeholder="Enter things to maintain"
                        />
                      </div>

                      {/* Policies */}
                      <div className="mb-6">
                        <label className="block font-medium mb-1">Policies</label>
                        <ReactQuill
                          theme="snow"
                          value={additionalDetails.policies}
                          onChange={(value) => handleAdditionalChange("policies", value)}
                          placeholder="Enter policies"
                        />
                      </div>

                      {/* Terms and Conditions */}
                      <div>
                        <label className="block font-medium mb-1">Terms and Conditions</label>
                        <ReactQuill
                          theme="snow"
                          value={additionalDetails.terms}
                          onChange={(value) => handleAdditionalChange("terms", value)}
                          placeholder="Enter terms and conditions"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-6 button_set_submit gap-5">
                    {activeTab > 0 && (
                      <button
                        type="button"
                        onClick={prevTab}
                        className="px-4 py-2 bg-gray-200 rounded"
                      >
                        Back
                      </button>
                    )}
                    {activeTab < tabs.length - 1 ? (
                      <button
                        type="button"
                        onClick={nextTab}
                        className="ml-auto px-4 py-2 bg-blue-600 text-white rounded"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        className="ml-auto px-4 py-2 bg-primary text-white rounded"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </form>
                {/* End form */}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default AddPackages;

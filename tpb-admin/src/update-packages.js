import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./dashboard/Header/Header";
import Sidebar from "./dashboard/Sidebar/Sidebar";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./dashboard.css";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";

const animatedComponents = makeAnimated();
const tabs = ["Basic Info", "Description", "Features", "Images"];
const { REACT_APP_API_URL } = process.env;

const safeArrayMap = (input, mapFn = (v) => ({ value: v })) => {
  try {
    const parsed = typeof input === "string" ? JSON.parse(input) : input;
    if (Array.isArray(parsed)) return parsed.map(mapFn);
    return [];
  } catch {
    return [];
  }
};

const formatDateForInput = (iso) => {
  try {
    return new Date(iso).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

function UpdatePackages() {
  const { packageId } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [images, setImages] = useState({
    avatar: null,
    bannerImage: null,
    featuredImage: null,
    gallery: [],
  });

  const [categoryOptions, setCategoryOptions] = useState([
    { value: "Most Popular Tours", label: "Most Popular Tours" },
    { value: "Adventure", label: "Adventure" },
    { value: "Dubai Tours", label: "Dubai Tours" },
    { value: "Honeymoon", label: "Honeymoon" },
    { value: "Family", label: "Family" },
  ]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [submitting, setSubmitting] = useState(false); // Add this to your state

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
      packagePrice: "",
      packageDate: "",
      packageDurationDate: "",
      packageDescription: "",
      country: "",
      slug: "",
      groupSize: "",
      rating: "",
      reviewCount: "",
      highlights: [""],
      included: [""],
      inclusions: [""],
      exclusions: [""],
      additionalInformation: [""],
    },
  });

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

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await axios.get(
          `${REACT_APP_API_URL}/packages/id/${packageId}`
        );
        const data = res.data;

        setValue("packageName", data.packageName);
        setValue(
          "packageCategory",
          safeArrayMap(data.packageCategory, (v) => ({ value: v, label: v }))
        );
        setValue("packageLocation", data.packageLocation);
        setValue("packagePrice", data.packagePrice);
        setValue("packageDate", formatDateForInput(data.packageDate));
        setValue("packageDurationDate", data.packageDurationDate);
        setValue("packageDescription", data.packageDescription);
        setValue("country", data.country);
        setValue("slug", data.slug);
        setValue("groupSize", data.groupSize);
        setValue("rating", data.rating);
        setValue("reviewCount", data.reviewCount);
        setValue("highlights", safeArrayMap(data.highlights));
        setValue("included", safeArrayMap(data.included));
        setValue("inclusions", safeArrayMap(data.inclusions));
        setValue("exclusions", safeArrayMap(data.exclusions));
        setValue(
          "additionalInformation",
          safeArrayMap(data.additionalInformation)
        );
      } catch (err) {
        toast.error("Failed to load package data");
        console.error(err);
      }
    };

    if (packageId) fetchPackage();
  }, [packageId, setValue]);

  const nextTab = () =>
    setActiveTab((prev) => Math.min(prev + 1, tabs.length - 1));
  const prevTab = () => setActiveTab((prev) => Math.max(prev - 1, 0));

  const onSubmit = async (data) => {
    if (submitting) {
      console.warn("Already submitting...");
      return;
    }

    setSubmitting(true);

    const form = new FormData();

    if (images.avatar) form.append("avatar", images.avatar);
    if (images.bannerImage) form.append("bannerImage", images.bannerImage);
    if (images.featuredImage)
      form.append("featuredImage", images.featuredImage);
    if (images.gallery && images.gallery.length > 0) {
      images.gallery.forEach((file) => form.append("gallery", file));
    }

    Object.entries(data).forEach(([key, val]) => {
      if (key === "packageCategory") {
        form.append("packageCategory", JSON.stringify(val.map((v) => v.value)));
      } else if (Array.isArray(val)) {
        form.append(key, JSON.stringify(val.map((v) => v.value || v)));
      } else {
        form.append(key, val);
      }
    });

    try {
      if (packageId) {
        await axios.put(
          `${REACT_APP_API_URL}/packages/update/${packageId}`,
          form
        );
        toast.success("Package updated successfully!");
      } else {
        await axios.post(`${REACT_APP_API_URL}/packages/create`, form);
        toast.success("Package created successfully!");
      }
    } catch (err) {
      toast.error("Failed to submit package.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const ArrayField = ({ label, name, control, register }) => {
    const { fields, append, remove } = useFieldArray({ control, name });
    const suggestions = {
      highlights: ["Free Wi-Fi", "Sightseeing", "Luxury Stay"],
      included: ["Hotel", "Meals", "Guide"],
      inclusions: ["Breakfast", "Airport Pickup"],
      exclusions: ["Personal Expenses", "Insurance"],
      additionalInformation: ["Passport required", "Non-refundable"],
    };

    return (
      <div className="mb-6">
        <label className="block font-semibold mb-2">{label}</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(suggestions[name] || []).map((s, i) => (
            <span
              key={i}
              className="cursor-pointer bg-gray-200 px-2 py-1 rounded"
              onClick={() =>
                !fields.find((f) => f.value === s) && append({ value: s })
              }
            >
              {s}
            </span>
          ))}
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <input
              {...register(`${name}.${index}.value`)}
              defaultValue={field.value}
              className="p-2 border rounded w-full"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ value: "" })}
          className="text-blue-600 underline text-sm"
        >
          + Add {label}
        </button>
      </div>
    );
  };

  return (
    <div className="wrapper">
      <Header />
      <Sidebar />
      <div className="main-panel">
        <div className="content">
          <div className="container-fluid">
            <div className="card">
              <div className="card-body">
                <Toaster />
                <h2 className="text-2xl font-bold mb-6">
                  {packageId ? "Update" : "Create"} Package
                </h2>

                <div className="flex mb-6 gap-4 border-b">
                  {tabs.map((tab, idx) => (
                    <button
                      key={idx}
                      className={`py-2 px-4 font-medium ${
                        activeTab === idx
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-500"
                      }`}
                      onClick={() => setActiveTab(idx)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <form>
                  {activeTab === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input
                        {...register("packageName", { required: true })}
                        placeholder="Package Name"
                        className="p-2 border rounded"
                      />
                      <div>
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
                              className="p-2 border rounded w-full"
                              placeholder="New category name"
                            />
                            <button
                              type="button"
                              className="bg-green-600 text-white px-3 py-1 rounded"
                              onClick={() => {
                                const newOption = {
                                  value: newCategory,
                                  label: newCategory,
                                };
                                if (
                                  !categoryOptions.some(
                                    (c) => c.value === newCategory
                                  )
                                ) {
                                  setCategoryOptions((prev) => [
                                    ...prev,
                                    newOption,
                                  ]);
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
                      <input
                        {...register("packageLocation", { required: true })}
                        placeholder="Location"
                        className="p-2 border rounded"
                      />
                      <input
                        {...register("country", { required: true })}
                        placeholder="Country"
                        className="p-2 border rounded"
                      />
                      <input
                        {...register("packagePrice", { required: true })}
                        placeholder="Price"
                        className="p-2 border rounded"
                      />
                      <input
                        type="date"
                        {...register("packageDate", { required: true })}
                        className="p-2 border rounded"
                      />
                      <input
                        {...register("packageDurationDate", { required: true })}
                        placeholder="Duration"
                        className="p-2 border rounded"
                      />
                      <input
                        {...register("groupSize", { required: true })}
                        placeholder="Group Size"
                        className="p-2 border rounded"
                      />
                      <input
                        {...register("slug", { required: true })}
                        placeholder="Slug"
                        className="p-2 border rounded"
                      />
                    </div>
                  )}

                  {activeTab === 1 && (
                    <div className="mb-4">
                      <label className="block font-semibold mb-1">
                        Package Description
                      </label>
                      <Controller
                        name="packageDescription"
                        control={control}
                        render={({ field }) => (
                          <ReactQuill theme="snow" {...field} />
                        )}
                      />
                    </div>
                  )}

                  {activeTab === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ArrayField
                        label="Highlights"
                        name="highlights"
                        control={control}
                        register={register}
                      />
                      <ArrayField
                        label="Included"
                        name="included"
                        control={control}
                        register={register}
                      />
                      <ArrayField
                        label="Inclusions"
                        name="inclusions"
                        control={control}
                        register={register}
                      />
                      <ArrayField
                        label="Exclusions"
                        name="exclusions"
                        control={control}
                        register={register}
                      />
                      <ArrayField
                        label="Additional Info"
                        name="additionalInformation"
                        control={control}
                        register={register}
                      />
                    </div>
                  )}

                  {activeTab === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(images).map(([name]) => (
                        <div key={name}>
                          <label className="block font-semibold mb-1 capitalize">
                            {name}
                          </label>
                          <input
                            type="file"
                            name={name}
                            multiple={name === "gallery"}
                            onChange={(e) => {
                              const { files } = e.target;
                              setImages((prev) => ({
                                ...prev,
                                [name]:
                                  name === "gallery" ? [...files] : files[0],
                              }));
                            }}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
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
                        className="ml-auto px-4 py-2 bg-green-600 text-white rounded"
                      >
                        {packageId ? "Update" : "Submit"}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdatePackages;

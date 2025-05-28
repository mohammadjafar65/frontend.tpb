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

const animatedComponents = makeAnimated();
const tabs = ["Basic Info", "Description", "Features", "Images"];

const { REACT_APP_API_URL } = process.env;

function AddPackages() {
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
  const [submitting, setSubmitting] = useState(false);

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

  // Auto-generate slug
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

  const nextTab = () => {
    if (activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  const prevTab = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

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
    if (images.gallery?.length > 0) {
      images.gallery.forEach((file) => form.append("gallery", file));
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
      await axios.post(`${REACT_APP_API_URL}/packages/create`, form);
      toast.success("Package created successfully!");
    } catch (err) {
      toast.error("Failed to create package.");
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

    const handleSuggestionClick = (value) => {
      const existingValues = fields.map((field) => field.value?.toLowerCase());
      if (!existingValues.includes(value.toLowerCase())) {
        append({ value });
      }
    };

    return (
      <div className="mb-6">
        <label className="block font-semibold mb-2">{label}</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(suggestions[name] || []).map((suggestion, idx) => (
            <span
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-sm px-2 py-1 rounded"
            >
              {suggestion}
            </span>
          ))}
        </div>
        {fields.map((field, index) => (
          <div className="flex gap-2 mb-2" key={field.id}>
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
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body">
                    <div className="">
                      <Toaster />
                      <h2 className="text-2xl font-bold mb-6">
                        Create Travel Package
                      </h2>

                      <div className="flex mb-6 gap-4 border-b">
                        {tabs.map((tab, idx) => (
                          <button
                            key={idx}
                            className={`py-2 px-4 font-medium transition-all ${
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

                      {/* Form */}
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
                                    onChange={(e) =>
                                      setNewCategory(e.target.value)
                                    }
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
                                        !categoryOptions.find(
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
                              {...register("packageLocation", {
                                required: true,
                              })}
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
                              {...register("packageDurationDate", {
                                required: true,
                              })}
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
                                    setImages({
                                      ...images,
                                      [name]:
                                        name === "gallery"
                                          ? [...files]
                                          : files[0],
                                    });
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
                              Submit
                            </button>
                          )}
                        </div>
                      </form>
                      {/* End form */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPackages;

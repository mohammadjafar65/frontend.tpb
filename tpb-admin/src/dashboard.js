import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "./dashboard/Header/Header";
import Sidebar from "./dashboard/Sidebar/Sidebar";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // import styles
import "./dashboard.css";

function Dashboard() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [addPackageModalVisible, setAddPackageModalVisible] = useState(false);
  const [editPackageModalVisible, setEditPackageModalVisible] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const { loginWithRedirect, isAuthenticated, logout } = useAuth0();
  const { REACT_APP_API_URL, REACT_APP_UPLOAD_API_URL } = process.env;
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${REACT_APP_API_URL}/packages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPackages(response.data);
      } catch (err) {
        setError(`Error fetching packages: ${err.message}`);
        console.error(err);
      }
      setLoading(false);
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    if (currentPackage?.packageDescription) {
      setText(currentPackage.packageDescription);
    }
  }, [currentPackage]);

  const handleChange = (value) => {
    setText(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Check if image is uploaded
    const imageFile = event.target.avatar.files[0];
    if (!imageFile) {
      alert("Thumbnail is not uploaded");
      return;
    }

    // Check if category is selected
    const category = event.target.packageCategory.value;
    if (!category) {
      alert("Category is not selected");
      return;
    }

    setPublishing(true);
    const data = new FormData(event.target);
    data.append("packageDescription", text);

    files.forEach((fileItem) => {
      data.append("gallery", fileItem.file);
    });

    const endpoint = `${REACT_APP_API_URL}/packages/create`;

    axios
      .post(endpoint, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response.data);
        setSuccessModalVisible(true);
        setPublishing(false);
      })
      .catch((error) => {
        console.error(error);
        if (error.response && error.response.status === 404) {
          alert("The server endpoint was not found. Please check the URL.");
        } else {
          alert("Error in package upload: " + error.message);
        }
        setPublishing(false);
      });
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    const filePreviews = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileReader = new FileReader();

      fileReader.onload = (e) => {
        filePreviews.push({
          name: file.name,
          src: e.target.result,
          file: file,
        });
      };

      fileReader.readAsDataURL(file);
    }

    setFiles([...filePreviews]);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Date(dateString).toLocaleDateString(
      "en-IN",
      options
    );
    return formattedDate;
  };

  const handleEditPackage = (packageItem) => {
    setCurrentPackage(packageItem);
    setEditPackageModalVisible(true);
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const data = new FormData(event.target);
    data.append("packageDescription", text);
    const endpoint = `${REACT_APP_API_URL}/packages/update/${currentPackage.id}`;

    try {
      const response = await axios.put(endpoint, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);
      setEditPackageModalVisible(false);
      setCurrentPackage(null);
      // Refresh the package list or update state
    } catch (error) {
      console.error("Error updating package:", error);
      alert("Error updating package: " + error.message);
    }
  };

  const handleDeletePackage = (packageId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this package?"
    );
    if (confirmDelete) {
      axios
        .delete(`${REACT_APP_API_URL}/packages/delete/${packageId}`)
        .then((response) => {
          console.log("Delete response:", response);
          if (response.status === 200 || response.status === 204) {
            setPackages((prevPackages) =>
              prevPackages.filter((packageItem) => packageItem.id !== packageId)
            );
          }
        })
        .catch((error) => {
          console.error(
            "Error deleting package:",
            error.response || error.message
          );
          alert("Error deleting package: " + error.message);
        });
    }
  };

  // You can specify custom modules and formats for the editor
  Dashboard.modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link"],
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
  };

  Dashboard.formats = [
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
  ];

  const removeFile = (fileName) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  if (loading) {
    return <div>Loading packages...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div>
        {isAuthenticated ? (
          <div>
            <div className="wrapper">
              <Header />
              <Sidebar />
              <div className="main-panel">
                <div className="content">
                  <div className="container-fluid">
                    <div className="mini_header">
                      <h4 className="page-title">Dashboard</h4>
                      {/* <button
                        type="button"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#addPackageModel"
                      >
                        <i className="la la-plus"></i> Add New Package
                      </button> */}
                      <a href="/add-hotel" className="btn btn-primary">
                        <i className="la la-plus"></i> Add Tour Package
                      </a>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="card">
                          <div className="card-header">
                            <div className="card-title">Packages List</div>
                          </div>
                          <div className="card-body">
                            <table
                              id="example"
                              className="table table-hover responsive nowrap"
                            >
                              <thead>
                                <tr>
                                  <th>IMAGE</th>
                                  <th>PACKAGE NAME</th>
                                  <th>CATEGORY</th>
                                  <th>LOCATION</th>
                                  <th>TOTAL PRICE</th>
                                  <th>START DATE</th>
                                  <th>DURATION</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {packages.map((packageItem) => (
                                  <tr key={packageItem.id}>
                                    <td>
                                      <div className="avatar avatar-blue mr-3">
                                        {packageItem.imageUrl ? (
                                          <img
                                            src={`${REACT_APP_UPLOAD_API_URL}/${packageItem.imageUrl}`}
                                            alt="Package"
                                          />
                                        ) : (
                                          "No Image"
                                        )}
                                      </div>
                                    </td>
                                    <td>{packageItem.packageName}</td>
                                    <td>{packageItem.category}</td>
                                    <td>{packageItem.packageLocation}</td>
                                    <td>{packageItem.packagePrice}</td>
                                    <td>
                                      {packageItem.packageDate
                                        ? formatDate(packageItem.packageDate)
                                        : "Not available"}
                                    </td>
                                    <td>{packageItem.packageDurationDate}</td>
                                    <td>
                                      <div className="dropdown">
                                        <button
                                          className="btn btn-sm btn-icon"
                                          type="button"
                                          id="dropdownMenuButton2"
                                          data-toggle="dropdown"
                                          aria-haspopup="true"
                                          aria-expanded="false"
                                        >
                                          <i className="bx bx-dots-horizontal-rounded"></i>
                                        </button>
                                        <div
                                          className="dropdown-menu"
                                          aria-labelledby="dropdownMenuButton2"
                                        >
                                          <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={() =>
                                              handleEditPackage(packageItem)
                                            }
                                          >
                                            <i className="bx bx-edit mr-2"></i>{" "}
                                            Edit
                                          </a>
                                          <a
                                            className="dropdown-item text-danger"
                                            href="#"
                                            onClick={() =>
                                              handleDeletePackage(
                                                packageItem.id
                                              )
                                            }
                                          >
                                            <i className="bx bxs-trash mr-2"></i>{" "}
                                            Remove
                                          </a>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`modal fade ${addPackageModalVisible ? "show" : ""}`}
              id="addPackageModel"
              tabIndex="-1"
              aria-labelledby="addPackageModelLabel"
              aria-hidden={!addPackageModalVisible}
            >
              <form
                className="row g-3"
                onSubmit={handleSubmit}
                encType="multipart/form-data"
              >
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h1
                        className="modal-title fs-5"
                        id="addPackageModelLabel"
                      >
                        Add New Package
                      </h1>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body form_details">
                      <div className="row">
                        <div className="col-lg-12 col-md-12 col-12">
                          <div className="ctcp_form_inp">
                            <label htmlFor="Image">UPLOAD IMAGE</label>
                            <input type="file" name="avatar" />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <div className="ctcp_form_inp">
                            <label htmlFor="Package Name">PACKAGE NAME</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter your package name"
                              name="packageName"
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <div className="ctcp_form_inp">
                            <label htmlFor="Package Name">CATEGORY</label>
                            <select name="packageCategory" required>
                              <option value="">Select a Category</option>
                              <option value="Popular Packages">
                                Popular Packages
                              </option>
                              <option value="The Pilgrimage">
                                The Pilgrimage
                              </option>
                              <option value="Holidays In 'India'">
                                Holidays In 'India'
                              </option>
                              <option value="The Modern 'Europe'">
                                The Modern 'Europe'
                              </option>
                              <option value="The Secrets of Middle East">
                                The Secrets of Middle East
                              </option>
                              <option value="Adventurous Africa">
                                Adventurous Africa
                              </option>
                              <option value="The Asia Pacific">
                                The Asia Pacific
                              </option>
                            </select>
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <label htmlFor="Location">LOCATION</label>
                          <div className="ctcp_form_inp">
                            <input
                              type="text"
                              className="form-control"
                              id="inputPassword4"
                              placeholder="Enter your location"
                              name="packageLocation"
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <div className="ctcp_form_inp">
                            <label htmlFor="Price">TOTAL PRICE</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter your price"
                              name="packagePrice"
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <label htmlFor="Date">START DATE</label>
                          <div className="ctcp_form_inp">
                            <input
                              type="date"
                              className="form-control"
                              id="inputPassword4"
                              name="packageDate"
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <label htmlFor="text">DURATION</label>
                          <div className="ctcp_form_inp">
                            <input
                              type="text"
                              className="form-control"
                              id="inputPassword4"
                              placeholder="Duration"
                              name="packageDurationDate"
                            />
                          </div>
                        </div>
                        <div className="col-lg-12 col-md-12 col-12">
                          <label htmlFor="text">PACKAGE DESCRIPTION</label>
                          <div className="ctcp_form_inp">
                            <ReactQuill
                              value={text}
                              onChange={handleChange}
                              modules={Dashboard.modules}
                              formats={Dashboard.formats}
                            />
                            {/* <textarea
                              id="w3review"
                              name="packageDescription"
                              rows="5"
                              cols="51"
                            ></textarea> */}
                          </div>
                        </div>
                        <div className="col-lg-12 col-md-12 col-12">
                          <label htmlFor="text">AMINITIES IN HOTEL</label>
                          <div className="ctcp_form_inp">
                            <textarea
                              id="w3review"
                              name="amenitiesInHotel"
                              rows="5"
                              cols="51"
                            ></textarea>
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <div className="ctcp_form_inp">
                            <label htmlFor="text">AGENT NAME</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter your Name"
                              name="agentName"
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <label htmlFor="number">AGENT NUMBER</label>
                          <div className="ctcp_form_inp">
                            <input
                              type="tel"
                              className="form-control"
                              id="inputPassword4"
                              placeholder="Enter your number"
                              name="agentNumber"
                            />
                          </div>
                        </div>
                        <div className="col-lg-12 col-md-12 col-12">
                          <label htmlFor="number">GALLERY IMAGES</label>
                          <input
                            type="file"
                            id="files"
                            name="gallery"
                            onChange={handleFileChange}
                            multiple
                          />
                          <div className="setAlign">
                            {files.map((file, index) => (
                              <span key={index} className="pip">
                                <img
                                  className="imageThumb"
                                  name="gallery"
                                  src={file.src}
                                  alt={file.name}
                                  title={file.name}
                                />
                                <br />
                                <button
                                  className="remove"
                                  onClick={() => removeFile(file.name)}
                                >
                                  Remove image
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <div className="ctcp_form_btn">
                        <button type="submit">Publish</button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            {publishing && <div className="loader">Publishing...</div>}
            <div
              className={`modal fade ${successModalVisible ? "show" : ""}`}
              id="successModal"
              tabIndex="-1"
              aria-labelledby="successModalLabel"
              aria-hidden={!successModalVisible}
              onHide={() => setAddPackageModalVisible(false)} // Add this line to handle onHide event
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="successModalLabel">
                      Success
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      onClick={() => setSuccessModalVisible(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    Your new package is published successfully.
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-primary"
                      data-bs-dismiss="modal"
                      onClick={() => setSuccessModalVisible(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`modal fade ${editPackageModalVisible ? "show" : ""}`}
              id="editPackageModel"
              tabIndex="-1"
              aria-labelledby="editPackageModelLabel"
              aria-hidden={!editPackageModalVisible}
            >
              <form
                className="row g-3"
                onSubmit={handleUpdateSubmit}
                encType="multipart/form-data"
              >
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h1
                        className="modal-title fs-5"
                        id="editPackageModelLabel"
                      >
                        Edit Package
                      </h1>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        onClick={() => setEditPackageModalVisible(false)}
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body form_details">
                      <div className="row">
                        <div className="col-lg-12 col-md-12 col-12">
                          <div className="ctcp_form_inp">
                            <label htmlFor="Image">UPLOAD IMAGE</label>
                            <input type="file" name="avatar" />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <div className="ctcp_form_inp">
                            <label htmlFor="Package Name">PACKAGE NAME</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter your package name"
                              name="packageName"
                              defaultValue={currentPackage?.packageName}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <div className="ctcp_form_inp">
                            <label htmlFor="Package Name">CATEGORY</label>
                            <select
                              name="packageCategory"
                              required
                              defaultValue={currentPackage?.packageCategory}
                            >
                              <option value="">Select a Category</option>
                              <option value="Popular Packages">
                                Popular Packages
                              </option>
                              <option value="The Pilgrimage">
                                The Pilgrimage
                              </option>
                              <option value="Holidays In 'India'">
                                Holidays In 'India'
                              </option>
                              <option value="The Modern 'Europe'">
                                The Modern 'Europe'
                              </option>
                              <option value="The Secrets of Middle East">
                                The Secrets of Middle East
                              </option>
                              <option value="Adventurous Africa">
                                Adventurous Africa
                              </option>
                              <option value="The Asia Pacific">
                                The Asia Pacific
                              </option>
                            </select>
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <label htmlFor="Location">LOCATION</label>
                          <div className="ctcp_form_inp">
                            <input
                              type="text"
                              className="form-control"
                              id="inputPassword4"
                              placeholder="Enter your location"
                              name="packageLocation"
                              defaultValue={currentPackage?.packageLocation}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <div className="ctcp_form_inp">
                            <label htmlFor="Price">TOTAL PRICE</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter your price"
                              name="packagePrice"
                              defaultValue={currentPackage?.packagePrice}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <label htmlFor="Date">START DATE</label>
                          <div className="ctcp_form_inp">
                            <input
                              type="date"
                              className="form-control"
                              id="inputPassword4"
                              name="packageDate"
                              defaultValue={currentPackage?.packageDate}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <label htmlFor="text">DURATION</label>
                          <div className="ctcp_form_inp">
                            <input
                              type="text"
                              className="form-control"
                              id="inputPassword4"
                              placeholder="Duration"
                              name="packageDurationDate"
                              defaultValue={currentPackage?.packageDurationDate}
                            />
                          </div>
                        </div>
                        <div className="col-lg-12 col-md-12 col-12">
                          <label htmlFor="text">PACKAGE DESCRIPTION</label>
                          <div className="ctcp_form_inp">
                            <ReactQuill
                              value={text}
                              onChange={handleChange}
                              modules={Dashboard.modules}
                              formats={Dashboard.formats}
                            />
                            {/* <textarea
                              id="w3review"
                              name="packageDescription"
                              rows="5"
                              cols="51"
                              defaultValue={currentPackage?.packageDescription}
                            ></textarea> */}
                          </div>
                        </div>
                        <div className="col-lg-12 col-md-12 col-12">
                          <label htmlFor="text">AMINITIES IN HOTEL</label>
                          <div className="ctcp_form_inp">
                            <textarea
                              id="w3review"
                              name="amenitiesInHotel"
                              rows="5"
                              cols="51"
                              defaultValue={currentPackage?.amenitiesInHotel}
                            ></textarea>
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <div className="ctcp_form_inp">
                            <label htmlFor="text">AGENT NAME</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter your Name"
                              name="agentName"
                              defaultValue={currentPackage?.agentName}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <label htmlFor="number">AGENT NUMBER</label>
                          <div className="ctcp_form_inp">
                            <input
                              type="tel"
                              className="form-control"
                              id="inputPassword4"
                              placeholder="Enter your number"
                              name="agentNumber"
                              defaultValue={currentPackage?.agentNumber}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="submit" className="btn btn-primary">
                        Update
                      </button>
                      <button
                        type="button"
                        className="btn"
                        data-bs-dismiss="modal"
                        onClick={() => setEditPackageModalVisible(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div>
            <div className="LoginScreen">
              <div className="card">
                <img src="https://thepilgrimbeez.com/img/tpb-logo.png" />
                <h2>Admin Panel Of TPB</h2>
                <button onClick={() => loginWithRedirect()}>Log In</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;

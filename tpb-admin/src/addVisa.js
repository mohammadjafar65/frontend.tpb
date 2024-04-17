import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import "./dashboard.css";

function AddVisa() {
  const [visa, setvisa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [addvisaModalVisible, setAddvisaModalVisible] = useState(false); // Track the visibility of the "Add New visa" modal
  const { loginWithRedirect, isAuthenticated, logout } = useAuth0();

  useEffect(() => {
    const fetchvisa = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/visa`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setvisa(response.data);
      } catch (err) {
        setError("An error occurred while fetching the visa.");
        console.error(err);
      }
      setLoading(false);
    };

    fetchvisa();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Check if image is uploaded
    const imageFile = event.target.avatar.files[0];
    if (!imageFile) {
      alert("Thumbnail is not uploaded");
      return;
    }

    // Check if category is selected
    const category = event.target.visaCategory.value;
    if (!category) {
      alert("Category is not selected");
      return;
    }

    setPublishing(true);
    const data = new FormData(event.target);

    files.forEach((fileItem) => {
      data.append("gallery", fileItem.file);
    });

    const endpoint = `https://api.thepilgrimbeez.com/visa/create`;

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
          alert("Error in visa upload: " + error.message);
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
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-IN', options);
    return formattedDate;
  };

  const handleDeletevisa = (visaId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this visa?"
    );
    if (confirmDelete) {
      axios
        .delete(`https://api.thepilgrimbeez.com/visa/delete/${visaId}`)
        .then((response) => {
          console.log("Delete response:", response);
          if (response.status === 200 || response.status === 204) {
            setvisa((prevvisa) =>
              prevvisa.filter((visaItem) => visaItem.id !== visaId)
            );
          }
        })
        .catch((error) => {
          console.error(
            "Error deleting visa:",
            error.response || error.message
          );
          alert("Error deleting visa: " + error.message);
        });
    }
  };

  const removeFile = (fileName) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  if (loading) {
    return <div>Loading visa...</div>;
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
              <div className="main-header">
                <div className="logo-header">
                  <h6>TPB Admin</h6>
                  <button
                    className="navbar-toggler sidenav-toggler ml-auto"
                    type="button"
                    data-toggle="collapse"
                    data-target="collapse"
                    aria-controls="sidebar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                  >
                    <span className="navbar-toggler-icon"></span>
                  </button>
                  <button className="topbar-toggler more">
                    <i className="la la-ellipsis-v"></i>
                  </button>
                </div>
                <nav className="navbar navbar-header navbar-expand-lg">
                  <div className="container-fluid">
                    <ul className="navbar-nav topbar-nav ml-md-auto align-items-center">
                      <li className="nav-item dropdown">
                        <a
                          className="dropdown-toggle profile-pic"
                          data-toggle="dropdown"
                          href="#"
                          aria-expanded="false"
                        >
                          {" "}
                          <img
                            src="assets/img/profile.jpg"
                            alt="user-img"
                            width="36"
                            className="img-circle"
                          />
                          <span>Admin</span>{" "}
                        </a>
                        <ul className="dropdown-menu dropdown-user">
                          <li>
                            <div className="user-box">
                              <div className="u-img">
                                <img src="assets/img/profile.jpg" alt="user" />
                              </div>
                              <div className="u-text">
                                <h4>Admin</h4>
                                <p className="text-muted">hello@tpb.com</p>
                              </div>
                            </div>
                          </li>
                          <div className="dropdown-divider"></div>
                          <button
                            onClick={() =>
                              logout({
                                logoutParams: {
                                  returnTo: window.location.origin,
                                },
                              })
                            }
                          >
                            <i className="fa fa-power-off"></i> Log Out
                          </button>
                          {/* <a className="dropdown-item" href="#">
                              <i className="fa fa-power-off"></i> Logout
                            </a> */}
                        </ul>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>
              <div className="sidebar">
                <div className="scrollbar-inner sidebar-wrapper">
                  <div className="user">
                    <div className="photo">
                      <img src="assets/img/profile.jpg" alt="" />
                    </div>
                    <div className="info">
                      <a
                        className=""
                        data-toggle="collapse"
                        href="#collapseExample"
                        aria-expanded="true"
                      >
                        <span>
                          Juned S
                          <span className="user-level">Administrator</span>
                        </span>
                      </a>
                    </div>
                  </div>
                  <ul className="nav">
                    <li className="nav-item active">
                      <a href="/">
                        <i className="la la-dashboard"></i>
                        <p>Dashboard</p>
                      </a>
                      <a href="/visa">
                        <i className="la la-fire"></i>
                        <p>Visa</p>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="main-panel">
                <div className="content">
                  <div className="container-fluid">
                    <div className="mini_header">
                      <h4 className="page-title">Visa</h4>
                      <button
                        type="button"
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#addvisaModel"
                      >
                        <i className="la la-plus"></i> Add New visa
                      </button>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="card">
                          <div className="card-header">
                            <div className="card-title">Visa List</div>
                          </div>
                          <div className="card-body">
                            <table
                              id="example"
                              className="table table-hover responsive nowrap"
                            >
                              <thead>
                                <tr>
                                  <th>IMAGE</th>
                                  <th>Visa NAME</th>
                                  <th>LOCATION</th>
                                  <th>TOTAL PRICE</th>
                                  <th>START DATE</th>
                                  <th>DURATION</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {visa.map((visaItem) => (
                                  <tr key={visaItem.id}>
                                    <td>
                                      <div className="avatar avatar-blue mr-3">
                                        {visaItem.imageUrl ? (
                                          <img
                                            src={`${process.env.REACT_APP_UPLOAD_API_URL}/${visaItem.imageUrl}`}
                                            alt="visa"
                                          />
                                        ) : (
                                          "No Image"
                                        )}
                                      </div>
                                    </td>
                                    <td>{visaItem.visaName}</td>
                                    <td>{visaItem.visaLocation}</td>
                                    <td>{visaItem.visaPrice}</td>
                                    <td>{visaItem.visaDate ? formatDate(visaItem.visaDate) : "Not available"}</td>
                                    <td>{visaItem.visaDurationDate}</td>
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
                                            className="dropdown-item text-danger"
                                            href="#"
                                            onClick={() =>
                                              handleDeletevisa(
                                                visaItem.id
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
              className={`modal fade ${addvisaModalVisible ? "show" : ""}`}
              id="addvisaModel"
              tabIndex="-1"
              aria-labelledby="addvisaModelLabel"
              aria-hidden={!addvisaModalVisible}
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
                        id="addvisaModelLabel"
                      >
                        Add New visa
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
                            <label htmlFor="visa Name">visa NAME</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter your visa name"
                              name="visaName"
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <div className="ctcp_form_inp">
                            <label htmlFor="visa Name">CATEGORY</label>
                            <select name="visaCategory" required>
                              <option value="">Select a Category</option>
                              <option value="POPULAR visa">
                                POPULAR visa
                              </option>
                              <option value="DUBAI visa">
                                DUBAI visa
                              </option>
                              <option value="KASHMIR FAMILY visa">
                                KASHMIR FAMILY visa
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
                              name="visaLocation"
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
                              name="visaPrice"
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
                              name="visaDate"
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
                              name="visaDurationDate"
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                          <label htmlFor="text">visa DESCRIPTION</label>
                          <div className="ctcp_form_inp">
                            <textarea
                              id="w3review"
                              name="visaDescription"
                              rows="5"
                              cols="51"
                            ></textarea>
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
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
              onHide={() => setAddvisaModalVisible(false)} // Add this line to handle onHide event
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
                    Your new visa is published successfully.
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

export default AddVisa;

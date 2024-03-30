import Header from "../header/header";
import Footer from "../footer/footer";
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AllPackages = () => {
    const [packages, setPackages] = useState([]);
    const [packagesByCategory, setPackagesByCategory] = useState({});
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const categories = ["POPULAR PACKAGES", "DUBAI PACKAGES", "KASHMIR FAMILY PACKAGES"];

    useEffect(() => {
        setIsLoading(true); // Start loading
        axios
            .get(`${process.env.REACT_APP_API_URL}/packages`)
            .then((response) => {
                setPackages(response.data);
                categorizePackages(response.data);
                setIsLoading(false); // End loading
            })
            .catch((error) => {
                console.error("Error fetching packages:", error);
                setIsLoading(false); // End loading
            });
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Date(dateString).toLocaleDateString('en-IN', options);
        return formattedDate;
    };

    // Function to categorize packages
    const categorizePackages = (packagesArray) => {
        const categorized = categories.reduce((acc, category) => {
            acc[category] = packagesArray.filter((pkg) => pkg.category === category);
            return acc;
        }, {});

        setPackagesByCategory(categorized);
    };

    if (isLoading) {
        return <div>Loading...</div>; // Show loading indicator
    }

    return (
        <>
            <Header />
            <section id="banner" class="package">
                <div class="css-zixqbe e7svxqc1"></div>
                <div class="container">
                    <div class="row">
                        <div class="col-lg-12 col-md-12  col-12">
                            <div class="inner_banner">
                                <h1>Our Packages</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Packages by Category */}
            {categories.map((category, index) => (
                <section id="our-packages" key={category} className={index % 2 === 0 ? "alternate-class" : "gray_bg"}>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-12">
                                <div className="title_head">
                                    <h2>{category || "Default Category"}</h2>
                                    <Link to={`/package/${category}`} className="btn">
                                        View All &nbsp;<iconify-icon icon="cil:arrow-right"></iconify-icon>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-12">
                                <OwlCarousel
                                    className="owl-carousel owl-theme projects"
                                    margin={30}
                                    nav
                                    responsive={{
                                        0: {
                                            items: 1,
                                        },
                                        600: {
                                            items: 3,
                                        },
                                        1000: {
                                            items: 5,
                                        },
                                    }}
                                >
                                    {packagesByCategory[category] && packagesByCategory[category].length > 0 ? (
                                        packagesByCategory[category].map((pkg) => (
                                            <div className="item" key={pkg.id}>
                                                <Link to={`/package/id/${pkg.id}`}>
                                                    <div className="card">
                                                        <span className="over_hover">
                                                            <img src={`${process.env.REACT_APP_API_URL}/uploads/${pkg.imageUrl}`} alt={pkg.packageName || "Package Image"} className="card-img" />
                                                        </span>
                                                        <div className="card_content">
                                                            <h2>{pkg.packageName || "No Name"}</h2>
                                                            <p>{pkg.packagePrice ? `₹${pkg.packagePrice}` : "Not available"}</p>
                                                            <div className="ft">
                                                                <span>
                                                                    <label>Duration</label>
                                                                    <h3>
                                                                        <iconify-icon icon="carbon:time"></iconify-icon> {pkg.packageDurationDate || "Not available"}
                                                                    </h3>
                                                                </span>
                                                                <span>
                                                                    <label>Start Date</label>
                                                                    <h3>
                                                                        <iconify-icon icon="uiw:date"></iconify-icon> {pkg.packageDate ? formatDate(pkg.packageDate) : "Not available"}
                                                                    </h3>
                                                                </span>
                                                            </div>
                                                            <div className="btn_yellow">View Package Details</div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No packages available.</p>
                                    )}
                                </OwlCarousel>
                            </div>
                        </div>
                    </div>
                </section>
            ))}
            <Footer />
        </>
  )
}

export default AllPackages

import Header from "../header/header";
import Footer from "../footer/footer";
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import React, { useEffect, useState } from "react";
import ImageSlider from '../components/ImageSlider';
import { Link } from "react-router-dom";
import axios from "axios";

const AllPackages = () => {
    
    const [packages, setPackages] = useState([]);
    const [packagesByCategory, setPackagesByCategory] = useState({});
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const categories = [
        "Popular Packages",
        "The Pilgrimage",
        "Holidays In 'India'",
        "The Modern 'Europe'",
        "The Secrets of Middle East",
        "Adventurous Africa",
        "The Asia Pacific"
    ];
    const images = [
        'img/slider_1.jpeg',
        'img/slider_2.jpeg',
        'img/slider_3.jpeg'
    ];

    useEffect(() => {
        setIsLoading(true); // Start loading
        axios
            .get(`${process.env.REACT_APP_API_URL}/packages`)
            .then((response) => {
                console.log("Packages:", response.data); // Log packages data
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
    
        console.log("Categorized Packages:", categorized); // Log categorized packages
    
        setPackagesByCategory(categorized);
    };     

    if (isLoading) {
        return <div>Loading...</div>; // Show loading indicator
    }
    
    return (
        <>
            <Header />
            <section id="banner" className="allpackages">
                <ImageSlider images={images} />
                <div className="css-zixqbe e7svxqc1"></div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12  col-12">
                            <div className="inner_banner">
                                <h1>
                                    All Packages
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Packages by Category */}
            {categories.map((category, index) => (
                <section id="our-packages" key={category} className={index % 2 === 0 ? "alternate-class" : "gray_bg"}>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-12">
                                <div className="title_head">
                                    <h2>{category || "Default Category"}</h2>
                                    <Link to={`/package/${encodeURIComponent(category)}`} className="btn">
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
                                            items: 4,
                                        },
                                    }}
                                >
                                    {packagesByCategory[category] && packagesByCategory[category].length > 0 ? (
                                        packagesByCategory[category].map((pkg) => (
                                            <div className="item" key={pkg.id}>
                                                <Link to={`/package/id/${pkg.id}`}>
                                                    <div className="card"
                                                    style={{ 
                                                        backgroundImage: `url(${process.env.REACT_APP_API_URL}/uploads/${pkg.imageUrl})`,
                                                        backgroundSize: 'cover',
                                                        transition: 'transform 0.2s ease-in-out'
                                                    }}>
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
                                                            {/* <div className="btn_yellow">View Package Details</div> */}
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
